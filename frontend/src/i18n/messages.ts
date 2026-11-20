import en from '../../messages/en.json'
import pt from '../../messages/pt.json'
import type { Locale } from './routing'

export type Messages = typeof en

const messages: Record<Locale, Messages> = { en, pt }

export const getMessages = (locale: Locale): Messages => messages[locale]
