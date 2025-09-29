"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div } from "fictoan-react";

// ASSETS ==============================================================================================================
import HuntingMulesVideo from "../assets/videos/hunting-mules.mp4";

// STYLES ==============================================================================================================
import "$/app/home.css";

const HomePage = () => {
    return (
        <Article id="page-home" verticalPadding="small">
            <Row horizontalPadding="large">
                <Portion desktopSpan="one-fourth" />

                <Portion desktopSpan="half">
                    <video
                        id="hero-background-video"
                        autoPlay
                        loop
                        muted
                        playsInline
                        src={HuntingMulesVideo}
                    />
                </Portion>
            </Row>

            <Row horizontalPadding="large">
                <Portion desktopSpan="one-fourth" />

                <Portion desktopSpan="half">
                    <Heading6 textColour="white" align="centre" marginBottom="micro">
                        HOW TO PLAY
                    </Heading6>

                    <Text textColour="white" align="centre" marginBottom="micro">
                        Spot accounts that send money to multiple accounts at once.
                    </Text>

                    <Text textColour="white" align="centre" marginBottom="micro">
                        Click on them to lock them and prevent them from transacting.
                    </Text>

                    <Text textColour="white" align="centre" marginBottom="micro">
                        Find them quickly to save as much money as you can—you are the MULE HUNTER!
                    </Text>

                    <Div horizontallyCentreThis>
                        <Link href="/game">
                            <Button kind="primary" size="large">START GAME</Button>
                        </Link>
                    </Div>
                </Portion>
            </Row>
        </Article>
    );
};

export default HomePage;