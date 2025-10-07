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
import "./demo-anim-fan-out.css";

interface DemoAnimFanOutProps {
    className ? : string;
}

export const DemoAnimFanOut = ({className} : DemoAnimFanOutProps) => {
    const [ activeTransactions, setActiveTransactions ] = useState<number[]>([]);

    // Number of destination nodes
    const destinationCount = 6;
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    // Calculate positions for destination nodes in a circle
    const destinations = Array.from({length : destinationCount}, (_, i) => {
        const angle = (i * 2 * Math.PI) / destinationCount;
        return {
            x : centerX + radius * Math.cos(angle),
            y : centerY + radius * Math.sin(angle),
        };
    });

    // Trigger animations periodically
    useEffect(() => {
        const interval = setInterval(() => {
            // Pick 2-3 random destinations
            const count = 2 + Math.floor(Math.random() * 2);
            const indices = Array.from({length : destinationCount}, (_, i) => i)
                .sort(() => Math.random() - 0.5)
                .slice(0, count);

            setActiveTransactions(indices);

            // Clear after animation completes
            setTimeout(() => {
                setActiveTransactions([]);
            }, 1500);
        }, 2000);

        return () => clearInterval(interval);
    }, [ destinationCount ]);

    return (
        <div className={`demo-anim-fan-out ${className || ""}`}>
            <svg width="300" height="300" viewBox="0 0 300 300">
                {/* Connection lines (subtle) */}
                {destinations.map((dest, i) => (
                    <line
                        key={i}
                        x1={centerX}
                        y1={centerY}
                        x2={dest.x}
                        y2={dest.y}
                        className="connection-line"
                    />
                ))}
            </svg>

            {/* Center node */}
            <img
                src={MuleHeadImage.src}
                alt="Mule Account"
                className="center-node"
                style={{
                    left : centerX,
                    top  : centerY,
                }}
            />

            {/* Destination nodes */}
            {destinations.map((dest, i) => {
                const isActive = activeTransactions.includes(i);
                return (
                    <img
                        key={i}
                        src={isActive ? MuleHeadImage.src : BankIconImage.src}
                        alt={isActive ? "Mule Account" : "Bank"}
                        className={`destination-node ${isActive ? "active" : ""}`}
                        style={{
                            left : dest.x,
                            top  : dest.y,
                        }}
                    />
                );
            })}

            {/* Animated transaction cards */}
            {activeTransactions.map((index) => {
                const dest = destinations[index];
                return (
                    <motion.div
                        key={`transaction-${index}`}
                        className="demo-transaction"
                        initial={{
                            x     : centerX,
                            y     : centerY,
                            scale : 0,
                        }}
                        animate={{
                            x     : dest.x,
                            y     : dest.y,
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
