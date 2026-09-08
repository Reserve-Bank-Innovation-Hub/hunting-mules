// Whether this machine needs the game to bring its own keyboard.
//
// A phone and a tablet raise one when a field is focused. A kiosk very often does
// not: Chrome on Windows only shows the touch keyboard in tablet mode, and a Linux
// kiosk usually has none at all — so tapping the name field does nothing, and the
// player cannot enter the game.
//
// Guessed rather than configured, so a kiosk works when it is switched on and
// nobody has to remember a flag:
//
//   coarse pointer  — it is a touchscreen, so there is no physical keyboard
//   wide viewport   — it is not a phone, which has a perfectly good one already
//
// Either way ?kiosk=on / ?kiosk=off settles it, the same way ?edd= does.

export const KIOSK_PARAM = "kiosk";

/** Below this a device is treated as a phone, which brings its own keyboard. */
const KIOSK_MIN_WIDTH = 900;

export const needsOwnKeyboard = (search : string) : boolean => {
    const forced = new URLSearchParams(search).get(KIOSK_PARAM);
    if (forced === "on") return true;
    if (forced === "off") return false;

    if (typeof window === "undefined") {
        return false;
    }

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    return isTouch && window.innerWidth >= KIOSK_MIN_WIDTH;
};

/** Carry an explicit ?kiosk= choice onto the next URL, the way ?edd= is carried. */
export const withKioskMode = (href : string, search : string) : string => {
    const value = new URLSearchParams(search).get(KIOSK_PARAM);
    if (value !== "on" && value !== "off") return href;
    return `${href}${href.includes("?") ? "&" : "?"}${KIOSK_PARAM}=${value}`;
};
