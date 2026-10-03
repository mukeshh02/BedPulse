import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

export default (phase) => ({
  ...nextConfig,
  distDir: process.env.BEDPULSE_BUILD_DIR ||
    (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
});
