"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React, { useEffect, useRef } from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Span } from "fictoan-react";

// LIB =================================================================================================================
import { cleanName, fetchLeaderboard, isNameTaken, LeaderboardEntry, MAX_NAME_LENGTH } from "$lib/leaderboard";

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

    useEffect(() => {
        fetchLeaderboard()
            .then(setBoard)
            // A board that cannot be read must not stop anyone playing. The server
            // checks the same thing, so a clash is still caught.
            .catch(() => setBoard([]));
    }, []);

    const isTaken = isNameTaken(board, trimmedName);
    const canStart = trimmedName.length > 0 && !isTaken;

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

                    {/* CONTEXT ///////////////////////////////////////////////////////////////////////////// */}
                    {/* Kiosk framing. Spacing is handled in home.css so the three lines are
                        set as one rhythm rather than each carrying its own margin. */}
                    <Portion>
                        <Div id="context-setting" horizontallyCentreThis>
                            <Text align="centre" textColour="white">
                                Stolen money never sits still. It is pushed through
                                {" "}<Span textColour="amber">ordinary bank accounts</Span>{" "}
                                to shake off the trail.
                            </Text>

                            <Heading6 align="centre" textColour="amber">
                                SPOT THE ACCOUNTS MOVING MONEY IN UNUSUAL PATTERNS
                            </Heading6>

                            {/* How to play is not spelled out here — the first pattern's
                                intro card says it, on the very next screen */}
                            <Text align="centre" textColour="white" opacity="60">
                                Four patterns · 80 seconds
                            </Text>
                        </Div>
                    </Portion>

                    {/* NAME ///////////////////////////////////////////////////////////////////////////////// */}
                    {/* Needed before the round so the leaderboard has something to
                        put against the score as it is being earned */}
                    <Portion>
                        <Div id="name-holder">
                            <label htmlFor="player-name">PLEASE ENTER YOUR NAME FOR THE GAME</label>

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
                                        window.location.href = `/game?player=${encodeURIComponent(trimmedName)}`;
                                    }
                                }}
                            />

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
                                <Link href={`/game?player=${encodeURIComponent(trimmedName)}`}>
                                    <Button className="eightbit-btn">
                                        START
                                    </Button>
                                </Link>
                            ) : (
                                <Button className="eightbit-btn is-waiting" disabled>
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