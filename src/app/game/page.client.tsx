"use client";

// EXTERNAL ============================================================================================================
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

// OTHER ===============================================================================================================
import ReactFlow, { Background, BackgroundVariant, Node, NodeTypes } from "reactflow";
import {
    Article,
    Card,
    Main,
    Spinner,
    showModal,
} from "fictoan-react";

// COMPONENTS
import { CircleNode } from "../../components/CircleNode/CircleNode";
import { AnimationOverlay } from "../../components/AnimationOverlay/AnimationOverlay";
import { Scorecard } from "../../components/Scorecard/Scorecard";
import { GameModals } from "../../components/GameModals/GameModals";

// HOOKS
import { useGameState } from "../../hooks/useGameState";

// LIB
import { getGridConfig, MULE_ACCOUNTS, TRANSACTION_CONFIG } from "../../lib/gameConfig";
import { TransactionInstance, NodeRipple, NodeData } from "../../lib/gameTypes";
import { calculateGridDimensions } from "../../lib/gridCalculations";






const GamePage = () => {
    const {
        activeTransactions,
        isGridReady,
        totalMoneyInCirculation,
        moneyLostToMules,
        activeRipples,
        pendingMoneyLoss,
        lockedNodes,
        shakingNodes,
        muleIndices,
        baseNodes,
        mulesFoundCount,
        actualMuleCount,
        gridDimensions,
        gameOverModalShown,
        victoryModalShown,
        setActiveTransactions,
        setIsGridReady,
        setTotalMoneyInCirculation,
        setMoneyLostToMules,
        setActiveRipples,
        setPendingMoneyLoss,
        setLockedNodes,
        setShakingNodes,
        setMuleIndices,
        setBaseNodes,
        setMulesFoundCount,
        setActualMuleCount,
        setGridDimensions,
        setGameOverModalShown,
        setVictoryModalShown,
    } = useGameState();

    const containerRef = useRef<HTMLDivElement>(null);

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : CircleNode,
    }), []);

    // Calculate grid dimensions based on container size
    useEffect(() => {
        const calculateGrid = () => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const dimensions = calculateGridDimensions(rect);
            setGridDimensions(dimensions);

            // Small delay to show loading state
            setTimeout(() => setIsGridReady(true), 300);
        };

        // Wait for next frame to ensure container is rendered
        const timeoutId = setTimeout(calculateGrid, 100);

        // Add resize listener for responsive updates
        const handleResize = () => {
            setIsGridReady(false);
            calculateGrid();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Handle node clicks
    const handleNodeClick = useCallback((nodeId : string, isMule : boolean) => {
        if (isMule) {
            // Check if already locked before making any changes
            setLockedNodes(prev => {
                if (prev.has(nodeId)) {
                    return prev; // Already locked, no changes
                }

                // Not locked yet - increment counter and lock
                const newLockedNodes = new Set(prev).add(nodeId);
                setMulesFoundCount(count => count + 1);
                return newLockedNodes;
            });
        } else {
            // Shake normal account
            setShakingNodes(prev => new Set(prev).add(nodeId));

            // Remove shake effect after animation
            setTimeout(() => {
                setShakingNodes(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(nodeId);
                    return newSet;
                });
            }, 600); // Match CSS animation duration
        }
    }, []);

    // Create base nodes only when grid dimensions change
    useEffect(() => {
        if (!gridDimensions) return;

        const gridNodes : Node[] = [];

        for (let row = 0; row < gridDimensions.rows; row++) {
            for (let col = 0; col < gridDimensions.columns; col++) {
                const nodeId = `circle-${row}-${col}`;
                const gridConfig = getGridConfig();
                const xPosition = gridDimensions.startX + col * (gridConfig.CIRCLE_SIZE + gridDimensions.spacingX);
                const yPosition = gridDimensions.startY + row * (gridConfig.CIRCLE_SIZE + gridDimensions.spacingY);

                gridNodes.push({
                    id       : nodeId,
                    type     : "circle",
                    position : {x : xPosition, y : yPosition},
                    data     : {isMule : false},
                });
            }
        }

        // Initialize mule indices only once
        if (!muleIndices) {
            const totalNodes = gridNodes.length;
            const muleCount = Math.min(MULE_ACCOUNTS, Math.floor(totalNodes * 0.25));
            const newMuleIndices = new Set<number>();

            while (newMuleIndices.size < muleCount) {
                const randomIndex = Math.floor(Math.random() * totalNodes);
                newMuleIndices.add(randomIndex);
            }

            setMuleIndices(newMuleIndices);
            setActualMuleCount(muleCount);

            // Mark selected nodes as mule accounts
            newMuleIndices.forEach(index => {
                if (gridNodes[index]) {
                    gridNodes[index].data = {isMule : true};
                }
            });
        } else {
            // Use existing mule indices
            muleIndices.forEach(index => {
                if (gridNodes[index]) {
                    gridNodes[index].data = {isMule : true};
                }
            });
        }

        setBaseNodes(gridNodes);
    }, [ gridDimensions, muleIndices ]);

    // Update nodes with dynamic state
    const nodes = useMemo(() => {
        return baseNodes.map(node => ({
            ...node,
            data : {
                ...node.data,
                onNodeClick : handleNodeClick,
                isLocked    : lockedNodes?.has(node.id) || false,
                isShaking   : shakingNodes?.has(node.id) || false,
            },
        }));
    }, [ baseNodes, handleNodeClick, lockedNodes, shakingNodes ]);

    // Helper function to generate random transaction amount
    const generateRandomAmount = () => {
        const randomAmount = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000; // Random between 1000 and 100000
        return `₹${randomAmount.toLocaleString("en-IN")}`; // Format with Indian number system
    };

    // Helper function to get random nodes
    const getRandomNodes = () => {
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
            fromNode : normalNodes[fromIndex],
            toNode   : availableTargetNodes[toIndex],
        };
    };

    // Create ripple effect for a node
    const createRipple = useCallback((nodeId : string, x : number, y : number, isLocked : boolean = false) => {
        const newRipple : NodeRipple = {
            id : `ripple-${Date.now()}-${Math.random()}`,
            nodeId,
            x,
            y,
            isLocked,
        };
        setActiveRipples(prev => [ ...prev, newRipple ]);
    }, []);

    // Handle ripple completion
    const handleRippleComplete = useCallback((rippleId : string) => {
        setActiveRipples(prev => prev.filter(r => r.id !== rippleId));
    }, []);

    // Create new transaction
    const createTransaction = useCallback(() => {
        if (activeTransactions.length >= TRANSACTION_CONFIG.MAX_CONCURRENT) {
            return; // Don't create more transactions if we're at the limit
        }

        const randomNodesResult = getRandomNodes();
        if (!randomNodesResult) {
            return; // Cannot create transaction (no valid targets)
        }

        const {fromNode, toNode} = randomNodesResult;
        const newTransaction : TransactionInstance = {
            id     : `transaction-${Date.now()}-${Math.random()}`,
            fromNode,
            toNode,
            amount : generateRandomAmount(),
        };

        // Create ripples for both nodes
        createRipple(fromNode.id, fromNode.position.x, fromNode.position.y, fromNode.data.isLocked || false);
        createRipple(toNode.id, toNode.position.x, toNode.position.y, toNode.data.isLocked || false);

        setActiveTransactions(prev => [ ...prev, newTransaction ]);
    }, [ nodes, activeTransactions.length, createRipple ]);

    // Get all mule nodes
    const muleNodes = useMemo(() => {
        return nodes.filter(node => node.data.isMule);
    }, [ nodes ]);

    // Helper function to parse amount from string (₹1,23,456 -> 123456)
    const parseAmount = (amountString : string) => {
        return parseInt(amountString.replace(/[₹,]/g, ""), 10);
    };

    // Helper function to format amount to string
    const formatAmount = (amount : number) => {
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    // Handle transaction completion
    const handleTransactionComplete = useCallback((transactionId : string) => {
        const completedTransaction = activeTransactions.find(t => t.id === transactionId);

        // Check if transaction hit a locked mule - bounce it back
        if (completedTransaction && completedTransaction.toNode.data.isMule && completedTransaction.toNode.data.isLocked) {
            // Bounce the transaction back to sender
            const bounceTransaction : TransactionInstance = {
                id       : `bounce-${Date.now()}-${Math.random()}`,
                fromNode : completedTransaction.toNode,
                toNode   : completedTransaction.fromNode,
                amount   : completedTransaction.amount,
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
                setActiveTransactions(prev => [ ...prev, bounceTransaction ]);
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

                    const newTransaction : TransactionInstance = {
                        id       : `bounce-split-${Date.now()}-${index}-${Math.random()}`,
                        fromNode : completedTransaction.toNode,
                        toNode   : randomMule,
                        amount   : formatAmount(splitAmount),
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
                        setActiveTransactions(prev => [ ...prev, newTransaction ]);
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
            const newPendingLoss = new Map(pendingMoneyLoss);
            newPendingLoss.set(parentTransactionId, originalAmount);
            setPendingMoneyLoss(newPendingLoss);

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

                    const newTransaction : TransactionInstance = {
                        id                         : `mule-transaction-${Date.now()}-${index}-${Math.random()}`,
                        fromNode                   : completedTransaction.toNode,
                        toNode                     : randomMule,
                        amount                     : formatAmount(splitAmount),
                        isSecondaryMuleTransaction : true,
                        originalAmount             : originalAmount, // Store original amount for final deduction
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
                        setActiveTransactions(prev => [ ...prev, newTransaction ]);
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
    }, [ activeTransactions, muleNodes, createRipple, pendingMoneyLoss ]);

    // Start transaction spawning
    useEffect(() => {
        // Stop spawning new transactions if no money left in circulation or all mules found
        if (totalMoneyInCirculation <= 0 || mulesFoundCount === actualMuleCount) {
            return;
        }

        const interval = setInterval(() => {
            // Check again before creating each transaction
            if (totalMoneyInCirculation > 0 && mulesFoundCount < actualMuleCount) {
                createTransaction();
            }
        }, 1000 / TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND);

        return () => clearInterval(interval);
    }, [ createTransaction, totalMoneyInCirculation, mulesFoundCount, actualMuleCount ]);

    // Show game over modal when money reaches 0
    useEffect(() => {
        if (totalMoneyInCirculation <= 0 && !gameOverModalShown) {
            setTimeout(() => {
                showModal("game-over-modal");
                setGameOverModalShown(true);
            }, 1000); // Small delay to let the last transaction complete
        }
    }, [ totalMoneyInCirculation, gameOverModalShown ]);

    // Show victory modal when all mules are found
    useEffect(() => {
        if (mulesFoundCount === actualMuleCount && actualMuleCount > 0 && !victoryModalShown) {
            setTimeout(() => {
                showModal("victory-modal");
                setVictoryModalShown(true);
            }, 500); // Small delay for better UX
        }
    }, [ mulesFoundCount, actualMuleCount, victoryModalShown ]);

    // Test modal on component mount
    // useEffect(() => {
    //     // Test showing victory modal after component is ready
    //     setTimeout(() => {
    //         showModal("victory-modal");
    //     }, 2000);
    // }, []);

    return (
        <Article id="game-page">
            <Scorecard
                totalMoneyInCirculation={totalMoneyInCirculation}
                moneyLostToMules={moneyLostToMules}
                mulesFoundCount={mulesFoundCount}
                actualMuleCount={actualMuleCount}
            />

            {/* PLAY AREA ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Main id="play-area">
                <Card bgColour="grey-light60" isFullHeight>
                    <div ref={containerRef} style={{position : "relative", width : "100%", height : "100%"}}>
                        {!isGridReady ? (
                            // Loading State
                            <Spinner />
                        ) : (
                            <>
                                <ReactFlow
                                    nodes={nodes}
                                    edges={[]}
                                    nodeTypes={nodeTypes}
                                    nodesDraggable={false}
                                    nodesConnectable={false}
                                    elementsSelectable={false}
                                    defaultViewport={{x : 0, y : 0, zoom : 1}}
                                    minZoom={1}
                                    maxZoom={1}
                                    panOnDrag={false}
                                    panOnScroll={false}
                                    zoomOnScroll={false}
                                    zoomOnPinch={false}
                                    zoomOnDoubleClick={false}
                                    preventScrolling={false}
                                    nodesFocusable={false}
                                    edgesFocusable={false}
                                >
                                    <Background color="#000" variant={BackgroundVariant.Dots} gap={12} size={1} />
                                </ReactFlow>

                                <AnimationOverlay
                                    activeTransactions={activeTransactions}
                                    activeRipples={activeRipples}
                                    onTransactionComplete={handleTransactionComplete}
                                    onRippleComplete={handleRippleComplete}
                                />
                            </>
                        )}
                    </div>
                </Card>
            </Main>

            <GameModals
                mulesFoundCount={mulesFoundCount}
                actualMuleCount={actualMuleCount}
                totalMoneyInCirculation={totalMoneyInCirculation}
            />
        </Article>
    );
};

export default GamePage;
