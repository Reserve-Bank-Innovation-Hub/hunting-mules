// Whether this machine needs the game to bring its own keyboard.
//
// A phone and a tablet raise one when a field is focused. A kiosk very often does
// not: Chrome on Windows only shows the touch keyboard in tablet mode, and a Linux
// kiosk usually has none at all — so tapping the name field does nothing, and the
// player cannot enter the game.
//
// The test is the VIEWPORT WIDTH and nothing else.
//
// It used to also require a coarse pointer, on the reasoning that a touchscreen
// has no physical keyboard. That reasoning is sound and the test is not: kiosk
// browsers report their pointer inconsistently, and plenty report `fine` — so on
// the actual hardware the keyboard never appeared, which is the one place it had
// to. A guess that fails silently on the only machine that needs it is worse than
// no guess.
//
// So: anything wider than a phone gets the keyboard. A laptop gets one it does
// not need, which is harmless — the field is still a real input and a physical
// keyboard still types into it. A phone is excluded because it already raises a
// better one of its own.
//
// ?kiosk=on / ?kiosk=off settles it either way, the same as ?edd=.

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

    return window.innerWidth >= KIOSK_MIN_WIDTH;
};

/** Carry an explicit ?kiosk= choice onto the next URL, the way ?edd= is carried. */
export const withKioskMode = (href : string, search : string) : string => {
    const value = new URLSearchParams(search).get(KIOSK_PARAM);
    if (value !== "on" && value !== "off") return href;
    return `${href}${href.includes("?") ? "&" : "?"}${KIOSK_PARAM}=${value}`;
};
