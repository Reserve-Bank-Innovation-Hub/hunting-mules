"use client";

import { AnimatePresence } from "framer-motion";
import { AnimatedTransaction } from "../AnimatedTransaction/AnimatedTransaction";
import { NodeRippleEffect } from "../NodeRippleEffect/NodeRippleEffect";
import { TransactionInstance, NodeRipple } from "../../lib/gameTypes";

interface AnimationOverlayProps {
    activeTransactions: TransactionInstance[];
    activeRipples: NodeRipple[];
    onTransactionComplete: (id: string) => void;
    onRippleComplete: (id: string) => void;
}

export const AnimationOverlay = ({
    activeTransactions,
    activeRipples,
    onTransactionComplete,
    onRippleComplete,
}: AnimationOverlayProps) => {
    return (
        <>
            {/* Animated Transactions Overlay */}
            <div
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
            </div>

            {/* Node Ripples Overlay */}
            <div
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
            </div>
        </>
    );
};