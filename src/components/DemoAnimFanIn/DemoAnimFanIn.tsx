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
import "./demo-anim-fan-in.css";

interface DemoAnimFanInProps {
    className ? : string;
}

export const DemoAnimFanIn = ({className} : DemoAnimFanInProps) => {
    const [ activeTransactions, setActiveTransactions ] = useState<number[]>([]);

    // Number of source nodes
    const sourceCount = 6;
    const viewBoxSize = 300;
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Calculate positions for source nodes in a circle
    const sources = Array.from({length : sourceCount}, (_, i) => {
        const angle = (i * 2 * Math.PI) / sourceCount;
        return {
            x         : centerX + radius * Math.cos(angle),
            y         : centerY + radius * Math.sin(angle),
            // Percentage positions for absolute positioning
            leftPct   : ((centerX + radius * Math.cos(angle)) / viewBoxSize) * 100,
            topPct    : ((centerY + radius * Math.sin(angle)) / viewBoxSize) * 100,
        };
    });

    // Trigger animations periodically
    useEffect(() => {
        const interval = setInterval(() => {
            // Pick 2-3 random sources
            const count = 2 + Math.floor(Math.random() * 2);
            const indices = Array.from({length : sourceCount}, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, count);

            setActiveTransactions(indices);

            // Clear after animation completes
            setTimeout(() => {
                setActiveTransactions([]);
            }, 1500);
        }, 2000);

        return () => clearInterval(interval);
    }, [ sourceCount ]);

    return (
        <div className={`demo-anim-fan-in ${className || ""}`}>
            <svg width="300" height="300" viewBox="0 0 300 300">
                {/* Connection lines (subtle) */}
                {sources.map((source, i) => (
                    <line
                        key={i}
                        x1={source.x}
                        y1={source.y}
                        x2={centerX}
                        y2={centerY}
                        className="connection-line"
                    />
                ))}
            </svg>

            {/* Center node (mule) */}
            <img
                src={MuleHeadImage.src}
                alt="Mule Account"
                className="center-node"
                style={{
                    left : "50%",
                    top  : "50%",
                }}
            />

            {/* Source nodes */}
            {sources.map((source, i) => {
                const isActive = activeTransactions.includes(i);
                return (
                    <img
                        key={i}
                        src={BankIconImage.src}
                        alt="Bank"
                        className={`source-node ${isActive ? "active" : ""}`}
                        style={{
                            left : `${source.leftPct}%`,
                            top  : `${source.topPct}%`,
                        }}
                    />
                );
            })}

            {/* Animated transaction cards */}
            {activeTransactions.map((index) => {
                const source = sources[index];
                return (
                    <motion.div
                        key={`transaction-${index}`}
                        className="demo-transaction"
                        initial={{
                            left  : `${source.leftPct}%`,
                            top   : `${source.topPct}%`,
                            scale : 0,
                        }}
                        animate={{
                            left  : "50%",
                            top   : "50%",
                            scale : [ 0, 1, 1, 0 ],
                        }}
                        transition={{
                            duration : 1.5,
                            times    : [ 0, 0.2, 0.8, 1 ],
                            ease     : "easeInOut",
                        }}
                    >
                        <Text weight="600">₹</Text>
                    </motion.div>
                );
            })}
        </div>
    );
};
