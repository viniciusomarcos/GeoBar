import en from '../../messages/en.json'
import pt from '../../messages/pt.json'
import type { Locale } from './routing'

export type Messages = typeof en

const messages: Record<Locale, Messages> = { en, pt }

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}
