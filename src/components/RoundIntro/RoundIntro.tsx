"use client";

// REACT CORE ==========================================================================================================
import React from "react";

// UI ==================================================================================================================
import { Button, Card, Div, Heading6, Text } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { DemoAnimFanInPattern } from "$components/DemoAnimFanInPattern/DemoAnimFanInPattern";
import { DemoAnimFanOut } from "$components/DemoAnimFanOut/DemoAnimFanOut";
import { DemoAnimGatherScatter } from "$components/DemoAnimGatherScatter/DemoAnimGatherScatter";
import { DemoAnimLowBalance } from "$components/DemoAnimLowBalance/DemoAnimLowBalance";

// LIB =================================================================================================================
import { PatternConfig, PatternBehaviour, TOTAL_PATTERNS } from "$lib/roundConfig";

// STYLES ==============================================================================================================
import "./round-intro.css";

interface RoundIntroProps {
    pattern      : PatternConfig;
    patternIndex : number;
    onStart      : () => void;
}

const DEMO_BY_BEHAVIOUR : Record<PatternBehaviour, React.ComponentType> = {
    "fan-in"         : DemoAnimFanInPattern,
    "fan-out"        : DemoAnimFanOut,
    "gather-scatter" : DemoAnimGatherScatter,
    "low-balance"    : DemoAnimLowBalance,
};

/**
 * Shown each time a new pattern joins the round. The clock is stopped the whole
 * time this is up, so learning a pattern never costs the player any of their 80
 * seconds — the game simply picks up where it left off.
 */
export const RoundIntro = ({pattern, patternIndex, onStart} : RoundIntroProps) => {
    const Demo = DEMO_BY_BEHAVIOUR[pattern.behaviour];
    const isOpening = patternIndex === 0;

    return (
        <Div className="round-intro-overlay">
            <Div className="round-intro-content">
                <Heading6 textColour="amber" align="centre" marginBottom="nano">
                    <span className="round-intro-detective" role="img" aria-label="Detective">🕵️</span>
                    {" "}NEW PATTERN DETECTED
                </Heading6>

                <Text align="centre" textColour="white" opacity="40" marginBottom="nano">
                    PATTERN {patternIndex + 1} OF {TOTAL_PATTERNS}
                </Text>

                {/* Same card treatment as the how-to-play boxes on the home screen */}
                <Card className="mule-behaviour-demo round-intro-card" padding="micro">
                    <Demo />

                    <Text align="centre" weight="700" marginBottom="nano">
                        {pattern.title}
                    </Text>

                    <Text align="centre" textColour="amber" weight="700" marginBottom="nano">
                        {pattern.reminder}
                    </Text>

                    <Text align="centre" textColour="white">
                        {pattern.description}
                    </Text>
                </Card>

                <Div horizontallyCentreThis marginTop="micro">
                    <Button className="eightbit-btn" onClick={onStart}>
                        {isOpening ? "START" : "GOT IT"}
                    </Button>
                </Div>

                <Text align="centre" textColour="white" opacity="40" marginTop="nano">
                    {isOpening
                        ? "80 seconds · tap the accounts doing this"
                        : "The clock is paused · it starts again when you carry on"}
                </Text>
            </Div>
        </Div>
    );
};
