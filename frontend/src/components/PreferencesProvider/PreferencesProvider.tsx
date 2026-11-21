'use client'

import { NextIntlClientProvider } from 'next-intl'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import { defaultLocale, type Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import {
  type Preferences,
  readPreferences,
  savePreferences,
  type Theme
} from '@/lib/preferences'

type PreferencesContextValue = Preferences & {
  setLocale: (locale: Locale) => void
  setTheme: (theme: Theme) => void
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const applyDocumentPreferences = ({ locale, theme }: Preferences) => {
  document.documentElement.lang = locale
  document.documentElement.dataset.theme = theme
}

export const PreferencesProvider = ({
  children,
  initialLocale = defaultLocale
}: {
  children: ReactNode
  initialLocale?: Locale
}) => {
  const [preferences, setPreferences] = useState<Preferences>({
    locale: initialLocale,
    theme: 'light'
  })

  useEffect(() => {
    const stored = readPreferences(initialLocale)
    setPreferences(stored)
    applyDocumentPreferences(stored)
  }, [initialLocale])

  const updatePreferences = (next: Preferences) => {
    setPreferences(next)
    applyDocumentPreferences(next)
    savePreferences(next)
  }

  return (
    <PreferencesContext
      value={{
        ...preferences,
        setLocale: (locale) => updatePreferences({ ...preferences, locale }),
        setTheme: (theme) => updatePreferences({ ...preferences, theme })
      }}
    >
      <NextIntlClientProvider
        locale={preferences.locale}
        messages={getMessages(preferences.locale)}
        timeZone="America/Sao_Paulo"
      >
        {children}
      </NextIntlClientProvider>
    </PreferencesContext>
  )
}

export const usePreferences = () => {
  const preferences = useContext(PreferencesContext)
  if (!preferences) {
    throw new Error('usePreferences must be used within PreferencesProvider')
  }
  return preferences
}
