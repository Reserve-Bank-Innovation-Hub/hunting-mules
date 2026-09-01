// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { useCallback, useEffect, useMemo, useRef } from "react";

// LIB =================================================================================================================
import {
    BASE_BURST_INTERVAL, BASE_DECOY_INTERVAL, TRANSACTION_CONFIG,
    burstsAtStage, densityAtStage,
} from "$lib/gameConfig";
import { TransactionInstance, PatternFlash, GamePhase } from "$lib/gameTypes";
import { PATTERNS, PatternBehaviour } from "$lib/roundConfig";
import {
    burstDuration, planBurst, planDecoy, restingBalance, weightedTowardsNewest, PlannedTransaction,
} from "$lib/behaviours";
import { Network } from "$lib/network";
import { formatAmount } from "$lib/transactionUtils";

// ASSETS ==============================================================================================================
import TransactionSound from "../assets/sounds/transaction.wav";

interface UseTransactionsProps {
    nodes                      : Node[];
    activeTransactions         : TransactionInstance[];
    lockedNodes                : Set<string>;
    phase                      : GamePhase;
    unlockedPatterns           : number;
    muleRoles                  : Map<string, PatternBehaviour>;
    nodeBalances               : Map<string, number>;
    network                    : Network | null;
    setActiveTransactions      : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setPatternFlashes          : (updater : (prev : PatternFlash[]) => PatternFlash[]) => void;
    setMoneyLostToMules        : (updater : (prev : number) => number) => void;
    setTotalMoneyInCirculation : (updater : (prev : number) => number) => void;
    setNodeBalances            : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    createRipple               : (nodeId : string, x : number, y : number, isLocked? : boolean, isMuleReceiving? : boolean) => void;
}

// A cue per transaction turns to mush once the board is busy, and building an
// Audio element for each one is wasted work in the stretch that can least afford
// it. One cue per window is enough to read the board by.
const SOUND_THROTTLE_MS = 140;
let lastSoundAt = 0;

const playTransactionSound = () => {
    const now = Date.now();
    if (now - lastSoundAt < SOUND_THROTTLE_MS) {
        return;
    }
    lastSoundAt = now;

    const audio = new Audio(TransactionSound);
    audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
    });
};

// Flashes clear themselves when their animation ends. This is the backstop for the
// case where that never fires — a tab in the background, say — so the list can
// never grow without bound over a long round.
const MAX_LIVE_FLASHES = 40;

export const useTransactions = ({
    nodes,
    activeTransactions,
    lockedNodes,
    phase,
    unlockedPatterns,
    muleRoles,
    nodeBalances,
    network,
    setActiveTransactions,
    setPatternFlashes,
    setMoneyLostToMules,
    setTotalMoneyInCirculation,
    setNodeBalances,
    createRipple,
} : UseTransactionsProps) => {
    // Get all mule nodes
    const muleNodes = useMemo(() => {
        return nodes.filter(node => node.data.isMule);
    }, [ nodes ]);

    // The schedulers below run on timers, so they read the board through refs
    // rather than closing over values that go stale between ticks.
    // Mules part-way through a routine. One account running two patterns at once
    // reads as nothing at all, and for the low-balance pattern it is worse than
    // that — the account would still be holding the last sum when the next one
    // lands, and the balance the whole pattern is read against would be wrong.
    const busyMules = useRef<Set<string>>(new Set());

    const nodesRef = useRef(nodes);
    const lockedRef = useRef(lockedNodes);
    const networkRef = useRef(network);
    const rolesRef = useRef(muleRoles);
    const balancesRef = useRef(nodeBalances);
    nodesRef.current = nodes;
    lockedRef.current = lockedNodes;
    networkRef.current = network;
    rolesRef.current = muleRoles;
    balancesRef.current = nodeBalances;

    // How busy the board should be right now. The schedulers read this through a ref
    // rather than closing over it: a pattern unlock changes the density, and if that
    // tore the schedulers down it would take every queued leg with it — a mule's
    // pay-away, or a decoy handing money back — leaving accounts holding sums that
    // were meant to move on. They are set up once and live for the whole round.
    const densityRef = useRef(1);
    const phaseRef = useRef(phase);
    const unlockedRef = useRef(unlockedPatterns);
    densityRef.current = densityAtStage(unlockedPatterns);
    phaseRef.current = phase;
    unlockedRef.current = unlockedPatterns;

    // A leg planned on the previous pattern's board, still sitting on a timer when
    // the round changed. Its accounts are gone, so it has nowhere to travel — the
    // schedulers are torn down on a round change, but a leg already queued for the
    // next few hundred milliseconds would otherwise land on a board that no longer
    // has the accounts it names.
    const isStale = (planned : PlannedTransaction) => {
        const board = nodesRef.current;
        return !board.some(node => node.id === planned.fromNode.id)
            || !board.some(node => node.id === planned.toNode.id);
    };

    // Put one planned leg onto the board. Only legs that carry a muleId are part of a
    // pattern, and only those get the flash cue — ordinary traffic and decoys never do.
    const emit = useCallback((planned : PlannedTransaction) => {
        const locked = lockedRef.current;
        const isPattern = planned.muleId !== undefined;

        if (isStale(planned)) {
            return;
        }

        // A frozen mule cannot pay anything away, so its outflow simply never happens
        if (isPattern && !planned.isInflow && locked.has(planned.fromNode.id)) {
            return;
        }

        // An account can only pay away what it is actually holding. This matters when
        // part of a routine was interrupted — money bounced off a mule the player had
        // already caught, say — because the pay-away leg was sized for the whole lot.
        // Without this the account would hand over money it never received, and every
        // interrupted routine would quietly drain a balance towards zero.
        let amount = planned.amount;
        if (planned.movesBalance && !planned.isInflow) {
            const held = balancesRef.current.get(planned.fromNode.id) ?? 0;
            amount = Math.min(amount, held);
            if (amount <= 0) {
                return;
            }
        }

        const transaction : TransactionInstance = {
            id            : `txn-${Date.now()}-${Math.random()}`,
            fromNode      : planned.fromNode,
            toNode        : planned.toNode,
            amount        : formatAmount(amount),
            amountValue   : amount,
            isMuleInflow  : isPattern && planned.isInflow,
            isMuleOutflow : isPattern && !planned.isInflow,
            muleId           : planned.muleId,
            movesBalance     : planned.movesBalance,
            isInflowToHolder : planned.isInflow,
            startTime        : Date.now(),
        };

        if (isPattern) {
            // A line tracing the route the money is taking. It is created here but
            // holds off until the money is halfway across — the wait is in the CSS
            // animation's delay, so there is no timer to schedule or clean up. The
            // component clears it the moment the animation finishes.
            setPatternFlashes(prev => [ ...prev, {
                id     : `flash-${transaction.id}`,
                fromId : planned.fromNode.id,
                toId   : planned.toNode.id,
            } ].slice(-MAX_LIVE_FLASHES));
        }

        playTransactionSound();
        setActiveTransactions(prev => [ ...prev, transaction ]);
    }, [ setActiveTransactions, setPatternFlashes ]);

    // Background traffic and decoys are capped, so a busy board never turns to soup.
    // Pattern legs are never dropped — they are the thing being played.
    const emitIfRoom = useCallback((planned : PlannedTransaction) => {
        if (isStale(planned)) {
            return;
        }

        setActiveTransactions(prev => {
            if (prev.length >= TRANSACTION_CONFIG.MAX_CONCURRENT) {
                return prev;
            }

            return [ ...prev, {
                id           : `noise-${Date.now()}-${Math.random()}`,
                fromNode     : planned.fromNode,
                toNode       : planned.toNode,
                amount       : formatAmount(planned.amount),
                amountValue  : planned.amount,
                movesBalance     : planned.movesBalance,
                isInflowToHolder : planned.isInflow,
                startTime        : Date.now(),
            } ];
        });
    }, [ setActiveTransactions ]);

    // MULE BURSTS =====================================================================================================
    // Every so often one mule runs the pattern it has been given. Patterns take turns,
    // so a newly unlocked one is never crowded out by the ones the player already knows.
    useEffect(() => {
        if (nodes.length === 0 || !network) {
            return;
        }

        const pending : ReturnType<typeof setTimeout>[] = [];
        let nextTick : ReturnType<typeof setTimeout>;
        let turn = 0;

        // Set one mule running the given pattern. Returns false when no mule is free
        // to run it, so the wave above can try a different pattern instead.
        const launchBurst = (behaviour : PatternBehaviour) => {
            const currentNetwork = networkRef.current;
            if (!currentNetwork) {
                return false;
            }

            // Every mule running this pattern gets a look in, in a fresh order each
            // time, so none of them can sit out the whole round unnoticed
            const candidates = Array.from(rolesRef.current.entries())
                .filter(([ id, role ]) => role === behaviour && !busyMules.current.has(id))
                .map(([ id ]) => id)
                .sort(() => Math.random() - 0.5);

            const burst = planBurst(
                behaviour, nodesRef.current, lockedRef.current, currentNetwork,
                candidates, balancesRef.current,
            );
            if (!burst) {
                return false;
            }

            busyMules.current.add(burst.muleId);
            pending.push(setTimeout(
                () => busyMules.current.delete(burst.muleId),
                burstDuration(burst.transactions) + 300,
            ));

            burst.transactions.forEach(leg => {
                pending.push(setTimeout(() => emit(leg), leg.delay));
            });

            return true;
        };

        // A wave of routines, several of them overlapping. Patterns take turns from a
        // rotating start, weighted towards the one that just joined — see
        // weightedTowardsNewest. The first pass insists on a different pattern per
        // mule so what the player sees overlapping is two kinds of behaviour rather
        // than the same one twice; only if that cannot be filled does the second pass
        // allow a repeat on another mule.
        const runWave = () => {
            const unlocked = unlockedRef.current;
            if (phaseRef.current !== "playing" || unlocked === 0) {
                return;
            }

            const rotation = weightedTowardsNewest(
                PATTERNS.slice(0, unlocked).map(pattern => pattern.behaviour),
            );

            const wanted = burstsAtStage(unlocked);
            const start = turn++;
            const alreadyRunning = new Set<PatternBehaviour>();
            let launched = 0;

            for (let i = 0; i < rotation.length * 2 && launched < wanted; i++) {
                const behaviour = rotation[(start + i) % rotation.length];
                const insistOnDistinct = i < rotation.length;

                if (insistOnDistinct && alreadyRunning.has(behaviour)) {
                    continue;
                }

                alreadyRunning.add(behaviour);
                if (launchBurst(behaviour)) {
                    launched += 1;
                }
            }
        };

        // Reschedules itself each time, so a change of pace takes effect on the next
        // tick without disturbing anything already queued
        const tick = () => {
            runWave();
            nextTick = setTimeout(tick, Math.round(BASE_BURST_INTERVAL / densityRef.current));
        };

        // Get one going straight away rather than making the player wait a full interval
        nextTick = setTimeout(tick, 400);

        return () => {
            clearTimeout(nextTick);
            pending.forEach(clearTimeout);
            busyMules.current.clear();
        };
    }, [ nodes.length, network, emit, setNodeBalances ]);

    // DECOYS ==========================================================================================================
    // Movements that look like they might be worth a click, and are not — so a big
    // number on its own is never enough to go on.
    useEffect(() => {
        if (nodes.length === 0 || !network) {
            return;
        }

        const pending : ReturnType<typeof setTimeout>[] = [];
        let nextTick : ReturnType<typeof setTimeout>;

        const tick = () => {
            const currentNetwork = networkRef.current;
            if (currentNetwork && phaseRef.current === "playing") {
                planDecoy(nodesRef.current, lockedRef.current, currentNetwork, balancesRef.current)
                    .forEach(leg => {
                        pending.push(setTimeout(() => emitIfRoom(leg), leg.delay));
                    });
            }
            nextTick = setTimeout(tick, Math.round(BASE_DECOY_INTERVAL / densityRef.current));
        };

        nextTick = setTimeout(tick, BASE_DECOY_INTERVAL);

        return () => {
            clearTimeout(nextTick);
            pending.forEach(clearTimeout);
        };
    }, [ nodes.length, network, emitIfRoom ]);

    // BACKGROUND NOISE ================================================================================================
    // Ordinary one-to-one payments between normal accounts, so a mule is spotted by
    // its pattern rather than by being the only thing moving.
    useEffect(() => {
        if (nodes.length === 0) {
            return;
        }

        let nextTick : ReturnType<typeof setTimeout>;

        const tick = () => {
            const currentNetwork = networkRef.current;

            if (currentNetwork && currentNetwork.edges.length > 0 && phaseRef.current === "playing") {
                const byId = new Map(nodesRef.current.map(node => [ node.id, node ]));

                // Ordinary payments run between joined accounts, along a line that is
                // drawn. Mules are left out of the noise so their own pattern stays readable.
                const plainEdges = currentNetwork.edges.filter(edge => {
                    const a = byId.get(edge.from);
                    const b = byId.get(edge.to);
                    return a && b && !a.data.isMule && !b.data.isMule;
                });

                if (plainEdges.length > 0) {
                    const edge = plainEdges[Math.floor(Math.random() * plainEdges.length)];
                    const forwards = Math.random() < 0.5;

                    emitIfRoom({
                        delay    : 0,
                        fromNode : byId.get(forwards ? edge.from : edge.to)!,
                        toNode   : byId.get(forwards ? edge.to : edge.from)!,
                        amount   : Math.floor(50 + Math.random() * 400),
                        isInflow : false,
                    });
                }
            }

            nextTick = setTimeout(tick, Math.round(
                1000 / (TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND * densityRef.current),
            ));
        };

        nextTick = setTimeout(tick, 500);

        return () => clearTimeout(nextTick);
    }, [ nodes.length, emitIfRoom ]);

    // COMPLETION ======================================================================================================
    const handleTransactionComplete = useCallback((transactionId : string) => {
        const completed = activeTransactions.find(t => t.id === transactionId);

        setActiveTransactions(prev => prev.filter(t => t.id !== transactionId));

        if (!completed) {
            return;
        }

        // A bounce has already done its job by getting the money home
        if (completed.isBounced || completed.isReturnLeg) {
            return;
        }

        const amount = completed.amountValue ?? 0;
        // Same reasoning as the stamp: a caught account is no longer flagged as a
        // mule, so being locked is the whole test
        const hitAFrozenMule = lockedRef.current.has(completed.toNode.id);

        // Money aimed at a mule the player has already caught is turned away at the door
        if (hitAFrozenMule) {
            const bounce : TransactionInstance = {
                id          : `bounce-${Date.now()}-${Math.random()}`,
                fromNode    : completed.toNode,
                toNode      : completed.fromNode,
                amount      : completed.amount,
                amountValue : amount,
                isReturnLeg : true,
                startTime   : Date.now(),
            };

            createRipple(completed.toNode.id, completed.toNode.position.x, completed.toNode.position.y, true, false);
            setTimeout(() => setActiveTransactions(prev => [ ...prev, bounce ]), 250);
            return;
        }

        // Only the account at the middle of a routine has its balance move — the one
        // taking the money in and passing it on. Its counterparties are funded from a
        // network far wider than the twenty accounts on screen, so their chips hold
        // still. This is what keeps a balance meaningful over a full round: a number
        // that moves is a number worth reading.
        if (completed.movesBalance) {
            const holderId = completed.isInflowToHolder
                ? completed.toNode.id
                : completed.fromNode.id;

            setNodeBalances(prev => {
                const next = new Map(prev);
                const current = next.get(holderId) ?? 0;
                next.set(holderId, completed.isInflowToHolder
                    ? current + amount
                    : Math.max(0, current - amount));
                return next;
            });
        }

        // A mule paying money away is the moment it leaves circulation for good
        if (completed.isMuleOutflow) {
            setMoneyLostToMules(prev => prev + amount);
            setTotalMoneyInCirculation(prev => Math.max(0, prev - amount));

            // A low-balance account goes quiet again the moment the money is gone —
            // the mule takes its cut out and the account is back to a few hundred
            // rupees, ready to be read the same way next time. Without this the slice
            // it keeps would build up past the point where the account still counts as
            // low, and it would quietly stop running the pattern altogether.
            const mule = completed.fromNode.id;
            if (rolesRef.current.get(mule) === "low-balance") {
                setNodeBalances(prev => new Map(prev).set(mule, restingBalance()));
            }
        }
    }, [
        activeTransactions, createRipple, setActiveTransactions, setMoneyLostToMules,
        setTotalMoneyInCirculation, setNodeBalances,
    ]);

    return {
        handleTransactionComplete,
        muleNodes,
    };
};
