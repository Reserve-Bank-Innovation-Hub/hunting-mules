"use client";

// REACT CORE ==========================================================================================================
import React, { useState } from "react";

// UI ==================================================================================================================
import { Button } from "fictoan-react";

// LIB =================================================================================================================
import { drawVisits, FvStatus } from "$lib/eddCases";
import { EDD_VISITS } from "$lib/gameConfig";
import { PATTERNS, PatternBehaviour } from "$lib/roundConfig";

// ASSETS ==============================================================================================================
import BankIcon from "../../assets/images/bank-icon.png";
import UncoveredSound from "../../assets/sounds/uncovered.wav";
import WrongSound from "../../assets/sounds/wrong.wav";

// STYLES ==============================================================================================================
import "./edd-visit.css";

interface EddVisitProps {
    caughtMules : Map<string, PatternBehaviour>;
    onComplete  : (correct : number) => void;
    onSkip      : () => void;   // Straight to the result, nothing recorded
}

const playSound = (src : string) => {
    const audio = new Audio(src);
    audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
    });
};

const titleOf = (behaviour : PatternBehaviour) =>
    PATTERNS.find(pattern => pattern.behaviour === behaviour)?.title ?? behaviour.toUpperCase();

// The brief is the step before the first visit
const BRIEF = -1;

/**
 * The field visits that follow the round.
 *
 * The player has just spent eighty seconds being the model, catching accounts on
 * the shape of their transactions alone. Now they are the branch officer: three
 * accounts they froze, the findings from the doorstep, and the same two verdicts the
 * real form offers. One of the three is innocent. Getting it right is not the point;
 * seeing that a pattern is a reason to look, not proof, is.
 *
 * None of this touches the leaderboard. Catching and verifying are different
 * skills, and the board measures the first. The verdicts show up as their own
 * figure on the result screen.
 */
export const EddVisit = ({caughtMules, onComplete, onSkip} : EddVisitProps) => {
    // Dealt once, when the screen comes up, and held for its whole life
    const [ visits ] = useState(() => drawVisits(caughtMules));
    const [ step, setStep ] = useState(BRIEF);
    const [ answer, setAnswer ] = useState<FvStatus | null>(null);
    const [ correct, setCorrect ] = useState(0);

    const caughtCount = caughtMules.size;
    const current = step >= 0 ? visits[step] : null;
    const isLast = step === visits.length - 1;

    const decide = (status : FvStatus) => {
        if (!current || answer !== null) {
            return;
        }

        const isRight = status === current.verdict;
        setAnswer(status);
        if (isRight) {
            setCorrect(count => count + 1);
        }
        playSound(isRight ? UncoveredSound : WrongSound);
    };

    const next = () => {
        if (isLast) {
            onComplete(correct);
            return;
        }
        setAnswer(null);
        setStep(index => index + 1);
    };

    // THE BRIEF =======================================================================================================
    if (current === null) {
        return (
            <div className="edd-overlay">
                <div className="edd-content">
                    <span className="edd-lead">TIME&rsquo;S UP</span>
                    <span className="edd-sub">ENHANCED DUE DILIGENCE</span>

                    <div className="edd-card edd-brief">
                        <img className="edd-brief-icon" src={BankIcon.src} alt="" />

                        <p className="edd-brief-headline">
                            {caughtCount > 0 ? (
                                <>You froze <strong>{caughtCount}</strong> {caughtCount === 1 ? "account" : "accounts"} on the shape of {caughtCount === 1 ? "its" : "their"} transactions alone.</>
                            ) : (
                                <>The model flagged accounts on the shape of their transactions alone.</>
                            )}
                            {" "}That is what a bank&rsquo;s model does too.
                        </p>

                        <p className="edd-brief-body">
                            Before a freeze is final, a branch officer goes to the address. They meet the
                            customer, ask the neighbours, and find out who is really behind the account.
                        </p>

                        <p className="edd-brief-body is-amber">
                            Visit {EDD_VISITS}. Decide which freezes stand.
                        </p>
                    </div>

                    <div className="edd-actions">
                        <Button className="eightbit-btn" onClick={() => setStep(0)}>
                            START THE VISITS
                        </Button>
                    </div>

                    <span className="edd-footnote">
                        {EDD_VISITS} visits · the clock is off
                    </span>

                    {/* For the player with a queue behind them. Quiet on purpose: the
                        visits are the default, and this is the way out of them. */}
                    <button type="button" className="edd-skip" onClick={onSkip}>
                        SKIP TO RESULTS
                    </button>
                </div>
            </div>
        );
    }

    // A VISIT =========================================================================================================
    const isRight = answer !== null && answer === current.verdict;
    const releases = current.verdict === "positive";

    return (
        <div className="edd-overlay">
            <div className="edd-content">
                <span className="edd-lead">
                    <img className="edd-lead-icon" src={BankIcon.src} alt="" />
                    {" "}FIELD VISIT {step + 1} OF {visits.length}
                </span>
                <span className="edd-sub">ENHANCED DUE DILIGENCE</span>

                {/* Keyed on the step so each visit animates in as a fresh card */}
                <div className="edd-card" key={current.id}>
                    {/* WHY WE ARE HERE ////////////////////////////////////////////////////////////////////////// */}
                    <div className="edd-reason">
                        <span className="edd-reason-lead">
                            {current.isPlayerCatch ? "ACCOUNT YOU FROZE FOR" : "ACCOUNT THE MODEL FLAGGED FOR"}
                        </span>
                        <span className="edd-reason-pattern">{titleOf(current.behaviour)}</span>
                        <span className="edd-reason-subject">
                            {current.subject === "entity" ? "BUSINESS ACCOUNT" : "INDIVIDUAL ACCOUNT"}
                        </span>
                    </div>

                    {/* WHAT THE BRANCH FOUND //////////////////////////////////////////////////////////////////// */}
                    <dl className="edd-findings">
                        {current.findings.map(finding => (
                            <div className="edd-finding" key={finding.label}>
                                <dt>{finding.label}</dt>
                                <dd>{finding.value}</dd>
                            </div>
                        ))}
                    </dl>

                    {answer === null ? (
                        // THE VERDICT ////////////////////////////////////////////////////////////////////////////
                        // The form's mandatory block, as two buttons. Red is the stop.
                        <div className="edd-verdict">
                            <span className="edd-verdict-question">YOUR VERDICT?</span>

                            <div className="edd-verdict-options">
                                <div className="edd-verdict-option">
                                    <Button className="eightbit-btn" onClick={() => decide("positive")}>
                                        RELEASE
                                    </Button>
                                    <span className="edd-verdict-caption">FV STATUS: POSITIVE</span>
                                </div>

                                <div className="edd-verdict-option">
                                    <Button className="eightbit-btn failure" onClick={() => decide("negative")}>
                                        CONFIRM FREEZE
                                    </Button>
                                    <span className="edd-verdict-caption">FV STATUS: NEGATIVE</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // THE REVEAL /////////////////////////////////////////////////////////////////////////////
                        <div className={`edd-reveal ${isRight ? "is-right" : "is-wrong"}`}>
                            <span className="edd-reveal-stamp">
                                {isRight ? "CORRECT" : "WRONG CALL"}
                            </span>

                            <span className="edd-reveal-status">
                                FV STATUS: {releases ? "POSITIVE" : "NEGATIVE"}
                                {" · "}
                                {releases ? "FALSE POSITIVE, ACCOUNT RELEASED" : "MULE CONFIRMED, STR FILED"}
                            </span>

                            <p className="edd-reveal-text">{current.reveal}</p>
                        </div>
                    )}
                </div>

                {answer !== null && (
                    <div className="edd-actions">
                        <Button className="eightbit-btn" onClick={next}>
                            {isLast ? "SEE RESULTS" : "NEXT VISIT"}
                        </Button>
                    </div>
                )}

                <span className="edd-footnote">
                    {answer === null
                        ? "Positive releases the account · Negative confirms the freeze"
                        : `${correct} of ${step + 1} verdicts right so far`}
                </span>
            </div>
        </div>
    );
};
