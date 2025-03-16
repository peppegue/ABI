/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AIMLAPI_KEY: process.env.AIMLAPI_KEY,
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 