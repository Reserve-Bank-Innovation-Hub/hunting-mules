"use client";

// UI ==================================================================================================================
import { motion } from "framer-motion";

// LIB =================================================================================================================
import { NodeRipple } from "$lib/gameTypes";
import { getGridConfig } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./node-ripple-effect.css";

interface NodeRippleEffectProps {
    ripple     : NodeRipple;
    onComplete : (id : string) => void;
}

export const NodeRippleEffect = ({
    ripple,
    onComplete,
} : NodeRippleEffectProps) => {
    const gridConfig = getGridConfig();

    // Simple center calculation - ripple.x/y is the top-left of the node
    const centerX = ripple.x + (gridConfig.CIRCLE_SIZE / 2);
    const centerY = ripple.y + (gridConfig.CIRCLE_SIZE / 2);

    const rippleSize = gridConfig.CIRCLE_SIZE;

    return (
        <motion.div
            className={`node-ripple ${ripple.isMuleReceiving ? 'mule-receiving' : ''} ${ripple.isLocked ? 'locked' : ''}`}
            style={{
                left      : centerX,
                top       : centerY,
                width     : 0,
                height    : 0,
                transform : "translate(-50%, -50%)",
            }}
            initial={{
                width   : 0,
                height  : 0,
                opacity : 1,
            }}
            animate={{
                width   : rippleSize * 3,
                height  : rippleSize * 3,
                opacity : 0,
            }}
            transition={{
                duration : 1,
                ease     : "easeOut",
            }}
            onAnimationComplete={() => onComplete(ripple.id)}
        />
    );
};