/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable prefetching for better navigation performance
    reactStrictMode: true,
    
    // Optimize images
    images: {
        unoptimized: true, // Disable if using Next.js Image component
    },

    // Disable caching in development for better hot reload
    onDemandEntries: {
        // period (in ms) where the server will keep pages in the buffer
        maxInactiveAge: 25 * 1000,
        // number of pages that should be kept simultaneously without being disposed
        pagesBufferLength: 5, // Increased for better prefetching
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
