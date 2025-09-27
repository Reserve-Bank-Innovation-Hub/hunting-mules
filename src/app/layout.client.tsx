"use client"

// EXTERNAL ============================================================================================================
import React, { ReactNode } from "react";

// COMPONENTS ==========================================================================================================
import { SiteHeader } from "$components/Header/SiteHeader";

// STYLES ==============================================================================================================
import "$styles/globals.css";

// OTHER ===============================================================================================================
import { ThemeProvider } from "fictoan-react";

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
