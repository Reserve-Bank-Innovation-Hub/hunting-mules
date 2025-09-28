/** @type {import("next").NextConfig} */
const nextConfig = {
    images         : {
        unoptimized : true,
    },
    async redirects() {
        return [
            {
                source      : '/projects',
                destination : '/#key-projects',
                permanent   : false,
            },
        ];
    },
    webpack        : (config, options) => {
        config.module.rules.push({
            test : /\.svg$/,
            use  : [
                options.defaultLoaders.babel,
                {
                    loader  : "@svgr/webpack",
                    options : { babel : false },
                },
            ],
        });

        config.module.rules.push({
            test : /\.(mp4|webm|ogg|swf|ogv)$/,
            use  : {
                loader  : "file-loader",
                options : {
                    publicPath : "/_next/static/videos/",
                    outputPath : "static/videos/",
                },
            },
        });

        return config;
    },
    pageExtensions : ["js", "jsx", "ts", "tsx", "mdx"],
};

module.exports = nextConfig;
