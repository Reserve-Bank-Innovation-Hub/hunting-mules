"use client";

// EXTERNAL ============================================================================================================
import React, { useMemo, useEffect } from "react";

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
} from "fictoan-react";

// COMPONENTS
import { CircleNode } from "../../components/CircleNode/CircleNode";
import { AnimationOverlay } from "../../components/AnimationOverlay/AnimationOverlay";
import { Scorecard } from "../../components/Scorecard/Scorecard";
import { GameModals } from "../../components/GameModals/GameModals";

// HOOKS
import { useGameState } from "../../hooks/useGameState";
import { useGridLayout } from "../../hooks/useGridLayout";
import { useNodeInteractions } from "../../hooks/useNodeInteractions";
import { useTransactions } from "../../hooks/useTransactions";
import { useGameFlow } from "../../hooks/useGameFlow";







const GamePage = () => {
    const gameState = useGameState();
    const gridLayout = useGridLayout();

    const nodeInteractions = useNodeInteractions({
        lockedNodes: gameState.lockedNodes,
        setLockedNodes: gameState.setLockedNodes,
        setShakingNodes: gameState.setShakingNodes,
        setMulesFoundCount: gameState.setMulesFoundCount,
    });

    const gameFlow = useGameFlow({
        totalMoneyInCirculation: gameState.totalMoneyInCirculation,
        mulesFoundCount: gameState.mulesFoundCount,
        actualMuleCount: gameState.actualMuleCount,
        gameOverModalShown: gameState.gameOverModalShown,
        victoryModalShown: gameState.victoryModalShown,
        setGameOverModalShown: gameState.setGameOverModalShown,
        setVictoryModalShown: gameState.setVictoryModalShown,
        setActiveRipples: gameState.setActiveRipples,
    });

    const transactions = useTransactions({
        nodes: gameState.baseNodes,
        activeTransactions: gameState.activeTransactions,
        pendingMoneyLoss: gameState.pendingMoneyLoss,
        lockedNodes: gameState.lockedNodes,
        totalMoneyInCirculation: gameState.totalMoneyInCirculation,
        mulesFoundCount: gameState.mulesFoundCount,
        actualMuleCount: gameState.actualMuleCount,
        setActiveTransactions: gameState.setActiveTransactions,
        setMoneyLostToMules: gameState.setMoneyLostToMules,
        setTotalMoneyInCirculation: gameState.setTotalMoneyInCirculation,
        setPendingMoneyLoss: gameState.setPendingMoneyLoss,
        createRipple: gameFlow.createRipple,
    });

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : CircleNode,
    }), []);

    // Setup grid layout
    useEffect(() => {
        return gridLayout.setupGrid(
            gameState.setGridDimensions,
            gameState.setIsGridReady,
            gameState.setBaseNodes,
            gameState.setMuleIndices,
            gameState.setActualMuleCount,
            gameState.muleIndices
        );
    }, [gameState.muleIndices]);



    // Update nodes with dynamic state
    const nodes = useMemo(() => {
        return gameState.baseNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onNodeClick: nodeInteractions.handleNodeClick,
                isLocked: gameState.lockedNodes?.has(node.id) || false,
                isShaking: gameState.shakingNodes?.has(node.id) || false,
            },
        }));
    }, [gameState.baseNodes, nodeInteractions.handleNodeClick, gameState.lockedNodes, gameState.shakingNodes]);





    return (
        <Article id="game-page">
            <Scorecard
                totalMoneyInCirculation={gameState.totalMoneyInCirculation}
                moneyLostToMules={gameState.moneyLostToMules}
                mulesFoundCount={gameState.mulesFoundCount}
                actualMuleCount={gameState.actualMuleCount}
            />

            {/* PLAY AREA ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Main id="play-area">
                <Card bgColour="grey-light60" isFullHeight>
                    <div ref={gridLayout.containerRef} style={{position : "relative", width : "100%", height : "100%"}}>
                        {!gameState.isGridReady ? (
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
                                    activeTransactions={gameState.activeTransactions}
                                    activeRipples={gameState.activeRipples}
                                    onTransactionComplete={transactions.handleTransactionComplete}
                                    onRippleComplete={gameFlow.handleRippleComplete}
                                />
                            </>
                        )}
                    </div>
                </Card>
            </Main>

            <GameModals
                mulesFoundCount={gameState.mulesFoundCount}
                actualMuleCount={gameState.actualMuleCount}
                totalMoneyInCirculation={gameState.totalMoneyInCirculation}
            />
        </Article>
    );
};

export default GamePage;
