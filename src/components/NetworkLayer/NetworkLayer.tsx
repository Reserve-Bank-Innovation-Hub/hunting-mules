"use client";

// REACT CORE ==========================================================================================================
import React, { useMemo } from "react";
import { Node } from "reactflow";

// LIB =================================================================================================================
import { Network } from "$lib/network";
import { getGridConfig } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./network-layer.css";

interface NetworkLayerProps {
    nodes       : Node[];
    network     : Network | null;
    activeEdges : Map<string, number>;
}

/**
 * The grey web the accounts sit on. Sits beneath the nodes and the money, and only
 * the handful of paths a live pattern is using are lit — never the whole network.
 */
export const NetworkLayer = ({nodes, network, activeEdges} : NetworkLayerProps) => {
    const half = getGridConfig().CIRCLE_SIZE / 2;

    const lines = useMemo(() => {
        if (!network) return [];
        const byId = new Map(nodes.map(node => [ node.id, node ]));

        return network.edges.flatMap(edge => {
            const from = byId.get(edge.from);
            const to = byId.get(edge.to);
            if (!from || !to) return [];

            return [ {
                id     : edge.id,
                x1     : from.position.x + half,
                y1     : from.position.y + half,
                x2     : to.position.x + half,
                y2     : to.position.y + half,
                active : activeEdges.has(edge.id),
            } ];
        });
    }, [ nodes, network, activeEdges, half ]);

    if (lines.length === 0) {
        return null;
    }

    return (
        <svg className="network-layer">
            {/* Resting relationships */}
            {lines.filter(line => !line.active).map(line => (
                <line key={line.id} className="network-edge"
                      x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            ))}

            {/* Paths the current pattern is running along, drawn last so they sit on top */}
            {lines.filter(line => line.active).map(line => (
                <line key={line.id} className="network-edge is-active"
                      x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            ))}
        </svg>
    );
};
