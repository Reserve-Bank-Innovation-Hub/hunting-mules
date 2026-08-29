"use client";

// REACT CORE ==========================================================================================================
import { useEffect, useState } from "react";

// UI ==================================================================================================================
import { Text } from "fictoan-react";
import { motion, useAnimation } from "framer-motion";

// LIB =================================================================================================================
import { TransactionInstance } from "$lib/gameTypes";
import { getGridConfig, TRANSACTION_CONFIG } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./animated-transaction.css";

interface AnimatedTransactionProps {
    transaction : TransactionInstance;
    onComplete  : (id : string) => void;
}

export const AnimatedTransaction = ({
    transaction,
    onComplete,
} : AnimatedTransactionProps) => {
    const gridConfig = getGridConfig();
    const controls = useAnimation();
    const [hasReversed, setHasReversed] = useState(false);

    // Calculate the exact center of nodes based on their stored positions
    // node.position is the top-left corner as set during grid creation
    const fromCenterX = transaction.fromNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const fromCenterY = transaction.fromNode.position.y + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterX = transaction.toNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterY = transaction.toNode.position.y + (gridConfig.CIRCLE_SIZE / 2);

    // Handle mid-flight reversal when transaction is bounced
    useEffect(() => {
        if (transaction.isBounced && !hasReversed) {
            setHasReversed(true);

            // Calculate remaining animation time
            const totalDuration = (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / 1000;
            const elapsedTime = transaction.startTime ? (Date.now() - transaction.startTime) / 1000 : 0;
            const remainingTime = Math.max(0.5, totalDuration - elapsedTime);

            // Animate to new destination (which is now the original source)
            controls.start({
                x: toCenterX,
                y: toCenterY,
                transition: {
                    duration: remainingTime,
                    ease: "easeInOut",
                }
            }).then(() => onComplete(transaction.id));
        }
    }, [transaction.isBounced, hasReversed, controls, toCenterX, toCenterY, transaction.startTime, transaction.id, onComplete]);

    return (
        <motion.div
            className={`transaction-card ${transaction.isBounced || transaction.isReturnLeg ? 'bounced' : ''}`}
            style={{
                position        : "absolute",
                left            : 0,
                top             : 0,
                transformOrigin : "center center",
            }}
            initial={{
                scale      : 0,
                x          : fromCenterX,
                y          : fromCenterY,
                translateX : "-50%",
                translateY : "-50%",
            }}
            animate={transaction.isBounced ? controls : {
                scale      : [ 0, 1, 1, 0 ],
                x          : [ fromCenterX, fromCenterX, toCenterX, toCenterX ],
                y          : [ fromCenterY, fromCenterY, toCenterY, toCenterY ],
                translateX : "-50%",
                translateY : "-50%",
            }}
            transition={transaction.isBounced ? undefined : {
                duration : (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / 1000,
                times    : [ 0, TRANSACTION_CONFIG.SCALE_TIME_MS / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS),
                    (TRANSACTION_CONFIG.SCALE_TIME_MS + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS), 1 ],
                ease     : "easeInOut",
            }}
            onAnimationComplete={() => !transaction.isBounced && onComplete(transaction.id)}
        >
            <Text weight="400">
                {(transaction.isBounced || transaction.isReturnLeg) && (
                    <span style={{
                        marginRight: '4px',
                        fontSize: '1.2em',
                        display: 'inline-block',
                        animation: 'spin-bounce 0.5s ease-in-out'
                    }}>
                        ↩
                    </span>
                )}
                {transaction.amount}
            </Text>
        </motion.div>
    );
};