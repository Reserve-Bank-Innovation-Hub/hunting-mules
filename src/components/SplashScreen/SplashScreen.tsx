// SECTION 1 — LANDING PAGE. The mule, the wordmark and "click anywhere to start".
// Section names are a shared vocabulary for discussing the game; see CLAUDE.md.
// They are never shown to a player.

// REACT CORE ==========================================================================================================
import React from "react";

// UI ==================================================================================================================
import { Div, Text } from "fictoan-react";

// ASSETS ==============================================================================================================
import MuleHunterLogo from "../../assets/images/mule-hunter-logo.png";
import LandingLoop from "../../assets/videos/landing-loop.mp4";
import RBIHLogo from "../../assets/images/rbih-logo.svg";

// STYLES ==============================================================================================================
import "./splash-screen.css";

interface SplashScreenProps {
    onStart : () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    return (
        <Div
            onClick={onStart}
            className="splash-screen-overlay"
        >
            <Div id="click-to-start">
                <video
                    id="hero-background-video"
                    autoPlay loop muted playsInline
                    src={LandingLoop}
                />
                <img id="mule-hunter-logo" src={MuleHunterLogo.src} alt="Mule Hunter Logo" />
                <Text textColour="white" size="large" opacity="60">by</Text>
                <RBIHLogo />
                <Text textColour="red" size="large">Click anywhere to start</Text>
            </Div>
        </Div>
    );
};

export default SplashScreen;
