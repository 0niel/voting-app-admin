/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['cdn.cms.mirea.ninja'],
    unoptimized: true,
  },
}

module.exports = nextConfig
