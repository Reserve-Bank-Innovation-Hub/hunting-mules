// REACT CORE ==========================================================================================================
import { Node } from "reactflow";

// LIB =================================================================================================================
import { FLIGHT_MS, LOW_BALANCE_CONFIG } from "./gameConfig";
import { PatternBehaviour } from "./roundConfig";
import { Network, edgeKey } from "./network";

// A single leg of a mule's routine, queued to fire `delay` ms after the burst starts
export interface PlannedTransaction {
    delay    : number;
    fromNode : Node;
    toNode   : Node;
    amount   : number;
    isInflow : boolean;   // Money moving into the mule, rather than back out
    muleId   : string;
}

export interface Burst {
    muleId       : string;
    transactions : PlannedTransaction[];
    edgeIds      : string[];   // The paths to light up while this plays out
}

const randomBetween = (min : number, max : number) =>
    Math.floor(min + Math.random() * (max - min + 1));

const shuffle = <T,>(items : T[]) : T[] => [ ...items ].sort(() => Math.random() - 0.5);

// The gap between money landing on a mule and the mule moving it on again
const HANDOFF_MS = 520;
const STAGGER_MS = 170;
// Gather-scatter is defined by how quickly it turns money around
const RAPID_HANDOFF_MS = 180;
const RAPID_STAGGER_MS = 110;

/**
 * Decide what one mule does next.
 *
 * The three patterns come straight from the verified definitions:
 *   fan-in         many credits consolidated, then moved out in a single transaction
 *   fan-out        a single inflow dispersed across many destinations
 *   gather-scatter brief aggregation followed by rapid redistribution
 *
 * Counterparties are always drawn from the mule's neighbours in the network, so
 * every transaction travels a line that is actually drawn on screen.
 */
export const planBurst = (
    behaviour        : PatternBehaviour,
    nodes            : Node[],
    lockedNodes      : Set<string>,
    network          : Network,
    preferredMuleId ? : string,
) : Burst | null => {
    const byId = new Map(nodes.map(node => [ node.id, node ]));
    const availableMules = nodes.filter(node => node.data.isMule && !lockedNodes.has(node.id));

    if (availableMules.length === 0) {
        return null;
    }

    // The scheduler rotates through the mules so every one of them gets a turn to
    // give itself away within the pattern, rather than leaving it to chance
    const ordered = preferredMuleId
        ? [ ...availableMules.filter(n => n.id === preferredMuleId), ...availableMules.filter(n => n.id !== preferredMuleId) ]
        : shuffle(availableMules);

    for (const mule of ordered) {
        // Only ordinary accounts the mule is actually joined to can take part
        const neighbours = (network.adjacency.get(mule.id) ?? [])
            .map(id => byId.get(id))
            .filter((node) : node is Node => !!node && !node.data.isMule);

        if (neighbours.length < 3) {
            continue;   // Too sparsely connected to show the pattern, try another mule
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
                });
            });

            const consolidated = amounts.reduce((sum, amount) => sum + amount, 0);
            planned.push({
                delay    : (sources.length - 1) * STAGGER_MS + FLIGHT_MS + HANDOFF_MS,
                fromNode : mule, toNode : destination,
                amount   : consolidated, isInflow : false, muleId : mule.id,
            });

        } else if (behaviour === "fan-out") {
            // ONE inflow, dispersed across MANY destinations
            const source = pool[0];
            const destinations = pool.slice(1, Math.min(6, pool.length));
            if (destinations.length < 2) continue;

            const inflow = randomBetween(60000, 140000);
            planned.push({
                delay : 0, fromNode : source, toNode : mule,
                amount : inflow, isInflow : true, muleId : mule.id,
            });

            let remaining = inflow;
            destinations.forEach((destination, index) => {
                const isLast = index === destinations.length - 1;
                const share = isLast ? remaining : Math.floor(inflow / destinations.length);
                remaining -= share;

                planned.push({
                    delay    : FLIGHT_MS + HANDOFF_MS + index * STAGGER_MS,
                    fromNode : mule, toNode : destination,
                    amount   : share, isInflow : false, muleId : mule.id,
                });
            });

        } else if (behaviour === "gather-scatter") {
            // Brief aggregation, then rapid redistribution to a different set
            const sources = pool.slice(0, 3);
            const destinations = pool.slice(3, 6);
            if (destinations.length < 2) continue;

            const amounts = sources.map(() => randomBetween(12000, 40000));
            sources.forEach((source, index) => {
                planned.push({
                    delay : index * RAPID_STAGGER_MS, fromNode : source, toNode : mule,
                    amount : amounts[index], isInflow : true, muleId : mule.id,
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
                });
            });

        } else {
            // Low balance — kept working, though it is not in the current pattern set
            const partners = pool.slice(0, 2);
            if (partners.length < 2) continue;

            const surge = randomBetween(LOW_BALANCE_CONFIG.INFLOW_MIN, LOW_BALANCE_CONFIG.INFLOW_MAX);
            planned.push({
                delay : 0, fromNode : partners[0], toNode : mule,
                amount : surge, isInflow : true, muleId : mule.id,
            });
            planned.push({
                delay : FLIGHT_MS + LOW_BALANCE_CONFIG.HOLD_MS, fromNode : mule, toNode : partners[1],
                amount : surge, isInflow : false, muleId : mule.id,
            });
        }

        if (planned.length === 0) {
            continue;
        }

        return {
            muleId       : mule.id,
            transactions : planned,
            edgeIds      : Array.from(new Set(
                planned.map(leg => edgeKey(leg.fromNode.id, leg.toNode.id)),
            )),
        };
    }

    return null;
};

// How long a full burst takes, so the scheduler knows when the paths can dim again
export const burstDuration = (planned : PlannedTransaction[]) =>
    Math.max(...planned.map(transaction => transaction.delay)) + FLIGHT_MS;
