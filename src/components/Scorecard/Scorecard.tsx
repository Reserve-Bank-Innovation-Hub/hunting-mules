"use client";

// REACT CORE ==========================================================================================================
import { useEffect, useState } from "react";

// UI ==================================================================================================================
import { Card, Heading5, Heading6, Div, Portion, Row, Text } from "fictoan-react";

import { ROUND_DURATION } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./scorecard.css";

interface ScorecardProps {
    moneyLostToMules        : number;
    mulesFoundCount         : number;   // Simply how many have been caught. There is no target.
    timeLeft                : number;
    unlockedPatterns        : number;
    totalPatterns           : number;
}

export const Scorecard = ({
    moneyLostToMules,
    mulesFoundCount,
    timeLeft,
    unlockedPatterns,
    totalPatterns,
} : ScorecardProps) => {
    // WHAT THE MULES HAVE TAKEN, OVER TIME ============================================================================
    // The figure alone says how much; the line beside it says how fast. Sampled
    // only when the number actually changes, and capped — this is a sparkline in
    // a 60px box, not a chart.
    const [ stolenTrail, setStolenTrail ] = useState<number[]>([]);

    useEffect(() => {
        setStolenTrail(prev => (
            prev[prev.length - 1] === moneyLostToMules ? prev : [ ...prev, moneyLostToMules ].slice(-28)
        ));
    }, [ moneyLostToMules ]);

    // Normalised into the box. Flat until there is something to draw.
    const trail = stolenTrail.length > 1 ? stolenTrail : [ 0, 0 ];
    const peak  = Math.max(...trail, 1);
    const points = trail.map((value, index) => {
        const x = (index / (trail.length - 1)) * 60;
        const y = 22 - (value / peak) * 19;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");

    return (
        <Row id="scorecard" retainLayoutAlways marginBottom="none">
            {/* DESKTOP STYLES ===================================================================================== */}
            {/* Four figures across one row, each an icon, its label and its number.
                The clock carries a bar of how much of the round is left, because it
                is the only one of the four that is running out. */}
            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card className="metric-card is-time" padding="nano" isFullHeight>
                    <Text><i className="metric-icon is-clock" aria-hidden="true" />Time left</Text>
                    <Heading5 textColour={timeLeft <= 10 ? "red" : undefined}>
                        {timeLeft}s
                    </Heading5>
                    <span className="metric-bar" aria-hidden="true">
                        <span className="metric-bar-fill"
                              style={{width : `${Math.max(0, Math.min(100, (timeLeft / ROUND_DURATION) * 100))}%`}} />
                    </span>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card className="metric-card" padding="nano" isFullHeight>
                    <Text><i className="metric-icon is-patterns" aria-hidden="true" />Patterns live</Text>
                    <Heading5>{unlockedPatterns}/{totalPatterns}</Heading5>
                    {/* One dot per pattern, filled as each joins the round. The
                        figure says how many; the dots say how far through. */}
                    <span className="metric-dots" aria-hidden="true">
                        {Array.from({length : totalPatterns}, (_, index) => (
                            <i key={index} className={index < unlockedPatterns ? "is-live" : ""} />
                        ))}
                    </span>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card className="metric-card is-money" padding="nano" isFullHeight>
                    <Text><i className="metric-icon is-rupee" aria-hidden="true" />Stolen</Text>
                    <span className="metric-figure">
                        <Heading5 textColour="red">
                            ₹{moneyLostToMules.toLocaleString("en-IN")}
                        </Heading5>

                        {/* How fast it is climbing. Red, because what it plots is loss. */}
                        <svg className="metric-spark" viewBox="0 0 60 24" aria-hidden="true"
                             preserveAspectRatio="none">
                            <polygon className="spark-fill" points={`0,24 ${points} 60,24`} />
                            <polyline className="spark-line" points={points} />
                        </svg>
                    </span>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card className="metric-card is-caught" padding="nano" isFullHeight>
                    <Text><i className="metric-icon is-shield" aria-hidden="true" />Caught</Text>
                    <span className="metric-figure">
                        <Heading5 textColour="green">{mulesFoundCount}</Heading5>

                        {/* A slow ring, breathing outward. The one thing in the bar that
                            moves on its own: it is what says the round is live even when
                            no number has changed for a few seconds. */}
                        <span className="metric-scan" aria-hidden="true">
                            <i /><i /><b />
                        </span>
                    </span>
                </Card>
            </Portion>

            {/* MOBILE STYLES ====================================================================================== */}
            <Portion showOnlyOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text textColour="amber-dark60">Time left</Text>
                        <Heading6 textColour={timeLeft <= 10 ? "red" : undefined}>
                            {timeLeft}s
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text textColour="amber-dark60">Patterns live</Text>
                        <Heading6>
                            {unlockedPatterns}/{totalPatterns}
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text textColour="amber-dark60">Stolen by mules</Text>
                        <Heading6 textColour="red">
                            ₹{moneyLostToMules.toLocaleString("en-IN")}
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text textColour="amber-dark60">Caught</Text>
                        <Heading6 textColour="green">
                            {mulesFoundCount}
                        </Heading6>
                    </Div>
                </Card>
            </Portion>
        </Row>
    );
};
