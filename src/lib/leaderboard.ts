/**
 * The kiosk leaderboard.
 *
 * Runs are kept in a plain JSON file on the machine (data/leaderboard.json) and
 * read and written through /api/leaderboard. That is deliberately the simplest
 * thing that works: one kiosk, one file, no database to run alongside the game.
 *
 * Nothing about a player is stored on the device itself. The name is typed in
 * before a run, carried through the session in memory, written to the board with
 * the score at the end, and gone — the next player starts from an empty field.
 */

export interface LeaderboardEntry {
    name  : string;
    score : number;    // Mule accounts caught
    at    : string;    // ISO timestamp, used only to break ties
}

export interface LeaderboardFile {
    entries : LeaderboardEntry[];
}

// A row as the board displays it: an entry with its position worked out, and a
// flag for the run happening right now
export interface RankedEntry extends LeaderboardEntry {
    position : number;
    isLive  ?: boolean;
}

export const MAX_NAME_LENGTH = 14;

/**
 * Order the board and number it.
 *
 * Highest score first. A tie goes to whoever got there first, so a player cannot
 * knock someone off a position by merely equalling them — they have to beat them.
 */
export const rank = <T extends LeaderboardEntry>(entries : T[]) : (T & { position : number })[] =>
    [ ...entries ]
        .sort((a, b) => b.score - a.score || Date.parse(a.at) - Date.parse(b.at))
        .map((entry, index) => ({...entry, position : index + 1}));

/**
 * The board as it stands, with the run in progress dropped into it.
 *
 * The live row is merged in on the client rather than written to the file on every
 * catch: the player watches their name climb past the others the instant they
 * score, with no round trip, and the file only ever gains one row per completed
 * run rather than one per catch.
 */
export const withLiveRun = (
    entries : LeaderboardEntry[],
    live   ?: LeaderboardEntry | null,
) : RankedEntry[] => {
    const combined : RankedEntry[] = entries.map(entry => ({...entry, position : 0}));

    if (live && live.name) {
        combined.push({...live, position : 0, isLive : true});
    }

    return rank(combined).map(entry => ({...entry, isLive : entry.isLive ?? false}));
};

// A name the board will accept: trimmed, capped, and with anything unprintable
// dropped. Written without a regex so this file holds no control characters itself.
export const cleanName = (value : string) =>
    Array.from(value)
        .filter(character => {
            const code = character.codePointAt(0) ?? 0;
            return code >= 32 && code !== 127;
        })
        .join("")
        .trim()
        .slice(0, MAX_NAME_LENGTH);

/**
 * How two names are judged to be the same one.
 *
 * Case and spacing are ignored, so "Suhani", "SUHANI" and "suhani  " are one person
 * as far as the board is concerned. Without this the board could show three rows
 * that a player reads as identical, and none of them would tell them which was
 * theirs — which is the whole point of putting a name on a score.
 */
export const nameKey = (name : string) =>
    cleanName(name).toLowerCase().split(" ").filter(Boolean).join(" ");

export const isNameTaken = (entries : LeaderboardEntry[], name : string) => {
    const key = nameKey(name);
    return key.length > 0 && entries.some(entry => nameKey(entry.name) === key);
};

// CLIENT ==============================================================================================================
export const fetchLeaderboard = async () : Promise<LeaderboardEntry[]> => {
    const response = await fetch("/api/leaderboard", {cache : "no-store"});

    if (!response.ok) {
        throw new Error(`Leaderboard responded ${response.status}`);
    }

    const body = await response.json() as LeaderboardFile;
    return body.entries ?? [];
};

export interface SubmitResult {
    entries : LeaderboardEntry[];
    entry   : LeaderboardEntry;   // The row just written, so the caller can find it again
}

export const submitScore = async (name : string, score : number) : Promise<SubmitResult> => {
    const response = await fetch("/api/leaderboard", {
        method  : "POST",
        headers : {"Content-Type" : "application/json"},
        body    : JSON.stringify({name, score}),
    });

    if (!response.ok) {
        throw new Error(`Leaderboard responded ${response.status}`);
    }

    const body = await response.json() as SubmitResult;
    return {entries : body.entries ?? [], entry : body.entry};
};
