import { parseApiBars } from '@/data/loadApiBars'
import type { Locale } from '@/i18n/config'
import apiBars from '../../cypress/fixtures/apiBars.json'

export { apiBars }

export const getTestBars = (locale: Locale) => parseApiBars(apiBars, locale)
