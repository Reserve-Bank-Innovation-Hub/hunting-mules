"use client";

// UI ==================================================================================================================
import { Card, Heading6, Text, Div, Row, Portion, Heading4, Heading5 } from "fictoan-react";

// STYLES ==============================================================================================================
import "./scorecard.css";

interface ScorecardProps {
    totalMoneyInCirculation : number;
    moneyLostToMules        : number;
    mulesFoundCount         : number;   // Cumulative across every round played
    totalMuleCount          : number;   // Mules dealt in so far, also cumulative
    roundTimeLeft           : number;
    patternNumber           : number;
    totalPatterns           : number;
}

export const Scorecard = ({
    totalMoneyInCirculation,
    moneyLostToMules,
    mulesFoundCount,
    totalMuleCount,
    roundTimeLeft,
    patternNumber,
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
                    <Text textColour="amber-dark60">Pattern {patternNumber}/{totalPatterns}</Text>
                    <Heading5 textColour={roundTimeLeft <= 10 ? "red" : undefined}>
                        {roundTimeLeft}s
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="half" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="nano" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">In circulation</Text>
                    <Heading5>
                        ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
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
                        {mulesFoundCount}/{totalMuleCount}
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
                        <Text textColour="amber-dark60">Pattern {patternNumber}/{totalPatterns}</Text>
                        <Heading6 textColour={roundTimeLeft <= 10 ? "red" : undefined}>
                            {roundTimeLeft}s
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text>In circulation</Text>
                        <Heading6>
                            ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text>Stolen by mules</Text>
                        <Heading6 textColour="red">
                            ₹{moneyLostToMules.toLocaleString("en-IN")}
                        </Heading6>
                    </Div>

                    <Div verticallyCentreItems pushItemsToEnds>
                        <Text>Caught</Text>
                        <Heading6 textColour="green">
                            {mulesFoundCount}/{totalMuleCount}
                        </Heading6>
                    </Div>
                </Card>
            </Portion>
        </Row>
    );
};