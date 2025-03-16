/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
    }
    return config;
  }
};

module.exports = nextConfig; 