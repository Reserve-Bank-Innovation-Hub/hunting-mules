"use client";

// REACT CORE ==========================================================================================================
import React from "react";

// UI ==================================================================================================================
import { Div } from "fictoan-react";

// ASSETS ==============================================================================================================
import BankIconImage from "../../assets/images/bank-icon.png";
import MuleHeadImage from "../../assets/images/mule-head.png";

// STYLES ==============================================================================================================
import "./account-node.css";

// TYPES
interface NodeData {
        isMule      ? : boolean;
        isLocked    ? : boolean;
        isShaking   ? : boolean;
        onNodeClick ? : (nodeId : string, isMule : boolean) => void;
}

export const AccountNode = ({data, id} : { data : NodeData, id : string }) => {
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

    if (data.isMule && data.isLocked) {
        return (
            <Div className={`account-node mule-account locked`} onClick={handleClick} onMouseDown={handleMouseDown}>
                <img
                    src={MuleHeadImage.src}
                    alt="Locked Mule"
                    style={{
                        borderRadius : "50%",
                        objectFit    : "cover",
                        maxWidth     : "unset",
                    }}
                />
            </Div>
        );
    }

    return (
        <Div
            className={`account-node ${data.isMule ? "mule-account" : ""} ${data.isShaking ? "shaking" : ""}`}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        >
            <img
                src={BankIconImage.src}
                alt="Bank Account"
                style={{
                    objectFit : "cover",
                    maxWidth  : "unset",
                }}
            />
        </Div>
    );
};