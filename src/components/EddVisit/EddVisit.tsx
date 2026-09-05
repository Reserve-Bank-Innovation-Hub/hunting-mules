"use client";

// SECTION 5 — INVESTIGATING CARDS: runs the three visits out over the world map.

// REACT CORE ==========================================================================================================
import React, { useEffect, useRef, useState } from "react";

// LOCAL COMPONENTS ====================================================================================================
import { PersonProfile } from "$components/PersonProfile/PersonProfile";
import { WorldMap } from "$components/WorldMap/WorldMap";

// LIB =================================================================================================================
import { drawVisits, FvStatus } from "$lib/eddCases";
import { EDD_VISITS } from "$lib/gameConfig";
import { PatternBehaviour } from "$lib/roundConfig";
import { HOUSES } from "$lib/worldMap";

// ASSETS ==============================================================================================================
import UncoveredSound from "../../assets/sounds/uncovered.wav";
import WrongSound from "../../assets/sounds/wrong.wav";

// STYLES ==============================================================================================================
import "./edd-visit.css";

interface EddVisitProps {
    caughtMules : Map<string, PatternBehaviour>;
    onComplete  : (correct : number) => void;
    onSkip      : () => void;   // Straight to the result, nothing recorded
}

const playSound = (src : string) => {
    const audio = new Audio(src);
    audio.play().catch((error) => {
        console.log("Audio playback failed:", error);
    });
};

// How long the resident takes to answer the door. The profile is held back until
// they are actually standing there, so the panel reads as their file rather than
// as a card that happened to appear.
const DOOR_MS = 620;

/**
 * The field visits that follow the round.
 *
 * The player has just spent eighty seconds being the model, catching accounts on
 * the shape of their transactions alone. Now they are the branch officer: three
 * accounts they froze, the findings from the doorstep, and the same two verdicts the
 * real form offers. One of the three is innocent. Getting it right is not the point;
 * seeing that a pattern is a reason to look, not proof, is.
 *
 * What changed in the revamp is only where this happens. The three visits used to
 * be dealt as a stack of cards; now they are three houses on the world map, and the
 * player walks to whichever one they like in whatever order they like. The cases,
 * how they are drawn, how a verdict is judged and what is counted are all exactly
 * as they were — house N simply holds visit N.
 *
 * None of this touches the leaderboard. Catching and verifying are different
 * skills, and the board measures the first. The verdicts show up as their own
 * figure on the result screen.
 */
export const EddVisit = ({caughtMules, onComplete, onSkip} : EddVisitProps) => {
    // Dealt once, when the screen comes up, and held for its whole life.
    //
    // One house holds one visit, so the round can never deal more cases than the
    // map has doors. EDD_VISITS and the map's three houses are set to agree with
    // each other, and this is where that agreement is enforced rather than assumed
    // — turn EDD_VISITS down and the spare house simply stays shut.
    const [ visits ] = useState(() => drawVisits(caughtMules).slice(0, HOUSES.length));

    // The brief comes first, over the map, so the player can see where they are
    // being sent while they are being told why
    const [ hasReadBrief, setHasReadBrief ] = useState(false);

    // Which door is open, whether the resident has finished answering it, and what
    // the player has decided about them
    const [ openHouse, setOpenHouse ] = useState<number | null>(null);
    const [ isProfileUp, setIsProfileUp ] = useState(false);
    const [ answer, setAnswer ] = useState<FvStatus | null>(null);

    const [ doneHouses, setDoneHouses ] = useState<number[]>([]);
    const [ correct, setCorrect ] = useState(0);

    const doorTimer = useRef<ReturnType<typeof setTimeout>>();
    useEffect(() => () => clearTimeout(doorTimer.current), []);

    const caughtCount = caughtMules.size;
    const current = openHouse !== null ? visits[openHouse] : null;
    const isLast = doneHouses.length === visits.length - 1;

    // ARRIVING AT A DOOR ==============================================================================================
    const knock = (houseIndex : number) => {
        setOpenHouse(houseIndex);
        setAnswer(null);
        doorTimer.current = setTimeout(() => setIsProfileUp(true), DOOR_MS);
    };

    // THE VERDICT =====================================================================================================
    // Untouched from the card version: one decision per visit, judged against the
    // case's own verdict, and counted once.
    const decide = (status : FvStatus) => {
        if (!current || answer !== null) {
            return;
        }

        const isRight = status === current.verdict;
        setAnswer(status);
        if (isRight) {
            setCorrect(count => count + 1);
        }
        playSound(isRight ? UncoveredSound : WrongSound);
    };

    // LEAVING =========================================================================================================
    const leave = () => {
        if (openHouse === null) {
            return;
        }

        const visited = [ ...doneHouses, openHouse ];

        setIsProfileUp(false);
        setOpenHouse(null);
        setAnswer(null);
        setDoneHouses(visited);

        if (visited.length === visits.length) {
            onComplete(correct);
        }
    };

    return (
        <WorldMap
            mode="investigate"
            headline={hasReadBrief ? "INVESTIGATE FURTHER" : "TIME'S UP"}
            caption={hasReadBrief
                ? `${doneHouses.length} of ${visits.length} visited`
                : "A pattern is a reason to look, not proof"}
            activeHouses={visits.map((_, index) => index)}
            doneHouses={doneHouses}
            emergedHouse={openHouse}
            panelHouse={isProfileUp ? openHouse : null}
            onEnterHouse={hasReadBrief ? knock : undefined}
            isOutside={hasReadBrief}
            onSkip={openHouse === null ? onSkip : undefined}
            skipLabel="SKIP TO RESULTS"
        >
            {/* THE BRIEF ====================================================================================== */}
            {/* Sits over the world rather than in front of it, so the three houses the
                player is about to be sent to are visible while they are being briefed */}
            {!hasReadBrief && (
                <div className="icard-layer edd-brief-layer">
                    <div className="icard is-medium has-tab">
                        {/* CONTEXT LABEL */}
                        <span className="icard-label">ENHANCED DUE DILIGENCE</span>

                        {/* SHORT EXPLANATION */}
                        <h2 className="icard-title">
                            {caughtCount > 0
                                ? <>You froze {caughtCount} {caughtCount === 1 ? "account" : "accounts"} on a pattern alone.</>
                                : <>These accounts were flagged on a pattern alone.</>}
                        </h2>

                        <p className="icard-body">
                            A real bank does the same, then sends someone to the address to
                            meet the customer before a freeze is final.
                        </p>

                        <p className="icard-body is-key">
                            {EDD_VISITS} houses. Knock on each and decide which freezes stand.
                        </p>

                        {/* ONE CLEAR ACTION */}
                        <div className="icard-actions">
                            <button type="button" className="toon-btn is-primary"
                                    onClick={() => setHasReadBrief(true)}>
                                GO OUT INTO THE FIELD
                            </button>
                        </div>

                        <span className="icard-foot">The clock is off</span>
                    </div>
                </div>
            )}

            {/* THE DOORSTEP =================================================================================== */}
            {current !== null && openHouse !== null && isProfileUp && (
                <PersonProfile
                    key={current.id}
                    visit={current}
                    houseIndex={openHouse}
                    step={doneHouses.length}
                    total={visits.length}
                    answer={answer}
                    correct={correct}
                    onDecide={decide}
                    onNext={leave}
                    isLast={isLast}
                />
            )}
        </WorldMap>
    );
};
