// REACT CORE ==========================================================================================================
import { NextResponse } from "next/server";

// OTHER ===============================================================================================================
import { promises as fs } from "fs";
import path from "path";

// LIB =================================================================================================================
import { cleanName, isNameTaken, LeaderboardEntry, LeaderboardFile, rank } from "$lib/leaderboard";

// The board is read and written on every request, so it must never be cached
export const dynamic = "force-dynamic";

const FILE = path.join(process.cwd(), "data", "leaderboard.json");

// A kiosk runs all day; without a ceiling the file would grow for as long as it is
// switched on. Ranked before trimming, so it is always the weakest runs that go.
const MAX_ENTRIES = 500;

const readBoard = async () : Promise<LeaderboardEntry[]> => {
    try {
        const raw = await fs.readFile(FILE, "utf-8");
        const parsed = JSON.parse(raw) as LeaderboardFile;
        return Array.isArray(parsed.entries) ? parsed.entries : [];
    } catch {
        // No file yet, or it has been hand-edited into something unreadable. Either
        // way the game carries on with an empty board rather than failing outright.
        return [];
    }
};

const writeBoard = async (entries : LeaderboardEntry[]) => {
    await fs.mkdir(path.dirname(FILE), {recursive : true});
    await fs.writeFile(FILE, `${JSON.stringify({entries}, null, 2)}\n`, "utf-8");
};

export const GET = async () => {
    return NextResponse.json({entries : rank(await readBoard())});
};

export const POST = async (request : Request) => {
    let body : { name ?: unknown; score ?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({error : "Expected a JSON body"}, {status : 400});
    }

    // Anything unprintable is dropped rather than refused — a kiosk keyboard can
    // send odd things and the player should not be told off for it
    const name = cleanName(String(body.name ?? ""));
    const score = Number(body.score);

    if (!name) {
        return NextResponse.json({error : "A name is required"}, {status : 400});
    }

    if (!Number.isFinite(score) || score < 0) {
        return NextResponse.json({error : "A score is required"}, {status : 400});
    }

    const existing = await readBoard();

    // One name, one player. The name is checked before the round starts too, so this
    // should never fire in normal play — it is here because the file is the source of
    // truth, and a board with two rows reading the same is a board nobody can find
    // themselves on.
    if (isNameTaken(existing, name)) {
        return NextResponse.json(
            {error : "That name is already on the board"},
            {status : 409},
        );
    }

    const entry : LeaderboardEntry = {
        name,
        score : Math.floor(score),
        at    : new Date().toISOString(),
    };

    // Ranked so the trim always drops the weakest runs, then stripped back to the
    // three fields the file actually owns. A stored position would be wrong the
    // moment the next player finished, so it is worked out on read instead.
    const ranked = rank([ ...existing, entry ]).slice(0, MAX_ENTRIES);
    const stored : LeaderboardEntry[] = ranked.map(({name, score, at}) => ({name, score, at}));

    await writeBoard(stored);

    return NextResponse.json({entries : rank(stored), entry});
};
