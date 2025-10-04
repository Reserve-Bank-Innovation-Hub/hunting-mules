"use client";

// REACT CORE ==========================================================================================================
import Link from "next/link";
import React from "react";

// UI ==================================================================================================================
import { Button, Portion, Row, Text, Article, Heading6, Div, Heading4, Heading2, Heading1, Span } from "fictoan-react";

// ASSETS ==============================================================================================================
import HuntingMulesVideo from "../assets/videos/hunting-mules.mp4";
import MuleHunterLogo from "../assets/images/mule-hunter-logo.png";

// STYLES ==============================================================================================================
import "$/app/home.css";

const HomePage = () => {
    return (
        <Article id="page-home" verticalPadding="small">
            <Row horizontalPadding="large">
                <Portion>
                    <Div horizontallyCentreThis marginBottom="small">
                        <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                    </Div>
                </Portion>

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

                <Portion desktopSpan="half">
                    <Heading6 textColour="amber" align="centre" marginBottom="tiny">
                        HOW TO PLAY
                    </Heading6>

                    <Text textColour="white" align="centre" marginBottom="small">
                        <strong><Span textColour="red">SPOT ACCOUNTS</Span></strong><br /> that send money to multiple
                        accounts at once.
                    </Text>

                    <Text textColour="white" align="centre" marginBottom="small">
                        <strong><Span textColour="red">CLICK TO LOCK THEM</Span></strong><br /> and prevent them from
                        transacting.
                    </Text>

                    <Text textColour="white" align="centre">
                        <strong><Span textColour="red">FIND THEM QUICKLY</Span></strong><br /> to save as much money as
                        you can—<br /><Span textColour="amber">you are the MULE HUNTER!</Span>
                    </Text>
                </Portion>

                <Portion>
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