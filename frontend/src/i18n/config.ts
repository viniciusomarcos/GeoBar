export const locales = ['pt', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'pt'

export const isLocale = (value: string | null): value is Locale =>
  locales.some((locale) => locale === value)
