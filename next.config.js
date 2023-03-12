/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    domains: ['cdn.cms.mirea.ninja', 'appwrite.mirea.ninja', 'www.mirea.ru'],
  },
  sentry: {
    hideSourceMaps: true,
  },
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/events',
        permanent: false,
      },
    ]
  },
}

const sentryWebpackPluginOptions = {
  url: 'https://error-monitoring.mirea.ru',
  org: 'mirea-ninja',
  project: 'voting-app-admin',
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)
