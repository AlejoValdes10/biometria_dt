/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            encoding: false,
        };
        config.ignoreWarnings = [
            { message: /Critical dependency/ },
            { module: /@vladmandic\/face-api/ }
        ];
        return config;
    },
};

module.exports = nextConfig;
