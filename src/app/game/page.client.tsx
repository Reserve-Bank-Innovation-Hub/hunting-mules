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
    MIN_SPACING : 60,   // Minimum spacing between circles
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

const GamePage = () => {
    const [ activeTransactions, setActiveTransactions ] = useState<TransactionInstance[]>([]);
    const [ isGridReady, setIsGridReady ] = useState(false);
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
        const fromIndex = Math.floor(Math.random() * nodes.length);
        let toIndex = Math.floor(Math.random() * nodes.length);

        // Ensure we don't select the same node
        while (toIndex === fromIndex) {
            toIndex = Math.floor(Math.random() * nodes.length);
        }

        return {
            fromNode : nodes[fromIndex],
            toNode   : nodes[toIndex],
        };
    };

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

        setActiveTransactions(prev => [ ...prev, newTransaction ]);
    }, [ nodes, activeTransactions.length ]);

    // Handle transaction completion
    const handleTransactionComplete = useCallback((transactionId : string) => {
        setActiveTransactions(prev => prev.filter(t => t.id !== transactionId));
    }, []);

    // Start transaction spawning
    useEffect(() => {
        const interval = setInterval(() => {
            createTransaction();
        }, 1000 / TRANSACTION_CONFIG.TRANSACTIONS_PER_SECOND);

        return () => clearInterval(interval);
    }, [ createTransaction ]);

    return (
        <Article id="game-page">
            <Header id="scorecard">
                <Card padding="micro" shape="rounded" isFullHeight>

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
                            </>
                        )}
                    </div>
                </Card>
            </Main>
        </Article>
    );
};

export default GamePage;
