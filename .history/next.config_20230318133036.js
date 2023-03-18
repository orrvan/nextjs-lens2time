/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['lens.infura-ipfs.io'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lens.infura-ipfs.io',
        port: '',
        pathname: '/atlas/**',
      },
    ],
  },
}
module.exports = {
  webpack(nextConfig) {
    nextConfig.experiments = { ...nextConfig.experiments, topLevelAwait: true }
    return nextConfig
  },
}