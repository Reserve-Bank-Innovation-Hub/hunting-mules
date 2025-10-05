"use client";

// UI ==================================================================================================================
import { Card, Heading6, Text, Div, Row, Portion, Heading4, Heading5 } from "fictoan-react";

// STYLES ==============================================================================================================
import "./scorecard.css";

interface ScorecardProps {
    totalMoneyInCirculation : number;
    moneyLostToMules        : number;
    mulesFoundCount         : number;
    actualMuleCount         : number;
    timeLeft                : number;
}

export const Scorecard = ({
    totalMoneyInCirculation,
    moneyLostToMules,
    mulesFoundCount,
    actualMuleCount,
    timeLeft,
} : ScorecardProps) => {
    return (
        <Row id="scorecard" retainLayoutAlways marginBottom="none">
            {/* DESKTOP STYLES ===================================================================================== */}
            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Time left</Text>
                    <Heading5 textColour={timeLeft <= 10 ? "red" : undefined}>
                        {timeLeft}s
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">In circulation</Text>
                    <Heading5>
                        ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Stolen by mules</Text>
                    <Heading5 textColour="red">
                        ₹{moneyLostToMules.toLocaleString("en-IN")}
                    </Heading5>
                </Card>
            </Portion>

            <Portion desktopSpan="one-fourth" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text textColour="amber-dark60">Mules found</Text>
                    <Heading5 textColour="green">
                        {mulesFoundCount}/{actualMuleCount}
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
                        <Text>Mules found</Text>
                        <Heading6 textColour="green">
                            {mulesFoundCount}/{actualMuleCount}
                        </Heading6>
                    </Div>
                </Card>
            </Portion>
        </Row>
    );
};