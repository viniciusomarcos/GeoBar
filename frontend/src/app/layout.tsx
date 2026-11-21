import type { Metadata } from 'next'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { PreferencesProvider } from '@/components/PreferencesProvider'
import { defaultLocale } from '@/i18n/config'
import 'leaflet/dist/leaflet.css'
import './globals.css'

export const metadata: Metadata = {
  applicationName: 'GeoBar'
}

const themeBootstrap = `(() => {
  try {
    if (localStorage.getItem('geobar.theme') === 'dark') {
      document.documentElement.dataset.theme = 'dark'
    }
  } catch {}
})()`

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => (
  <html lang={defaultLocale} data-theme="light" suppressHydrationWarning>
    <body>
      <Script id="theme-preference" strategy="beforeInteractive">
        {themeBootstrap}
      </Script>
      <PreferencesProvider>{children}</PreferencesProvider>
    </body>
  </html>
)

export default RootLayout
