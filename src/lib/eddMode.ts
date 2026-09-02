// Whether the field visits run at all.
//
// EDD_ENABLED in gameConfig is the default. A kiosk can be switched the other way
// without a rebuild by opening it with ?edd=off, or forced on with ?edd=on. The
// machine stores nothing between screens, so the choice rides in the query string
// from the home screen into the round and back again through "play again".

// LIB =================================================================================================================
import { EDD_ENABLED } from "./gameConfig";

export const EDD_PARAM = "edd";

export const readEddEnabled = (search : string) : boolean => {
    const value = new URLSearchParams(search).get(EDD_PARAM);
    if (value === "off") return false;
    if (value === "on") return true;
    return EDD_ENABLED;
};

// Carry an explicit ?edd= choice from the current URL onto the next one. Leaves the
// link alone when the kiosk is running on the default, so ordinary URLs stay clean.
export const withEddMode = (href : string, search : string) : string => {
    const value = new URLSearchParams(search).get(EDD_PARAM);
    if (value !== "off" && value !== "on") return href;
    return `${href}${href.includes("?") ? "&" : "?"}${EDD_PARAM}=${value}`;
};
