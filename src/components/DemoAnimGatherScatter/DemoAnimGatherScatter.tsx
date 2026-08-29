"use client";

// REACT CORE ==========================================================================================================
import { useEffect, useState } from "react";

// UI ==================================================================================================================
import { Text } from "fictoan-react";
import { motion } from "framer-motion";

// ASSETS ==============================================================================================================
import BankIconImage from "../../assets/images/bank-icon.png";
import MuleHeadImage from "../../assets/images/mule-head.png";

// STYLES ==============================================================================================================
import "$/styles/demo-anim.css";

const VIEWBOX = 300;
const CENTRE = 150;

// Money is gathered from the group on the left and scattered to a different group
// on the right — it never goes back where it came from.
const SOURCES = [ 60, 150, 240 ].map(y => ({x : 45, y}));
const DESTINATIONS = [ 60, 150, 240 ].map(y => ({x : 255, y}));

const toPct = (value : number) => (value / VIEWBOX) * 100;

export const DemoAnimGatherScatter = () => {
    const [ direction, setDirection ] = useState<"gather" | "scatter">("gather");

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection(prev => (prev === "gather" ? "scatter" : "gather"));
        }, 1800);

        return () => clearInterval(interval);
    }, []);

    const isGathering = direction === "gather";
    const movingGroup = isGathering ? SOURCES : DESTINATIONS;

    return (
        <div className="demo-anim demo-anim-gather-scatter">
            <svg width="300" height="300" viewBox="0 0 300 300">
                {[ ...SOURCES, ...DESTINATIONS ].map((node, i) => (
                    <line
                        key={i}
                        x1={CENTRE} y1={CENTRE} x2={node.x} y2={node.y}
                        className="connection-line"
                    />
                ))}
            </svg>

            <img src={MuleHeadImage.src} alt="Mule account" className="center-node"
                 style={{left : "50%", top : "50%"}} />

            {SOURCES.map((node, i) => (
                <img
                    key={`source-${i}`}
                    src={BankIconImage.src}
                    alt="Paying account"
                    className={`satellite-node ${isGathering ? "active" : ""}`}
                    style={{left : `${toPct(node.x)}%`, top : `${toPct(node.y)}%`}}
                />
            ))}

            {DESTINATIONS.map((node, i) => (
                <img
                    key={`destination-${i}`}
                    src={BankIconImage.src}
                    alt="Receiving account"
                    className={`satellite-node ${!isGathering ? "active" : ""}`}
                    style={{left : `${toPct(node.x)}%`, top : `${toPct(node.y)}%`}}
                />
            ))}

            {movingGroup.map((node, order) => {
                const nodePosition = {left : `${toPct(node.x)}%`, top : `${toPct(node.y)}%`};
                const centrePosition = {left : "50%", top : "50%"};

                return (
                    <motion.div
                        key={`${direction}-${order}`}
                        className="demo-transaction"
                        initial={{...(isGathering ? nodePosition : centrePosition), scale : 0}}
                        animate={{...(isGathering ? centrePosition : nodePosition), scale : [ 0, 1, 1, 0 ]}}
                        transition={{
                            duration : 1.4,
                            delay    : order * 0.12,
                            times    : [ 0, 0.2, 0.8, 1 ],
                            ease     : "easeInOut",
                        }}
                    >
                        <Text weight="600">₹</Text>
                    </motion.div>
                );
            })}

            <span className="demo-phase-label">
                {isGathering ? "GATHER FROM  A, B, C" : "SCATTER TO  D, E, F"}
            </span>
        </div>
    );
};
