"use client";

// REACT CORE ==========================================================================================================
import React, { useEffect, useRef, useState } from "react";

// LIB =================================================================================================================
import { PATTERNS } from "$lib/roundConfig";
import { PATTERN_REMINDER_INTERVAL } from "$lib/gameConfig";

import { PatternShape } from "./PatternShape";

// STYLES ==============================================================================================================
import "./pattern-reminder.css";

interface PatternReminderProps {
    unlockedPatterns : number;
}

// Long enough to notice, short enough not to nag
const PULSE_MS = 620;

const LEAD = "LOOK OUT FOR";

/**
 * A thin strip between the numbers and the board, naming what this round is asking
 * the player to spot. It is always there — a reminder that comes and goes is one the
 * player has to wait for.
 *
 * It names one pattern: the one that round is about. Listing every pattern unlocked
 * so far grew into a row of four exactly as the board got busier.
 *
 * Every few seconds the instruction pulses. Only the text moves: a whole strip
 * flashing above a busy board reads as something happening in the game.
 */
export const PatternReminder = ({unlockedPatterns} : PatternReminderProps) => {
    // The round's own pattern is the one most recently unlocked
    const pattern = PATTERNS[unlockedPatterns - 1];
    const [ isPulsing, setIsPulsing ] = useState(false);
    const offTimer = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        const cycle = setInterval(() => {
            setIsPulsing(true);
            offTimer.current = setTimeout(() => setIsPulsing(false), PULSE_MS);
        }, PATTERN_REMINDER_INTERVAL);

        return () => {
            clearInterval(cycle);
            clearTimeout(offTimer.current);
            setIsPulsing(false);
        };
    }, []);

    if (!pattern) {
        return null;
    }

    // The four patterns differ hugely in how much they have to say — "FAN IN /
    // MANY → ONE" is 28 characters, "LOW BALANCE / TINY BALANCE · HUGE IN · ALMOST
    // ALL OUT" is 62. One size cannot serve both, so the strip sizes itself to what
    // it is carrying: short reminders get the full size, longer ones step down just
    // far enough to stay on one line.
    const contentLength = pattern.title.length + LEAD.length + pattern.reminder.length;
    const scale = Math.min(1, Math.max(0.65, 34 / contentLength));

    return (
        <div
            className={`pattern-strip ${isPulsing ? "is-pulsing" : ""}`}
            style={{"--strip-scale" : scale} as React.CSSProperties}
        >
            {/* WHICH CASE ================================================================ */}
            <span className="pattern-strip-case">
                <span className="pattern-strip-no">
                    PATTERN {String(unlockedPatterns).padStart(2, "0")}
                </span>
                <span className="pattern-strip-pill">{pattern.title}</span>
            </span>

            {/* WHAT TO LOOK FOR ========================================================== */}
            <span className="pattern-strip-instruction">
                <span className="pattern-strip-lead">{LEAD}</span>
                <span className="pattern-strip-shape">{pattern.reminder}</span>
            </span>

            {/* THE SAME THING, DRAWN ===================================================== */}
            <span className="pattern-strip-diagram">
                <PatternShape behaviour={pattern.behaviour} />
            </span>
        </div>
    );
};
