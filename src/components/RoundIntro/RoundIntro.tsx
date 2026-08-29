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
import { RoundConfig, PatternBehaviour, TOTAL_PATTERNS } from "$lib/roundConfig";

// STYLES ==============================================================================================================
import "./round-intro.css";

interface RoundIntroProps {
    round      : RoundConfig;
    roundIndex : number;
    onStart    : () => void;
}

const DEMO_BY_BEHAVIOUR : Record<PatternBehaviour, React.ComponentType> = {
    "fan-in"         : DemoAnimFanInPattern,
    "fan-out"        : DemoAnimFanOut,
    "gather-scatter" : DemoAnimGatherScatter,
    "low-balance"    : DemoAnimLowBalance,
};

export const RoundIntro = ({round, roundIndex, onStart} : RoundIntroProps) => {
    const Demo = DEMO_BY_BEHAVIOUR[round.behaviour];

    return (
        <Div className="round-intro-overlay">
            <Div className="round-intro-content">
                <Heading6 textColour="amber" align="centre" marginBottom="nano">
                    PATTERN {roundIndex + 1} OF {TOTAL_PATTERNS}
                </Heading6>

                {/* Same card treatment as the how-to-play boxes on the home screen */}
                <Card className="mule-behaviour-demo round-intro-card" padding="micro">
                    <Demo />

                    <Text align="centre" weight="700" marginBottom="nano">
                        {round.title}
                    </Text>

                    <Text align="centre" textColour="amber" weight="700" marginBottom="nano">
                        {round.reminder}
                    </Text>

                    <Text align="centre" textColour="white">
                        {round.description}
                    </Text>
                </Card>

                <Div horizontallyCentreThis marginTop="micro">
                    <Button className="eightbit-btn" onClick={onStart}>
                        {roundIndex === 0 ? "START" : "NEXT PATTERN"}
                    </Button>
                </Div>

                <Text align="centre" textColour="white" opacity="40" marginTop="nano">
                    {round.duration} seconds · tap the accounts doing this
                </Text>
            </Div>
        </Div>
    );
};
