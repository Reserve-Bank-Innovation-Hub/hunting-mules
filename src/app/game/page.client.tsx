"use client";

// EXTERNAL ============================================================================================================
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

// OTHER ===============================================================================================================
import ReactFlow, { Background, BackgroundVariant, Node, NodeTypes } from "reactflow";
import {
    Article,
    Card,
    Heading1,
    Heading6,
    Main,
    Spinner,
    Text,
    Button,
    Modal,
    showModal,
    hideModal,
    Div, Header, Heading4, Portion, Row,
} from "fictoan-react";

import MuleHeadImage from "../../assets/images/mule-head.png";
import MulesEliminatedImage from "../../assets/images/mules-eliminated.png";
import MulesEscapeImage from "../../assets/images/mule-escape.jpg";
import BankIconImage from "../../assets/images/bank-icon.png";

// TYPES ===============================================================================================================
interface NodeData {
    isMule? : boolean;
    isLocked? : boolean;
    isShaking? : boolean;
    onNodeClick? : (nodeId : string, isMule : boolean) => void;
}

// CUSTOM NODE COMPONENT ===============================================================================================
const CircleNode = ({data, id} : { data : NodeData, id : string }) => {
    const handleClick = (event : React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (data.onNodeClick) {
            data.onNodeClick(id, data.isMule || false);
        }
        return false;
    };

    const handleMouseDown = (event : React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    if (data.isMule && data.isLocked) {
        return (
            <div className={`circle-node mule-account locked`} onClick={handleClick} onMouseDown={handleMouseDown}>
                <img
                    src={MuleHeadImage.src}
                    alt="Locked Mule"
                    style={{
                        borderRadius : "50%",
                        objectFit    : "cover",
                        maxWidth     : "unset",
                    }}
                />
            </div>
        );
    }

    return (
        <Div
            className={`circle-node ${data.isMule ? "mule-account" : ""} ${data.isShaking ? "shaking" : ""}`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <img
                src={BankIconImage.src}
                alt="Bank Account"
                style={{
                    objectFit : "cover",
                    maxWidth  : "unset",
                }}
            />
        </Div>
    );
};

// CONFIGURATION =======================================================================================================
const getGridConfig = () => {
    const isMobile = window.innerWidth < 768;
    return {
        CIRCLE_SIZE            : isMobile ? 32 : 40,
        MIN_SPACING            : isMobile ? 32 : 15,  // Minimum spacing, will scale up proportionally
        PADDING                : isMobile ? 32 : 50,
        MAX_CELLS              : 100,                  // Maximum total cells
        TARGET_MULE_PERCENTAGE : 0.25,      // 25% of cells should be mules
    };
};

const MULE_ACCOUNTS = 25;

const TRANSACTION_CONFIG = {
    STARTING_AMOUNT         : 10000000,  // ₹1,00,00,000
    TRANSACTIONS_PER_SECOND : 2,         // Number of new transactions per second
    SCALE_TIME_MS           : 500,       // Time to scale up/down in milliseconds
    TRANSACTION_TIME_MS     : 2000,      // Time to fly between nodes in milliseconds
    MAX_CONCURRENT          : 10,        // Maximum concurrent transactions for performance
};

// TYPES ===============================================================================================
interface TransactionInstance {
    id : string;
    fromNode : Node;
    toNode : Node;
    amount : string;
    isSecondaryMuleTransaction? : boolean;
    originalAmount? : number;
}

interface NodeRipple {
    id : string;
    nodeId : string;
    x : number;
    y : number;
    isLocked? : boolean;
}

// ANIMATED TRANSACTION COMPONENT ======================================================================================
const AnimatedTransactionCard = ({
    transaction,
    onComplete,
} : {
    transaction : TransactionInstance;
    onComplete : (id : string) => void;
}) => {
    const gridConfig = getGridConfig();

    // Calculate the exact center of nodes based on their stored positions
    // node.position is the top-left corner as set during grid creation
    const fromCenterX = transaction.fromNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const fromCenterY = transaction.fromNode.position.y + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterX = transaction.toNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterY = transaction.toNode.position.y + (gridConfig.CIRCLE_SIZE / 2);

    return (
        <motion.div
            className="transaction-card"
            style={{
                position        : "absolute",
                left            : 0,
                top             : 0,
                transformOrigin : "center center",
            }}
            initial={{
                scale      : 0,
                x          : fromCenterX,
                y          : fromCenterY,
                translateX : "-50%",
                translateY : "-50%",
            }}
            animate={{
                scale      : [ 0, 1, 1, 0 ],
                x          : [ fromCenterX, fromCenterX, toCenterX, toCenterX ],
                y          : [ fromCenterY, fromCenterY, toCenterY, toCenterY ],
                translateX : "-50%",
                translateY : "-50%",
            }}
            transition={{
                duration : (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / 1000,
                times    : [ 0, TRANSACTION_CONFIG.SCALE_TIME_MS / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS),
                    (TRANSACTION_CONFIG.SCALE_TIME_MS + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS), 1 ],
                ease     : "easeInOut",
            }}
            onAnimationComplete={() => onComplete(transaction.id)}
        >
            <Text weight="400">{transaction.amount}</Text>
        </motion.div>
    );
};

// RIPPLE COMPONENT ====================================================================================================
const NodeRippleEffect = ({
    ripple,
    onComplete,
} : {
    ripple : NodeRipple;
    onComplete : (id : string) => void;
}) => {
    const gridConfig = getGridConfig();

    // Simple center calculation - ripple.x/y is the top-left of the node
    const centerX = ripple.x + (gridConfig.CIRCLE_SIZE / 2);
    const centerY = ripple.y + (gridConfig.CIRCLE_SIZE / 2);

    const rippleSize = gridConfig.CIRCLE_SIZE;

    return (
        <motion.div
            className="node-ripple"
            style={{
                left      : centerX,
                top       : centerY,
                width     : 0,
                height    : 0,
                transform : "translate(-50%, -50%)",
            }}
            initial={{
                width   : 0,
                height  : 0,
                opacity : 1,
            }}
            animate={{
                width   : rippleSize * 3,
                height  : rippleSize * 3,
                opacity : 0,
            }}
            transition={{
                duration : 1,
                ease     : "easeOut",
            }}
            onAnimationComplete={() => onComplete(ripple.id)}
        />
    );
};

const GamePage = () => {
    const [ activeTransactions, setActiveTransactions ] = useState<TransactionInstance[]>([]);
    const [ isGridReady, setIsGridReady ] = useState(false);
    const [ totalMoneyInCirculation, setTotalMoneyInCirculation ] = useState(TRANSACTION_CONFIG.STARTING_AMOUNT);
    const [ moneyLostToMules, setMoneyLostToMules ] = useState(0);
    const [ activeRipples, setActiveRipples ] = useState<NodeRipple[]>([]);
    const [ pendingMoneyLoss, setPendingMoneyLoss ] = useState<Map<string, number>>(new Map());
    const [ lockedNodes, setLockedNodes ] = useState<Set<string>>(new Set());
    const [ shakingNodes, setShakingNodes ] = useState<Set<string>>(new Set());
    const [ muleIndices, setMuleIndices ] = useState<Set<number> | null>(null);
    const [ baseNodes, setBaseNodes ] = useState<Node[]>([]);
    const [ mulesFoundCount, setMulesFoundCount ] = useState(0);
    const [ actualMuleCount, setActualMuleCount ] = useState(0);
    const [ gridDimensions, setGridDimensions ] = useState<{
                                                               rows : number;
                                                               columns : number;
                                                               spacingX : number;
                                                               spacingY : number;
                                                               startX : number;
                                                               startY : number;
                                                           } | null>(null);
    const [ gameOverModalShown, setGameOverModalShown ] = useState(false);
    const [ victoryModalShown, setVictoryModalShown ] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : CircleNode,
    }), []);

    // Calculate grid dimensions based on container size
    useEffect(() => {
        const calculateGridDimensions = () => {
            if (!containerRef.current) return;

            const gridConfig = getGridConfig();
            const rect = containerRef.current.getBoundingClientRect();
            const availableWidth = rect.width - (gridConfig.PADDING * 2);
            const availableHeight = rect.height - (gridConfig.PADDING * 2);

            // Calculate maximum possible cells that could fit with minimum spacing
            const maxPossibleCols = Math.floor((availableWidth + gridConfig.MIN_SPACING) /
                (gridConfig.CIRCLE_SIZE + gridConfig.MIN_SPACING));
            const maxPossibleRows = Math.floor((availableHeight + gridConfig.MIN_SPACING) /
                (gridConfig.CIRCLE_SIZE + gridConfig.MIN_SPACING));

            // Start with the ideal square grid for MAX_CELLS
            let targetCells = gridConfig.MAX_CELLS;
            let bestConfig = {rows : 0, columns : 0, totalCells : 0};

            // Try to find the best configuration that maximizes cells while fitting the space
            for (let testRows = maxPossibleRows; testRows >= 3; testRows--) {
                for (let testCols = maxPossibleCols; testCols >= 3; testCols--) {
                    const totalCells = testRows * testCols;

                    // Skip if this exceeds our maximum
                    if (totalCells > targetCells) continue;

                    // Check if this configuration would fit with proportional spacing
                    const testSpacingX = (availableWidth - (testCols * gridConfig.CIRCLE_SIZE)) / (testCols - 1);
                    const testSpacingY = (availableHeight - (testRows * gridConfig.CIRCLE_SIZE)) / (testRows - 1);

                    // Ensure minimum spacing is maintained
                    if (testSpacingX >= gridConfig.MIN_SPACING && testSpacingY >= gridConfig.MIN_SPACING) {
                        // Prefer configurations closer to our target
                        if (totalCells > bestConfig.totalCells) {
                            bestConfig = {
                                rows       : testRows,
                                columns    : testCols,
                                totalCells : totalCells,
                            };
                        }
                    }
                }
            }

            // If we didn't find a valid configuration, use a fallback
            if (bestConfig.totalCells === 0) {
                // Fallback to a minimal grid that definitely fits
                bestConfig.rows = Math.min(5, maxPossibleRows);
                bestConfig.columns = Math.min(5, maxPossibleCols);
                bestConfig.totalCells = bestConfig.rows * bestConfig.columns;
            }

            // Calculate proportional spacing to fill the available space
            const spacingX = Math.max(
                gridConfig.MIN_SPACING,
                (availableWidth - (bestConfig.columns * gridConfig.CIRCLE_SIZE)) / Math.max(1, bestConfig.columns - 1),
            );
            const spacingY = Math.max(
                gridConfig.MIN_SPACING,
                (availableHeight - (bestConfig.rows * gridConfig.CIRCLE_SIZE)) / Math.max(1, bestConfig.rows - 1),
            );

            // Calculate the actual grid dimensions
            const totalGridWidth = bestConfig.columns * gridConfig.CIRCLE_SIZE + (bestConfig.columns - 1) * spacingX;
            const totalGridHeight = bestConfig.rows * gridConfig.CIRCLE_SIZE + (bestConfig.rows - 1) * spacingY;

            // Center the grid in the available space
            const startX = gridConfig.PADDING + (availableWidth - totalGridWidth) / 2;
            const startY = gridConfig.PADDING + (availableHeight - totalGridHeight) / 2;

            console.log(`Grid: ${bestConfig.rows}x${bestConfig.columns} (${bestConfig.totalCells} cells), Spacing: ${spacingX.toFixed(
                1)}x${spacingY.toFixed(1)}px`);

            setGridDimensions({
                rows     : bestConfig.rows,
                columns  : bestConfig.columns,
                spacingX : spacingX,
                spacingY : spacingY,
                startX   : startX,
                startY   : startY,
            });

            // Small delay to show loading state
            setTimeout(() => setIsGridReady(true), 300);
        };

        // Wait for next frame to ensure container is rendered
        const timeoutId = setTimeout(calculateGridDimensions, 100);

        // Add resize listener for responsive updates
        const handleResize = () => {
            setIsGridReady(false);
            calculateGridDimensions();
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
            <Row id="scorecard" retainLayoutAlways marginBottom="none">
                <Portion desktopSpan="one-third">
                    <Card
                        className="metric-card"
                        padding="micro" bgColour="amber-light60" isFullHeight
                    >
                        <Text size="small">Amount in circulation</Text>
                        <Heading6>
                            ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                        </Heading6>
                    </Card>
                </Portion>

                <Portion desktopSpan="one-third">
                    <Card
                        className="metric-card"
                        padding="micro" bgColour="amber-light60" isFullHeight
                    >
                        <Text>Amount stolen by mules</Text>
                        <Heading6 textColour="red">
                            ₹{moneyLostToMules.toLocaleString("en-IN")}
                        </Heading6>
                    </Card>
                </Portion>

                <Portion desktopSpan="one-third">
                    <Card
                        className="metric-card"
                        padding="micro" bgColour="amber-light60" isFullHeight
                    >
                        <Text size="small">Mules found</Text>
                        <Heading6 textColour="green">
                            {mulesFoundCount}/{actualMuleCount}
                        </Heading6>
                    </Card>
                </Portion>
            </Row>

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

                                {/* Animated Transactions Overlay */}
                                <div
                                    style={{
                                        position      : "absolute",
                                        top           : 0,
                                        left          : 0,
                                        width         : "100%",
                                        height        : "100%",
                                        pointerEvents : "none",
                                        zIndex        : 10,
                                    }}
                                >
                                    <AnimatePresence>
                                        {activeTransactions.map((transaction) => (
                                            <AnimatedTransactionCard
                                                key={transaction.id}
                                                transaction={transaction}
                                                onComplete={handleTransactionComplete}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Node Ripples Overlay */}
                                <div
                                    style={{
                                        position      : "absolute",
                                        top           : 0,
                                        left          : 0,
                                        width         : "100%",
                                        height        : "100%",
                                        pointerEvents : "none",
                                        zIndex        : 5,
                                    }}
                                >
                                    <AnimatePresence>
                                        {activeRipples.map((ripple) => (
                                            <NodeRippleEffect
                                                key={ripple.id}
                                                ripple={ripple}
                                                onComplete={handleRippleComplete}
                                            />
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </Main>

            {/* GAME OVER MODAL //////////////////////////////////////////////////////////////////////////////////// */}
            <Modal
                id="game-over-modal"
                isDismissible={false}
                showBackdrop
                blurBackdrop
                label="Game Over"
                description="All money has been laundered by the mules"
            >
                <>
                    <Header marginBottom="micro">
                        <img
                            className="modal-image"
                            src={MulesEscapeImage.src}
                            alt="Mules eliminated"
                        />

                        <Heading1 weight="400" textColour="red" align="centre" verticalMargin="nano">
                            GAME OVER!
                        </Heading1>

                        <Heading6 weight="400" align="centre">
                            All money has been laundered!
                        </Heading6>
                    </Header>

                    <Heading4 weight="400" align="centre" marginBottom="small">
                        You found {mulesFoundCount} out of {actualMuleCount} mule accounts.
                    </Heading4>

                    <Button
                        kind="primary" horizontallyCentreThis
                        size="large" marginBottom="micro"
                        onClick={() => {
                            hideModal("game-over-modal");
                            window.location.reload();
                        }}
                    >
                        PLAY AGAIN
                    </Button>
                </>
            </Modal>

            {/* VICTORY MODAL ////////////////////////////////////////////////////////////////////////////////////// */}
            <Modal
                id="victory-modal"
                isDismissible={false}
                showBackdrop
                blurBackdrop
                label="Victory"
                description="All mule accounts have been found"
                padding="small"
            >
                <>
                    <Header marginBottom="micro">
                        <img
                            className="modal-image"
                            src={MulesEliminatedImage.src}
                            alt="Mules eliminated"
                        />

                        <Heading1 weight="400" textColour="green" align="centre" marginBottom="nano" marginTop="micro">
                            VICTORY!
                        </Heading1>

                        <Heading6 weight="400" align="centre">
                            You got all {actualMuleCount} mule accounts
                        </Heading6>
                    </Header>

                    <Heading4 weight="400" align="centre" marginBottom="small">
                        Money saved: ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                    </Heading4>

                    <Button
                        kind="primary" horizontallyCentreThis
                        size="large"
                        onClick={() => {
                            hideModal("victory-modal");
                            window.location.reload();
                        }}
                    >
                        PLAY AGAIN
                    </Button>
                </>
            </Modal>
        </Article>
    );
};

export default GamePage;
