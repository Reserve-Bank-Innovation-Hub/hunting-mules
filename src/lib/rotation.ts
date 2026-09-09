// Turning the whole game on its side.
//
// The kiosk panel is mounted in portrait, but the machine driving it still thinks
// it is landscape — so the browser hands us a wide viewport and everything lands
// rotated on the physical screen. The game is drawn for a tall one.
//
// The RIGHT fix for this is to rotate the display in the operating system: the
// browser then reports a portrait viewport, every layout in here works as it was
// designed to, and touch coordinates are corrected by the OS rather than by us.
// This is the fallback for when that setting is not reachable.
//
//   ?rotate=left   anticlockwise, for a panel whose top edge is on the right
//   ?rotate=right  clockwise
//   ?rotate=off    back to normal, and forget the setting
//
// Kept for the tab once it has been seen, so the choice survives the jump from
// the home screen into the round without every link having to carry it.

export const ROTATE_PARAM = "rotate";
const STORE_KEY = "mulehunter:rotate";

export type Rotation = "left" | "right" | null;

export const readRotation = (search : string) : Rotation => {
    if (typeof window === "undefined") {
        return null;
    }

    const asked = new URLSearchParams(search).get(ROTATE_PARAM);

    if (asked === "off" || asked === "none") {
        try { window.sessionStorage.removeItem(STORE_KEY); } catch { /* private mode */ }
        return null;
    }

    // "on" means anticlockwise, which is the way this kiosk is hung
    const chosen = asked === "on" ? "left" : asked;

    if (chosen === "left" || chosen === "right") {
        try { window.sessionStorage.setItem(STORE_KEY, chosen); } catch { /* private mode */ }
        return chosen;
    }

    try {
        const kept = window.sessionStorage.getItem(STORE_KEY);
        return kept === "left" || kept === "right" ? kept : null;
    } catch {
        return null;
    }
};

/**
 * Carry an explicit ?rotate= onto the next URL, the way ?edd= is carried.
 *
 * The tab remembers the setting as well, but the URL is what makes it survive a
 * refresh, a bookmark, or somebody restarting the kiosk browser — and it means
 * the setting is visible rather than hiding in storage where nobody can see why
 * the screen is sideways.
 */
export const withRotation = (href : string, search : string) : string => {
    const value = new URLSearchParams(search).get(ROTATE_PARAM);
    if (value !== "left" && value !== "right" && value !== "on") return href;
    return `${href}${href.includes("?") ? "&" : "?"}${ROTATE_PARAM}=${value}`;
};
