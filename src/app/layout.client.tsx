"use client"

// REACT CORE ==========================================================================================================
import React, { ReactNode, useEffect } from "react";

// UI ==================================================================================================================
import { ThemeProvider } from "fictoan-react";

// STYLES ==============================================================================================================
import "$styles/globals.css";

export const RootLayoutClient = ({children} : { children : ReactNode }) => {
    const listOfThemes = ["theme-light", "theme-dark"];

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

    return (
        <html lang="en">
        <body>
        <ThemeProvider themeList={listOfThemes} currentTheme="theme-dark">
            {children}
        </ThemeProvider>
        </body>
        </html>
    );
}
