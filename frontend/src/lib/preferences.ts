import { defaultLocale, isLocale, type Locale } from '@/i18n/config'

export const themes = ['light', 'dark'] as const
export type Theme = (typeof themes)[number]
export type Preferences = { locale: Locale; theme: Theme }

export const readPreferences = (
  fallbackLocale: Locale = defaultLocale
): Preferences => {
  const preferences: Preferences = { locale: fallbackLocale, theme: 'light' }

  try {
    const locale = localStorage.getItem('geobar.locale')
    const theme = localStorage.getItem('geobar.theme')
    if (isLocale(locale)) {
      preferences.locale = locale
    }
    if (themes.some((option) => option === theme)) {
      preferences.theme = theme as Theme
    }
  } catch {
    return preferences
  }

  return preferences
}

export const savePreferences = ({ locale, theme }: Preferences) => {
  try {
    localStorage.setItem('geobar.locale', locale)
    localStorage.setItem('geobar.theme', theme)
  } catch {
    // Preferences still work in memory when browser storage is unavailable.
  }
}
