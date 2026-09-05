"use client";

// REACT CORE ==========================================================================================================
import { useEffect, useState } from "react";

// UI ==================================================================================================================
import { Text } from "fictoan-react";
import { motion } from "framer-motion";

// ASSETS ==============================================================================================================
import MuleHeadImage from "../../assets/images/mule-head.png";

// LOCAL COMPONENTS ====================================================================================================
import { BankMark } from "$components/BankMark/BankMark";

// LIB =================================================================================================================
import { formatBalance } from "$lib/transactionUtils";

// STYLES ==============================================================================================================
import "$/styles/demo-anim.css";

const RESTING = 500;
const SURGE = 58400;

// Rest → money lands → held for a beat → money leaves → back to rest
const STEP_DURATIONS = [ 900, 1300, 900, 1300 ];

export const DemoAnimLowBalance = () => {
    const [ step, setStep ] = useState(0);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStep(prev => (prev + 1) % STEP_DURATIONS.length);
        }, STEP_DURATIONS[step]);

        return () => clearTimeout(timeout);
    }, [ step ]);

    const isHoldingSurge = step === 2 || step === 3;
    const balance = isHoldingSurge ? SURGE : RESTING;

    const label = [
        "SITS AT A FEW HUNDRED",
        "A LARGE SUM LANDS",
        "HELD FOR SECONDS",
        "AND IT IS GONE",
    ][step];

    return (
        <div className="demo-anim demo-anim-low-balance">
            <svg width="300" height="300" viewBox="0 0 300 300">
                <line x1="150" y1="150" x2="45" y2="150" className="connection-line" />
                <line x1="150" y1="150" x2="255" y2="150" className="connection-line" />
            </svg>

            <img src={MuleHeadImage.src} alt="Mule account" className="center-node"
                 style={{left : "50%", top : "50%"}} />

            <span  
                 className={`satellite-node bank-disc ${step === 1 ? "active" : ""}`}
                 style={{left : "15%", top : "50%"}}><BankMark /></span>

            <span  
                 className={`satellite-node bank-disc ${step === 3 ? "active" : ""}`}
                 style={{left : "85%", top : "50%"}}><BankMark /></span>

            {/* The large sum arriving */}
            {step === 1 && (
                <motion.div
                    className="demo-transaction"
                    initial={{left : "15%", top : "50%", scale : 0}}
                    animate={{left : "50%", top : "50%", scale : [ 0, 1, 1, 0 ]}}
                    transition={{duration : 1.3, times : [ 0, 0.2, 0.8, 1 ], ease : "easeInOut"}}
                >
                    <Text weight="600">+₹58,400</Text>
                </motion.div>
            )}

            {/* ...and leaving again */}
            {step === 3 && (
                <motion.div
                    className="demo-transaction"
                    initial={{left : "50%", top : "50%", scale : 0}}
                    animate={{left : "85%", top : "50%", scale : [ 0, 1, 1, 0 ]}}
                    transition={{duration : 1.3, times : [ 0, 0.2, 0.8, 1 ], ease : "easeInOut"}}
                >
                    <Text weight="600">−₹58,400</Text>
                </motion.div>
            )}

            <span className={`demo-balance ${isHoldingSurge ? "surging" : ""}`}>
                {formatBalance(balance)}
            </span>

            <span className="demo-phase-label">{label}</span>
        </div>
    );
};
