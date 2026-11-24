import type { Locale } from '@/i18n/config'
import type { DemoBar } from './demoBars'

type ApiBar = {
  id: number
  name: string
  address: string | null
  neighborhood: string | null
  category: string
  metadata: Record<string, unknown>
  latitude: number
  longitude: number
}

type FallbackText = {
  categories: Record<string, string>
  defaultCategory: string
  city: string
  unknownNeighborhood: string
  unknownAddress: string
  unknownHours: string
  description: (category: string, place: string) => string
}

const fallbackText: Record<Locale, FallbackText> = {
  pt: {
    categories: {
      buteco: 'Buteco',
      bar: 'Bar',
      pub: 'Pub',
      biergarten: 'Cervejaria ao ar livre'
    },
    defaultCategory: 'Bar',
    city: 'Belo Horizonte',
    unknownNeighborhood: 'Bairro não informado',
    unknownAddress: 'Endereço não informado',
    unknownHours: 'Horário não informado',
    description: (category, place) => `${category} em ${place}.`
  },
  en: {
    categories: {
      buteco: 'Buteco',
      bar: 'Bar',
      pub: 'Pub',
      biergarten: 'Beer garden'
    },
    defaultCategory: 'Bar',
    city: 'Belo Horizonte',
    unknownNeighborhood: 'Neighborhood not informed',
    unknownAddress: 'Address not informed',
    unknownHours: 'Hours not informed',
    description: (category, place) => `${category} in ${place}.`
  }
}

const isApiBar = (value: unknown): value is ApiBar => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const bar = value as Record<string, unknown>
  return (
    typeof bar.id === 'number' &&
    typeof bar.name === 'string' &&
    bar.name.trim() !== '' &&
    (bar.address === null || typeof bar.address === 'string') &&
    (bar.neighborhood === null || typeof bar.neighborhood === 'string') &&
    typeof bar.category === 'string' &&
    typeof bar.metadata === 'object' &&
    bar.metadata !== null &&
    typeof bar.latitude === 'number' &&
    Number.isFinite(bar.latitude) &&
    typeof bar.longitude === 'number' &&
    Number.isFinite(bar.longitude)
  )
}

const pickIllustration = (bar: ApiBar): DemoBar['illustration'] => {
  if (
    bar.category === 'biergarten' ||
    bar.metadata.outdoor_seating === 'yes'
  ) {
    return 'garden'
  }
  return 'beer'
}

export const toDemoBar = (bar: ApiBar, locale: Locale): DemoBar => {
  const text = fallbackText[locale]
  const category = text.categories[bar.category] ?? text.defaultCategory
  const openingHours = bar.metadata.opening_hours
  return {
    id: String(bar.id),
    name: bar.name,
    neighborhood: bar.neighborhood || text.unknownNeighborhood,
    description: text.description(category, bar.neighborhood || text.city),
    atmosphere: category,
    story: bar.address || text.unknownAddress,
    highlights: [category],
    hours: typeof openingHours === 'string' ? openingHours : text.unknownHours,
    illustration: pickIllustration(bar),
    position: [bar.latitude, bar.longitude]
  }
}

export const parseApiBars = (payload: unknown, locale: Locale) => {
  if (!Array.isArray(payload) || !payload.every(isApiBar)) {
    throw new Error('Invalid API bar catalog')
  }
  return payload.map((bar) => toDemoBar(bar, locale))
}

const apiBaseUrl = (apiUrl: string) => apiUrl.replace(/\/+$/, '')

export const loadApiBars = async (
  apiUrl: string,
  locale: Locale,
  signal: AbortSignal
) => {
  const response = await fetch(`${apiBaseUrl(apiUrl)}/bars/all`, {
    signal,
    cache: 'no-store',
    headers: { Accept: 'application/json' }
  })
  if (!response.ok) {
    throw new Error('Unable to load the API bar catalog')
  }
  return parseApiBars(await response.json(), locale)
}

export const loadApiBar = async (
  apiUrl: string,
  id: string,
  locale: Locale
): Promise<DemoBar | undefined> => {
  if (!/^\d+$/.test(id)) {
    return undefined
  }
  const response = await fetch(`${apiBaseUrl(apiUrl)}/bars/${id}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' }
  })
  if (response.status === 404) {
    return undefined
  }
  if (!response.ok) {
    throw new Error('Unable to load the API bar')
  }
  const payload: unknown = await response.json()
  if (!isApiBar(payload)) {
    throw new Error('Invalid API bar')
  }
  return toDemoBar(payload, locale)
}
