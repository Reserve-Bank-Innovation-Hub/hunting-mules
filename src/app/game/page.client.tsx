"use client";

// REACT CORE ==========================================================================================================
import React, { useMemo, useEffect, useRef } from "react";
import ReactFlow, { Background, BackgroundVariant, NodeTypes } from "reactflow";

// UI ==================================================================================================================
import { Article, Card, Div, Main, Spinner } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { AccountNode } from "$components/AccountNode/AccountNode";
import { AnimationOverlay } from "$components/AnimationOverlay/AnimationOverlay";
import { NetworkLayer } from "$components/NetworkLayer/NetworkLayer";
import { PatternReminder } from "$components/PatternReminder/PatternReminder";
import { RoundIntro } from "$components/RoundIntro/RoundIntro";
import { Scorecard } from "$components/Scorecard/Scorecard";
import { ScoreBar } from "$components/ScoreBar/ScoreBar";

// HOOKS ===============================================================================================================
import { useGameFlow } from "$hooks/useGameFlow";
import { useGameState } from "$hooks/useGameState";
import { useGridLayout } from "$hooks/useGridLayout";
import { useNodeInteractions } from "$hooks/useNodeInteractions";
import { useTransactions } from "$hooks/useTransactions";

// LIB =================================================================================================================
import { ROUNDS, TOTAL_PATTERNS } from "$lib/roundConfig";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

const GamePage = () => {
    const gameState = useGameState();
    const gridLayout = useGridLayout();

    const round = ROUNDS[gameState.roundIndex];
    const isLowBalanceRound = round?.behaviour === "low-balance";

    // The resize handler needs the phase as it is when the user resizes, not as it
    // was when the grid was last built
    const phaseRef = useRef(gameState.phase);
    phaseRef.current = gameState.phase;

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
        actualMuleCount         : gameState.actualMuleCount,
        lockedNodes             : gameState.lockedNodes,
        gameOverModalShown      : gameState.gameOverModalShown,
        victoryModalShown       : gameState.victoryModalShown,
        roundTimeLeft           : gameState.roundTimeLeft,
        phase                   : gameState.phase,
        roundIndex              : gameState.roundIndex,
        setGameOverModalShown   : gameState.setGameOverModalShown,
        setVictoryModalShown    : gameState.setVictoryModalShown,
        setActiveRipples        : gameState.setActiveRipples,
        setRoundTimeLeft        : gameState.setRoundTimeLeft,
        setGameOverReason       : gameState.setGameOverReason,
        setPhase                : gameState.setPhase,
        setRoundIndex           : gameState.setRoundIndex,
        setLockedNodes          : gameState.setLockedNodes,
        setShakingNodes         : gameState.setShakingNodes,
        setActiveTransactions   : gameState.setActiveTransactions,
        setMuleIndices          : gameState.setMuleIndices,
        setSurgingNodes         : gameState.setSurgingNodes,
        setIsGridReady          : gameState.setIsGridReady,
    });

    // Update nodes with dynamic state
    const nodes = useMemo(() => {
        return gameState.baseNodes.map(node => ({
            ...node,
            data : {
                ...node.data,
                onNodeClick : nodeInteractions.handleNodeClick,
                isLocked    : gameState.lockedNodes?.has(node.id) || false,
                isShaking   : gameState.shakingNodes?.has(node.id) || false,
                // Balances are only part of the low-balance round
                showBalance : isLowBalanceRound,
                balance     : isLowBalanceRound ? gameState.nodeBalances.get(node.id) : undefined,
                isSurging   : isLowBalanceRound && gameState.surgingNodes.has(node.id),
            },
        }));
    }, [
        gameState.baseNodes, nodeInteractions.handleNodeClick, gameState.lockedNodes,
        gameState.shakingNodes, gameState.nodeBalances, gameState.surgingNodes, isLowBalanceRound,
    ]);

    const transactions = useTransactions({
        nodes,
        network                    : gameState.network,
        activeTransactions         : gameState.activeTransactions,
        lockedNodes                : gameState.lockedNodes,
        totalMoneyInCirculation    : gameState.totalMoneyInCirculation,
        phase                      : gameState.phase,
        roundIndex                 : gameState.roundIndex,
        setActiveTransactions      : gameState.setActiveTransactions,
        setMoneyLostToMules        : gameState.setMoneyLostToMules,
        setTotalMoneyInCirculation : gameState.setTotalMoneyInCirculation,
        setNodeBalances            : gameState.setNodeBalances,
        setSurgingNodes            : gameState.setSurgingNodes,
        setActiveEdges             : gameState.setActiveEdges,
        createRipple               : gameFlow.createRipple,
    });

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : AccountNode,
    }), []);

    // Build the board for the current round. This runs while the intro card is still
    // up, so play begins the moment the player dismisses it.
    useEffect(() => {
        return gridLayout.setupGrid({
            roundIndex                : gameState.roundIndex,
            muleIndices               : gameState.muleIndices,
            shouldRecalculateOnResize : () => phaseRef.current === "playing",
            setGridDimensions         : gameState.setGridDimensions,
            setIsGridReady            : gameState.setIsGridReady,
            setBaseNodes              : gameState.setBaseNodes,
            setMuleIndices            : gameState.setMuleIndices,
            setActualMuleCount        : gameState.setActualMuleCount,
            setTotalMuleCount         : gameState.setTotalMuleCount,
            setNodeBalances           : gameState.setNodeBalances,
            setNetwork                : gameState.setNetwork,
        });
    }, [ gameState.roundIndex, gameState.muleIndices ]);

    return (
        <Article id="game-page">
            {/* SCORECARD ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Scorecard
                totalMoneyInCirculation={gameState.totalMoneyInCirculation}
                moneyLostToMules={gameState.moneyLostToMules}
                mulesFoundCount={gameState.mulesFoundCount}
                totalMuleCount={gameState.totalMuleCount}
                roundTimeLeft={gameState.roundTimeLeft}
                patternNumber={gameState.roundIndex + 1}
                totalPatterns={TOTAL_PATTERNS}
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
                                <NetworkLayer
                                    nodes={nodes}
                                    network={gameState.network}
                                    activeEdges={gameState.activeEdges}
                                />

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

                                {gameState.phase === "playing" && round && (
                                    <PatternReminder
                                        patternNumber={gameState.roundIndex + 1}
                                        totalPatterns={TOTAL_PATTERNS}
                                        title={round.title}
                                        reminder={round.reminder}
                                    />
                                )}
                            </>
                        )}
                    </div>
                </Card>
            </Main>

            {/* ROUND INTRO //////////////////////////////////////////////////////////////////////////////////////// */}
            {gameState.phase === "intro" && round && (
                <RoundIntro
                    round={round}
                    roundIndex={gameState.roundIndex}
                    onStart={gameFlow.startRound}
                />
            )}

            {/* SCORE AREA ///////////////////////////////////////////////////////////////////////////////////////// */}
            <Div id="score-area">
                <ScoreBar
                    mulesFoundCount={gameState.mulesFoundCount}
                    totalMuleCount={gameState.totalMuleCount}
                    totalMoneyInCirculation={gameState.totalMoneyInCirculation}
                    isFinished={gameState.phase === "finished"}
                    ranOutOfMoney={gameState.gameOverReason === "money"}
                />
            </Div>

        </Article>
    );
};

export default GamePage;
