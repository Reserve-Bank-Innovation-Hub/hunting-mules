// REACT CORE ==========================================================================================================
import { Metadata } from "next";

// OTHER ===============================================================================================================
import GamePage from "./page.client";

export const metadata : Metadata = {
    title       : "Play game",
    description : "Interactive financial fraud detection game. Click on mule accounts to lock them before they launder all the money. Track transactions in real-time and save as much money as possible from money mules.",
    openGraph   : {
        title       : "Play game — Hunting Mules",
        description : "Interactive financial fraud detection game. Click on mule accounts to lock them before they launder all the money. Track transactions in real-time and save as much money as possible from money mules.",
        url         : "https://hunting-mules.com/game",
        siteName    : "Hunting Mules",
        images      : [
            {
                url    : "https://hunting-mules.s3.ap-south-1.amazonaws.com/mule-hunter.jpg",
                width  : 1200,
                height : 630,
                alt    : "Play game — Hunting Mules",
            },
        ],
        locale      : "en_US",
        type        : "website",
    },
    twitter     : {
        card        : "summary_large_image",
        title       : "Play game — Hunting Mules",
        description : "Interactive financial fraud detection game. Click on mule accounts to lock them before they launder all the money. Track transactions in real-time and save as much money as possible from money mules.",
        images      : [ "https://hunting-mules.s3.ap-south-1.amazonaws.com/mule-hunter.jpg" ],
    },
};

export default function Page() {
    return <GamePage />;
}
