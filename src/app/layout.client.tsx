"use client"

// REACT CORE ==========================================================================================================
import React, { ReactNode, useEffect } from "react";

// UI ==================================================================================================================
import { ThemeProvider } from "fictoan-react";

// LIB =================================================================================================================
import { readRotation } from "$lib/rotation";

// STYLES ==============================================================================================================
import "$styles/globals.css";

export const RootLayoutClient = ({children} : { children : ReactNode }) => {
    const listOfThemes = ["theme-light", "theme-dark"];

    // TURNING THE SCREEN ==============================================================================================
    // Kept in sync after mount — the class itself is put on by the inline script
    // below, which has to run before the first paint.
    useEffect(() => {
        // Re-asserted after mount purely as insurance: the inline script has already
        // set it, and anything that rewrites <html> after hydration would otherwise
        // take it away.
        const turn = readRotation(window.location.search);
        if (turn) {
            document.documentElement.setAttribute("data-rotate", turn);
        } else {
            document.documentElement.removeAttribute("data-rotate");
        }
    }, []);

    // THE BROWSER'S OWN GESTURES ======================================================================================
    // A context menu has nothing to offer on a kiosk, and it is one long press or
    // one stray right click away at all times. iOS pinch-zoom goes the same way:
    // the board is laid out from a measurement of its container, so a zoom mid-round
    // rebuilds it under the player.
    //
    // Listeners rather than CSS because neither has a CSS equivalent. Passive is
    // explicitly off — preventDefault is the whole point.
    useEffect(() => {
        const stop = (event : Event) => event.preventDefault();

        document.addEventListener("contextmenu", stop);
        document.addEventListener("gesturestart", stop);
        document.addEventListener("gesturechange", stop);
        document.addEventListener("gestureend", stop);

        return () => {
            document.removeEventListener("contextmenu", stop);
            document.removeEventListener("gesturestart", stop);
            document.removeEventListener("gesturechange", stop);
            document.removeEventListener("gestureend", stop);
        };
    }, []);

    // suppressHydrationWarning because the inline script below sets data-rotate
    // before hydration, so the server's <html> and the client's disagree by
    // design — the same pattern, and the same fix, a theme script uses.
    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            {/* Runs before the first paint, on purpose.
                The board is laid out from a measurement of its container, so if the
                turn is applied in an effect the grid has already been built for the
                unturned shape and ends up in the corner of the turned one. Setting
                the class here means the very first layout is the right one. */}
            <script
                dangerouslySetInnerHTML={{__html : `(function(){try{
                    var p=new URLSearchParams(location.search).get("rotate");
                    var k="mulehunter:rotate";
                    if(p==="off"||p==="none"){sessionStorage.removeItem(k);document.documentElement.removeAttribute("data-rotate");return;}
                    if(p==="on")p="left";
                    if(p!=="left"&&p!=="right")p=sessionStorage.getItem(k);
                    if(p!=="left"&&p!=="right")return;
                    sessionStorage.setItem(k,p);
                    document.documentElement.setAttribute("data-rotate",p);
                }catch(e){}})();`}}
            />
        </head>
        <body>
        <ThemeProvider themeList={listOfThemes} currentTheme="theme-dark">
            {/* Only ever a box when the screen is turned — see #rotate-frame in
                globals.css, which is `display: contents` otherwise and so has no
                effect at all on a normal screen. */}
            <div id="rotate-frame">{children}</div>
        </ThemeProvider>
        </body>
        </html>
    );
}
