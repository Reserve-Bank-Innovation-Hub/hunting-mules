"use client";

// SECTION 2 — HOME PAGE: the keyboard the kiosk does not have.

// STYLES ==============================================================================================================
import "./on-screen-keyboard.css";

interface OnScreenKeyboardProps {
    value      : string;
    onChange   : (next : string) => void;
    onSubmit   : () => void;
    canSubmit  : boolean;
    maxLength  : number;
}

/**
 * A keyboard, on the page.
 *
 * A kiosk touchscreen usually raises no keyboard of its own — Chrome on Windows
 * only does it in tablet mode — so the name field can be tapped, and focused,
 * and still leave the player with no way to type. Nothing in the page can fix
 * that from the outside, so the page brings its own.
 *
 * Letters only, in caps, because that is all a name needs here and the board
 * shows every name in caps anyway. No shift, no numbers, no symbols: each one
 * would be another key to find on a screen somebody is using for eight seconds.
 */

const ROWS = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    "ZXCVBNM".split(""),
];

export const OnScreenKeyboard = ({
    value, onChange, onSubmit, canSubmit, maxLength,
} : OnScreenKeyboardProps) => {
    const type = (char : string) => {
        if (value.length >= maxLength) {
            return;
        }
        onChange(value + char);
    };

    return (
        <div className="osk" role="group" aria-label="On-screen keyboard">
            {ROWS.map((row, index) => (
                <div className="osk-row" key={index}>
                    {/* The last row carries backspace, so it is built alongside the letters */}
                    {index === 2 && (
                        <button type="button" className="osk-key is-wide is-back"
                                onClick={() => onChange(value.slice(0, -1))}
                                aria-label="Backspace">⌫</button>
                    )}

                    {row.map(char => (
                        <button type="button" className="osk-key" key={char}
                                onClick={() => type(char)}>{char}</button>
                    ))}

                    {index === 2 && (
                        <button type="button" className="osk-key is-wide is-space"
                                onClick={() => type(" ")}
                                aria-label="Space">SPACE</button>
                    )}
                </div>
            ))}

            {/* The way out. Disabled rather than hidden, so the key does not move
                under the finger the moment a name becomes valid. */}
            <div className="osk-row">
                <button type="button"
                        className={`osk-key is-go ${canSubmit ? "" : "is-waiting"}`}
                        onClick={onSubmit} disabled={!canSubmit}>START</button>
            </div>
        </div>
    );
};
