"use client";

// EXTERNAL ============================================================================================================
import React from "react";

// STYLES ==============================================================================================================
import "./game-page.css";

// OTHER ===============================================================================================================
import { Article, Heading1, Portion, Row } from "fictoan-react";

const GamePage = () => {
    return (
        <Article id="game-page">
            <Row layoutAsGrid padding="small" gutters="huge">
                <Portion>
                    <Heading1 as="h1">This is the game page!</Heading1>
                </Portion>
            </Row>
        </Article>
    );
};

export default GamePage;
