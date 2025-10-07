"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React, { useEffect, useRef } from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Span } from "fictoan-react";

// ASSETS ==============================================================================================================
import HuntingMulesVideo from "../assets/videos/hunting-mules.mp4";
import IntroSound from "../assets/sounds/intro.wav";
import MuleHunterLogo from "../assets/images/mule-hunter-logo.png";
import MuleHunterSplash from "../assets/images/mule-bg.png";
import MuleSweeperLogo from "../assets/images/mule-sweeper-logo.jpg";
import RBIHLogo from "../assets/images/rbih-logo.svg";

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
            {!audioStarted && (
                <Div
                    onClick={handleStartAudio}
                    style={{
                        position        : "fixed",
                        top             : 0,
                        left            : 0,
                        width           : "100vw",
                        height          : "100vh",
                        backgroundColor : "rgba(0, 0, 0, 0.9)",
                        display         : "flex",
                        alignItems      : "center",
                        justifyContent  : "center",
                        cursor          : "pointer",
                        zIndex          : 9999,
                    }}
                >
                    <Div id="click-to-start">
                        <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                        <Text textColour="white" size="large" opacity="60">by</Text>
                        <RBIHLogo />
                        <Text textColour="red" size="large">Click anywhere to start</Text>
                    </Div>
                </Div>
            )}

            <Article id="page-home" verticalPadding="tiny">
                <Row horizontalPadding="micro">
                    <Portion>
                        <Div horizontallyCentreThis marginBottom="tiny">
                            <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                        </Div>
                    </Portion>

                    <Portion desktopSpan="half">
                        <img id="mule-hunter-logo" src={MuleHunterSplash.src} alt="Mule Hunter Logo" />s
                        {/* <video */}
                        {/*     id="hero-background-video" */}
                        {/*     autoPlay */}
                        {/*     loop */}
                        {/*     muted */}
                        {/*     playsInline */}
                        {/*     src={HuntingMulesVideo} */}
                        {/* /> */}
                    </Portion>

                    <Portion desktopSpan="half">
                        <Heading6 textColour="amber" align="centre" marginBottom="tiny">
                            HOW TO PLAY
                        </Heading6>

                        <Text textColour="white" align="centre" marginBottom="small">
                            <strong><Span textColour="red">SPOT ACCOUNTS</Span></strong><br /> that send money to
                            multiple accounts at once.
                        </Text>

                        <Text textColour="white" align="centre" marginBottom="small">
                            <strong><Span textColour="red">CLICK TO LOCK THEM</Span></strong><br /> and prevent them
                            from transacting.
                        </Text>

                        <Text textColour="white" align="centre" marginBottom="small">
                            <strong><Span textColour="red">FIND ALL IN 60 SECONDS</Span></strong><br /> to save as much
                            money as you can—<br /><Span textColour="amber">you are the MULE HUNTER!</Span>
                        </Text>

                        <Div horizontallyCentreThis>
                            <Link href="/game">
                                <Button className="eightbit-btn">START GAME</Button>
                            </Link>
                        </Div>
                    </Portion>
                </Row>
            </Article>
        </>
    );
};

export default HomePage;