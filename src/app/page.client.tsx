// EXTERNAL ============================================================================================================
import Link from "next/link";
import React from "react";

// STYLES ==============================================================================================================
import "$styles/home.css";

// OTHER ===============================================================================================================
import { Button, Card, Element, Heading1, Portion, Row, Text, CodeBlock, Article } from "fictoan-react";

const HomePage = () => {
    return (
        <Article id="page-home">
            <Row layoutAsGrid horizontalPadding="large" marginTop="small">
                <Portion>
                    <Element as="div" verticallyCentreItems pushItemsToEnds>
                        <Heading1>Hello, world!</Heading1>
                    </Element>
                </Portion>
            </Row>
        </Article>
    );
}

export default HomePage;