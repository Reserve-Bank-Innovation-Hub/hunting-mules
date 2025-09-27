// OTHER ===============================================================================================================
import HomePage from "./page.client";

export const metadata = {
    title       : "Blog — Sujan Sundareswaran",
    description : "My ramblings and other such discursive digressions. Thoughts on design, development, and everything in between.",
    openGraph   : {
        title       : "Blog — Sujan Sundareswaran",
        description : "My ramblings and other such discursive digressions. Thoughts on design, development, and everything in between.",
        url         : "https://sujansundareswaran.com/blog",
        siteName    : "Sujan Sundareswaran",
        images      : [
            {
                url    : "https://s3.ap-south-1.amazonaws.com/sujansundareswaran.com/images-cdn/blog-og.png",
                width  : 1200,
                height : 630,
                alt    : "Blog — Sujan Sundareswaran",
            },
        ],
        locale      : "en_US",
        type        : "website",
    },
    twitter     : {
        card        : "summary_large_image",
        title       : "Blog — Sujan Sundareswaran",
        description : "My ramblings and other such discursive digressions. Thoughts on design, development, and everything in between.",
        images      : [ "https://s3.ap-south-1.amazonaws.com/sujansundareswaran.com/images-cdn/blog-og.png" ],
    },
};

export default function Page() {
    return <HomePage />;
}
