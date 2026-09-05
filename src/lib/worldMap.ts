// SECTION 4 — WORLD MAP: where the branch, the houses and the routes are.

// THE NETWORK MAP =====================================================================================================
//
// The world map is a transit diagram: coloured lines on a near-black field, with
// the branch and the three banks as stations on it.
//
// COORDINATES
//
//   Everything below is in the diagram's own space, 1024 across. The viewport shows
//   y from -142 to 1678, which is the kiosk's 9:16 exactly, so the lines run off
//   all four edges and the diagram is a crop of a larger network rather than a
//   picture with a border.
//
// The line colours are the four the game already uses for its banks — bank 1 red,
// bank 2 amber, bank 3 green — plus two more that carry no meaning and exist to
// make the network read as a network.

export interface Point { x : number; y : number; }

export const VIEW = {x : 0, y : -142, w : 1024, h : 1820};

// THE PALETTE =========================================================================================================
export const INK = {
    bg        : "#030712",
    bgPanel   : "#0B1220",
    bgLift    : "#111827",
    hairline  : "rgba(245,245,245,0.10)",
    text      : "#F5F5F5",
    textSoft  : "#9CA3AF",
};

// The palette has four chromatic colours, so the three lines that serve a bank
// take red, lime and teal, and the two that exist only to make the map read as a
// network take the two violets. Named for what they are: a token called "amber"
// holding lime is a trap for whoever reads this next.
export const LINE_COLOUR = {
    red    : "#EF4444",
    lime   : "#BEF264",
    teal   : "#2DD4BF",
    lilac  : "#A78BFA",
    violet : "#7C3AED",
    grey   : "#374151",
} as const;

export type LineName = keyof typeof LINE_COLOUR;

/**
 * The second stop of each route's gradient.
 *
 * A route is not one flat colour end to end — it shifts along its length, which
 * is what stops it reading as a coloured line laid on top of the map and starts
 * it reading as part of the surface.
 *
 * Every pair stays inside its own family, so no route changes colour: the reds
 * move between two reds, the limes between two limes. The one pair that crosses
 * is lilac and violet, which are two values of the same hue anyway — that is the
 * blue-into-purple blend the map is meant to have.
 */
export const LINE_BLEND = {
    red    : "#DC2626",
    lime   : "#A3E635",
    teal   : "#14B8A6",
    lilac  : "#7C3AED",
    violet : "#A78BFA",
    grey   : "#2B3444",
} as const;

// WHERE THE PLAYER CAN GO =============================================================================================
export type PlaceId = "bank" | "house-1" | "house-2" | "house-3";

export interface Place {
    id    : PlaceId;
    label : string;
    line  : LineName;
    x     : number;
    y     : number;
}

export const BANK : Place = {id : "bank", label : "BANK HQ", line : "grey", x : 512, y : 415};

// Numbered as the game numbers them, and each sitting on the line of its own colour
export const HOUSES : Place[] = [
    {id : "house-1", label : "1", line : "red",   x : 145, y : 1085},
    {id : "house-2", label : "2", line : "lime", x : 512, y : 1241},
    {id : "house-3", label : "3", line : "teal", x : 858, y : 1098},
];

export const PLACES : Place[] = [ BANK, ...HOUSES ];

// THE LINES ===========================================================================================================
export interface Route {
    line   : LineName;
    /** Waypoints. Corners are rounded when the path is built — see roundedPath. */
    points : Point[];
    /** Only the three that serve a bank are lit; the rest are the network around them */
    serves ? : PlaceId;
}

const p = (x : number, y : number) : Point => ({x, y});

export const ROUTES : Route[] = [
    // RED — in at the top, down through the branch, then away to the left and down
    // to bank 1. Where it passes behind the branch's own card it is hidden, which
    // is what a station box does on a real diagram.
    {
        line : "red", serves : "house-1",
        points : [ p(512, -180), p(512, 830), p(430, 910), p(215, 910), p(145, 980), p(145, 1085) ],
    },

    // GREEN — in at the top, right at the interchange, then down the right-hand
    // side to bank 3
    {
        line : "teal", serves : "house-3",
        points : [ p(680, -180), p(680, 520), p(775, 615), p(775, 700), p(867, 792), p(867, 1098) ],
    },

    // AMBER — the long cross-town line, right across the middle of the frame
    {
        line : "lime",
        points : [ p(-60, 910), p(1084, 910) ],
    },
    // and its branch down to bank 2, carrying on off the bottom
    {
        line : "lime", serves : "house-2",
        points : [ p(512, 910), p(512, 1241), p(512, 1400), p(640, 1528), p(640, 1720) ],
    },

    // BLUE — top left, down the side, then away across the bottom right
    {
        line : "lilac",
        points : [ p(138, -180), p(138, 240), p(200, 302), p(200, 380), p(130, 450),
                   p(130, 840), p(310, 1010), p(470, 1250), p(470, 1720) ],
    },

    // PURPLE — in at the left, across behind the branch, out at the right
    {
        line : "violet",
        points : [ p(-60, 600), p(150, 600), p(250, 490), p(700, 490), p(800, 600),
                   p(913, 600), p(1084, 720) ],
    },

    // GREY — the quiet ones. No station, no bank, just depth behind the rest.
    {line : "grey", points : [ p(1084, 120), p(940, 120), p(850, 220), p(850, 335), p(470, 335) ]},
    {line : "grey", points : [ p(330, 1000), p(330, 800), p(400, 760), p(620, 760), p(700, 840), p(700, 980) ]},
    {line : "grey", points : [ p(660, 1460), p(800, 1320), p(1084, 1320) ]},
];

/** Interchanges: a ringed dot wherever lines meet */
/**
 * Grey pipelines behind the network.
 *
 * They serve nothing and lead nowhere the player can go. They exist so the map
 * has more than one plane to it: the coloured routes read as being ON something
 * rather than floating. Drawn under everything, thin, and at an opacity where
 * they are depth rather than content.
 */
export const BACKDROP_ROUTES : Route[] = [
    {line : "grey", points : [ p(-60, 200), p(240, 200), p(340, 300), p(340, 560), p(430, 650), p(430, 1100) ]},
    {line : "grey", points : [ p(1084, 980), p(880, 980), p(790, 1070), p(790, 1310), p(700, 1400), p(700, 1720) ]},
    {line : "grey", points : [ p(160, 1720), p(160, 1500), p(250, 1410), p(620, 1410), p(720, 1310), p(1084, 1310) ]},
];

/**
 * Building footprints.
 *
 * The World Map is a place people live in, and a place has more in it than the
 * three addresses being visited. These are the rest of it: blocks of small
 * rectangles, the way a map draws buildings from above.
 *
 * Abstract on purpose — no roofs, no windows, no elevation, no labels. They are
 * plans, not pictures, and they sit at the same depth as the slabs and the water
 * that were always behind the routes. Deterministic, so the map is the same map
 * every time it loads.
 *
 * Laid out as clusters, each a loose grid with gaps knocked out of it, so it
 * reads as blocks and plots rather than as a pattern.
 */
const FOOTPRINT_CLUSTERS = [
    {x : -40,  y : 60,   cols : 5, rows : 4, seed : 11},
    {x : 780,  y : 190,  cols : 4, rows : 5, seed : 23},
    {x : 60,   y : 560,  cols : 3, rows : 4, seed : 37},
    {x : 880,  y : 830,  cols : 4, rows : 4, seed : 41},
    {x : 250,  y : 1330, cols : 5, rows : 3, seed : 53},
    {x : 700,  y : 1560, cols : 4, rows : 3, seed : 67},
    {x : -60,  y : 1180, cols : 3, rows : 3, seed : 71},
    {x : 330,  y : -110, cols : 4, rows : 3, seed : 83},
    {x : 900,  y : 1180, cols : 3, rows : 4, seed : 97},
    {x : 120,  y : 830,  cols : 3, rows : 3, seed : 103},
    {x : 620,  y : 1010, cols : 3, rows : 3, seed : 109},
    {x : 940,  y : 480,  cols : 3, rows : 4, seed : 127},
    {x : -40,  y : 1520, cols : 4, rows : 3, seed : 139},
    {x : 760,  y : 1380, cols : 4, rows : 3, seed : 149},
];

export interface Footprint { x : number; y : number; w : number; h : number; }

export const FOOTPRINTS : Footprint[] = FOOTPRINT_CLUSTERS.flatMap(cluster => {
    const out : Footprint[] = [];
    for (let row = 0; row < cluster.rows; row++) {
        for (let col = 0; col < cluster.cols; col++) {
            // A cheap deterministic hash. Sine rather than a counter, because a
            // counter walks in step with the grid and draws diagonal stripes.
            const n = Math.abs(Math.sin((col + 1) * 12.9898 + (row + 1) * 78.233 + cluster.seed) * 43758.5453) % 1;
            if (n < 0.26) continue;                       // a gap in the block
            const w = 26 + Math.round(n * 34);
            const h = 20 + Math.round(((n * 7) % 1) * 26);
            out.push({x : cluster.x + col * 54, y : cluster.y + row * 46, w, h});
        }
    }
    return out;
});

export const STATIONS : Point[] = [
    p(680, 335), p(827, 335),
    // The red line's own ring, below the branch's card rather than above it
    p(512, 655),
    p(775, 595),
    p(215, 910), p(512, 910), p(719, 910), p(867, 910),
];

// BACKGROUND TEXTURE ==================================================================================================
// The reference is not a flat black field: it carries very dark rounded slabs, a
// few dotted patches and some scattered squares. All of it sits a hair above the
// background and none of it competes with the lines.
export const SLABS = [
    {x : -180, y : 250, w : 420, h : 520, r : 90, a : 0.55},
    {x : 780, y : 560, w : 460, h : 640, r : 110, a : 0.5},
    {x : 300, y : 1500, w : 520, h : 400, r : 90, a : 0.4},
];

export const DOT_FIELDS = [
    {x : 312, y : 330, cols : 7, rows : 5},
    {x : 226, y : 676, cols : 7, rows : 5},
    {x : 652, y : 1032, cols : 7, rows : 5},
];

export const CHIPS = [
    {x : 52, y : 218, s : 18}, {x : 78, y : 262, s : 22}, {x : 222, y : 508, s : 18},
    {x : 262, y : 560, s : 20}, {x : 934, y : 570, s : 20}, {x : 900, y : 596, s : 16},
    {x : 70, y : 986, s : 20}, {x : 74, y : 1030, s : 16}, {x : 686, y : 1206, s : 18},
    {x : 744, y : 1318, s : 22},
];

export const RIPPLES = [
    {x : 26, y : 448}, {x : 940, y : 786}, {x : 940, y : 1338},
];

// BUILDING A LINE =====================================================================================================
/**
 * A path through the waypoints with every corner rounded.
 *
 * This is the whole visual grammar of a transit diagram: straight runs meeting at
 * turns of a fixed radius. The radius is clamped to half the shorter of the two
 * legs, so a tight corner rounds as much as it can and never overshoots into the
 * segment beyond it.
 */
export const roundedPath = (points : Point[], radius = 34) : string => {
    if (points.length < 2) {
        return "";
    }

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const here = points[i];
        const next = points[i + 1];

        const inLen = Math.hypot(here.x - prev.x, here.y - prev.y);
        const outLen = Math.hypot(next.x - here.x, next.y - here.y);
        const r = Math.min(radius, inLen / 2, outLen / 2);

        const a = {
            x : here.x + (prev.x - here.x) * (r / inLen),
            y : here.y + (prev.y - here.y) * (r / inLen),
        };
        const b = {
            x : here.x + (next.x - here.x) * (r / outLen),
            y : here.y + (next.y - here.y) * (r / outLen),
        };

        d += ` L ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${here.x} ${here.y} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
    }

    const last = points[points.length - 1];
    return `${d} L ${last.x} ${last.y}`;
};

/** How long the line lights up for when the player picks a bank */
export const TRAVEL_MS = 620;

// THE CAMERA ==========================================================================================================
/**
 * The World Map opens close on the branch — the player is still inside it — and
 * pulls back to the whole world once they step out. Two framings of the same
 * SVG, animated by interpolating the viewBox between them.
 *
 * Done as a transform on the map's contents rather than by animating the
 * viewBox: viewBox is not a transitionable CSS property, so animating it snaps.
 * BANK_CAMERA is the transform that frames the branch — scaled up and shifted so
 * the branch card lands in the middle of the screen. Identity is the whole world.
 */
export const WORLD_VIEW = VIEW;

/** How far in the opening framing sits, and what it is centred on. */
const BANK_ZOOM   = 2.2;
// Focused below the branch, which puts the branch itself in the upper third of
// the screen — above the brief card rather than behind it.
const BANK_FOCUS  = p(BANK.x, BANK.y + 150);
const WORLD_CX    = VIEW.x + VIEW.w / 2;
const WORLD_CY    = VIEW.y + VIEW.h / 2;

/**
 * ONE translate and ONE scale, both precomputed.
 *
 * Written as `translate(A) scale(k) translate(B)` the pull-back came out as an
 * arc, and that is arithmetic rather than easing: CSS interpolates each function
 * in the list separately, so the focus point lands at
 * `lerp(A) + lerp(k) x (focus + lerp(B))` — a product of two interpolations,
 * which is quadratic, which is a curve. Folding the pair into a single absolute
 * translate makes every term linear, and the zoom goes straight in and out.
 */
export const BANK_CAMERA =
    `translate(${WORLD_CX - BANK_ZOOM * BANK_FOCUS.x} ${WORLD_CY - BANK_ZOOM * BANK_FOCUS.y}) ` +
    `scale(${BANK_ZOOM})`;

export const WORLD_CAMERA = "translate(0 0) scale(1)";

/** How long the pull-back from the branch to the whole world takes. */
export const ZOOM_MS = 1500;

/** How long the arrow takes to travel from the centre out to a house. */
export const ARROW_MS = 900;

/**
 * Where the navigation arrow waits before it is sent anywhere: the middle of the
 * world, below the branch, so its first move is outward in every case.
 */
export const ARROW_HOME = p(512, 812);

/**
 * The road the arrow actually drives to each house.
 *
 * Every point below is taken off the existing routes — the arrow turns where the
 * roads turn and never cuts across open ground. It was travelling in a straight
 * diagonal before, which made it a cursor being dragged rather than a marker
 * moving through a place.
 *
 *   HOUSE 1  down the red, then its bend west and south
 *   HOUSE 2  straight down the lime branch
 *   HOUSE 3  down to the lime horizontal, east along it, then up the teal
 */
export const ARROW_PATHS : Record<string, Point[]> = {
    "house-1" : [ p(512, 812), p(512, 830), p(430, 910), p(215, 910), p(145, 980), p(145, 1085) ],
    "house-2" : [ p(512, 812), p(512, 910), p(512, 1241) ],
    "house-3" : [ p(512, 812), p(512, 910), p(867, 910), p(867, 1098) ],
};
