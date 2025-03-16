/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Necessario per Electron
  images: {
    unoptimized: true, // Necessario per build statica
  },
  env: {
    AIMLAPI_KEY: process.env.AIMLAPI_KEY,
  },
  experimental: {
    serverActions: true,
  },
  // Configurazione per Electron
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.target = 'electron-renderer';
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        process: false,
      };
    }

    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...config.resolve.fallback,
          child_process: false,
          fs: false,
          'fs/promises': false,
          net: false,
          stream: false,
          tls: false,
        },
      },
    };
  },
}

module.exports = nextConfig 