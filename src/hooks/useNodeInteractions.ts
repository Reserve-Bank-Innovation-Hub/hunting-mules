// REACT CORE ==========================================================================================================
import { Node } from "reactflow";
import { useCallback, useEffect, useRef } from "react";

// LIB =================================================================================================================
import { TransactionInstance } from "$lib/gameTypes";
import { PATTERNS, PatternBehaviour } from "$lib/roundConfig";
import { recruitReplacement, restingBalance } from "$lib/behaviours";

// ASSETS ==============================================================================================================
import UncoveredSound from "../assets/sounds/uncovered.wav";
import WrongSound from "../assets/sounds/wrong.wav";

interface UseNodeInteractionsProps {
    nodes                 : Node[];
    lockedNodes           : Set<string>;
    unlockedPatterns      : number;
    muleRoles             : Map<string, PatternBehaviour>;
    nodeBalances          : Map<string, number>;
    setLockedNodes        : (updater : (prev : Set<string>) => Set<string>) => void;
    setShakingNodes       : (updater : (prev : Set<string>) => Set<string>) => void;
    setCaughtMules        : (updater : (prev : Map<string, PatternBehaviour>) => Map<string, PatternBehaviour>) => void;
    setMuleRoles          : (updater : (prev : Map<string, PatternBehaviour>) => Map<string, PatternBehaviour>) => void;
    setNodeBalances       : (updater : (prev : Map<string, number>) => Map<string, number>) => void;
    setActiveTransactions : (updater : (prev : TransactionInstance[]) => TransactionInstance[]) => void;
}

export const useNodeInteractions = ({
    nodes,
    lockedNodes,
    unlockedPatterns,
    muleRoles,
    nodeBalances,
    setLockedNodes,
    setShakingNodes,
    setCaughtMules,
    setMuleRoles,
    setNodeBalances,
    setActiveTransactions,
} : UseNodeInteractionsProps) => {
    // Mules already counted. Held in a ref so the de-dupe check happens in the click
    // handler itself, never inside a state updater — React may call an updater more
    // than once for the same click, which would count the same catch twice. Nothing
    // is ever removed from this: a caught account stays caught for the round.
    const countedMules = useRef<Set<string>>(new Set());

    const shakeTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

    const nodesRef = useRef(nodes);
    const rolesRef = useRef(muleRoles);
    const lockedRef = useRef(lockedNodes);
    const balancesRef = useRef(nodeBalances);
    const unlockedRef = useRef(unlockedPatterns);
    nodesRef.current = nodes;
    rolesRef.current = muleRoles;
    lockedRef.current = lockedNodes;
    balancesRef.current = nodeBalances;
    unlockedRef.current = unlockedPatterns;

    useEffect(() => () => {
        shakeTimers.current.forEach(clearTimeout);
        shakeTimers.current = [];
    }, []);

    const handleNodeClick = useCallback((nodeId : string, isMule : boolean) => {
        // A WRONG CALL COSTS NOTHING ==================================================================================
        // The account shakes it off and the score stands. This game is here to teach a
        // pattern, so guessing badly must never be more expensive than not guessing.
        if (!isMule) {
            setShakingNodes(prev => new Set(prev).add(nodeId));

            const audio = new Audio(WrongSound);
            audio.play().catch((error) => {
                console.log("Audio playback failed:", error);
            });

            shakeTimers.current.push(setTimeout(() => {
                setShakingNodes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(nodeId);
                    return newSet;
                });
            }, 600));   // Match CSS animation duration
            return;
        }

        // A CATCH =====================================================================================================
        // Already counted, so nothing to do
        if (countedMules.current.has(nodeId)) {
            return;
        }
        countedMules.current.add(nodeId);

        setLockedNodes(prev => new Set(prev).add(nodeId));

        // Recording which account was caught, and what it was doing, rather than adding
        // one to a tally. Run this twice for the same account and the map is unchanged,
        // so the score is unchanged — which is what stops a catch ever counting as two.
        // The pattern is read now because the role is about to pass to a replacement,
        // and the field visits after the round need to know what this was frozen for.
        const behaviour = rolesRef.current.get(nodeId) ?? PATTERNS[0].behaviour;
        setCaughtMules(prev => prev.has(nodeId) ? prev : new Map(prev).set(nodeId, behaviour));

        const audio = new Audio(UncoveredSound);
        audio.play().catch((error) => {
            console.log("Audio playback failed:", error);
        });

        // The network does not stop because one account was shut down. A fresh mule
        // starts up elsewhere immediately, so there is always something to hunt and
        // the score can keep climbing for the whole round.
        // Worked out here rather than inside an updater — React may call an updater
        // more than once, and recruiting twice would put two mules on the board
        const remaining = new Map(rolesRef.current);
        remaining.delete(nodeId);

        // Accounts still frozen from an earlier catch are not eligible — one cannot
        // pay anything away, so it would sit there looking like a mule doing nothing
        const replacement = recruitReplacement(
            nodesRef.current,
            new Set([
                ...Array.from(rolesRef.current.keys()),
                ...Array.from(lockedRef.current),
                nodeId,
            ]),
            PATTERNS.slice(0, unlockedRef.current).map(pattern => pattern.behaviour),
            remaining,
            balancesRef.current,
        );

        setMuleRoles(() => {
            const next = new Map(remaining);
            if (replacement) {
                next.set(replacement.nodeId, replacement.behaviour);
            }
            return next;
        });

        // A new low-balance mule has to actually be sitting on a few hundred rupees
        if (replacement?.behaviour === "low-balance") {
            setNodeBalances(prev => new Map(prev).set(replacement.nodeId, restingBalance()));
        }

        // Money already on its way to this mule is turned around mid-flight
        const bouncedAt = Date.now();
        setActiveTransactions(transactions =>
            transactions.map(transaction => {
                if (transaction.toNode.id === nodeId && !transaction.isBounced) {
                    return {
                        ...transaction,
                        isBounced : true,
                        // Swap the from and to nodes to reverse direction
                        fromNode  : transaction.toNode,
                        toNode    : transaction.fromNode,
                        startTime : bouncedAt,   // Reset animation start time
                    };
                }
                return transaction;
            }),
        );

        // The account stays shut down for the rest of the round — stamped, frozen and
        // out of play. It is the player's record of the catch, and it is the reason
        // the board thins out as they score.
    }, [
        setLockedNodes, setShakingNodes, setCaughtMules,
        setMuleRoles, setNodeBalances, setActiveTransactions,
    ]);

    return {
        handleNodeClick,
    };
};
