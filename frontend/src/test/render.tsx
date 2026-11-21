import { render } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { PreferencesProvider } from '@/components/PreferencesProvider'
import type { Locale } from '@/i18n/config'

export const renderWithIntl = (ui: ReactElement, locale: Locale = 'en') => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <PreferencesProvider initialLocale={locale}>{children}</PreferencesProvider>
  )
  return render(ui, { wrapper })
}
