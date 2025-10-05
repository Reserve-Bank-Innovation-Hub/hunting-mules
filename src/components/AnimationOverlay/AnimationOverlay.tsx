"use client";

// UI ==================================================================================================================
import { AnimatePresence } from "framer-motion";
import { Div } from "fictoan-react";

// LOCAL COMPONENTS ====================================================================================================
import { AnimatedTransaction } from "$components/AnimatedTransaction/AnimatedTransaction";
import { NodeRippleEffect } from "$components/NodeRippleEffect/NodeRippleEffect";

// LIB =================================================================================================================
import { TransactionInstance, NodeRipple } from "$lib/gameTypes";

interface AnimationOverlayProps {
    activeTransactions    : TransactionInstance[];
    activeRipples         : NodeRipple[];
    onTransactionComplete : (id : string) => void;
    onRippleComplete      : (id : string) => void;
}

export const AnimationOverlay = ({
    activeTransactions,
    activeRipples,
    onTransactionComplete,
    onRippleComplete,
} : AnimationOverlayProps) => {
    return (
        <>
            {/* Animated transactions overlay */}
            <Div
                style={{
                    position      : "absolute",
                    top           : 0,
                    left          : 0,
                    width         : "100%",
                    height        : "100%",
                    pointerEvents : "none",
                    zIndex        : 10,
                }}
            >
                <AnimatePresence>
                    {activeTransactions.map((transaction) => (
                        <AnimatedTransaction
                            key={transaction.id}
                            transaction={transaction}
                            onComplete={onTransactionComplete}
                        />
                    ))}
                </AnimatePresence>
            </Div>

            {/* Node ripples overlay */}
            <Div
                style={{
                    position      : "absolute",
                    top           : 0,
                    left          : 0,
                    width         : "100%",
                    height        : "100%",
                    pointerEvents : "none",
                    zIndex        : 5,
                }}
            >
                <AnimatePresence>
                    {activeRipples.map((ripple) => (
                        <NodeRippleEffect
                            key={ripple.id}
                            ripple={ripple}
                            onComplete={onRippleComplete}
                        />
                    ))}
                </AnimatePresence>
            </Div>
        </>
    );
};