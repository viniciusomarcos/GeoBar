import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import { getApiUrl } from './src/data/apiConfig'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  rewrites: async () => [
    {
      source: '/api/:path*',
      destination: `${getApiUrl().replace(/\/+$/, '')}/:path*`
    }
  ],
  redirects: async () => [
    { source: '/:locale(en|pt)', destination: '/', permanent: true }
  ]
}

export default withNextIntl(nextConfig)
