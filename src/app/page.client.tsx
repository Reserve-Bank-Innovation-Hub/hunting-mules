"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React, { useEffect, useRef } from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Span, Card } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import SplashScreen from "../components/SplashScreen/SplashScreen";
import { DemoAnimFanIn } from "../components/DemoAnimFanIn/DemoAnimFanIn";
import { DemoAnimFanOut } from "../components/DemoAnimFanOut/DemoAnimFanOut";

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
                        <Heading6 textColour="amber" align="centre" marginBottom="tiny">
                            HOW TO PLAY
                        </Heading6>
                    </Portion>

                    <Portion desktopSpan="half">
                        <Card className="mule-behaviour-demo" padding="micro">
                            <DemoAnimFanOut />

                            <Text align="centre" weight="700" marginBottom="nano">
                                MULE BEHAVIOUR 1
                            </Text>

                            <Text align="centre" textColour="white">
                                Credited money is immediately split into smaller amounts, and sent off to other mule
                                accounts.
                            </Text>
                        </Card>
                    </Portion>

                    <Portion desktopSpan="half">
                        <Card className="mule-behaviour-demo" padding="micro">
                            <DemoAnimFanIn />

                            <Text align="centre" weight="700" marginBottom="nano">
                                MULE BEHAVIOUR 2
                            </Text>

                            <Text align="centre" textColour="white">
                                Mule accounts also tend to receive multiple small sums.
                            </Text>
                        </Card>
                    </Portion>

                    {/* <Portion desktopSpan="half"> */}
                    {/*     <Text textColour="white" align="centre" marginBottom="small"> */}
                    {/*         <strong><Span textColour="red">SPOT ACCOUNTS</Span></strong><br /> that send money to */}
                    {/*         multiple accounts at once. */}
                    {/*     </Text> */}

                    {/*     <Text textColour="white" align="centre" marginBottom="small"> */}
                    {/*         <strong><Span textColour="red">CLICK TO LOCK THEM</Span></strong><br /> and prevent them */}
                    {/*         from transacting. */}
                    {/*     </Text> */}

                    {/*     <Text textColour="white" align="centre" marginBottom="small"> */}
                    {/*         <strong><Span textColour="red">FIND ALL IN 60 SECONDS</Span></strong><br /> to save as much */}
                    {/*         money as you can—<br /><Span textColour="amber">you are the MULE HUNTER!</Span> */}
                    {/*     </Text> */}

                    <Portion>
                        <Div horizontallyCentreThis marginTop="micro">
                            <Link href="/game">
                                <Button className="eightbit-btn">
                                    START GAME
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