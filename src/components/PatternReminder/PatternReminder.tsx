"use client";

// REACT CORE ==========================================================================================================
import React from "react";

// STYLES ==============================================================================================================
import "./pattern-reminder.css";

interface PatternReminderProps {
    patternNumber : number;
    totalPatterns : number;
    title         : string;
    reminder      : string;
}

// Sits in a corner of the play area for the whole pattern, so the player never has
// to remember what they are looking for. Deliberately small.
export const PatternReminder = ({patternNumber, totalPatterns, title, reminder} : PatternReminderProps) => (
    <div className="pattern-reminder">
        <span className="pattern-reminder-index">
            PATTERN {patternNumber} OF {totalPatterns}
        </span>
        <span className="pattern-reminder-title">{title}</span>
        <span className="pattern-reminder-shape">{reminder}</span>
    </div>
);
