// SHARED ASSET — the bank. Used by 4 Pattern Identification (the board and every
// pattern tutorial), the World Map and the instruction cards. One file, so the
// same object can never end up with two unrelated versions of itself.

/**
 * A branch, drawn as a classical facade: a pediment, an architrave, three
 * columns on their own bases and two steps.
 *
 * Drawn rather than imported so it can be recoloured with whatever it sits on
 * and stay crisp at any size — from 43px on the board to 90px in a tutorial.
 *
 * The character is in the silhouette and the light, not in detail — at 43px on
 * the board no detail survives. A wide shallow pediment overhanging the columns,
 * capitals and bases on each, and a three-step plinth that steps out as it comes
 * down: that stack is what makes the shape recognisable when it is small.
 *
 * One light, from the upper left, shades the right-hand face of every solid. The
 * house is built and lit exactly the same way, which is what makes the two read
 * as one family rather than two icons that happen to be in the same game.
 *
 * Colour comes from `currentColor`, so a parent sets it once.
 */
export const BankShape = () => (
    <g fill="currentColor">
        {/* A finial on the ridge. Three units wide and eight tall — at 43px that
            is a three-pixel bump, which is enough to make the silhouette this
            building's and not any building's. */}
        <rect x="47.4" y="0" width="5.2" height="9" rx="1.4" />
        {/* Pediment, wide and shallow */}
        <path d="M50 5.5 88 31H12Z" />
        {/* Architrave */}
        <rect x="19" y="32" width="62" height="4.4" rx="1" />
        {/* Three columns, each with a capital and a base */}
        <rect x="21.4" y="37.6" width="11.4" height="3.2" rx="0.8" />
        <rect x="44.3" y="37.6" width="11.4" height="3.2" rx="0.8" />
        <rect x="67.2" y="37.6" width="11.4" height="3.2" rx="0.8" />
        {/* Tapered: narrower at the top than at the base, the way a real column
            is. Half a unit each side is invisible as detail and legible as weight. */}
        <path d="M23.5 41.4h7.2l.9 27.6h-9Z" />
        <path d="M46.4 41.4h7.2l.9 27.6h-9Z" />
        <path d="M69.3 41.4h7.2l.9 27.6h-9Z" />
        <rect x="19.6" y="69" width="15" height="4.6" rx="0.8" />
        <rect x="42.5" y="69" width="15" height="4.6" rx="0.8" />
        <rect x="65.4" y="69" width="15" height="4.6" rx="0.8" />
        {/* Three steps, each broader than the last. The stack is what gives the
            bank its silhouette at sizes where no detail survives. */}
        <rect x="21" y="75.4" width="58" height="4.4" rx="1" />
        <rect x="16" y="81"   width="68" height="4.6" rx="1" />
        <rect x="11" y="86.8" width="78" height="5.4" rx="1" />

        {/* SHADING. One light, from the upper left, on every solid: the right
            slope of the pediment, the right of each column, and the right end of
            each step. It is what stops the mark reading as clip art — and it is
            the only detail that survives at 43px on the board. */}
        <g fill="#000000" opacity="0.26">
            <path d="M50 5.5 88 31H67.5Z" />
            <rect x="29.2" y="41.4" width="2"   height="27.6" />
            <rect x="52.1" y="41.4" width="2"   height="27.6" />
            <rect x="75"   y="41.4" width="2"   height="27.6" />
            <rect x="70"   y="75.4" width="9"   height="4.4" rx="1" />
            <rect x="73"   y="81"   width="11"  height="4.6" rx="1" />
            <rect x="76"   y="86.8" width="13"  height="5.4" rx="1" />
        </g>
    </g>
);

/**
 * A house — one person's address on the World Map, never a branch.
 *
 * Deliberately unlike the bank: a pitched roof with an overhanging eave, a
 * chimney, a door and one window. Same head-on view, same stroke weight and
 * the same grounding step, so it belongs to the bank's family while being
 * unmistakably domestic at a glance.
 */
export const HouseShape = () => (
    <g fill="currentColor">
        {/* Chimney, behind the roof line */}
        <rect x="66" y="16" width="9" height="18" rx="1.4" />
        {/* Roof, with the eave overhanging the walls on both sides */}
        <path d="M50 12 92 44.5l-4.6 6L50 22.6 12.6 50.5 8 44.5Z" />
        {/* Walls */}
        <path d="M18.5 48 50 24.6 81.5 48V84h-24V63.5h-15V84h-24Z" />
        {/* The door and the window, knocked out of the wall */}
        <rect x="42.5" y="63.5" width="15" height="20.5" rx="1.2" fill="var(--house-cut, #0B1220)" />
        <rect x="26"   y="55"   width="13" height="12"   rx="1.2" fill="var(--house-cut, #0B1220)" />
        {/* The step it stands on — the same grounding the bank has, so the two
            sit on the world the same way */}
        <rect x="14" y="86" width="72" height="6" rx="1.2" />

        {/* SHADING. The same light, from the upper left: the right slope of the
            roof, the right of the wall, and the right end of the step. */}
        <g fill="#000000" opacity="0.26">
            <path d="M50 12 92 44.5l-4.6 6L50 22.6Z" />
            <path d="M64 40.5 81.5 53.5V84h-24V63.5h-4V53Z" />
            <rect x="70" y="86" width="16" height="6" rx="1.2" />
        </g>
    </g>
);

/* ---------------------------------------------------------------------------
   The same two marks boxed in their own SVG, for the places that need a sized
   element rather than something to drop inside another drawing.

   The shapes above are <g> on purpose: a nested <svg> ignores a parent <g>'s
   transform and falls back to filling its viewport, which is what put
   house-sized houses on the World Map.
   ------------------------------------------------------------------------- */

export const BankMark = ({className} : { className ? : string }) => (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
        <BankShape />
    </svg>
);

export const HouseMark = ({className} : { className ? : string }) => (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
        <HouseShape />
    </svg>
);
