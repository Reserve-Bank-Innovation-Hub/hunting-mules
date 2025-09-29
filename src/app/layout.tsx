// REACT CORE ==========================================================================================================
import { Metadata } from "next";
import { ReactNode } from "react";

// OTHER ===============================================================================================================
import { RootLayoutClient } from "./layout.client";

export const metadata : Metadata = {
    title        : {
        template : "%s — Hunting Mules",
        default  : "Hunting Mules — Financial Fraud Detection Game",
    },
    description  : "Spot accounts that send money to multiple accounts at once. Click on them to lock them and prevent them from transacting. Find them quickly to save the maximum amount as possible!",
    icons        : {
        icon     : [
            {
                url  : "/favicon.ico",
                type : "image/svg+xml",
            },
        ],
        shortcut : "/favicon.ico",
    },
    metadataBase : new URL("https://hunting-mules.com"),
    robots       : {
        index  : true,
        follow : true,
    },
    openGraph    : {
        title       : "Hunting Mules — Financial Fraud Detection Game",
        description : "Spot accounts that send money to multiple accounts at once. Click on them to lock them and prevent them from transacting. Find them quickly to save the maximum amount as possible!",
        url         : "https://hunting-mules.com",
        siteName    : "Hunting Mules",
        images      : [
            {
                url    : "https://hunting-mules.s3.ap-south-1.amazonaws.com/mule-hunter.jpg",
                width  : 1200,
                height : 630,
                alt    : "Hunting Mules — Financial Fraud Detection Game",
            },
        ],
        locale      : "en_US",
        type        : "website",
    },
    twitter      : {
        card        : "summary_large_image",
        title       : "Hunting Mules — Financial Fraud Detection Game",
        description : "Spot accounts that send money to multiple accounts at once. Click on them to lock them and prevent them from transacting. Find them quickly to save the maximum amount as possible!",
        images      : [ "https://hunting-mules.s3.ap-south-1.amazonaws.com/mule-hunter.jpg" ],
    },
};

export default function RootLayout({children} : { children : ReactNode }) {
    return <RootLayoutClient>{children}</RootLayoutClient>;
}
