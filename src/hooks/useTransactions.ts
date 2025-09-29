import { useCallback, useEffect, useMemo } from "react";
import { Node } from "reactflow";
import { TransactionInstance, NodeRipple } from "../lib/gameTypes";
import { TRANSACTION_CONFIG } from "../lib/gameConfig";
import { generateRandomAmount, parseAmount, formatAmount } from "../lib/transactionUtils";

interface UseTransactionsProps {
    nodes: Node[];
    activeTransactions: TransactionInstance[];
    pendingMoneyLoss: Map<string, number>;
    lockedNodes: Set<string>;
    totalMoneyInCirculation: number;
    mulesFoundCount: number;
    actualMuleCount: number;
    setActiveTransactions: (updater: (prev: TransactionInstance[]) => TransactionInstance[]) => void;
    setMoneyLostToMules: (updater: (prev: number) => number) => void;
    setTotalMoneyInCirculation: (updater: (prev: number) => number) => void;
    setPendingMoneyLoss: (updater: (prev: Map<string, number>) => Map<string, number>) => void;
    createRipple: (nodeId: string, x: number, y: number, isLocked?: boolean) => void;
}

export const useTransactions = ({
    nodes,
    activeTransactions,
    pendingMoneyLoss,
    lockedNodes,
    totalMoneyInCirculation,
    mulesFoundCount,
    actualMuleCount,
    setActiveTransactions,
    setMoneyLostToMules,
    setTotalMoneyInCirculation,
    setPendingMoneyLoss,
    createRipple,
}: UseTransactionsProps) => {

    // Get all mule nodes
    const muleNodes = useMemo(() => {
        return nodes.filter(node => node.data.isMule);
    }, [nodes]);

    // Helper function to get random nodes
    const getRandomNodes = useCallback(() => {
        // Get only normal accounts for "from" node (mules don't initiate transactions)
        const normalNodes = nodes.filter(node => !node.data.isMule);
        // Get available target nodes (exclude locked mules)
        const availableTargetNodes = nodes.filter(node => !(node.data.isMule && node.data.isLocked));

        if (normalNodes.length === 0 || availableTargetNodes.length === 0) {
            return null; // Cannot create transaction
        }

        const fromIndex = Math.floor(Math.random() * normalNodes.length);
        let toIndex = Math.floor(Math.random() * availableTargetNodes.length);

        // Ensure we don't select the same node
        while (availableTargetNodes[toIndex].id === normalNodes[fromIndex].id) {
            toIndex = Math.floor(Math.random() * availableTargetNodes.length);
            // Prevent infinite loop if only one valid target
            if (availableTargetNodes.length === 1 && availableTargetNodes[0].id === normalNodes[fromIndex].id) {
                return null;
            }
        }

        return {
            fromNode: normalNodes[fromIndex],
            toNode: availableTargetNodes[toIndex],
        };
    }, [nodes, lockedNodes]);

    // Create new transaction
    const createTransaction = useCallback(() => {
        if (activeTransactions.length >= TRANSACTION_CONFIG.MAX_CONCURRENT) {
            return; // Don't create more transactions if we're at the limit
        }

        const randomNodesResult = getRandomNodes();
        if (!randomNodesResult) {
            return; // Cannot create transaction (no valid targets)
        }

        const { fromNode, toNode } = randomNodesResult;
        const newTransaction: TransactionInstance = {
            id: `transaction-${Date.now()}-${Math.random()}`,
            fromNode,
            toNode,
            amount: generateRandomAmount(),
        };

        // Create ripples for both nodes
        createRipple(fromNode.id, fromNode.position.x, fromNode.position.y, fromNode.data.isLocked || false);
        createRipple(toNode.id, toNode.position.x, toNode.position.y, toNode.data.isLocked || false);

        setActiveTransactions(prev => [...prev, newTransaction]);
    }, [activeTransactions.length, getRandomNodes, createRipple, setActiveTransactions]);

    // Handle transaction completion
    const handleTransactionComplete = useCallback((transactionId: string) => {
        const completedTransaction = activeTransactions.find(t => t.id === transactionId);

        // Check if transaction hit a locked mule - bounce it back
        if (completedTransaction && completedTransaction.toNode.data.isMule && completedTransaction.toNode.data.isLocked) {
            // Bounce the transaction back to sender
            const bounceTransaction: TransactionInstance = {
                id: `bounce-${Date.now()}-${Math.random()}`,
                fromNode: completedTransaction.toNode,
                toNode: completedTransaction.fromNode,
                amount: completedTransaction.amount,
            };

            // Create ripples for bounce
            createRipple(
                completedTransaction.toNode.id,
                completedTransaction.toNode.position.x,
                completedTransaction.toNode.position.y,
                completedTransaction.toNode.data.isLocked || false);
            createRipple(
                completedTransaction.fromNode.id,
                completedTransaction.fromNode.position.x,
                completedTransaction.fromNode.position.y,
                completedTransaction.fromNode.data.isLocked || false);

            // Add bounce transaction with delay
            setTimeout(() => {
                setActiveTransactions(prev => [...prev, bounceTransaction]);
            }, 300);

            // Remove original transaction
            setActiveTransactions(prev => prev.filter(t => t.id !== transactionId));
            return;
        }

        // Handle bounced transaction returning to a mule account
        if (completedTransaction && completedTransaction.toNode.data.isMule && !completedTransaction.toNode.data.isLocked &&
            completedTransaction.id.startsWith("bounce-")) {
            // This is a bounced transaction hitting a mule - treat as normal mule behavior
            const originalAmount = parseAmount(completedTransaction.amount);
            const splitCount = Math.random() < 0.5 ? 2 : 3;

            const splitAmounts = [];
            let remainingAmount = originalAmount;

            for (let i = 0; i < splitCount - 1; i++) {
                const splitAmount = Math.floor(remainingAmount * (0.2 + Math.random() * 0.6));
                splitAmounts.push(splitAmount);
                remainingAmount -= splitAmount;
            }
            splitAmounts.push(remainingAmount);

            const availableMules = muleNodes.filter(node =>
                node.id !== completedTransaction.toNode.id && !node.data.isLocked,
            );

            splitAmounts.forEach((splitAmount, index) => {
                if (availableMules.length > 0) {
                    const randomMule = availableMules[Math.floor(Math.random() * availableMules.length)];

                    const newTransaction: TransactionInstance = {
                        id: `bounce-split-${Date.now()}-${index}-${Math.random()}`,
                        fromNode: completedTransaction.toNode,
                        toNode: randomMule,
                        amount: formatAmount(splitAmount),
                    };

                    createRipple(
                        completedTransaction.toNode.id,
                        completedTransaction.toNode.position.x,
                        completedTransaction.toNode.position.y,
                        completedTransaction.toNode.data.isLocked || false);
                    createRipple(
                        randomMule.id,
                        randomMule.position.x,
                        randomMule.position.y,
                        randomMule.data.isLocked || false);

                    setTimeout(() => {
                        setActiveTransactions(prev => [...prev, newTransaction]);
                    }, 200 + index * 100);
                } else {
                    setMoneyLostToMules(prev => prev + splitAmount);
                    setTotalMoneyInCirculation(prev => prev - splitAmount);
                }
            });

            setMoneyLostToMules(prev => prev + originalAmount);
            setTotalMoneyInCirculation(prev => prev - originalAmount);
        } else if (completedTransaction && completedTransaction.toNode.data.isMule && !completedTransaction.fromNode.data.isMule) {
            // Transaction hit a mule account - split and redistribute
            const originalAmount = parseAmount(completedTransaction.amount);
            const splitCount = Math.random() < 0.5 ? 2 : 3; // Randomly 2 or 3 splits
            const parentTransactionId = `parent-${transactionId}`;

            // Track how many secondary transactions we're creating
            setPendingMoneyLoss(prev => {
                const newPendingLoss = new Map(prev);
                newPendingLoss.set(parentTransactionId, originalAmount);
                return newPendingLoss;
            });

            // Split the amount
            const splitAmounts = [];
            let remainingAmount = originalAmount;

            for (let i = 0; i < splitCount - 1; i++) {
                const splitAmount = Math.floor(remainingAmount * (0.2 + Math.random() * 0.6)); // 20-80% of remaining
                splitAmounts.push(splitAmount);
                remainingAmount -= splitAmount;
            }
            splitAmounts.push(remainingAmount); // Last amount gets the remainder

            // Create new transactions to other mule accounts (exclude locked mules)
            const availableMules = muleNodes.filter(node =>
                node.id !== completedTransaction.toNode.id && !node.data.isLocked,
            );

            splitAmounts.forEach((splitAmount, index) => {
                if (availableMules.length > 0) {
                    const randomMule = availableMules[Math.floor(Math.random() * availableMules.length)];

                    const newTransaction: TransactionInstance = {
                        id: `mule-transaction-${Date.now()}-${index}-${Math.random()}`,
                        fromNode: completedTransaction.toNode,
                        toNode: randomMule,
                        amount: formatAmount(splitAmount),
                        isSecondaryMuleTransaction: true,
                        originalAmount: originalAmount, // Store original amount for final deduction
                    };

                    // Create ripples for the new transaction
                    createRipple(
                        completedTransaction.toNode.id,
                        completedTransaction.toNode.position.x,
                        completedTransaction.toNode.position.y,
                        completedTransaction.toNode.data.isLocked || false);
                    createRipple(
                        randomMule.id,
                        randomMule.position.x,
                        randomMule.position.y,
                        randomMule.data.isLocked || false);

                    // Add the new transaction with a slight delay
                    setTimeout(() => {
                        setActiveTransactions(prev => [...prev, newTransaction]);
                    }, 200 + index * 100); // Stagger the new transactions
                } else {
                    // No available mules - money is effectively lost immediately
                    setMoneyLostToMules(prev => prev + splitAmount);
                    setTotalMoneyInCirculation(prev => prev - splitAmount);
                }
            });
        } else if (completedTransaction && completedTransaction.isSecondaryMuleTransaction && completedTransaction.originalAmount) {
            // This is a secondary mule transaction completing - check if all are done
            const originalAmount = completedTransaction.originalAmount;

            // Check if this is the last secondary transaction for this original transaction
            const remainingSecondaryTransactions = activeTransactions.filter(t =>
                t.isSecondaryMuleTransaction &&
                t.originalAmount === originalAmount &&
                t.id !== transactionId,
            );

            // If this is the last one, update the money counters
            if (remainingSecondaryTransactions.length === 0) {
                setMoneyLostToMules(prev => prev + originalAmount);
                setTotalMoneyInCirculation(prev => prev - originalAmount);
            }
        }

        setActiveTransactions(prev => prev.filter(t => t.id !== transactionId));
    }, [activeTransactions, muleNodes, createRipple, pendingMoneyLoss, setActiveTransactions, setMoneyLostToMules, setTotalMoneyInCirculation, setPendingMoneyLoss]);

    // Start transaction spawning
    useEffect(() => {
        // Stop spawning new transactions if no money left in circulation or all mules found
        if (totalMoneyInCirculation <= 0 || mulesFoundCount === actualMuleCount) {
            return;
        }

        // Don't start spawning if nodes aren't ready yet
        if (nodes.length === 0) {
            return;
        }

        const interval = setInterval(() => {
            // Check again before creating each transaction
            if (totalMoneyInCirculation > 0 && mulesFoundCount < actualMuleCount) {
                // Create transaction inline to avoid dependency issues
                setActiveTransactions(current => {
                    if (current.length >= TRANSACTION_CONFIG.MAX_CONCURRENT) {
                        return current;
                    }

                    const randomNodesResult = getRandomNodes();
                    if (!randomNodesResult) {
                        return current;
                    }

                    const { fromNode, toNode } = randomNodesResult;
                    const newTransaction = {
                        id: `transaction-${Date.now()}-${Math.random()}`,
                        fromNode,
                        toNode,
                        amount: generateRandomAmount(),
                    };

                    // Create ripples for both nodes
                    createRipple(fromNode.id, fromNode.position.x, fromNode.position.y, fromNode.data.isLocked || false);
                    createRipple(toNode.id, toNode.position.x, toNode.position.y, toNode.data.isLocked || false);

                    return [...current, newTransaction];
                });
            }
        }, 1000 / TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND);

        return () => {
            clearInterval(interval);
        };
    }, [totalMoneyInCirculation, mulesFoundCount, actualMuleCount, nodes.length, getRandomNodes, createRipple]);

    return {
        handleTransactionComplete,
        createTransaction,
        muleNodes,
    };
};