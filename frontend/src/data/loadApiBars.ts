import type { Locale } from '@/i18n/config'
import type { ApiBar } from './apiBar'
import type { Bar } from './bar'

type FallbackText = {
  categories: Record<string, string>
  defaultCategory: string
  city: string
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
    city: 'Belo Horizonte'
  },
  en: {
    categories: {
      buteco: 'Buteco',
      bar: 'Bar',
      pub: 'Pub',
      biergarten: 'Beer garden'
    },
    defaultCategory: 'Bar',
    city: 'Belo Horizonte'
  }
}

const isApiBar = (value: unknown): value is ApiBar => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const bar = value as Record<string, unknown>
  return (
    typeof bar.id === 'number' &&
    Number.isSafeInteger(bar.id) &&
    bar.id > 0 &&
    typeof bar.name === 'string' &&
    bar.name.trim() !== '' &&
    (bar.address === null || typeof bar.address === 'string') &&
    (bar.neighborhood === null || typeof bar.neighborhood === 'string') &&
    typeof bar.category === 'string' &&
    typeof bar.metadata === 'object' &&
    bar.metadata !== null &&
    !Array.isArray(bar.metadata) &&
    typeof bar.latitude === 'number' &&
    Number.isFinite(bar.latitude) &&
    Math.abs(bar.latitude) <= 90 &&
    typeof bar.longitude === 'number' &&
    Number.isFinite(bar.longitude) &&
    Math.abs(bar.longitude) <= 180
  )
}

export const toBar = (bar: ApiBar, locale: Locale): Bar => {
  const text = fallbackText[locale]
  const category = text.categories[bar.category] ?? text.defaultCategory
  const openingHours = bar.metadata.opening_hours
  return {
    id: String(bar.id),
    name: bar.name,
    neighborhood: bar.neighborhood?.trim() || text.city,
    address: bar.address?.trim() || null,
    description:
      bar.address?.trim() ||
      `${category} · ${bar.neighborhood?.trim() || text.city}`,
    category,
    hours:
      typeof openingHours === 'string' && openingHours.trim() !== ''
        ? openingHours
        : null,
    position: [bar.latitude, bar.longitude],
    apiData: bar
  }
}

export const parseApiBars = (payload: unknown, locale: Locale) => {
  if (!Array.isArray(payload) || !payload.every(isApiBar)) {
    throw new Error('Invalid API bar catalog')
  }
  if (new Set(payload.map(({ id }) => id)).size !== payload.length) {
    throw new Error('Duplicate API bar identifiers')
  }
  return payload.map((bar) => toBar(bar, locale))
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

export type NearbyQuery = Readonly<{
  lat: number
  lng: number
  radius: number
  limit?: number
}>

type NearbyApiBar = ApiBar & Readonly<{ distance_m: number }>

const isNearbyApiBar = (value: unknown): value is NearbyApiBar => {
  if (!isApiBar(value)) {
    return false
  }
  const bar = value as Record<string, unknown>
  return (
    typeof bar.distance_m === 'number' &&
    Number.isFinite(bar.distance_m) &&
    bar.distance_m >= 0
  )
}

export const parseNearbyApiBars = (
  payload: unknown,
  locale: Locale
): Array<Bar> => {
  if (!Array.isArray(payload) || !payload.every(isNearbyApiBar)) {
    throw new Error('Invalid API nearby bar catalog')
  }
  if (new Set(payload.map(({ id }) => id)).size !== payload.length) {
    throw new Error('Duplicate API bar identifiers')
  }
  return payload.map((bar) => ({
    ...toBar(bar, locale),
    distanceMeters: bar.distance_m
  }))
}

export const loadNearbyApiBars = async (
  apiUrl: string,
  query: NearbyQuery,
  locale: Locale,
  signal: AbortSignal
) => {
  const params = new URLSearchParams({
    lat: String(query.lat),
    lng: String(query.lng),
    radius: String(query.radius),
    limit: String(query.limit ?? 100)
  })
  const response = await fetch(
    `${apiBaseUrl(apiUrl)}/bars/nearby?${params.toString()}`,
    {
      signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    }
  )
  if (!response.ok) {
    throw new Error('Unable to load nearby bars')
  }
  return parseNearbyApiBars(await response.json(), locale)
}

export const loadApiBar = async (
  apiUrl: string,
  id: string,
  locale: Locale
): Promise<Bar | undefined> => {
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
  return toBar(payload, locale)
}
