// REACT CORE ==========================================================================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// LIB =================================================================================================================
import {
    fetchLeaderboard, submitScore, withLiveRun, LeaderboardEntry, RankedEntry,
} from "$lib/leaderboard";

interface UseLeaderboardProps {
    playerName : string;
    score      : number;
    isFinished : boolean;
    // Set when the end screen is being previewed rather than played. The board is
    // still read and ranked for real, but the run is never written — checking the
    // layout must not leave a score on the kiosk's leaderboard.
    isPreview ?: boolean;
}

interface UseLeaderboardReturn {
    rows        : RankedEntry[];   // The board including the run in progress
    position    : number | null;   // Where this player currently stands
    isConnected : boolean;         // False if the board could not be reached
}

/**
 * The board as the player sees it while they play.
 *
 * Saved runs are fetched once at the start. The run in progress is merged in on the
 * client and re-ranked on every catch, so the player's own row climbs past the
 * others the moment they score rather than after a round trip. The completed run is
 * written to the file once, at the end.
 */
export const useLeaderboard = ({
    playerName,
    score,
    isFinished,
    isPreview = false,
} : UseLeaderboardProps) : UseLeaderboardReturn => {
    const [ saved, setSaved ] = useState<LeaderboardEntry[]>([]);
    const [ isConnected, setIsConnected ] = useState(true);

    // The exact row written for this run. Matching on name and score alone would pick
    // the wrong one when somebody plays twice under the same name and ties their own
    // score — on a shared kiosk that is a likely thing to happen, not a rare one.
    const [ savedEntry, setSavedEntry ] = useState<LeaderboardEntry | null>(null);

    // Fixed for the whole session, so ties against earlier runs are broken by when
    // this player started rather than shifting every time they score
    const startedAt = useRef(new Date().toISOString());

    // Guards against a double submit — React may run an effect twice in development,
    // and the round ending must never write two rows for one run
    const hasSubmitted = useRef(false);

    const load = useCallback(async () => {
        try {
            setSaved(await fetchLeaderboard());
            setIsConnected(true);
        } catch {
            // A leaderboard that cannot be reached must not stop anyone playing
            setIsConnected(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [ load ]);

    // The finished run goes to the file once, and the board comes back with it in
    useEffect(() => {
        if (!isFinished || hasSubmitted.current || !playerName || isPreview) {
            return;
        }

        hasSubmitted.current = true;

        submitScore(playerName, score)
            .then(({entries, entry}) => {
                setSaved(entries);
                setSavedEntry(entry);
                setIsConnected(true);
            })
            .catch(() => setIsConnected(false));
    }, [ isFinished, playerName, score, isPreview ]);

    // Once the run is saved it is in `saved` already, so the live row is dropped to
    // avoid the player appearing on the board twice
    const isSaved = isFinished && !isPreview;

    const rows = useMemo(() => withLiveRun(
        saved,
        isSaved || !playerName
            ? null
            : {name : playerName, score, at : startedAt.current},
    ), [ saved, playerName, score, isSaved ]);

    const position = useMemo(() => {
        // While playing, the live row knows itself. Once saved, the run is identified
        // by the timestamp the server gave it back, which is unique to this run.
        const mine = isSaved
            ? savedEntry && rows.find(row => row.at === savedEntry.at && row.name === savedEntry.name)
            : rows.find(row => row.isLive);

        return mine?.position ?? null;
    }, [ rows, isSaved, savedEntry ]);

    return {rows, position, isConnected};
};
