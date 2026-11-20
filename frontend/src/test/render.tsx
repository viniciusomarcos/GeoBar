import { render } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ReactElement } from 'react'
import { getMessages } from '@/i18n/messages'
import type { Locale } from '@/i18n/routing'

export function renderWithIntl(ui: ReactElement, locale: Locale = 'en') {
  return render(
    <NextIntlClientProvider
      locale={locale}
      messages={getMessages(locale)}
      timeZone="America/Sao_Paulo"
    >
      {ui}
    </NextIntlClientProvider>
  )
}
