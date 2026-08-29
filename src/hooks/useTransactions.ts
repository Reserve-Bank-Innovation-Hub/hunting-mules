// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { useCallback, useEffect, useMemo, useRef } from "react";

// LIB =================================================================================================================
import { TRANSACTION_CONFIG, LOW_BALANCE_CONFIG } from "$lib/gameConfig";
import { TransactionInstance, GamePhase } from "$lib/gameTypes";
import { ROUNDS } from "$lib/roundConfig";
import { planBurst, burstDuration, PlannedTransaction } from "$lib/behaviours";
import { Network, edgeKey } from "$lib/network";
import { formatAmount } from "$lib/transactionUtils";

// ASSETS ==============================================================================================================
import TransactionSound from "../assets/sounds/transaction.wav";

interface UseTransactionsProps {
    nodes                      : Node[];
    activeTransactions         : TransactionInstance[];
    lockedNodes                : Set<string>;
    totalMoneyInCirculation    : number;
    phase                      : GamePhase;
    roundIndex                 : number;
    network                    : Network | null;
    setActiveTransactions      : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
    setMoneyLostToMules        : (updater : (prev : number) => number) => void;
    setTotalMoneyInCirculation : (updater : (prev : number) => number) => void;
    setNodeBalances            : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setSurgingNodes            : (updater : (prev : Set<string>) => Set<string>) => void;
    setActiveEdges             : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    createRipple               : (nodeId : string, x : number, y : number, isLocked? : boolean, isMuleReceiving? : boolean) => void;
}

const playTransactionSound = () => {
    const audio = new Audio(TransactionSound);
    audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
    });
};

export const useTransactions = ({
    nodes,
    activeTransactions,
    lockedNodes,
    totalMoneyInCirculation,
    phase,
    roundIndex,
    network,
    setActiveTransactions,
    setMoneyLostToMules,
    setTotalMoneyInCirculation,
    setNodeBalances,
    setSurgingNodes,
    setActiveEdges,
    createRipple,
} : UseTransactionsProps) => {
    const round = ROUNDS[roundIndex];

    // Get all mule nodes
    const muleNodes = useMemo(() => {
        return nodes.filter(node => node.data.isMule);
    }, [ nodes ]);

    // The schedulers below run on timers, so they read the board through refs
    // rather than closing over values that go stale between ticks.
    const nodesRef = useRef(nodes);
    const lockedRef = useRef(lockedNodes);
    const networkRef = useRef(network);
    nodesRef.current = nodes;
    lockedRef.current = lockedNodes;
    networkRef.current = network;

    // Put one planned leg of a burst onto the board
    const emit = useCallback((planned : PlannedTransaction) => {
        const locked = lockedRef.current;

        // A frozen mule cannot pay anything away, so its outflow simply never happens
        if (!planned.isInflow && locked.has(planned.fromNode.id)) {
            return;
        }

        const transaction : TransactionInstance = {
            id            : `burst-${Date.now()}-${Math.random()}`,
            fromNode      : planned.fromNode,
            toNode        : planned.toNode,
            amount        : formatAmount(planned.amount),
            amountValue   : planned.amount,
            isMuleInflow  : planned.isInflow,
            isMuleOutflow : !planned.isInflow,
            muleId        : planned.muleId,
            startTime     : Date.now(),
        };

        playTransactionSound();
        setActiveTransactions(prev => [ ...prev, transaction ]);
    }, [ setActiveTransactions ]);

    // MULE BURSTS =====================================================================================================
    // Every so often one mule runs through the pattern this round is teaching.
    useEffect(() => {
        if (phase !== "playing" || !round || nodes.length === 0 || totalMoneyInCirculation <= 0 || !network) {
            return;
        }

        const pending : ReturnType<typeof setTimeout>[] = [];

        // Take mules in a shuffled rotation, refilling once everyone has had a turn,
        // so no mule can sit out the whole round unnoticed
        let queue : string[] = [];

        const nextMuleId = () => {
            const available = nodesRef.current
                .filter(node => node.data.isMule && !lockedRef.current.has(node.id))
                .map(node => node.id);

            queue = queue.filter(id => available.includes(id));

            if (queue.length === 0) {
                queue = [ ...available ].sort(() => Math.random() - 0.5);
            }

            return queue.shift();
        };

        const runBurst = () => {
            const currentNetwork = networkRef.current;
            if (!currentNetwork) {
                return;
            }

            const burst = planBurst(
                round.behaviour, nodesRef.current, lockedRef.current, currentNetwork, nextMuleId(),
            );
            if (!burst) {
                return;
            }

            // Light the paths this pattern runs along, and dim them once it is done
            setActiveEdges(prev => {
                const next = new Map(prev);
                burst.edgeIds.forEach(id => next.set(id, (next.get(id) ?? 0) + 1));
                return next;
            });

            pending.push(setTimeout(() => {
                setActiveEdges(prev => {
                    const next = new Map(prev);
                    burst.edgeIds.forEach(id => {
                        const count = (next.get(id) ?? 1) - 1;
                        if (count > 0) next.set(id, count);
                        else next.delete(id);
                    });
                    return next;
                });
            }, burstDuration(burst.transactions) + 400));

            burst.transactions.forEach(leg => {
                pending.push(setTimeout(() => emit(leg), leg.delay));
            });
        };

        // Get one going straight away rather than making the player wait a full interval
        pending.push(setTimeout(runBurst, 400));
        const interval = setInterval(runBurst, round.burstInterval);

        return () => {
            clearInterval(interval);
            pending.forEach(clearTimeout);
        };
    }, [ phase, roundIndex, round, nodes.length, totalMoneyInCirculation <= 0, network, emit, setActiveEdges ]);

    // BACKGROUND NOISE ================================================================================================
    // Ordinary one-to-one payments between normal accounts, so a mule is spotted by
    // its pattern rather than by being the only thing moving.
    useEffect(() => {
        if (phase !== "playing" || nodes.length === 0 || totalMoneyInCirculation <= 0) {
            return;
        }

        const interval = setInterval(() => {
            const currentNetwork = networkRef.current;
            if (!currentNetwork || currentNetwork.edges.length === 0) {
                return;
            }

            const byId = new Map(nodesRef.current.map(node => [ node.id, node ]));

            // Ordinary payments run between joined accounts, along a line that is drawn.
            // Mules are left out of the noise so their own pattern stays readable.
            const plainEdges = currentNetwork.edges.filter(edge => {
                const a = byId.get(edge.from);
                const b = byId.get(edge.to);
                return a && b && !a.data.isMule && !b.data.isMule;
            });
            if (plainEdges.length === 0) {
                return;
            }

            const edge = plainEdges[Math.floor(Math.random() * plainEdges.length)];
            const forwards = Math.random() < 0.5;
            const fromNode = byId.get(forwards ? edge.from : edge.to)!;
            const toNode = byId.get(forwards ? edge.to : edge.from)!;

            const amount = Math.floor(50 + Math.random() * 400);
            const transaction : TransactionInstance = {
                id          : `noise-${Date.now()}-${Math.random()}`,
                fromNode,
                toNode,
                amount      : formatAmount(amount),
                amountValue : amount,
                startTime   : Date.now(),
            };

            setActiveTransactions(prev =>
                prev.length >= TRANSACTION_CONFIG.MAX_CONCURRENT ? prev : [ ...prev, transaction ],
            );
        }, 1000 / TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND);

        return () => clearInterval(interval);
    }, [ phase, roundIndex, nodes.length, totalMoneyInCirculation <= 0, setActiveTransactions ]);

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
        const hitAFrozenMule = completed.toNode.data.isMule && lockedRef.current.has(completed.toNode.id);

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

        // Money reaching a mule that is still running swells its balance
        if (completed.isMuleInflow && completed.toNode.data.isMule) {
            setNodeBalances(prev => {
                const next = new Map(prev);
                next.set(completed.toNode.id, (next.get(completed.toNode.id) ?? 0) + amount);
                return next;
            });
            setSurgingNodes(prev => new Set(prev).add(completed.toNode.id));
            return;
        }

        // The mule has paid the money away — this is the moment it leaves circulation
        if (completed.isMuleOutflow) {
            setMoneyLostToMules(prev => prev + amount);
            setTotalMoneyInCirculation(prev => Math.max(0, prev - amount));

            setNodeBalances(prev => {
                const next = new Map(prev);
                const drained = Math.max(
                    LOW_BALANCE_CONFIG.RESTING_BALANCE,
                    (next.get(completed.fromNode.id) ?? 0) - amount,
                );
                next.set(completed.fromNode.id, drained);
                return next;
            });
            setSurgingNodes(prev => {
                const next = new Set(prev);
                next.delete(completed.fromNode.id);
                return next;
            });
        }
    }, [
        activeTransactions, createRipple, setActiveTransactions, setMoneyLostToMules,
        setTotalMoneyInCirculation, setNodeBalances, setSurgingNodes,
    ]);

    return {
        handleTransactionComplete,
        muleNodes,
    };
};
