/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['cdn.cms.mirea.ninja'],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/voting',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
