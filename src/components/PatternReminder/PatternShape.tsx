// SECTION 3 — 4 PATTERN IDENTIFICATION: the pattern's shape, as a diagram.

// LIB =================================================================================================================
import { PatternBehaviour } from "$lib/roundConfig";

/**
 * The active pattern drawn as four or five dots and an arrow — the same shape
 * the player is being asked to find on the board, at a glance.
 *
 * Deliberately abstract. These are not accounts and not buildings: they are the
 * shape of a movement. Ordinary accounts take the system purple, and the one
 * doing the suspicious thing takes red — which is the same reading the board
 * itself uses, so the briefing and the board agree.
 */

const ORD = "var(--primary-dot, #7C3AED)";
const SUS = "var(--line-red)";

const Arrow = ({x1, y1, x2, y2} : { x1 : number; y1 : number; x2 : number; y2 : number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--ink-faint)" strokeWidth="1.6"
          strokeLinecap="round" markerEnd="url(#pattern-shape-head)" />
);

export const PatternShape = ({behaviour} : { behaviour : PatternBehaviour }) => (
    <svg className="pattern-shape" viewBox="0 0 96 44" aria-hidden="true">
        <defs>
            <marker id="pattern-shape-head" viewBox="0 0 8 8" refX="6.4" refY="4"
                    markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M1 1 6.6 4 1 7Z" fill="var(--ink-faint)" />
            </marker>
        </defs>

        {behaviour === "fan-in" && (
            <>
                <Arrow x1={16} y1={10} x2={56} y2={22} />
                <Arrow x1={16} y1={22} x2={56} y2={22} />
                <Arrow x1={16} y1={34} x2={56} y2={22} />
                <circle cx="10" cy="10" r="4.6" fill={ORD} />
                <circle cx="10" cy="22" r="4.6" fill={ORD} />
                <circle cx="10" cy="34" r="4.6" fill={ORD} />
                <circle cx="64" cy="22" r="6.6" fill={SUS} />
            </>
        )}

        {behaviour === "fan-out" && (
            <>
                <Arrow x1={40} y1={22} x2={78} y2={10} />
                <Arrow x1={40} y1={22} x2={78} y2={22} />
                <Arrow x1={40} y1={22} x2={78} y2={34} />
                <circle cx="32" cy="22" r="6.6" fill={SUS} />
                <circle cx="86" cy="10" r="4.6" fill={ORD} />
                <circle cx="86" cy="22" r="4.6" fill={ORD} />
                <circle cx="86" cy="34" r="4.6" fill={ORD} />
            </>
        )}

        {behaviour === "gather-scatter" && (
            <>
                <Arrow x1={14} y1={12} x2={40} y2={22} />
                <Arrow x1={14} y1={32} x2={40} y2={22} />
                <Arrow x1={56} y1={22} x2={82} y2={12} />
                <Arrow x1={56} y1={22} x2={82} y2={32} />
                <circle cx="8"  cy="12" r="4.2" fill={ORD} />
                <circle cx="8"  cy="32" r="4.2" fill={ORD} />
                <circle cx="48" cy="22" r="6.6" fill={SUS} />
                <circle cx="88" cy="12" r="4.2" fill={ORD} />
                <circle cx="88" cy="32" r="4.2" fill={ORD} />
            </>
        )}

        {behaviour === "low-balance" && (
            <>
                {/* A big arrow in, a big arrow out, and almost nothing kept */}
                <Arrow x1={16} y1={22} x2={40} y2={22} />
                <Arrow x1={56} y1={22} x2={82} y2={22} />
                <circle cx="10" cy="22" r="4.6" fill={ORD} />
                <circle cx="48" cy="22" r="6.6" fill={SUS} />
                <circle cx="88" cy="22" r="4.6" fill={ORD} />
                {/* What is left behind: a sliver, drawn under the account */}
                <rect x="43" y="33" width="10" height="2.6" rx="1.3" fill="var(--ink-faint)" />
            </>
        )}
    </svg>
);
