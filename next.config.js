/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['cdn.cms.mirea.ninja', 'appwrite.mirea.ninja', 'www.mirea.ru'],
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ]
  },
  publicRuntimeConfig: {
    redirectHostname: process.env.NEXT_PUBLIC_REDIRECT_HOSTNAME,
  },
}

module.exports = nextConfig
