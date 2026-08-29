"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React, { useEffect, useRef } from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Span } from "fictoan-react";

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
                        <Div horizontallyCentreThis marginBottom="tiny">
                            <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                        </Div>
                    </Portion>

                    {/* CONTEXT ///////////////////////////////////////////////////////////////////////////// */}
                    {/* Kiosk framing. Two lines, no instructions — the patterns teach themselves. */}
                    <Portion>
                        <Div id="context-setting" horizontallyCentreThis>
                            <Text align="centre" textColour="white" marginBottom="micro">
                                Stolen money never sits still. It is pushed through
                                {" "}<Span textColour="amber">ordinary bank accounts</Span>{" "}
                                to shake off the trail.
                            </Text>

                            <Heading6 align="centre" textColour="amber" marginBottom="tiny">
                                SPOT THE ACCOUNTS MOVING MONEY IN UNUSUAL PATTERNS
                            </Heading6>

                            <Text align="centre" textColour="white" opacity="60">
                                Three patterns · 25 seconds each · tap an account to freeze it
                            </Text>
                        </Div>
                    </Portion>

                    <Portion>
                        <Div horizontallyCentreThis marginTop="small">
                            <Link href="/game">
                                <Button className="eightbit-btn">
                                    START
                                </Button>
                            </Link>
                        </Div>
                    </Portion>
                </Row>
            </Article>
        </>
    );
};

export default HomePage;