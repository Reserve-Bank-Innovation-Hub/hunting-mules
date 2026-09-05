"use client";

// SECTION 3 — PATTERN ROUNDS, and the host for sections 4 and 5 after the clock
// runs out. See CLAUDE.md for the five sections.

// REACT CORE ==========================================================================================================
import React, { useMemo, useEffect, useRef, useState } from "react";
import ReactFlow, { Background, BackgroundVariant, NodeTypes } from "reactflow";

// UI ==================================================================================================================
import { Article, Card, Div, Main, Spinner } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { AccountNode } from "$components/AccountNode/AccountNode";
import { AnimationOverlay } from "$components/AnimationOverlay/AnimationOverlay";
import { BoardHints } from "$components/BoardHints/BoardHints";
import { BoardTexture } from "$components/BoardTexture/BoardTexture";
import { EddVisit } from "$components/EddVisit/EddVisit";
import { NetworkLayer } from "$components/NetworkLayer/NetworkLayer";
import { PatternReminder } from "$components/PatternReminder/PatternReminder";
import { RoundIntro } from "$components/RoundIntro/RoundIntro";
import { Scorecard } from "$components/Scorecard/Scorecard";
import { ScoreBar } from "$components/ScoreBar/ScoreBar";

// HOOKS ===============================================================================================================
import { useGameFlow } from "$hooks/useGameFlow";
import { useGameState } from "$hooks/useGameState";
import { useGridLayout } from "$hooks/useGridLayout";
import { useLeaderboard } from "$hooks/useLeaderboard";
import { useNodeInteractions } from "$hooks/useNodeInteractions";
import { useTransactions } from "$hooks/useTransactions";

// LIB =================================================================================================================
import { EDD_ENABLED, EDD_VISITS } from "$lib/gameConfig";
import { readEddEnabled, withEddMode } from "$lib/eddMode";
import { PATTERNS, PatternBehaviour, TOTAL_PATTERNS } from "$lib/roundConfig";
import { cleanName } from "$lib/leaderboard";

// STYLES ==============================================================================================================
import "./game-page.css";
import "reactflow/dist/style.css";

const GamePage = () => {
    const gameState = useGameState();
    const gridLayout = useGridLayout();

    // The name is carried from the home screen in the URL and lives only in this
    // component's state. Nothing is written to the device — the kiosk is shared, and
    // the next player must start from an empty field rather than inherit this one.
    const [ playerName, setPlayerName ] = useState("");

    // Whether the field visits run after the round. The default is in gameConfig; the
    // kiosk can be opened with ?edd=off to skip them for the day, and the choice is
    // carried from screen to screen in the URL because the machine stores nothing.
    const [ isEddEnabled, setIsEddEnabled ] = useState(EDD_ENABLED);
    const [ search, setSearch ] = useState("");

    // Jump straight to a late screen without playing a round, for checking layout:
    //   /game?preview=end   the result screen   (optionally &score=24&verdicts=2&player=NAME;
    //                                            verdicts=none shows a run that skipped the visits)
    //   /game?preview=edd   the field visits    (optionally &score=24&player=NAME)
    //
    // The board is read and ranked for real, so the screen shows genuine standings —
    // but the run is never written, so looking at the layout cannot leave a score on
    // the kiosk's leaderboard.
    const [ isPreview, setIsPreview ] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearch(window.location.search);
        setIsEddEnabled(readEddEnabled(window.location.search));

        const fromUrl = params.get("player");
        if (fromUrl) {
            setPlayerName(cleanName(fromUrl));
        }

        const preview = params.get("preview");
        if (preview !== "end" && preview !== "edd") {
            return;
        }

        setIsPreview(true);
        if (!fromUrl) {
            setPlayerName("PREVIEW");
        }

        // The score is the number of accounts caught, so a previewed score is that
        // many stand-in accounts, dealt a pattern each in turn so the field visits
        // have something to be drawn towards
        const previewScore = Math.max(0, Math.min(99, Number(params.get("score") ?? 24)));
        gameState.setCaughtMules(() => new Map(
            Array.from({length : previewScore}, (_, index) : [ string, PatternBehaviour ] =>
                [ `preview-${index}`, PATTERNS[index % TOTAL_PATTERNS].behaviour ]),
        ));

        if (preview === "edd") {
            gameState.setPhase("edd");
            return;
        }

        const verdicts = params.get("verdicts");
        gameState.setEddCorrect(verdicts === "none"
            ? null
            : Math.max(0, Math.min(EDD_VISITS, Number(verdicts ?? 2))));
        gameState.setPhase("finished");
    }, []);

    const leaderboard = useLeaderboard({
        playerName,
        score      : gameState.mulesFoundCount,
        isFinished : gameState.phase === "finished",
        isPreview,
    });

    // The pattern currently in play — the last one unlocked. The hint bar under
    // the board shows its shape for as long as it is live.
    const livePattern = gameState.unlockedPatterns > 0
        ? PATTERNS[gameState.unlockedPatterns - 1]
        : null;

    const introPattern = gameState.introPatternIndex !== null
        ? PATTERNS[gameState.introPatternIndex]
        : null;

    // Each pattern is played on a board of its own. This lags unlockedPatterns by
    // one so the opening round uses the board built at mount, and every pattern
    // after that triggers a rebuild the moment its intro is dismissed.
    const roundIndex = Math.max(0, gameState.unlockedPatterns - 1);

    // Balances belong to the low-balance pattern, so the chips stay off the board
    // until it is unlocked. Keyed off the pattern itself rather than a count, so
    // reordering the patterns cannot quietly separate the two. The grid always
    // reserves the room for them, so nothing on the board shifts when they appear.
    const showBalances = PATTERNS
        .slice(0, gameState.unlockedPatterns)
        .some(pattern => pattern.behaviour === "low-balance");

    // The board is built once and only rebuilt on a resize, so these are read live
    // rather than closed over at the moment the grid was last measured
    const phaseRef = useRef(gameState.phase);
    const rolesRef = useRef(gameState.muleRoles);
    const balancesRef = useRef(gameState.nodeBalances);
    const unlockedRef = useRef(gameState.unlockedPatterns);
    phaseRef.current = gameState.phase;
    rolesRef.current = gameState.muleRoles;
    balancesRef.current = gameState.nodeBalances;
    unlockedRef.current = gameState.unlockedPatterns;

    const nodeInteractions = useNodeInteractions({
        nodes                 : gameState.baseNodes,
        lockedNodes           : gameState.lockedNodes,
        unlockedPatterns      : gameState.unlockedPatterns,
        muleRoles             : gameState.muleRoles,
        nodeBalances          : gameState.nodeBalances,
        setLockedNodes        : gameState.setLockedNodes,
        setShakingNodes       : gameState.setShakingNodes,
        setCaughtMules        : gameState.setCaughtMules,
        setMuleRoles          : gameState.setMuleRoles,
        setNodeBalances       : gameState.setNodeBalances,
        setActiveTransactions : gameState.setActiveTransactions,
    });

    const gameFlow = useGameFlow({
        timeLeft             : gameState.timeLeft,
        phase                : gameState.phase,
        unlockedPatterns      : gameState.unlockedPatterns,
        introPatternIndex     : gameState.introPatternIndex,
        isGridReady           : gameState.isGridReady,
        setActiveRipples      : gameState.setActiveRipples,
        setPatternFlashes     : gameState.setPatternFlashes,
        setActiveTransactions : gameState.setActiveTransactions,
        setLockedNodes        : gameState.setLockedNodes,
        setShakingNodes       : gameState.setShakingNodes,
        setMuleRoles          : gameState.setMuleRoles,
        setNodeBalances       : gameState.setNodeBalances,
        setIsGridReady        : gameState.setIsGridReady,
        setTimeLeft           : gameState.setTimeLeft,
        setPhase              : gameState.setPhase,
        setUnlockedPatterns   : gameState.setUnlockedPatterns,
        setIntroPatternIndex  : gameState.setIntroPatternIndex,
        setEddCorrect         : gameState.setEddCorrect,
        isEddEnabled,
    });

    // Update nodes with dynamic state. Which accounts are mules is decided by the
    // roles map, so a caught mule's replacement takes over without rebuilding the board.
    const nodes = useMemo(() => {
        return gameState.baseNodes.map(node => ({
            ...node,
            data : {
                ...node.data,
                onNodeClick : nodeInteractions.handleNodeClick,
                isMule      : gameState.muleRoles.has(node.id),
                isLocked    : gameState.lockedNodes.has(node.id),
                isShaking   : gameState.shakingNodes.has(node.id),
                balance     : showBalances ? gameState.nodeBalances.get(node.id) : undefined,
            },
        }));
    }, [
        gameState.baseNodes, nodeInteractions.handleNodeClick, gameState.muleRoles,
        gameState.lockedNodes, gameState.shakingNodes, gameState.nodeBalances, showBalances,
    ]);

    const transactions = useTransactions({
        nodes,
        network                    : gameState.network,
        activeTransactions         : gameState.activeTransactions,
        lockedNodes                : gameState.lockedNodes,
        phase                      : gameState.phase,
        unlockedPatterns           : gameState.unlockedPatterns,
        muleRoles                  : gameState.muleRoles,
        nodeBalances               : gameState.nodeBalances,
        setActiveTransactions      : gameState.setActiveTransactions,
        setPatternFlashes          : gameState.setPatternFlashes,
        setMoneyLostToMules        : gameState.setMoneyLostToMules,
        setTotalMoneyInCirculation : gameState.setTotalMoneyInCirculation,
        setNodeBalances            : gameState.setNodeBalances,
        createRipple               : gameFlow.createRipple,
    });

    const nodeTypes : NodeTypes = useMemo(() => ({
        circle : AccountNode,
    }), []);

    // Deal a board for this round. On mount this runs while the first intro card is
    // still up, so play begins the moment the player dismisses it; afterwards it runs
    // again each time a new pattern starts, dealing fresh accounts and clearing the
    // stamps along with them.
    useEffect(() => {
        return gridLayout.setupGrid({
            roundIndex,
            // Once the clock has run out the board is behind an overlay and out of play,
            // so a resize must not deal it again
            shouldRecalculateOnResize : () =>
                phaseRef.current === "intro" || phaseRef.current === "playing",
            currentRoles              : () => rolesRef.current,
            currentBalances           : () => balancesRef.current,
            unlockedBehaviours        : () => PATTERNS
                .slice(0, Math.max(1, unlockedRef.current))
                .map(pattern => pattern.behaviour),
            setGridDimensions         : gameState.setGridDimensions,
            setIsGridReady            : gameState.setIsGridReady,
            setBaseNodes              : gameState.setBaseNodes,
            setMuleRoles              : gameState.setMuleRoles,
            setNodeBalances           : gameState.setNodeBalances,
            setNetwork                : gameState.setNetwork,
        });
    }, [ roundIndex ]);

    return (
        <Article id="game-page">
            {/* SCORECARD ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Scorecard
                moneyLostToMules={gameState.moneyLostToMules}
                mulesFoundCount={gameState.mulesFoundCount}
                timeLeft={gameState.timeLeft}
                unlockedPatterns={gameState.unlockedPatterns}
                totalPatterns={TOTAL_PATTERNS}
            />

            {/* PATTERN REMINDER /////////////////////////////////////////////////////////////////////////////////// */}
            {/* A thin strip between the numbers and the board, there the whole round */}
            <PatternReminder unlockedPatterns={gameState.unlockedPatterns} />

            {/* PLAY AREA ////////////////////////////////////////////////////////////////////////////////////////// */}
            <Main id="play-area">
                <Card isFullHeight>
                    <div ref={gridLayout.containerRef} style={{position : "relative", width : "100%", height : "100%"}}>
                        {!gameState.isGridReady ? (
                            // Loading State
                                <Div padding="small" marginTop="small">
                                    <Spinner />
                                </Div>
                        ) : (
                            <>
                                {/* Texture behind the board, in the World Map's own
                                    graphic vocabulary. Marks, not objects. */}
                                <BoardTexture />

                                <NetworkLayer
                                    nodes={nodes}
                                    network={gameState.network}
                                    flashes={gameState.patternFlashes}
                                    onFlashComplete={gameFlow.handleFlashComplete}
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
                                    {/* The dot grid is texture, not information. Black dots
                                        every 12px read as a speckle over the whole board and
                                        competed with the accounts sitting on it — this is the
                                        same grid, pitched down to a whisper. */}
                                    <Background
                                        color="#1F2937"
                                        variant={BackgroundVariant.Dots}
                                        gap={20}
                                        size={1}
                                    />
                                </ReactFlow>

                                <AnimationOverlay
                                    activeTransactions={gameState.activeTransactions}
                                    activeRipples={gameState.activeRipples}
                                    onTransactionComplete={transactions.handleTransactionComplete}
                                    onRippleComplete={gameFlow.handleRippleComplete}
                                />

                                {/* Three reminders along the foot of the board: what to
                                    do, what this pattern looks like, and how to act on
                                    it. There for the whole round, because the tutorial
                                    card is not. */}
                                {livePattern && <BoardHints pattern={livePattern} />}
                            </>
                        )}
                    </div>
                </Card>
            </Main>

            {/* PATTERN INTRO ////////////////////////////////////////////////////////////////////////////////////// */}
            {/* The clock stops while this is up, so learning costs no play time */}
            {gameState.phase === "intro" && introPattern && gameState.introPatternIndex !== null && (
                <RoundIntro
                    pattern={introPattern}
                    patternIndex={gameState.introPatternIndex}
                    onStart={gameFlow.dismissIntro}
                />
            )}

            {/* FIELD VISITS /////////////////////////////////////////////////////////////////////////////////////// */}
            {/* The clock has run out. Before the result, the player checks their own
                catches the way a branch would. The score is written once they are done. */}
            {gameState.phase === "edd" && (
                <EddVisit
                    caughtMules={gameState.caughtMules}
                    onComplete={gameFlow.finishEdd}
                    onSkip={gameFlow.skipEdd}
                />
            )}

            {/* SCORE AREA ///////////////////////////////////////////////////////////////////////////////////////// */}
            <Div id="score-area">
                <ScoreBar
                    mulesFoundCount={gameState.mulesFoundCount}
                    isFinished={gameState.phase === "finished"}
                    eddCorrect={gameState.eddCorrect}
                    playAgainHref={withEddMode("/", search)}
                    playerName={playerName}
                    rows={leaderboard.rows}
                    position={leaderboard.position}
                    isConnected={leaderboard.isConnected}
                />
            </Div>

        </Article>
    );
};

export default GamePage;
