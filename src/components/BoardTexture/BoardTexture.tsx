// SECTION 3 — 4 PATTERN IDENTIFICATION: the board's background texture.

// STYLES ==============================================================================================================
import "./board-texture.css";

/**
 * Texture behind the accounts, in the World Map's own graphic vocabulary: the
 * same dark slabs, dot clusters, chips, wave motifs and long slow curves that
 * the map is built from.
 *
 * Nothing here is a thing. There are no buildings, roads, trees or skylines —
 * a literal object behind the board would compete with the pattern, which is
 * the only thing on this screen worth looking at. These are marks, at an
 * opacity where they register as surface rather than as content.
 *
 * It sits behind ReactFlow's dot grid and is inert: no pointer events, no
 * animation, and it never re-renders, because none of it depends on play.
 */
export const BoardTexture = () => (
    <svg className="board-texture" viewBox="0 0 1000 1400"
         preserveAspectRatio="xMidYMid slice" aria-hidden="true">

        {/* SLABS — the map's soft blocks, holding the corners */}
        <g className="texture-slab">
            <rect x="-60"  y="80"   width="330" height="290" rx="46" />
            <rect x="700"  y="470"  width="380" height="330" rx="52" />
            <rect x="120"  y="1010" width="300" height="260" rx="44" />
        </g>

        {/* CURVES — two long slow lines, the way a route leaves the map */}
        <g className="texture-curve">
            <path d="M-40 300 Q 210 300 300 430 T 620 620 Q 760 700 1040 690" />
            <path d="M1040 180 Q 800 200 700 330 T 420 560 Q 300 660 -40 640" />
            <path d="M-40 1080 Q 260 1060 380 950" />
        </g>

        {/* DOT CLUSTERS — the map's fields, three of them, off the centre line */}
        <g className="texture-dots">
            {[
                {x : 60,  y : 470, cols : 6, rows : 4},
                {x : 760, y : 150, cols : 5, rows : 5},
                {x : 620, y : 1130, cols : 7, rows : 3},
            ].map((field, f) => (
                <g key={f}>
                    {Array.from({length : field.rows}).map((_, r) =>
                        Array.from({length : field.cols}).map((_, c) => (
                            <circle key={`${r}-${c}`}
                                    cx={field.x + c * 26} cy={field.y + r * 26} r="3.4" />
                        )))}
                </g>
            ))}
        </g>

        {/* CHIPS — small squares, scattered the way the map scatters them */}
        <g className="texture-chip">
            {[ [ 200, 240 ], [ 880, 900 ], [ 430, 760 ], [ 90, 880 ],
               [ 940, 1240 ], [ 540, 1290 ], [ 330, 60 ] ].map(([ x, y ], i) => (
                <rect key={i} x={x} y={y} width="16" height="16" rx="4" />
            ))}
        </g>

        {/* WAVES — the map's water motif, twice, well out of the way */}
        <g className="texture-wave">
            {[ [ 60, 1230 ], [ 860, 330 ] ].map(([ x, y ], i) => (
                <g key={i}>
                    {[ 0, 1, 2 ].map(k => (
                        <path key={k} d={`M${x} ${y + k * 16} q11 -9 22 0 t22 0`} />
                    ))}
                </g>
            ))}
        </g>
    </svg>
);
