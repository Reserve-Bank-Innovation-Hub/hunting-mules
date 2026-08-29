"use client";

// REACT CORE ==========================================================================================================
import React from "react";

// UI ==================================================================================================================
import { Div } from "fictoan-react";

// ASSETS ==============================================================================================================
import BankIconImage from "../../assets/images/bank-icon.png";
import MuleHeadImage from "../../assets/images/mule-head.png";

// LIB =================================================================================================================
import { getGridConfig } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./account-node.css";

// TYPES
interface NodeData {
        isMule      ? : boolean;
        isLocked    ? : boolean;
        isShaking   ? : boolean;
        balance     ? : number;
        showBalance ? : boolean;
        isSurging   ? : boolean;
        onNodeClick ? : (nodeId : string, isMule : boolean) => void;
}

export const AccountNode = ({data, id} : { data : NodeData, id : string }) => {
    const iconSize = getGridConfig().CIRCLE_SIZE;

    const handleClick = (event : React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        if (data.onNodeClick) {
            data.onNodeClick(id, data.isMule || false);
        }
        return false;
    };

    const handleMouseDown = (event : React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        return false;
    };

    // Only the low-balance round asks for this, where watching a balance spike and
    // collapse is the whole point of the exercise
    const balanceLabel = data.showBalance && data.balance !== undefined ? (
        <span className={`account-balance ${data.isSurging ? "surging" : ""}`}>
            ₹{data.balance.toLocaleString("en-IN")}
        </span>
    ) : null;

    const isLockedMule = data.isMule && data.isLocked;

    return (
        <Div
            className={[
                "account-node",
                data.isMule ? "mule-account" : "",
                isLockedMule ? "locked" : "",
                data.isShaking ? "shaking" : "",
                data.showBalance ? "with-balance" : "",
                data.isSurging ? "surging" : "",
            ].filter(Boolean).join(" ")}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            style={{"--icon-size": `${iconSize}px`} as React.CSSProperties}
        >
            <img
                src={isLockedMule ? MuleHeadImage.src : BankIconImage.src}
                alt={isLockedMule ? "Locked Mule" : "Bank Account"}
                style={isLockedMule ? {
                    borderRadius : "50%",
                    objectFit    : "cover",
                    maxWidth     : "unset",
                } : {
                    objectFit : "cover",
                    maxWidth  : "unset",
                }}
            />

            {balanceLabel}
        </Div>
    );
};
