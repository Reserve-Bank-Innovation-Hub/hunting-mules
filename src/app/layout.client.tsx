"use client"

// REACT CORE ==========================================================================================================
import React, { ReactNode } from "react";

// UI ==================================================================================================================
import { ThemeProvider } from "fictoan-react";

// STYLES ==============================================================================================================
import "$styles/globals.css";

export const RootLayoutClient = ({children} : { children : ReactNode }) => {
    const listOfThemes = ["theme-light", "theme-dark"];

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
