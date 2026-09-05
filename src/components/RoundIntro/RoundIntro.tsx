"use client";

// SECTION 3 — PATTERN ROUNDS: the card that introduces one pattern, off the clock.

// REACT CORE ==========================================================================================================
import React from "react";

// UI ==================================================================================================================
import { Button, Div, Heading6, Text } from "fictoan-react";

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
        <Div className="icard-layer round-intro-layer">
            <Div className="icard is-narrow has-tab round-intro">
                {/* CONTEXT LABEL */}
                <span className="icard-label">
                    PATTERN {patternIndex + 1} OF {TOTAL_PATTERNS}
                </span>

                {/* SHORT EXPLANATION */}
                <Heading6 className="icard-title round-intro-name">{pattern.title}</Heading6>
                <Text className="icard-body is-key round-intro-shape">{pattern.reminder}</Text>

                {/* RELEVANT VISUAL */}
                <Div className="icard-visual">
                    <Demo />
                </Div>

                <Text className="icard-body">{pattern.description}</Text>

                {/* ONE CLEAR ACTION */}
                <Div className="icard-actions">
                    <Button className="toon-btn is-primary" onClick={onStart}>
                        {isOpening ? "START" : "GOT IT"}
                    </Button>
                </Div>

                <span className="icard-foot">
                    {isOpening
                        ? "80 seconds · tap the accounts doing this"
                        : "The clock is paused"}
                </span>
            </Div>
        </Div>
    );
};
