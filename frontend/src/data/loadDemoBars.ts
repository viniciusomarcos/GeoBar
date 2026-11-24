import type { Locale } from '@/i18n/config'
import { parseDemoBars } from './demoBars'
import { loadApiBars } from './loadApiBars'

export const loadDemoBars = async (locale: Locale, signal: AbortSignal) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return loadApiBars(apiUrl, locale, signal)
  }
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
