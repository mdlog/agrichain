/** @type {import('next').NextConfig} */
const nextConfig = {
    // Disable caching in development for better hot reload
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 2,
    },

    // Disable SWC minify cache in development
    swcMinify: true,

    // Configure webpack for better hot reload
    webpack: (config, { dev, isServer }) => {
        if (dev && !isServer) {
            // Disable caching in development
            config.cache = false;
        }
        return config;
    },

    // Experimental features for better dev experience
    experimental: {
        // Faster refresh
        optimizeCss: false,
    },
}

module.exports = nextConfig
