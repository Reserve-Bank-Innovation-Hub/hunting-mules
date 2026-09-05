"use client";

// SECTION 4 — WORLD MAP. The world outside the bank: ONE bank, and the houses of
// the people being investigated. Not a transaction network — the routes are roads
// between addresses, and a house is somebody's home, never a branch and never a
// node. See CLAUDE.md.

// REACT CORE ==========================================================================================================
import React, { useEffect, useRef, useState } from "react";

// LIB =================================================================================================================
import {
    ARROW_HOME, ARROW_MS, ARROW_PATHS, BACKDROP_ROUTES, BANK, BANK_CAMERA, CHIPS,
    DOT_FIELDS,
    HOUSES, INK, LINE_BLEND,
    FOOTPRINTS, LINE_COLOUR, Place, PlaceId, RIPPLES, ROUTES, roundedPath, SLABS,
    STATIONS,
    WORLD_CAMERA, WORLD_VIEW, ZOOM_MS,
} from "$lib/worldMap";

// LOCAL COMPONENTS ====================================================================================================
import { BankShape, HouseShape } from "$components/BankMark/BankMark";

// STYLES ==============================================================================================================
import "./world-map.css";

// GLYPHS =============================================================================================================
/** Places one of the shared building marks, centred, at a given size. */
const Mark = ({kind, size} : { kind : "bank" | "house"; size : number }) => (
    <g transform={`translate(${-size / 2} ${-size / 2}) scale(${size / 100})`}>
        {kind === "bank" ? <BankShape /> : <HouseShape />}
    </g>
);

/**
 * The navigation arrow — the one thing on this map that moves.
 *
 * Drawn from the supplied asset rather than dropped in as the PNG: it has to
 * point along whichever road it is travelling, sit on the game's own colours,
 * and stay sharp while it scales. The silhouette is the asset's — a filled disc
 * with a notched chevron — and nothing else about it was invented.
 */
const NavArrow = ({size} : { size : number }) => (
    <g transform={`scale(${size / 100})`}>
        <circle cx="0" cy="0" r="50" fill="var(--primary)" />
        <circle cx="0" cy="0" r="50" fill="none" stroke="var(--ink)" strokeWidth="4" />
        {/* Points up at rest; the parent rotates it toward wherever it is going */}
        <path d="M0 -30 21 24a3.4 3.4 0 0 1-4.7 4.2L0 19 -16.3 28.2A3.4 3.4 0 0 1-21 24Z"
              fill="var(--ink)" />
    </g>
);

const ArrowGlyph = ({x, y, size} : { x : number; y : number; size : number }) => (
    <path d={`M${x - size / 2} ${y} h${size * 0.72} m${-size * 0.3} ${-size * 0.3} l${size * 0.3} ${size * 0.3}
              l${-size * 0.3} ${size * 0.3}`}
          fill="none" stroke="currentColor" strokeWidth={size * 0.16}
          strokeLinecap="round" strokeLinejoin="round" />
);

// TYPES ===============================================================================================================
export type WorldMode = "entry" | "investigate";

interface WorldMapProps {
    mode : WorldMode;
    headline : string;
    caption  : string;
    onEnterBank  ? : () => void;
    onEnterHouse ? : (index : number) => void;
    activeHouses ? : number[];
    doneHouses   ? : number[];
    emergedHouse ? : number | null;
    panelHouse   ? : number | null;
    children ? : React.ReactNode;
    onSkip    ? : () => void;
    skipLabel ? : string;
    /**
     * False while the player is still inside the branch: the map holds tight on
     * the bank. Flips true when they step out, and the camera pulls back to the
     * whole world. Defaults true, so nothing that does not care is affected.
     */
    isOutside ? : boolean;
}

/**
 * The world outside the bank.
 *
 * ONE bank — the branch the player has just left — and the houses of the people
 * whose accounts they froze. The coloured lines are the roads between those
 * addresses. It is deliberately NOT a transaction network: no house is a branch,
 * nothing here stands for money moving, and the houses are all lit the same
 * because none of them is more suspicious than another until it is visited.
 *
 * The map opens close on the bank and pulls back to the whole world once the
 * player steps outside. From then on exactly one thing moves: the navigation
 * arrow. It waits in the middle of the world with a slow pulse, and when a house
 * is chosen it travels there. The roads themselves never animate — a map that
 * moves everywhere tells the player nothing about where to go.
 */
export const WorldMap = ({
    mode, headline, caption, onEnterBank, onEnterHouse,
    activeHouses = HOUSES.map((_, index) => index),
    doneHouses = [], emergedHouse = null, panelHouse = null,
    children, onSkip, skipLabel = "SKIP", isOutside = true,
} : WorldMapProps) => {
    // WHICH road the arrow is on, if any. Null means it is at the centre.
    const [ travelling, setTravelling ] = useState<PlaceId | null>(null);
    // How far along that road: 0 at the centre end, 1 at the house. Held apart
    // from the path itself so the same road can be driven in both directions —
    // out to the house, and back to the centre when the card closes.
    const [ progress, setProgress ] = useState(0);
    // WHETHER it is in flight. Kept apart from the above, or the arrow parking at
    // house 1 would block house 2 from ever being picked.
    const [ isMoving, setIsMoving ] = useState(false);
    // False for the single frame in which a new road is taken up. Without it the
    // browser transitions offset-distance onto the NEW path — so the first house
    // picked had the arrow start at its far end and slide backwards to the centre
    // before setting off. The later houses looked right only because the arrow was
    // already parked at zero on a road by then.
    const [ armed, setArmed ] = useState(true);
    // Whether it has left the bank yet. It emerges as the camera pulls back, so
    // the two read as one move rather than two things happening at once.
    const [ emerged, setEmerged ] = useState(false);
    const timer = useRef<ReturnType<typeof setTimeout>>();

    // The camera. Starts on the bank and pulls back once the player is outside;
    // held in state so the very first frame is the close view rather than a jump.
    const [ pulledBack, setPulledBack ] = useState(isOutside);

    useEffect(() => {
        if (isOutside) {
            // One frame's delay, so the browser has a close view to animate away
            // from. The arrow leaves the bank on the same tick as the camera.
            const id = setTimeout(() => { setPulledBack(true); setEmerged(true); }, 30);
            return () => clearTimeout(id);
        }
        setPulledBack(false);
        setEmerged(false);
    }, [ isOutside ]);

    // The arrow has arrived and the file is open. It drives back down the same
    // road to the centre while the player reads — the card is the thing to look
    // at now, and the arrow waiting at the doorstep is just something else moving.
    // The road is kept rather than forgotten: every road starts at ARROW_HOME, so
    // the next house begins exactly where this one ended.
    useEffect(() => {
        if (panelHouse === null || isMoving || progress === 0) {
            return;
        }
        const id = setTimeout(() => setProgress(0), 650);
        return () => clearTimeout(id);
    }, [ panelHouse, isMoving, progress ]);

    useEffect(() => () => clearTimeout(timer.current), []);

    const travelTo = (place : Place, arrive : () => void) => {
        if (isMoving) {
            return;
        }
        setIsMoving(true);
        setArmed(false);          // take up the new road with no transition...
        setTravelling(place.id);
        setProgress(0);
        requestAnimationFrame(() => requestAnimationFrame(() => {
            setArmed(true);       // ...then arm it and drive
            setProgress(1);
        }));
        timer.current = setTimeout(() => {
            setIsMoving(false);
            arrive();
        }, ARROW_MS);
    };

    const bankIsOpen = mode === "entry";

    // The camera is a transform on the map's contents. The viewBox stays fixed —
    // it is not a transitionable property, so animating it would snap.
    const viewBox = `${WORLD_VIEW.x} ${WORLD_VIEW.y} ${WORLD_VIEW.w} ${WORLD_VIEW.h}`;
    const camera  = pulledBack ? WORLD_CAMERA : BANK_CAMERA;

    // The arrow drives along the road rather than across the map. While it is
    // travelling it rides an offset-path built from the route's own points, and
    // offset-rotate turns it into every bend — so the heading is the road's, not
    // a straight line to the destination. Parked, it sits at ARROW_HOME facing up.
    // The arrow is ALWAYS on an offset-path — the road to a house when it has one,
    // and the short run out of the branch before that. It used to swap between a
    // motion path and a transform, and the moment it swapped back the transform's
    // base was identity, which is the top-left corner of the map: that is why it
    // kept flying in from the top. Both paths meet at ARROW_HOME, so switching
    // between them never moves it.
    const journey = travelling ? ARROW_PATHS[travelling] : [ BANK, ARROW_HOME ];
    const onRoad  = travelling !== null;
    const arrowStyle : React.CSSProperties = {
        offsetPath     : `path("${roundedPath(journey, onRoad ? 26 : 0)}")`,
        // It always points the way it is travelling — including out of the branch,
        // which runs downward, so it leaves pointing down rather than up.
        offsetRotate   : "auto 90deg",
        offsetDistance : onRoad ? `${progress * 100}%` : (emerged ? "100%" : "0%"),
        transition     : armed
            ? `offset-distance ${onRoad ? ARROW_MS : ZOOM_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : "none",
    };

    return (
        <div className={`world-scene mode-${mode} ${panelHouse !== null ? "is-panelled" : ""}`}>
            {/* meet, not slice. The viewBox is 1024x1820 and the kiosk is 1080x1920
                — 0.5626 against 0.5625 — so on the kiosk the two are indistinguishable,
                but on any wider screen slice filled the width and cut the houses off
                the bottom of the frame. */}
            <svg className="world-svg" viewBox={viewBox}
                 preserveAspectRatio="xMidYMid meet" role="img"
                 aria-label="The world outside the bank">

                <rect x={WORLD_VIEW.x} y={WORLD_VIEW.y} width={WORLD_VIEW.w} height={WORLD_VIEW.h}
                      fill={INK.bg} />

                <g className="world-camera" transform={camera}>

                {/* THE FIELD ================================================================== */}
                {/* Very dark slabs, dot fields and chips. None of it competes with a line. */}
                <g aria-hidden="true">
                    {/* BUILDING FOOTPRINTS — the rest of the place. Plans seen from
                        above, not pictures: no roofs, no elevation, no labels. They sit
                        at the same depth as the slabs and the water, behind everything
                        the player can act on, and nothing here is ever picked out. */}
                    {FOOTPRINTS.map((f, i) => (
                        <rect key={`fp-${i}`} className="footprint"
                              x={f.x} y={f.y} width={f.w} height={f.h} rx="2.5" />
                    ))}

                    {SLABS.map((s, i) => (
                        <rect key={i} x={s.x} y={s.y} width={s.w} height={s.h} rx={s.r}
                              fill="#0B1220" opacity={s.a} />
                    ))}

                    {DOT_FIELDS.map((f, i) => (
                        <g key={i} fill="#1F2937">
                            {Array.from({length : f.rows}).map((_, r) =>
                                Array.from({length : f.cols}).map((_, c) => (
                                    <circle key={`${r}-${c}`} cx={f.x + c * 14} cy={f.y + r * 14} r="2.2" />
                                )))}
                        </g>
                    ))}

                    {CHIPS.map((c, i) => (
                        <rect key={i} x={c.x} y={c.y} width={c.s} height={c.s} rx="3" fill="#111827" />
                    ))}

                    {RIPPLES.map((w, i) => (
                        <g key={i} stroke="#1E3A5F" fill="none"
                           strokeWidth="3.4" strokeLinecap="round">
                            {[ 0, 1, 2 ].map(k => (
                                <path key={k} d={`M${w.x} ${w.y + k * 13} q9 -7 18 0 t18 0`} />
                            ))}
                        </g>
                    ))}
                </g>

                {/* THE LINES ================================================================== */}
                {/* A route is not a flat stroke of one colour at one strength. Each is
                    drawn on a gradient that does two things along its length:

                      COLOUR   shifts within its own family — the reds between two reds,
                               the limes between two limes. Lilac and violet cross, which
                               is the blue-into-purple blend, and they are two values of
                               one hue anyway. Nothing is recoloured.

                      OPACITY  fades in where the route enters the frame, holds through
                               the middle, and softens again at the far end, so a route
                               dissolves into the map instead of being cut off by it.

                    No bloom and no blur. The softness is the fade, not a glow.
                    Geometry, order and the colour system are untouched. */}
                <defs>
                    {[ ...ROUTES, ...BACKDROP_ROUTES ].map((route, i) => {
                        // Along the route: first point to last, in the map's own
                        // coordinates rather than the path's bounding box, so a route
                        // that doubles back still shifts the way it travels.
                        const from   = route.points[0];
                        const to     = route.points[route.points.length - 1];
                        const isGrey = route.line === "grey";
                        return (
                            <linearGradient key={i} id={`route-grad-${i}`}
                                            gradientUnits="userSpaceOnUse"
                                            x1={from.x} y1={from.y} x2={to.x} y2={to.y}>
                                <stop offset="0%"   stopColor={LINE_COLOUR[route.line]} stopOpacity={isGrey ? 0.06 : 0.12} />
                                <stop offset="11%"  stopColor={LINE_COLOUR[route.line]} stopOpacity={isGrey ? 0.4  : 0.9} />
                                <stop offset="52%"  stopColor={LINE_COLOUR[route.line]} stopOpacity={isGrey ? 0.42 : 0.86} />
                                <stop offset="90%"  stopColor={LINE_BLEND[route.line]}  stopOpacity={isGrey ? 0.36 : 0.8} />
                                <stop offset="100%" stopColor={LINE_BLEND[route.line]}  stopOpacity={isGrey ? 0.08 : 0.42} />
                            </linearGradient>
                        );
                    })}
                </defs>

                {/* THE PIPELINES BEHIND — depth, not content */}
                <g fill="none" strokeLinecap="round" strokeLinejoin="round"
                   strokeWidth="7" aria-hidden="true">
                    {BACKDROP_ROUTES.map((route, i) => (
                        <path key={i} d={roundedPath(route.points)}
                              stroke={`url(#route-grad-${ROUTES.length + i})`} />
                    ))}
                </g>

                {/* THE ROUTES */}
                <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                    {ROUTES.map((route, i) => {
                        // The road the arrow is travelling brightens, but it does not
                        // animate: a map where every line runs tells the player nothing.
                        const lit = route.serves !== undefined && travelling === route.serves;
                        return (
                            <path
                                key={i}
                                className={lit ? "route is-active" : "route"}
                                d={roundedPath(route.points)}
                                stroke={`url(#route-grad-${i})`}
                                strokeWidth={route.line === "grey" ? 9 : 13}
                            />
                        );
                    })}
                </g>

                {/* INTERCHANGES =============================================================== */}
                <g aria-hidden="true">
                    {STATIONS.map((s, i) => (
                        <g key={i}>
                            <circle cx={s.x} cy={s.y} r="15" fill={INK.bg} />
                            <circle cx={s.x} cy={s.y} r="15" fill="none" stroke="#F5F5F5" strokeWidth="4.5" />
                        </g>
                    ))}
                </g>

                {/* THE BANKS ================================================================== */}
                {HOUSES.map((house, index) => {
                    const isDone = doneHouses.includes(index);
                    const isOpen = mode === "investigate" && activeHouses.includes(index)
                        && !isDone && emergedHouse === null;
                    const colour = LINE_COLOUR[house.line];

                    return (
                        <g key={house.id}
                           className={[ "station",
                               isOpen ? "is-open" : "", isDone ? "is-done" : "",
                               mode === "entry" ? "is-idle" : "" ].filter(Boolean).join(" ")}
                           onClick={isOpen && onEnterHouse
                               ? () => travelTo(house, () => onEnterHouse(index))
                               : undefined}
                           role={isOpen ? "button" : undefined}
                           aria-label={isOpen ? `Visit house ${house.label}` : undefined}>

                            <circle cx={house.x} cy={house.y} r="37" fill={INK.bg} />
                            <circle cx={house.x} cy={house.y} r="37" fill="none"
                                    stroke={colour} strokeWidth="5" />
                            <g color={INK.text} transform={`translate(${house.x} ${house.y})`}>
                                <Mark kind="house" size={40} />
                            </g>

                            {/* The pill under the station: its number, and the way on.
                                All three take dark type. Under the new palette white
                                is unreadable on two of the three — 1.2:1 on lime and
                                1.7:1 on teal — and an exception on the third would
                                make the row read as two rules rather than one. Dark
                                clears 5.4:1 on red, 10.8 on teal and 15.4 on lime. */}
                            <g transform={`translate(${house.x} ${house.y + 60})`}>
                                <rect x="-52" y="-20" width="104" height="40" rx="20"
                                      fill={isDone ? INK.bgLift : colour} />
                                <text x="-22" y="7" textAnchor="middle" className="station-num"
                                      fill={INK.bg}>
                                    {house.label}
                                </text>
                                <g color={INK.bg}>
                                    <ArrowGlyph x={22} y={0} size={26} />
                                </g>
                            </g>
                        </g>
                    );
                })}

                {/* THE BRANCH ================================================================= */}
                {/* Its card sits over the lines, which is how a diagram hides a route behind
                    a station box. Drawn last so nothing crosses it. */}
                <g className={`branch ${bankIsOpen ? "is-open" : "is-shut"}`}>
                    <rect x={BANK.x - 128} y={BANK.y + 8} width="256" height="192" rx="26"
                          fill={INK.bgPanel} stroke={INK.hairline} />

                    <circle cx={BANK.x} cy={BANK.y} r="66" fill={INK.bg} />
                    <circle cx={BANK.x} cy={BANK.y} r="62" fill={INK.text} />
                    <g color={INK.bg} transform={`translate(${BANK.x} ${BANK.y})`}>
                        <Mark kind="bank" size={62} />
                    </g>

                    <text x={BANK.x} y={BANK.y + 104} textAnchor="middle" className="branch-name">
                        BANK HQ
                    </text>

                    {bankIsOpen && onEnterBank && (
                        <g className="branch-enter"
                           onClick={() => travelTo(BANK, onEnterBank)}
                           role="button" aria-label="Enter Bank HQ">
                            <rect x={BANK.x - 104} y={BANK.y + 125} width="208" height="48" rx="24"
                                  fill={INK.text} />
                            <text x={BANK.x - 14} y={BANK.y + 157} textAnchor="middle"
                                  className="branch-enter-text">ENTER HQ</text>
                            <g color={INK.bg}><ArrowGlyph x={BANK.x + 68} y={BANK.y + 149} size={26} /></g>
                        </g>
                    )}
                </g>
                {/* THE NAVIGATION ARROW ======================================================= */}
                {/* The only thing on this map that moves. It waits in the middle of the
                    world with a slow pulse, and travels out along the road when the
                    player picks a house. */}
                {isOutside && mode === "investigate" && (
                    <g className={`nav-arrow ${isMoving ? "is-travelling" : ""}`}
                       style={arrowStyle} aria-hidden="true">
                        <NavArrow size={96} />
                    </g>
                )}
                </g>
            </svg>

            {/* THE ERRAND ===================================================================== */}
            {/* Banner and hint are one stack rather than two things positioned from
                opposite edges. They used to be placed independently — the banner's
                type growing with viewport WIDTH and the hint's offset shrinking with
                viewport HEIGHT — so on a wide short screen they walked into each
                other. Stacked, they cannot overlap at any size. */}
            <div className="world-top">
            <div className="world-banner">
                <span className="banner-mark" aria-hidden="true">
                    <svg viewBox="-16 -16 32 32"><g color={INK.text}><Mark kind="bank" size={24} /></g></svg>
                </span>
                <div className="banner-copy">
                    <h1 className="world-headline">{headline}</h1>
                    <p className="world-caption">{caption}</p>
                </div>
            </div>

            {/* One short line, and only once the player is out in the world. The
                first one names the house, because the arrow is already pointing there. */}
            {isOutside && (
                <div className="world-hint">
                    {doneHouses.length === 0
                        ? "Okay, let\u2019s go to house number one."
                        : "Pick the next house."}
                </div>
            )}

            </div>

            {onSkip && (
                <button type="button" className="world-skip" onClick={onSkip}>{skipLabel}</button>
            )}

            {children}
        </div>
    );
};
