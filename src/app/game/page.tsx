// OTHER ===============================================================================================================
import GamePage from "./page.client";

export const metadata = {
    title       : "Sujan Sundareswaran — The online presence of",
    description : "Designer, amateur developer and amateur-er writer. A jack of many trades and master of few.",
    openGraph   : {
        title       : "Sujan Sundareswaran — The online presence of",
        description : "Designer, amateur developer and amateur-er writer. A jack of many trades and master of few.",
        url         : "https://sujansundareswaran.com/",
        siteName    : "Sujan Sundareswaran",
        images      : [
            {
                url    : "https://s3.ap-south-1.amazonaws.com/sujansundareswaran.com/images-cdn/og.png",
                width  : 1200,
                height : 630,
                alt    : "Sujan Sundareswaran — The online presence of",
            },
        ],
        locale      : "en_US",
        type        : "website",
    },
    twitter     : {
        card        : "summary_large_image",
        title       : "Sujan Sundareswaran — The online presence of",
        description : "Designer, amateur developer and amateur-er writer. A jack of many trades and master of few.",
        images      : [ "https://s3.ap-south-1.amazonaws.com/sujansundareswaran.com/images-cdn/og.png" ],
    },
};

export default function Page() {
    return <GamePage />;
}
