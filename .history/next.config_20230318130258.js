/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['lens.infura-ipfs.io'],
  },
}
module.exports = {
  webpack(nextConfig) {
    nextConfig.experiments = { ...nextConfig.experiments, topLevelAwait: true }
    return nextConfig
  },
}