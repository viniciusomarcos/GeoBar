import type { Locale } from '@/i18n/config'
import { parseDemoBars } from './demoBars'

export const loadDemoBars = async (locale: Locale, signal: AbortSignal) => {
  const response = await fetch('/data/bars.json', {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error('Unable to load the demo bar catalog')
  }
  return parseDemoBars(await response.json(), locale)
}
