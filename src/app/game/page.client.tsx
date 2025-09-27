"use client";

// EXTERNAL ============================================================================================================
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

// OTHER ===============================================================================================================
import ReactFlow, { Background, BackgroundVariant, Node, NodeTypes } from "reactflow";
import { Article, Card, Footer, Header, Heading1, Main, Portion, Row, Spinner, Text } from "fictoan-react";

// CUSTOM NODE COMPONENT ===============================================================================================
const CircleNode = ({data} : { data : { isMule? : boolean } }) => {
    return <div className={`circle-node ${data.isMule ? "mule-account" : ""}`}></div>;
};

// CONFIGURATION =======================================================================================================
const GRID_CONFIG = {
    CIRCLE_SIZE : 40,
    MIN_SPACING : 80,   // Minimum spacing between circles
    PADDING     : 50,   // Padding from container edges
};

const MULE_ACCOUNTS = 25;

const TRANSACTION_CONFIG = {
    TRANSACTIONS_PER_SECOND : 2,        // Number of new transactions per second
    SCALE_TIME_MS           : 500,       // Time to scale up/down in milliseconds
    TRANSACTION_TIME_MS     : 2000,      // Time to fly between nodes in milliseconds
    MAX_CONCURRENT          : 10,        // Maximum concurrent transactions for performance
};

// TYPES ===============================================================================================================
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
}

// ANIMATED TRANSACTION COMPONENT ======================================================================================
const AnimatedTransactionCard = ({
    transaction,
    onComplete,
} : {
    transaction : TransactionInstance;
    onComplete : (id : string) => void;
}) => {
    // Calculate positions accounting for the overlay and centering the card on nodes
    const fromX = transaction.fromNode.position.x + (GRID_CONFIG.CIRCLE_SIZE / 2) - 50; // Center card (100px width / 2)
    const fromY = transaction.fromNode.position.y + (GRID_CONFIG.CIRCLE_SIZE / 2) - 20; // Approximate center height
    const toX = transaction.toNode.position.x + (GRID_CONFIG.CIRCLE_SIZE / 2) - 50;
    const toY = transaction.toNode.position.y + (GRID_CONFIG.CIRCLE_SIZE / 2) - 20;

    return (
        <motion.div
            className="transaction-card"
            style={{
                position        : "absolute",
                left            : fromX,
                top             : fromY,
                transformOrigin : "center center",
            }}
            initial={{
                scale : 0,
                x     : 0,
                y     : 0,
            }}
            animate={{
                scale : [ 0, 1, 1, 0 ],
                x     : [ 0, 0, toX - fromX, toX - fromX ],
                y     : [ 0, 0, toY - fromY, toY - fromY ],
            }}
            transition={{
                duration : (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / 1000,
                times    : [ 0, TRANSACTION_CONFIG.SCALE_TIME_MS / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS),
                    (TRANSACTION_CONFIG.SCALE_TIME_MS + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS), 1 ],
                ease     : "easeInOut",
            }}
            onAnimationComplete={() => onComplete(transaction.id)}
        >
            <Card padding="nano" shape="rounded">
                <Text>{transaction.amount}</Text>
            </Card>
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
    return (
        <motion.div
            className="node-ripple"
            style={{
                left   : ripple.x + (GRID_CONFIG.CIRCLE_SIZE / 2),
                top    : ripple.y + (GRID_CONFIG.CIRCLE_SIZE / 2),
                width  : 0,
                height : 0,
            }}
            initial={{
                width   : 0,
                height  : 0,
                opacity : 1,
            }}
            animate={{
                width   : GRID_CONFIG.CIRCLE_SIZE * 2,
                height  : GRID_CONFIG.CIRCLE_SIZE * 2,
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
    const [ totalMoneyInCirculation, setTotalMoneyInCirculation ] = useState(10000000); // ₹1,00,00,000
    const [ moneyLostToMules, setMoneyLostToMules ] = useState(0);
    const [ activeRipples, setActiveRipples ] = useState<NodeRipple[]>([]);
    const [ pendingMoneyLoss, setPendingMoneyLoss ] = useState<Map<string, number>>(new Map());
    const [ gridDimensions, setGridDimensions ] = useState<{
                                                               rows : number;
                                                               columns : number;
                                                               spacingX : number;
                                                               spacingY : number;
                                                               startX : number;
                                                               startY : number;
                                                           } | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : CircleNode,
    }), []);

    // Calculate grid dimensions based on container size
    useEffect(() => {
        const calculateGridDimensions = () => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const availableWidth = rect.width - (GRID_CONFIG.PADDING * 2);
            const availableHeight = rect.height - (GRID_CONFIG.PADDING * 2);

            // Calculate maximum columns and rows that can fit
            const maxCols = Math.floor((availableWidth + GRID_CONFIG.MIN_SPACING) / (GRID_CONFIG.CIRCLE_SIZE + GRID_CONFIG.MIN_SPACING));
            const maxRows = Math.floor((availableHeight + GRID_CONFIG.MIN_SPACING) / (GRID_CONFIG.CIRCLE_SIZE + GRID_CONFIG.MIN_SPACING));

            // Ensure minimum grid size
            const columns = Math.max(5, Math.min(15, maxCols));
            const rows = Math.max(5, Math.min(12, maxRows));

            // Calculate optimal spacing to center the grid
            const totalCirclesWidth = columns * GRID_CONFIG.CIRCLE_SIZE;
            const totalCirclesHeight = rows * GRID_CONFIG.CIRCLE_SIZE;

            const spacingX = columns > 1 ? (availableWidth - totalCirclesWidth) / (columns - 1) : GRID_CONFIG.MIN_SPACING;
            const spacingY = rows > 1 ? (availableHeight - totalCirclesHeight) / (rows - 1) : GRID_CONFIG.MIN_SPACING;

            // Calculate start position to center the grid
            const totalGridWidth = (columns - 1) * spacingX + GRID_CONFIG.CIRCLE_SIZE;
            const totalGridHeight = (rows - 1) * spacingY + GRID_CONFIG.CIRCLE_SIZE;

            const startX = (rect.width - totalGridWidth) / 2;
            const startY = (rect.height - totalGridHeight) / 2;

            setGridDimensions({
                rows,
                columns,
                spacingX,
                spacingY,
                startX,
                startY,
            });

            // Small delay to show loading state
            setTimeout(() => setIsGridReady(true), 300);
        };

        // Wait for next frame to ensure container is rendered
        const timeoutId = setTimeout(calculateGridDimensions, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    const nodes = useMemo(() => {
        if (!gridDimensions) return [];

        const gridNodes : Node[] = [];

        for (let row = 0; row < gridDimensions.rows; row++) {
            for (let col = 0; col < gridDimensions.columns; col++) {
                const nodeId = `circle-${row}-${col}`;
                const xPosition = gridDimensions.startX + col * gridDimensions.spacingX;
                const yPosition = gridDimensions.startY + row * gridDimensions.spacingY;

                gridNodes.push({
                    id       : nodeId,
                    type     : "circle",
                    position : {x : xPosition, y : yPosition},
                    data     : {isMule : false},
                });
            }
        }

        // Randomly select mule accounts (up to 25 or 25% of total, whichever is smaller)
        const totalNodes = gridNodes.length;
        const muleCount = Math.min(MULE_ACCOUNTS, Math.floor(totalNodes * 0.25));
        const muleIndices = new Set<number>();

        while (muleIndices.size < muleCount) {
            const randomIndex = Math.floor(Math.random() * totalNodes);
            muleIndices.add(randomIndex);
        }

        // Mark selected nodes as mule accounts
        muleIndices.forEach(index => {
            gridNodes[index].data = {isMule : true};
        });

        return gridNodes;
    }, [ gridDimensions ]);

    // Helper function to generate random transaction amount
    const generateRandomAmount = () => {
        const randomAmount = Math.floor(Math.random() * (100000 - 1000 + 1)) + 1000; // Random between 1000 and 100000
        return `₹${randomAmount.toLocaleString("en-IN")}`; // Format with Indian number system
    };

    // Helper function to get random nodes
    const getRandomNodes = () => {
        // Get only normal accounts for "from" node (mules don't initiate transactions)
        const normalNodes = nodes.filter(node => !node.data.isMule);

        if (normalNodes.length === 0) {
            // Fallback to any node if no normal nodes exist
            const fromIndex = Math.floor(Math.random() * nodes.length);
            let toIndex = Math.floor(Math.random() * nodes.length);

            while (toIndex === fromIndex) {
                toIndex = Math.floor(Math.random() * nodes.length);
            }

            return {
                fromNode : nodes[fromIndex],
                toNode   : nodes[toIndex],
            };
        }

        const fromIndex = Math.floor(Math.random() * normalNodes.length);
        let toIndex = Math.floor(Math.random() * nodes.length);

        // Ensure we don't select the same node
        while (nodes[toIndex].id === normalNodes[fromIndex].id) {
            toIndex = Math.floor(Math.random() * nodes.length);
        }

        return {
            fromNode : normalNodes[fromIndex],
            toNode   : nodes[toIndex],
        };
    };

    // Create ripple effect for a node
    const createRipple = useCallback((nodeId : string, x : number, y : number) => {
        const newRipple : NodeRipple = {
            id : `ripple-${Date.now()}-${Math.random()}`,
            nodeId,
            x,
            y,
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

        const {fromNode, toNode} = getRandomNodes();
        const newTransaction : TransactionInstance = {
            id     : `transaction-${Date.now()}-${Math.random()}`,
            fromNode,
            toNode,
            amount : generateRandomAmount(),
        };

        // Create ripples for both nodes
        createRipple(fromNode.id, fromNode.position.x, fromNode.position.y);
        createRipple(toNode.id, toNode.position.x, toNode.position.y);

        setActiveTransactions(prev => [ ...prev, newTransaction ]);
    }, [ nodes, activeTransactions.length, createRipple ]);

    // Get all mule nodes
    const muleNodes = useMemo(() => {
        return nodes.filter(node => node.data.isMule);
    }, [nodes]);

    // Helper function to parse amount from string (₹1,23,456 -> 123456)
    const parseAmount = (amountString : string) => {
        return parseInt(amountString.replace(/[₹,]/g, ''), 10);
    };

    // Helper function to format amount to string
    const formatAmount = (amount : number) => {
        return `₹${amount.toLocaleString("en-IN")}`;
    };

    // Handle transaction completion
    const handleTransactionComplete = useCallback((transactionId : string) => {
        const completedTransaction = activeTransactions.find(t => t.id === transactionId);

        if (completedTransaction && completedTransaction.toNode.data.isMule && !completedTransaction.fromNode.data.isMule) {
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

            // Create new transactions to other mule accounts
            const availableMules = muleNodes.filter(node => node.id !== completedTransaction.toNode.id);
            let completedSecondaryCount = 0;

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
                    createRipple(completedTransaction.toNode.id, completedTransaction.toNode.position.x, completedTransaction.toNode.position.y);
                    createRipple(randomMule.id, randomMule.position.x, randomMule.position.y);

                    // Add the new transaction with a slight delay
                    setTimeout(() => {
                        setActiveTransactions(prev => [...prev, newTransaction]);
                    }, 200 + index * 100); // Stagger the new transactions
                }
            });
        } else if (completedTransaction && completedTransaction.isSecondaryMuleTransaction && completedTransaction.originalAmount) {
            // This is a secondary mule transaction completing - check if all are done
            const originalAmount = completedTransaction.originalAmount;

            // Check if this is the last secondary transaction for this original transaction
            const remainingSecondaryTransactions = activeTransactions.filter(t =>
                t.isSecondaryMuleTransaction &&
                t.originalAmount === originalAmount &&
                t.id !== transactionId
            );

            // If this is the last one, update the money counters
            if (remainingSecondaryTransactions.length === 0) {
                setMoneyLostToMules(prev => prev + originalAmount);
                setTotalMoneyInCirculation(prev => prev - originalAmount);
            }
        }

        setActiveTransactions(prev => prev.filter(t => t.id !== transactionId));
    }, [activeTransactions, muleNodes, createRipple, pendingMoneyLoss]);

    // Start transaction spawning
    useEffect(() => {
        // Stop spawning new transactions if no money left in circulation
        if (totalMoneyInCirculation <= 0) {
            return;
        }

        const interval = setInterval(() => {
            // Check again before creating each transaction
            if (totalMoneyInCirculation > 0) {
                createTransaction();
            }
        }, 1000 / TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND);

        return () => clearInterval(interval);
    }, [ createTransaction, totalMoneyInCirculation ]);

    return (
        <Article id="game-page">
            <Header id="scorecard">
                <Card padding="micro" shape="rounded" isFullHeight>
                    <Row horizontalPadding="micro">
                        <Portion desktopSpan="one-third">
                            <Text size="small" weight="400">Total Money in Circulation</Text>
                            <Heading1 marginTop="nano">
                                ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                            </Heading1>
                        </Portion>

                        <Portion desktopSpan="one-third">
                            <Text size="small" weight="400">Money Lost to Mules</Text>
                            <Heading1 textColour="red" marginTop="nano">
                                ₹{moneyLostToMules.toLocaleString("en-IN")}
                            </Heading1>
                        </Portion>

                        {totalMoneyInCirculation <= 0 && (
                            <Portion desktopSpan="one-third">
                                <Text size="small" weight="400" textColour="red">GAME OVER</Text>
                                <Heading1 textColour="red" marginTop="nano">
                                    All Money Laundered!
                                </Heading1>
                            </Portion>
                        )}
                    </Row>
                </Card>
            </Header>

            <Main id="play-area">
                <Card shape="rounded" isFullHeight>
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
                                    zoomOnScroll={false}
                                    zoomOnPinch={false}
                                    zoomOnDoubleClick={false}
                                >
                                    <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
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
        </Article>
    );
};

export default GamePage;
