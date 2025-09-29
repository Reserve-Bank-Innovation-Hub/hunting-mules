"use client";

import React from "react";
import { Div } from "fictoan-react";

// ASSETS
import MuleHeadImage from "../../assets/images/mule-head.png";
import BankIconImage from "../../assets/images/bank-icon.png";

// STYLES
import "./circle-node.css";

// TYPES
interface NodeData {
    isMule? : boolean;
    isLocked? : boolean;
    isShaking? : boolean;
    onNodeClick? : (nodeId : string, isMule : boolean) => void;
}

export const CircleNode = ({data, id} : { data : NodeData, id : string }) => {
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
            <div className={`circle-node mule-account locked`} onClick={handleClick} onMouseDown={handleMouseDown}>
                <img
                    src={MuleHeadImage.src}
                    alt="Locked Mule"
                    style={{
                        borderRadius : "50%",
                        objectFit    : "cover",
                        maxWidth     : "unset",
                    }}
                />
            </div>
        );
    }

    return (
        <Div
            className={`circle-node ${data.isMule ? "mule-account" : ""} ${data.isShaking ? "shaking" : ""}`}
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