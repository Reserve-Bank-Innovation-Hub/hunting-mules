"use client";

// UI ==================================================================================================================
import { Card, Heading6, Text, Div, Row, Portion, Heading5 } from "fictoan-react";

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
    return (
        <Row id="scorecard" retainLayoutAlways marginBottom="none">
            {/* DESKTOP STYLES ===================================================================================== */}
            <Portion desktopSpan="half" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="nano" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Time left</Text>
                    <Heading5 textColour={timeLeft <= 10 ? "red" : undefined}>
                        {timeLeft}s
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="half" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="nano" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Patterns live</Text>
                    <Heading5>
                        {unlockedPatterns}/{totalPatterns}
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="half" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="nano" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Stolen by mules</Text>
                    <Heading5 textColour="red">
                        ₹{moneyLostToMules.toLocaleString("en-IN")}
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="half" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="nano" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Caught</Text>
                    <Heading5 textColour="green">
                        {mulesFoundCount}
                    </Heading5>
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
