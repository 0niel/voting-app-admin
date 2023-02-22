/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['cdn.cms.mirea.ninja', 'appwrite.mirea.ninja'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/voting',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
