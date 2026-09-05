"use client";

// SECTION 2 — HOME PAGE. Wordmark, brief box, the three steps, the name, START.
// See CLAUDE.md for the five sections.

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React, { useEffect, useRef } from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Span } from "fictoan-react";

// LIB =================================================================================================================
import { cleanName, fetchLeaderboard, isNameTaken, LeaderboardEntry, MAX_NAME_LENGTH } from "$lib/leaderboard";
import { withEddMode } from "$lib/eddMode";

// LOCAL COMPONENTS ====================================================================================================
import SplashScreen from "../components/SplashScreen/SplashScreen";

// ASSETS ==============================================================================================================
import HuntingMulesVideo from "../assets/videos/hunting-mules.mp4";
import IntroSound from "../assets/sounds/intro.wav";
import MuleHunterLogo from "../assets/images/mule-hunter-logo.png";
import MuleHunterSplash from "../assets/images/mule-bg.png";
import MuleSweeperLogo from "../assets/images/mule-sweeper-logo.jpg";

// STYLES ==============================================================================================================
import "$/app/home.css";

const HomePage = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [ audioStarted, setAudioStarted ] = React.useState(false);

    // The name lives in this component and travels to the round in the URL. Nothing
    // is written to the device: this is a shared kiosk, and the next player must
    // find an empty field rather than the last player's name.
    const [ playerName, setPlayerName ] = React.useState("");
    const trimmedName = cleanName(playerName);

    // The board is read once here so a name already on it can be turned away before
    // the round rather than after it — being told at the end would cost the player
    // their score, and this is a shared kiosk where the next person is waiting.
    const [ board, setBoard ] = React.useState<LeaderboardEntry[]>([]);

    // The kiosk's settings ride in the URL, because the machine stores nothing. Read
    // once here so they can be carried into the round.
    const [ search, setSearch ] = React.useState("");

    useEffect(() => {
        setSearch(window.location.search);
        fetchLeaderboard()
            .then(setBoard)
            // A board that cannot be read must not stop anyone playing. The server
            // checks the same thing, so a clash is still caught.
            .catch(() => setBoard([]));
    }, []);

    const isTaken = isNameTaken(board, trimmedName);
    const canStart = trimmedName.length > 0 && !isTaken;
    const gameHref = withEddMode(`/game?player=${encodeURIComponent(trimmedName)}`, search);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio(IntroSound);
        audioRef.current.loop = true;

        // Cleanup function to stop audio when component unmounts
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleStartAudio = () => {
        if (audioRef.current && !audioStarted) {
            audioRef.current.play().catch((error) => {
                console.log("Audio playback failed:", error);
            });
            setAudioStarted(true);
        }
    };

    return (
        <>
            {!audioStarted && <SplashScreen onStart={handleStartAudio} />}

            <Article id="page-home" verticalPadding="tiny">
                <Row horizontalPadding="micro">
                    <Portion>
                        <Div id="logo-holder" horizontallyCentreThis>
                            <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                        </Div>
                    </Portion>

                    {/* THE BRIEF ///////////////////////////////////////////////////////////////////////// */}
                    {/* One message, not two. The instruction is the primary and carries
                        the size; what it is about sits under it, smaller and grey, as
                        the supporting line. These used to be the same size in two
                        different places, which meant neither won. */}
                    <Portion>
                        <Div className="icard is-wide has-tab home-brief">
                            <span className="icard-label">YOUR BRIEF</span>

                            <Heading6 className="icard-title">
                                Spot the accounts moving money in{" "}
                                <Span className="shout-accent">unusual patterns</Span>
                            </Heading6>

                            <Text className="icard-body">
                                Stolen money never sits still. It is pushed through
                                {" "}<Span className="home-accent">ordinary bank accounts</Span>{" "}
                                to shake off the trail.
                            </Text>

                            <div className="icard-rule" />

                            <div className="band-stats">
                                <span><i className="stat-icon is-clock" aria-hidden="true" />80 SECONDS</span>
                                <span><i className="stat-icon is-stack" aria-hidden="true" />4 PATTERNS</span>
                            </div>
                        </Div>
                    </Portion>

                    {/* THE ERRAND, IN ORDER ///////////////////////////////////////////////////////////////// */}
                    {/* Numbered and joined by a dashed run, because these are three
                        steps of one job rather than three separate facts. Same icons
                        and same words the network map shows once the player is out
                        in the world. */}
                    <Portion>
                        <ol id="home-steps">
                            <li>
                                <span className="step-num">01</span>
                                <i className="step-icon is-look" aria-hidden="true" />
                                <span className="step-verb">TRACE</span>
                                <span className="step-note">Follow the<br />transactions</span>
                            </li>
                            <li>
                                <span className="step-num">02</span>
                                <i className="step-icon is-flag" aria-hidden="true" />
                                <span className="step-verb">FLAG</span>
                                <span className="step-note">Spot suspicious<br />accounts</span>
                            </li>
                            <li>
                                <span className="step-num">03</span>
                                <i className="step-icon is-safe" aria-hidden="true" />
                                <span className="step-verb">STOP</span>
                                <span className="step-note">Help keep the<br />system safe</span>
                            </li>
                        </ol>
                    </Portion>

                    {/* NAME ///////////////////////////////////////////////////////////////////////////////// */}
                    {/* Needed before the round so the leaderboard has something to
                        put against the score as it is being earned */}
                    <Portion>
                        <Div id="name-holder">
                            <label htmlFor="player-name">PLEASE ENTER YOUR NAME FOR THE GAME</label>

                            <div id="name-field">
                                <i className="name-mark" aria-hidden="true" />

                                {/* A plain input rather than a form control from the kit:
                                    this one is typed on a kiosk keyboard and needs to be
                                    large, centred and free of any autofill or history that
                                    might offer up the last player's name. */}
                                <input
                                    id="player-name"
                                    type="text"
                                    value={playerName}
                                    placeholder="Type your name"
                                    maxLength={MAX_NAME_LENGTH}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    autoCapitalize="words"
                                    spellCheck={false}
                                    aria-invalid={isTaken}
                                    onChange={event => setPlayerName(event.target.value)}
                                    onKeyDown={event => {
                                        if (event.key === "Enter" && canStart) {
                                            window.location.href = gameHref;
                                        }
                                    }}
                                    />
                            </div>

                            {/* Names are matched ignoring case and spacing, so the
                                board can never show two rows a player reads as theirs */}
                            {isTaken && (
                                <span id="name-taken">
                                    {trimmedName.toUpperCase()} IS ALREADY ON THE BOARD — PICK ANOTHER
                                </span>
                            )}
                        </Div>
                    </Portion>

                    <Portion>
                        <Div id="start-holder" horizontallyCentreThis>
                            {canStart ? (
                                <Link href={gameHref}>
                                    <Button className="toon-btn is-go">
                                        START
                                    </Button>
                                </Link>
                            ) : (
                                <Button className="toon-btn is-go is-waiting" disabled>
                                    START
                                </Button>
                            )}
                        </Div>
                    </Portion>
                </Row>
            </Article>
        </>
    );
};

export default HomePage;