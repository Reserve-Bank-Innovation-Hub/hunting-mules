// REACT CORE ==========================================================================================================
import { Node } from "reactflow";

// LIB =================================================================================================================
import {
    ACTIVE_MULES, BALANCE_PROFILE, DECOY_SETTLE_MS, FLIGHT_MS, LOW_BALANCE_CONFIG,
    MIN_ORDINARY_ACCOUNTS,
} from "./gameConfig";
import { PatternBehaviour } from "./roundConfig";
import { Network } from "./network";

// A single leg of a routine, queued to fire `delay` ms after it is planned.
// `muleId` is present only on the real thing — a decoy leg leaves it undefined, and
// that is what keeps decoys out of the scoring, the flash cues and the money stolen.
export interface PlannedTransaction {
    delay          : number;
    fromNode       : Node;
    toNode         : Node;
    amount         : number;
    isInflow       : boolean;   // Money moving into the account being watched, rather than back out
    muleId       ? : string;
    // Whether this leg moves the balance of the account at the middle of the routine.
    // Counterparties are deliberately left alone: they are funded from a network far
    // wider than the twenty accounts on screen, and a board where every chip churned
    // would drift so far over eighty seconds that "low balance" stopped meaning
    // anything. Only the account actually holding the money shows it.
    movesBalance ? : boolean;
}

export interface Burst {
    muleId       : string;
    transactions : PlannedTransaction[];
}

const randomBetween = (min : number, max : number) =>
    Math.floor(min + Math.random() * (max - min + 1));

const shuffle = <T,>(items : T[]) : T[] => [ ...items ].sort(() => Math.random() - 0.5);

const pickOne = <T,>(items : T[]) : T | undefined => items[Math.floor(Math.random() * items.length)];

/**
 * A list with every unlocked pattern in it, weighted so the one that joined most
 * recently comes up about half the time.
 *
 * Used both to deal mules their patterns and to decide which pattern runs next. The
 * newest pattern has the least of the round left to be seen in and is the one the
 * player has just been shown, so an even share would leave it appearing a couple of
 * times before the clock ran out. The weight grows with the number of patterns
 * competing, so the split stays at roughly half however many are in play — and with
 * only two unlocked, they simply take turns.
 */
export const weightedTowardsNewest = <T,>(patterns : T[]) : T[] => {
    if (patterns.length < 2) {
        return patterns;
    }

    // The newest pattern is the one the player has just been taught, so it needs
    // to be visibly running. Weighted to about half the board once all four are
    // out, rather than a quarter.
    const newest = patterns[patterns.length - 1];
    const extra = new Array(patterns.length).fill(newest);

    return [ ...patterns, ...extra ];
};

// The gap between money landing on a mule and the mule moving it on again
const HANDOFF_MS = 520;
const STAGGER_MS = 170;
// The arms of a fan-out MUST overlap. The whole pattern is one account paying
// several at once, and at a wide stagger they leave one at a time and there is
// nothing to recognise — it just looks like ordinary traffic from a busy account.
// A short stagger so they do not launch on the same frame, and no more.
const SPREAD_STAGGER_MS = 130;
// Gather-scatter is defined by how quickly it turns money around
const RAPID_HANDOFF_MS = 180;
const RAPID_STAGGER_MS = 130;

// BALANCES ============================================================================================================
/**
 * Deal every account its opening balance.
 *
 * The spread is dealt out by proportion rather than rolled per account. On a board
 * of twenty, independent rolls land on two or three rich accounts often enough to
 * matter, and the whole reading of the low-balance pattern rests on this spread: a
 * few hundred rupees only looks like a few hundred rupees next to accounts holding
 * lakhs. Dealing it out guarantees the same contrast on every board and every
 * screen size, which is what a kiosk needs.
 */
export const dealOpeningBalances = (nodeIds : string[]) : Map<string, number> => {
    const bands = [ BALANCE_PROFILE.LOW, BALANCE_PROFILE.MID, BALANCE_PROFILE.HIGH ];
    const counts = bands.map(band => Math.floor(nodeIds.length * band.share));

    // Whatever rounding leaves over goes to the small accounts — they are the ones
    // the pattern is read against, and the board is never short of them
    counts[0] += nodeIds.length - counts.reduce((sum, count) => sum + count, 0);

    const dealt = new Map<string, number>();
    let cursor = 0;

    shuffle(nodeIds).forEach((id, index) => {
        while (cursor < counts.length - 1 && index >= counts.slice(0, cursor + 1).reduce((a, b) => a + b, 0)) {
            cursor += 1;
        }
        dealt.set(id, randomBetween(bands[cursor].min, bands[cursor].max));
    });

    return dealt;
};

// A low-balance mule has to actually be sitting on a few hundred rupees, or the
// pattern it is about to run makes no sense to look at
export const restingBalance = () =>
    randomBetween(LOW_BALANCE_CONFIG.RESTING_MIN, LOW_BALANCE_CONFIG.RESTING_MAX);

// MULE ROLES ==========================================================================================================
/**
 * Hand out one pattern to each active mule, spread evenly across the patterns
 * unlocked so far. Called when the board is built and again whenever a new pattern
 * joins, so a freshly unlocked pattern always has mules running it straight away.
 *
 * Low-balance duty goes to whichever mules are already sitting on the least money.
 * A recruiter would pick a dormant account for this, and it matters mechanically
 * too: emptying a well-funded account to make it fit the pattern would thin out the
 * rich end of the board over a round, and that spread is exactly what makes a low
 * balance read as low in the first place.
 */
export const distributeRoles = (
    muleIds          : string[],
    unlockedPatterns : PatternBehaviour[],
    balances       ? : Map<string, number>,
) : Map<string, PatternBehaviour> => {
    const roles = new Map<string, PatternBehaviour>();
    if (unlockedPatterns.length === 0) {
        return roles;
    }

    // Round-robin over a shuffled list, so every unlocked pattern is represented and
    // no pattern is always handed the same corner of the board. The pattern that just
    // joined is dealt an extra mule: a single account running it is part-way through a
    // routine most of the time, and the pattern would barely appear in the stretch of
    // the round the player was given it for.
    const deal = weightedTowardsNewest(unlockedPatterns);
    const shuffled = shuffle(muleIds);
    shuffled.forEach((id, index) => {
        roles.set(id, deal[index % deal.length]);
    });

    if (!balances || !unlockedPatterns.includes("low-balance")) {
        return roles;
    }

    // Swap the low-balance slots onto the poorest mules available
    const lowSlots = shuffled.filter(id => roles.get(id) === "low-balance");
    const poorestFirst = [ ...shuffled ].sort(
        (a, b) => (balances.get(a) ?? 0) - (balances.get(b) ?? 0),
    ).slice(0, lowSlots.length);

    lowSlots.forEach((slotId, index) => {
        const poorId = poorestFirst[index];
        if (!poorId || poorId === slotId) return;
        // Whatever the poorest account was going to do, the one it displaces takes on
        roles.set(slotId, roles.get(poorId)!);
        roles.set(poorId, "low-balance");
    });

    return roles;
};

/**
 * Which account should take over now that one has been caught, and what it should do.
 *
 * The new mule takes on whichever pattern is furthest below the share it is meant to
 * have — the same weighting the mules were dealt on, so catches top the board back up
 * towards the mix it was set up with instead of flattening it. Drawing at random, or
 * simply topping up whichever pattern has fewest accounts, would both undo that
 * weighting over a run of catches, and the pattern that suffers is the one unlocked
 * last: the one with the least of the round left and the most need to be seen.
 */
export const recruitReplacement = (
    nodes            : Node[],
    excludedIds      : Set<string>,
    unlockedPatterns : PatternBehaviour[],
    remainingRoles   : Map<string, PatternBehaviour>,
    balances       ? : Map<string, number>,
) : { nodeId : string; behaviour : PatternBehaviour } | null => {
    const candidates = nodes.filter(node => !excludedIds.has(node.id));

    // Below this the network has been cleaned out. A new mule here would have no
    // ordinary accounts left to move money through, so none is recruited and the
    // board winds down with the mules that are still running.
    if (candidates.length < MIN_ORDINARY_ACCOUNTS || unlockedPatterns.length === 0) {
        return null;
    }

    const running = new Map<PatternBehaviour, number>(unlockedPatterns.map(b => [ b, 0 ]));
    remainingRoles.forEach(role => running.set(role, (running.get(role) ?? 0) + 1));

    // The share each pattern is meant to hold, taken straight from the weighting the
    // mules were originally dealt on
    const weighted = weightedTowardsNewest(unlockedPatterns);
    const totalAfter = remainingRoles.size + 1;
    const shortfall = (b : PatternBehaviour) => {
        const target = (weighted.filter(x => x === b).length / weighted.length) * totalAfter;
        return target - (running.get(b) ?? 0);
    };

    const worst = Math.max(...unlockedPatterns.map(shortfall));
    const behaviour = pickOne(unlockedPatterns.filter(b => shortfall(b) === worst))!;

    // As above — a low-balance recruit is drawn from the quiet, near-empty accounts
    // rather than made to fit by emptying a well-funded one
    if (behaviour === "low-balance" && balances) {
        const poorest = [ ...candidates ]
            .sort((a, b) => (balances.get(a.id) ?? 0) - (balances.get(b.id) ?? 0))
            .slice(0, 8);
        return {nodeId : pickOne(poorest)!.id, behaviour};
    }

    return {nodeId : pickOne(candidates)!.id, behaviour};
};

// PATTERNS ============================================================================================================
/**
 * Decide what one mule does next.
 *
 * Counterparties are always drawn from the mule's neighbours in the network, so
 * every transaction travels a line that is actually drawn on screen.
 */
export const planBurst = (
    behaviour       : PatternBehaviour,
    nodes           : Node[],
    lockedNodes     : Set<string>,
    network         : Network,
    candidateIds    : string[],
    balances      ? : Map<string, number>,
) : Burst | null => {
    const byId = new Map(nodes.map(node => [ node.id, node ]));

    const available = candidateIds
        .map(id => byId.get(id))
        .filter((node) : node is Node => !!node && !lockedNodes.has(node.id));

    for (const mule of available) {
        // Only ordinary accounts the mule is actually joined to can take part
        const neighbours = (network.adjacency.get(mule.id) ?? [])
            .map(id => byId.get(id))
            .filter((node) : node is Node => !!node && !node.data.isMule);

        if (neighbours.length < 3) {
            continue;   // Too sparsely connected to show the pattern, try another mule
        }

        // The whole point of this pattern is the mismatch between what the account
        // holds and what passes through it. An account that is not actually short of
        // money has nothing to show, so it sits this one out rather than being
        // emptied to fit — draining it would thin out the rich end of the board, and
        // that spread is what makes a low balance read as low.
        if (behaviour === "low-balance" && balances
            && (balances.get(mule.id) ?? 0) > LOW_BALANCE_CONFIG.MAX_TO_RUN) {
            continue;
        }

        const planned : PlannedTransaction[] = [];
        const pool = shuffle(neighbours);

        if (behaviour === "fan-in") {
            // MANY credits in, consolidated, then out in ONE transaction
            const sources = pool.slice(0, Math.min(4, pool.length - 1));
            const destination = pool[sources.length];

            const amounts = sources.map(() => randomBetween(9000, 45000));
            sources.forEach((source, index) => {
                planned.push({
                    delay : index * STAGGER_MS, fromNode : source, toNode : mule,
                    amount : amounts[index], isInflow : true, muleId : mule.id,
                    movesBalance : true,
                });
            });

            const consolidated = amounts.reduce((sum, amount) => sum + amount, 0);
            planned.push({
                delay    : (sources.length - 1) * STAGGER_MS + FLIGHT_MS + HANDOFF_MS,
                fromNode : mule, toNode : destination,
                amount   : consolidated, isInflow : false, muleId : mule.id,
                movesBalance : true,
            });

        } else if (behaviour === "fan-out") {
            // ONE inflow, dispersed across MANY destinations
            const source = pool[0];
            // Four arms. Fewer than that and "one splits into many" does not read
            // as many; the calm comes from how many MULES run at once, not from
            // thinning out the shape of the pattern itself.
            const destinations = pool.slice(1, Math.min(5, pool.length));
            if (destinations.length < 2) continue;

            const inflow = randomBetween(60000, 140000);
            planned.push({
                delay : 0, fromNode : source, toNode : mule,
                amount : inflow, isInflow : true, muleId : mule.id,
                movesBalance : true,
            });

            let remaining = inflow;
            destinations.forEach((destination, index) => {
                const isLast = index === destinations.length - 1;
                const share = isLast ? remaining : Math.floor(inflow / destinations.length);
                remaining -= share;

                planned.push({
                    delay    : FLIGHT_MS + HANDOFF_MS + index * SPREAD_STAGGER_MS,
                    fromNode : mule, toNode : destination,
                    amount   : share, isInflow : false, muleId : mule.id,
                    movesBalance : true,
                });
            });

        } else if (behaviour === "gather-scatter") {
            // Brief aggregation, then rapid redistribution to a different set. The
            // split adapts to how well connected the mule is — on a twenty-account
            // board, insisting on three of each would leave the pattern unable to run.
            // Two in, three out. The turnaround is what identifies it, so the
            // gather side can be lighter than the scatter side.
            const sourceCount = Math.min(2, pool.length - 2);
            const sources = pool.slice(0, sourceCount);
            const destinations = pool.slice(sourceCount, sourceCount + 3);
            if (sources.length < 2 || destinations.length < 2) continue;

            const amounts = sources.map(() => randomBetween(12000, 40000));
            sources.forEach((source, index) => {
                planned.push({
                    delay : index * RAPID_STAGGER_MS, fromNode : source, toNode : mule,
                    amount : amounts[index], isInflow : true, muleId : mule.id,
                    movesBalance : true,
                });
            });

            const gathered = amounts.reduce((sum, amount) => sum + amount, 0);
            const outflowStart = (sources.length - 1) * RAPID_STAGGER_MS + FLIGHT_MS + RAPID_HANDOFF_MS;
            let remaining = gathered;

            destinations.forEach((destination, index) => {
                const isLast = index === destinations.length - 1;
                const share = isLast ? remaining : Math.floor(gathered / destinations.length);
                remaining -= share;

                planned.push({
                    delay    : outflowStart + index * RAPID_STAGGER_MS,
                    fromNode : mule, toNode : destination,
                    amount   : share, isInflow : false, muleId : mule.id,
                    movesBalance : true,
                });
            });

        } else {
            // LOW BALANCE — one very large sum lands on an account holding a few
            // hundred rupees, and a slightly smaller sum leaves moments later. The
            // mule keeps a small slice, which is what makes the two amounts differ.
            const partners = pool.slice(0, 2);
            if (partners.length < 2) continue;

            const inflow = randomBetween(LOW_BALANCE_CONFIG.INFLOW_MIN, LOW_BALANCE_CONFIG.INFLOW_MAX);
            const retained = randomBetween(LOW_BALANCE_CONFIG.RETAIN_FEE_MIN,
                                           LOW_BALANCE_CONFIG.RETAIN_FEE_MAX);
            const outflow = Math.max(1000, Math.round((inflow - retained) / 100) * 100);
            const hold = randomBetween(LOW_BALANCE_CONFIG.HOLD_MIN_MS, LOW_BALANCE_CONFIG.HOLD_MAX_MS);

            planned.push({
                delay : 0, fromNode : partners[0], toNode : mule,
                amount : inflow, isInflow : true, muleId : mule.id,
                movesBalance : true,
            });
            planned.push({
                delay : FLIGHT_MS + hold, fromNode : mule, toNode : partners[1],
                amount : outflow, isInflow : false, muleId : mule.id,
                movesBalance : true,
            });
        }

        if (planned.length === 0) {
            continue;
        }

        return {muleId : mule.id, transactions : planned};
    }

    return null;
};

// DECOYS ==============================================================================================================
/**
 * Movements that look like they might be worth a click, and are not. None of these
 * legs carry a muleId, so none of them flash, score or count as money stolen — the
 * player has to read the relationship rather than react to a big number.
 */
export const planDecoy = (
    nodes       : Node[],
    lockedNodes : Set<string>,
    network     : Network,
    balances    : Map<string, number>,
) : PlannedTransaction[] => {
    const byId = new Map(nodes.map(node => [ node.id, node ]));
    const ordinary = nodes.filter(node => !node.data.isMule && !lockedNodes.has(node.id));

    const neighboursOf = (node : Node) => (network.adjacency.get(node.id) ?? [])
        .map(id => byId.get(id))
        .filter((other) : other is Node =>
            !!other && !other.data.isMule && !lockedNodes.has(other.id));

    const isRich = (node : Node) => (balances.get(node.id) ?? 0) >= BALANCE_PROFILE.HIGH.min;
    const isSmall = (node : Node) => (balances.get(node.id) ?? 0) <= BALANCE_PROFILE.LOW.max;

    // A large sum between two accounts that comfortably hold it — a big number, and
    // nothing whatsoever out of the ordinary about it
    const richTransfer = () : PlannedTransaction[] => {
        const from = pickOne(ordinary.filter(isRich));
        const to = from && pickOne(neighboursOf(from).filter(isRich));
        if (!from || !to) return [];

        return [ {
            delay : 0, fromNode : from, toNode : to,
            amount : randomBetween(60000, 200000), isInflow : false,
        } ];
    };

    // A large sum lands somewhere small. Either it simply sits there, or the account
    // pays away something trivial that bears no relation to what arrived. Neither is
    // the pattern, and both hand the money back long afterwards, to where it came
    // from, so the board's balances stay believable over a full round.
    const landsSomewhereSmall = (withUnrelatedOutflow : boolean) : PlannedTransaction[] => {
        const target = pickOne(ordinary.filter(isSmall));
        const source = target && pickOne(neighboursOf(target).filter(node => !isSmall(node)));
        if (!target || !source) return [];

        const inflow = randomBetween(50000, 160000);
        const legs : PlannedTransaction[] = [ {
            delay : 0, fromNode : source, toNode : target,
            amount : inflow, isInflow : true, movesBalance : true,
        } ];

        if (withUnrelatedOutflow) {
            legs.push({
                delay    : FLIGHT_MS + randomBetween(700, 1500),
                fromNode : target, toNode : pickOne(neighboursOf(target)) ?? source,
                amount   : randomBetween(400, 3500), isInflow : false, movesBalance : true,
            });
        }

        legs.push({
            delay : FLIGHT_MS + DECOY_SETTLE_MS, fromNode : target, toNode : source,
            amount : inflow, isInflow : false, movesBalance : true,
        });

        return legs;
    };

    // Try the kinds in a fresh order and take the first that the board can actually
    // support. On twenty accounts any single kind will often find no one to use, and
    // giving up there would leave the decoys far too thin to do their job.
    const kinds = shuffle([
        richTransfer,
        () => landsSomewhereSmall(false),
        () => landsSomewhereSmall(true),
    ]);

    for (const kind of kinds) {
        const legs = kind();
        if (legs.length > 0) {
            return legs;
        }
    }

    return [];
};

// How long a full routine takes, from the first leg to the last one landing
export const burstDuration = (planned : PlannedTransaction[]) =>
    Math.max(...planned.map(transaction => transaction.delay)) + FLIGHT_MS;

export { ACTIVE_MULES };
