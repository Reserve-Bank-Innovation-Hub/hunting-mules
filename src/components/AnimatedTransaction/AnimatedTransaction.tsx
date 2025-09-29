"use client";

// UI ==================================================================================================================
import { Text } from "fictoan-react";
import { motion } from "framer-motion";

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

    // Calculate the exact center of nodes based on their stored positions
    // node.position is the top-left corner as set during grid creation
    const fromCenterX = transaction.fromNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const fromCenterY = transaction.fromNode.position.y + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterX = transaction.toNode.position.x + (gridConfig.CIRCLE_SIZE / 2);
    const toCenterY = transaction.toNode.position.y + (gridConfig.CIRCLE_SIZE / 2);

    return (
        <motion.div
            className="transaction-card"
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
            animate={{
                scale      : [ 0, 1, 1, 0 ],
                x          : [ fromCenterX, fromCenterX, toCenterX, toCenterX ],
                y          : [ fromCenterY, fromCenterY, toCenterY, toCenterY ],
                translateX : "-50%",
                translateY : "-50%",
            }}
            transition={{
                duration : (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / 1000,
                times    : [ 0, TRANSACTION_CONFIG.SCALE_TIME_MS / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS),
                    (TRANSACTION_CONFIG.SCALE_TIME_MS + TRANSACTION_CONFIG.TRANSACTION_TIME_MS) / (TRANSACTION_CONFIG.SCALE_TIME_MS * 2 + TRANSACTION_CONFIG.TRANSACTION_TIME_MS), 1 ],
                ease     : "easeInOut",
            }}
            onAnimationComplete={() => onComplete(transaction.id)}
        >
            <Text weight="400">{transaction.amount}</Text>
        </motion.div>
    );
};