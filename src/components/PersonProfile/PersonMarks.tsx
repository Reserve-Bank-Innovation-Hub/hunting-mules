// SECTION 5 — INVESTIGATION CARDS: who answered the door.

/**
 * The three residents, one per house.
 *
 * Drawn from the supplied marks rather than dropped in as the PNGs: those are
 * watermarked, raster, and fixed black — these have to sit inside a coloured
 * card, take the house's own hue, and stay sharp at 168px.
 *
 * Silhouettes, the way the sources are: one solid shape with the detail knocked
 * out of it rather than lines drawn on top. That is what keeps them readable
 * small and what makes the three read as one set — a decorator, a farmer and a
 * student, all built the same way, all facing front, all standing on the same
 * baseline. The knock-outs use the card's own background so the shape reads as
 * cut rather than as a second colour.
 *
 * Everything takes `currentColor`, so the card sets the hue once.
 */

const CUT = "var(--mark-cut, #0B1220)";

/** HOUSE 1 — the decorator. Collar, folded arms, a board under one hand. */
export const DecoratorMark = ({className} : { className ? : string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        {/* Hair and head as one mass, the way the source mark is built */}
        <path d="M50 7c11 0 19 8 19 19v7c0 9-8 15-19 15s-19-6-19-15v-7c0-11 8-19 19-19Z" />
        {/* The face cut out of it, low and to the front, which leaves the hair
            reading as a swept fringe rather than a band across the head */}
        <path d="M36.5 24.5c5-3.5 11.5-4.5 17.5-3.2 4.5 1 8 2.8 10 4.7v7c0 8-6 13.4-13.8 13.4S36.5 41.5 36.5 33.5Z"
              fill={CUT} />
        {/* Features, drawn back in on the cut face */}
        <circle cx="44.5" cy="31" r="2" />
        <circle cx="56" cy="31" r="2" />
        <path d="M46.5 37h8a4 4 0 0 1-8 0Z" />
        {/* Shoulders */}
        <path d="M50 45c14 0 24 9 26 22l1 21H23l1-21c2-13 12-22 26-22Z" />
        {/* An open collar, cut out */}
        <path d="M50 45 41 49l6 8 3-4 3 4 6-8Z" fill={CUT} />
        <circle cx="50" cy="61" r="2.2" fill={CUT} />
        {/* The board held at the hip */}
        <rect x="55" y="66" width="20" height="24" rx="2" fill={CUT} />
        <rect x="58" y="69" width="14" height="18" rx="1.4" />
    </svg>
);

/** HOUSE 2 — the farmer. Brimmed hat, dungarees, a fork at the side. */
export const FarmerMark = ({className} : { className ? : string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        {/* Hat: crown and a wide brim */}
        <path d="M41 15c0-5 4-8 9-8s9 3 9 8v5H41Z" />
        <ellipse cx="50" cy="21" rx="24" ry="5" />
        {/* Face, mostly in shadow under the brim, with a beard below */}
        <path d="M40 25h20v7a10 10 0 0 1-20 0Z" />
        <path d="M42 26h16v5H42Z" fill={CUT} />
        {/* Shoulders and sleeves */}
        <path d="M50 41c11 0 19 6 21 16l2 17h-8l-1-14v29H36V60l-1 14h-8l2-17c2-10 10-16 21-16Z" />
        {/* Dungaree bib and straps, cut out */}
        <path d="M43 47h14v12H43Z" fill={CUT} />
        <path d="M41 44h4v6h-4ZM55 44h4v6h-4Z" fill={CUT} />
        {/* The fork, held at the right */}
        <rect x="76" y="30" width="2.6" height="58" rx="1.3" />
        <path d="M70 30v-8h2.4v8ZM76.1 30v-9h2.6v9ZM82.4 30v-8h2.4v8Z" />
        <rect x="69" y="29" width="16.5" height="2.6" rx="1.3" />
    </svg>
);

/** HOUSE 3 — the student. Plaits, sailor collar, a neckerchief knot. */
export const StudentMark = ({className} : { className ? : string }) => (
    <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true">
        {/* Hair, then the face cut out of it */}
        <path d="M50 6c11 0 18 8 18 19v8H32v-8C32 14 39 6 50 6Z" />
        <path d="M39 20h22v11a11 11 0 0 1-22 0Z" />
        <circle cx="44.5" cy="25" r="2" fill={CUT} />
        <circle cx="55.5" cy="25" r="2" fill={CUT} />
        <path d="M45 31h10a5 5 0 0 1-10 0Z" fill={CUT} />
        {/* Plaits, one either side */}
        <path d="M30 26c-3 4-3 10 0 14 3-4 3-10 0-14ZM70 26c3 4 3 10 0 14-3-4-3-10 0-14Z" />
        {/* Shoulders, and a skirt below */}
        <path d="M50 43c12 0 20 7 22 18l1 11H27l1-11c2-11 10-18 22-18Z" />
        <path d="M35 72h30l5 20H30Z" />
        {/* Sailor collar and knot, cut out */}
        <path d="M50 43 38 47l5 12 7-8 7 8 5-12Z" fill={CUT} />
        <path d="M50 58l-5 5 5 3 5-3Z" fill={CUT} />
    </svg>
);
