"use client";

// REACT CORE ==========================================================================================================
import React, { useMemo } from "react";
import { Node } from "reactflow";

// LIB =================================================================================================================
import { Network } from "$lib/network";
import { PatternFlash } from "$lib/gameTypes";
import { getGridConfig, PATTERN_FLASH_DELAY, PATTERN_FLASH_DURATION } from "$lib/gameConfig";

// STYLES ==============================================================================================================
import "./network-layer.css";

// How far back from the destination the arrowhead sits, so it clears the bank icon
const ARROW_INSET = 26;

interface NetworkLayerProps {
    nodes           : Node[];
    network         : Network | null;
    flashes         : PatternFlash[];
    onFlashComplete : (flashId : string) => void;
}

/**
 * The grey web the accounts sit on, plus the cues drawn over it.
 *
 * Nothing on this layer stays lit. A pattern transaction gets a line that waits
 * until the money is halfway across, traces the rest of its route, and clears
 * itself the instant the animation ends — so the board never accumulates a map of
 * where the mules are, and the player still has to watch.
 */
export const NetworkLayer = ({nodes, network, flashes, onFlashComplete} : NetworkLayerProps) => {
    const half = getGridConfig().CIRCLE_SIZE / 2;

    const centres = useMemo(() => new Map(
        nodes.map(node => [ node.id, {x : node.position.x + half, y : node.position.y + half} ]),
    ), [ nodes, half ]);

    const lines = useMemo(() => {
        if (!network) return [];

        return network.edges.flatMap(edge => {
            const from = centres.get(edge.from);
            const to = centres.get(edge.to);
            if (!from || !to) return [];

            return [ {id : edge.id, x1 : from.x, y1 : from.y, x2 : to.x, y2 : to.y} ];
        });
    }, [ centres, network ]);

    if (lines.length === 0) {
        return null;
    }

    return (
        <svg className="network-layer">
            {/* Resting relationships */}
            {lines.map(line => (
                <line key={line.id} className="network-edge"
                      x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
            ))}

            {/* A brief cue along the route one pattern transaction is taking */}
            {flashes.map(flash => {
                const from = centres.get(flash.fromId);
                const to = centres.get(flash.toId);
                if (!from || !to) return null;

                // The dash is the length of the route, so the line draws itself from
                // one account towards the other rather than simply appearing
                const length = Math.hypot(to.x - from.x, to.y - from.y);

                // A tiny head near the far end, turned to face the way the money is
                // going. Set back from the centre so it sits clear of the bank icon
                // rather than underneath it.
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const inset = Math.min(ARROW_INSET, length / 2);
                const head = {
                    x : to.x - Math.cos(angle) * inset,
                    y : to.y - Math.sin(angle) * inset,
                };

                // A second head halfway along, so the direction is readable from the
                // middle of the run rather than only once the line has arrived
                const middle = {
                    x : (from.x + to.x) / 2,
                    y : (from.y + to.y) / 2,
                };

                const turn = `rotate(${angle * 180 / Math.PI})`;

                const timing = {
                    "--flash-length"   : length,
                    "--flash-duration" : `${PATTERN_FLASH_DURATION}ms`,
                    // Held back by the animation itself rather than a timer, so
                    // nothing has to be scheduled or cleaned up
                    "--flash-delay"    : `${PATTERN_FLASH_DELAY}ms`,
                } as React.CSSProperties;

                return (
                    <g key={flash.id}>
                        <line
                            className="pattern-flash"
                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                            style={timing}
                            // Only the line reports back, so the cue is cleared once
                            onAnimationEnd={() => onFlashComplete(flash.id)}
                        />

                        <polygon
                            className="pattern-flash-arrow is-mid"
                            points="0,-3.8 8,0 0,3.8"
                            style={timing}
                            transform={`translate(${middle.x} ${middle.y}) ${turn}`}
                        />

                        <polygon
                            className="pattern-flash-arrow"
                            points="0,-3.8 8,0 0,3.8"
                            style={timing}
                            transform={`translate(${head.x} ${head.y}) ${turn}`}
                        />
                    </g>
                );
            })}
        </svg>
    );
};
