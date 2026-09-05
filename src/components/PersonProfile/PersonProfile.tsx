"use client";

// SECTION 5 — INVESTIGATING CARDS. One resident's doorstep file, and the
// freeze / let go decision. See CLAUDE.md for the five sections.

// REACT CORE ==========================================================================================================
import React from "react";

// LOCAL COMPONENTS ====================================================================================================

// LIB =================================================================================================================
import { EddVisitCase, FvStatus } from "$lib/eddCases";
import { PATTERNS, PatternBehaviour } from "$lib/roundConfig";

import { DecoratorMark, FarmerMark, StudentMark } from "./PersonMarks";

// STYLES ==============================================================================================================
import "./person-profile.css";

interface PersonProfileProps {
    visit       : EddVisitCase;
    houseIndex  : number;
    step        : number;      // Zero-based, for "visit 2 of 3"
    total       : number;
    answer      : FvStatus | null;
    correct     : number;
    onDecide    : (status : FvStatus) => void;
    onNext      : () => void;
    isLast      : boolean;
}

// The same three faces the world map put outside these three doors
// The same three people the square put outside these three doors
// One mark per house, in order. They are the residents, not the cases — the case
// drawn for a house changes, the person who lives there does not.
const RESIDENTS = [ DecoratorMark, FarmerMark, StudentMark ];

const titleOf = (behaviour : PatternBehaviour) =>
    PATTERNS.find(pattern => pattern.behaviour === behaviour)?.title ?? behaviour.toUpperCase();

/**
 * What the investigator learns on the doorstep.
 *
 * This is the field-verification report the branch actually fills in, laid out as a
 * profile card: who was met, what the premises are, what the neighbours say, and
 * the two verdicts the form offers. Every word of it comes from the case as it was
 * already written — the panel is a new way of reading the same report, not a new
 * report.
 *
 * It sits over the world rather than replacing it, and deliberately leaves the left
 * of the screen clear, so the person who has just come to the door stays in view
 * the whole time their file is being read.
 */
export const PersonProfile = ({
    visit, houseIndex, step, total, answer, correct, onDecide, onNext, isLast,
} : PersonProfileProps) => {
    const isRight = answer !== null && answer === visit.verdict;
    const releases = visit.verdict === "positive";

    return (
        <div className={`profile-spread house-${houseIndex + 1}`}
             role="dialog" aria-label="Field verification report">

            {/* CARD 1 — WHO ================================================================== */}
            {/* One job: who answered the door. Nothing to read, nothing to decide. */}
            <div className="icard profile-who-card">
                <span className="icard-label profile-house">HOUSE {houseIndex + 1}</span>

                <div className="profile-portrait">
                    {(() => {
                        const Resident = RESIDENTS[houseIndex] ?? RESIDENTS[0];
                        return <Resident className="profile-resident" />;
                    })()}
                </div>

                <span className="profile-subject">
                    {visit.subject === "entity" ? "BUSINESS ACCOUNT" : "INDIVIDUAL ACCOUNT"}
                </span>
                <span className="profile-visit-count">FIELD VISIT {step + 1} OF {total}</span>
            </div>

            {/* CARD 2 — THE FILE, AND THE CALL ============================================== */}
            <div className="icard profile-file-card">
                {answer === null ? (
                    <>
                        {/* KEY FACTS, at the top: it is what the decision is made on */}
                        <span className="icard-label profile-facts-label">KEY FACTS</span>

                        <dl className="profile-findings">
                            {visit.findings.map(finding => (
                                <div className="profile-finding" key={finding.label}>
                                    <dt>{finding.label}</dt>
                                    <dd>{finding.value}</dd>
                                </div>
                            ))}
                        </dl>

                        {/* Why we knocked. Context rather than evidence, so it sits below
                            the facts, immediately above the call it informs. */}
                        <div className="profile-reason">
                            <span className="profile-reason-lead">
                                {visit.isPlayerCatch ? "YOU FROZE THIS ACCOUNT FOR" : "THE MODEL FLAGGED THIS ACCOUNT FOR"}
                            </span>
                            <span className="profile-reason-pattern">{titleOf(visit.behaviour)}</span>
                        </div>

                        {/* THE CALL */}
                        <div className="profile-verdict">
                            <span className="profile-verdict-question">DOES THE FREEZE STAND?</span>

                            <div className="icard-actions profile-verdict-options">
                                <button type="button" className="toon-btn is-good" onClick={() => onDecide("positive")}>
                                    LET GO
                                    <span className="toon-btn-caption">FV STATUS: POSITIVE</span>
                                </button>

                                <button type="button" className="toon-btn is-bad" onClick={() => onDecide("negative")}>
                                    FREEZE
                                    <span className="toon-btn-caption">FV STATUS: NEGATIVE</span>
                                </button>
                            </div>
                        </div>

                        <footer className="profile-foot">
                            Positive releases the account · Negative confirms the freeze
                        </footer>
                    </>
                ) : (
                    <div className={`profile-reveal ${isRight ? "is-right" : "is-wrong"}`}>
                        <span className="profile-reveal-stamp">{isRight ? "CORRECT" : "WRONG CALL"}</span>

                        <span className="profile-reveal-status">
                            FV STATUS: {releases ? "POSITIVE" : "NEGATIVE"}
                            {" · "}
                            {releases ? "FALSE POSITIVE, ACCOUNT RELEASED" : "MULE CONFIRMED, STR FILED"}
                        </span>

                        <p className="profile-reveal-text">{visit.reveal}</p>

                        <button type="button" className="toon-btn is-primary profile-next" onClick={onNext}>
                            {isLast ? "SEE RESULTS" : "BACK TO THE MAP"}
                        </button>

                        <footer className="profile-foot">
                            {correct} of {step + 1} verdicts right so far
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
};
