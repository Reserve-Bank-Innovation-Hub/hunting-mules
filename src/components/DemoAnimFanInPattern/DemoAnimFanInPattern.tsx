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
const RADIUS = 100;

// Four accounts pay in; the fifth position is where the consolidated sum goes onward
const PAYERS = [ 0, 1, 2, 3 ];
const ONWARD = 4;
const SATELLITES = 5;

// gather → consolidated → single onward transfer
const STEP_DURATIONS = [ 1500, 700, 1500 ];

export const DemoAnimFanInPattern = () => {
    const [ step, setStep ] = useState(0);

    const satellites = Array.from({length : SATELLITES}, (_, i) => {
        const angle = (i * 2 * Math.PI) / SATELLITES - Math.PI / 2;
        return {
            x       : CENTRE + RADIUS * Math.cos(angle),
            y       : CENTRE + RADIUS * Math.sin(angle),
            leftPct : ((CENTRE + RADIUS * Math.cos(angle)) / VIEWBOX) * 100,
            topPct  : ((CENTRE + RADIUS * Math.sin(angle)) / VIEWBOX) * 100,
        };
    });

    useEffect(() => {
        const timeout = setTimeout(() => {
            setStep(prev => (prev + 1) % STEP_DURATIONS.length);
        }, STEP_DURATIONS[step]);

        return () => clearTimeout(timeout);
    }, [ step ]);

    const label = [ "MANY PAY IN", "CONSOLIDATED", "ONE TRANSFER OUT" ][step];

    return (
        <div className="demo-anim demo-anim-fan-in-pattern">
            <svg width="300" height="300" viewBox="0 0 300 300">
                {satellites.map((satellite, i) => (
                    <line key={i} x1={CENTRE} y1={CENTRE} x2={satellite.x} y2={satellite.y}
                          className="connection-line" />
                ))}
            </svg>

            <img src={MuleHeadImage.src} alt="Mule account" className="center-node"
                 style={{left : "50%", top : "50%"}} />

            {satellites.map((satellite, i) => (
                <img
                    key={i}
                    src={BankIconImage.src}
                    alt="Bank account"
                    className={`satellite-node ${
                        (step === 0 && PAYERS.includes(i)) || (step === 2 && i === ONWARD) ? "active" : ""
                    }`}
                    style={{left : `${satellite.leftPct}%`, top : `${satellite.topPct}%`}}
                />
            ))}

            {/* Many credits converging */}
            {step === 0 && PAYERS.map((index, order) => {
                const satellite = satellites[index];
                return (
                    <motion.div
                        key={`in-${index}`}
                        className="demo-transaction"
                        initial={{left : `${satellite.leftPct}%`, top : `${satellite.topPct}%`, scale : 0}}
                        animate={{left : "50%", top : "50%", scale : [ 0, 1, 1, 0 ]}}
                        transition={{duration : 1.4, delay : order * 0.1, times : [ 0, 0.2, 0.8, 1 ], ease : "easeInOut"}}
                    >
                        <Text weight="600">₹</Text>
                    </motion.div>
                );
            })}

            {/* ...leaving again as one single, larger transfer */}
            {step === 2 && (
                <motion.div
                    className="demo-transaction is-consolidated"
                    initial={{left : "50%", top : "50%", scale : 0}}
                    animate={{
                        left  : `${satellites[ONWARD].leftPct}%`,
                        top   : `${satellites[ONWARD].topPct}%`,
                        scale : [ 0, 1.15, 1.15, 0 ],
                    }}
                    transition={{duration : 1.4, times : [ 0, 0.2, 0.8, 1 ], ease : "easeInOut"}}
                >
                    <Text weight="600">₹₹₹</Text>
                </motion.div>
            )}

            <span className="demo-phase-label">{label}</span>
        </div>
    );
};
