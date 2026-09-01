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
import { formatBalance } from "$lib/transactionUtils";

// STYLES ==============================================================================================================
import "./account-node.css";

// TYPES
interface NodeData {
        isMule      ? : boolean;
        isLocked    ? : boolean;
        isShaking   ? : boolean;
        balance     ? : number;
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

    // Every account carries its balance for the whole round. It is what the low
    // balance pattern is read against, and it stays deliberately quiet — the number
    // itself is the tell, so it is never coloured in to give a mule away.
    const balanceLabel = data.balance !== undefined ? (
        <span className="account-balance">
            {formatBalance(data.balance)}
        </span>
    ) : null;

    // A locked account is a caught one — nothing else in the game locks a node. This
    // deliberately does NOT also test isMule: the account stops being a mule the
    // moment it is caught (its pattern is handed to a fresh recruit elsewhere), so
    // requiring both would mean the stamp never appeared at all.
    const isCaught = !!data.isLocked;

    return (
        <Div
            className={[
                "account-node",
                data.isMule ? "mule-account" : "",
                isCaught ? "locked" : "",
                data.isShaking ? "shaking" : "",
            ].filter(Boolean).join(" ")}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            style={{"--icon-size": `${iconSize}px`} as React.CSSProperties}
        >
            <img
                src={isCaught ? MuleHeadImage.src : BankIconImage.src}
                alt={isCaught ? "Caught mule account" : "Bank Account"}
                style={isCaught ? {
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
