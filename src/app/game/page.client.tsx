"use client";

// REACT CORE ==========================================================================================================
import React, { useMemo, useEffect } from "react";
import ReactFlow, { Background, BackgroundVariant, Node, NodeTypes } from "reactflow";

// UI ==================================================================================================================
import { Article, Card, Div, Main, Spinner } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { AccountNode } from "$components/AccountNode/AccountNode";
import { AnimationOverlay } from "$components/AnimationOverlay/AnimationOverlay";
import { GameModals } from "$components/GameModals/GameModals";
import { Scorecard } from "$components/Scorecard/Scorecard";

// HOOKS ===============================================================================================================
import { useGameFlow } from "$hooks/useGameFlow";
import { useGameState } from "$hooks/useGameState";
import { useGridLayout } from "$hooks/useGridLayout";
import { useNodeInteractions } from "$hooks/useNodeInteractions";
import { useTransactions } from "$hooks/useTransactions";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

const GamePage = () => {
    const gameState = useGameState();
    const gridLayout = useGridLayout();

    const nodeInteractions = useNodeInteractions({
        lockedNodes           : gameState.lockedNodes,
        activeTransactions    : gameState.activeTransactions,
        setLockedNodes        : gameState.setLockedNodes,
        setShakingNodes       : gameState.setShakingNodes,
        setMulesFoundCount    : gameState.setMulesFoundCount,
        setActiveTransactions : gameState.setActiveTransactions,
    });

    const gameFlow = useGameFlow({
        totalMoneyInCirculation : gameState.totalMoneyInCirculation,
        mulesFoundCount         : gameState.mulesFoundCount,
        actualMuleCount         : gameState.actualMuleCount,
        gameOverModalShown      : gameState.gameOverModalShown,
        victoryModalShown       : gameState.victoryModalShown,
        timeLeft                : gameState.timeLeft,
        setGameOverModalShown   : gameState.setGameOverModalShown,
        setVictoryModalShown    : gameState.setVictoryModalShown,
        setActiveRipples        : gameState.setActiveRipples,
        setTimeLeft             : gameState.setTimeLeft,
        setGameOverReason       : gameState.setGameOverReason,
    });

    const transactions = useTransactions({
        nodes                      : gameState.baseNodes,
        activeTransactions         : gameState.activeTransactions,
        pendingMoneyLoss           : gameState.pendingMoneyLoss,
        lockedNodes                : gameState.lockedNodes,
        totalMoneyInCirculation    : gameState.totalMoneyInCirculation,
        mulesFoundCount            : gameState.mulesFoundCount,
        actualMuleCount            : gameState.actualMuleCount,
        setActiveTransactions      : gameState.setActiveTransactions,
        setMoneyLostToMules        : gameState.setMoneyLostToMules,
        setTotalMoneyInCirculation : gameState.setTotalMoneyInCirculation,
        setPendingMoneyLoss        : gameState.setPendingMoneyLoss,
        createRipple               : gameFlow.createRipple,
    });

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : AccountNode,
    }), []);

    // Setup grid layout
    useEffect(() => {
        return gridLayout.setupGrid(
            gameState.setGridDimensions,
            gameState.setIsGridReady,
            gameState.setBaseNodes,
            gameState.setMuleIndices,
            gameState.setActualMuleCount,
            gameState.muleIndices,
        );
    }, [ gameState.muleIndices ]);


    // Update nodes with dynamic state
    const nodes = useMemo(() => {
        return gameState.baseNodes.map(node => ({
            ...node,
            data : {
                ...node.data,
                onNodeClick : nodeInteractions.handleNodeClick,
                isLocked    : gameState.lockedNodes?.has(node.id) || false,
                isShaking   : gameState.shakingNodes?.has(node.id) || false,
            },
        }));
    }, [ gameState.baseNodes, nodeInteractions.handleNodeClick, gameState.lockedNodes, gameState.shakingNodes ]);


    return (
        <Article id="game-page">
            {/* SCORECARD ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Scorecard
                totalMoneyInCirculation={gameState.totalMoneyInCirculation}
                moneyLostToMules={gameState.moneyLostToMules}
                mulesFoundCount={gameState.mulesFoundCount}
                actualMuleCount={gameState.actualMuleCount}
                timeLeft={gameState.timeLeft}
            />

            {/* PLAY AREA ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Main id="play-area">
                <Card bgColour="amber-light90" isFullHeight>
                    <div ref={gridLayout.containerRef} style={{position : "relative", width : "100%", height : "100%"}}>
                        {!gameState.isGridReady ? (
                            // Loading State
                                <Div padding="small" marginTop="small">
                                    <Spinner />
                                </Div>
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
                gameOverReason={gameState.gameOverReason}
            />
        </Article>
    );
};

export default GamePage;
