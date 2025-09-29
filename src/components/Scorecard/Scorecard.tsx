"use client";

// UI ==================================================================================================================
import { Card, Heading6, Text, Div, Row, Portion } from "fictoan-react";

// STYLES ==============================================================================================================
import "./scorecard.css";

interface ScorecardProps {
    totalMoneyInCirculation : number;
    moneyLostToMules        : number;
    mulesFoundCount         : number;
    actualMuleCount         : number;
}

export const Scorecard = ({
    totalMoneyInCirculation,
    moneyLostToMules,
    mulesFoundCount,
    actualMuleCount,
} : ScorecardProps) => {
    return (
        <Row id="scorecard" retainLayoutAlways marginBottom="none">
            {/* DESKTOP STYLES ===================================================================================== */}
            <Portion desktopSpan="one-third" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text>In circulation</Text>
                    <Heading6>
                        ₹{totalMoneyInCirculation.toLocaleString("en-IN")}
                    </Heading6>
                </Card>
            </Portion>

            <Portion desktopSpan="one-third" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text>Stolen by mules</Text>
                    <Heading6 textColour="red">
                        ₹{moneyLostToMules.toLocaleString("en-IN")}
                    </Heading6>
                </Card>
            </Portion>

            <Portion desktopSpan="one-third" hideOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
                    <Text>Mules found</Text>
                    <Heading6 textColour="green">
                        {mulesFoundCount}/{actualMuleCount}
                    </Heading6>
                </Card>
            </Portion>

            {/* MOBILE STYLES ====================================================================================== */}
            <Portion showOnlyOnMobile>
                <Card
                    className="metric-card"
                    padding="micro" bgColour="amber-light60" isFullHeight
                >
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