import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'
import places from '../../public/data/bars.json'

export type DemoBar = Readonly<{
  id: string
  name: string
  neighborhood: string
  description: string
  atmosphere: string
  story: string
  highlights: ReadonlyArray<string>
  hours: string
  illustration: 'beer' | 'garden' | 'music'
  position: readonly [latitude: number, longitude: number]
}>

type PlaceId = keyof ReturnType<typeof getMessages>['Places']
type Place = Pick<
  DemoBar,
  'name' | 'neighborhood' | 'illustration' | 'position'
> & {
  id: PlaceId
}

const isPlace = (value: unknown): value is Place => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const place = value as Record<string, unknown>
  return (
    typeof place.id === 'string' &&
    Object.hasOwn(getMessages('en').Places, place.id) &&
    typeof place.name === 'string' &&
    place.name.trim() !== '' &&
    typeof place.neighborhood === 'string' &&
    typeof place.illustration === 'string' &&
    ['beer', 'garden', 'music'].includes(place.illustration) &&
    Array.isArray(place.position) &&
    place.position.length === 2 &&
    place.position.every(
      (coordinate) =>
        typeof coordinate === 'number' && Number.isFinite(coordinate)
    ) &&
    Math.abs(place.position[0]) <= 90 &&
    Math.abs(place.position[1]) <= 180
  )
}

export const parseDemoBars = (
  payload: unknown,
  locale: Locale
): Array<DemoBar> => {
  if (!Array.isArray(payload) || !payload.every(isPlace)) {
    throw new Error('Invalid demo bar catalog')
  }
  if (new Set(payload.map((place) => place.id)).size !== payload.length) {
    throw new Error('Duplicate demo bar identifiers')
  }
  const translations = getMessages(locale).Places
  return payload.map((place) => ({ ...place, ...translations[place.id] }))
}

export const getDemoBars = (locale: Locale): Array<DemoBar> =>
  parseDemoBars(places, locale)

export const getDemoBar = (id: string, locale: Locale) =>
  getDemoBars(locale).find((bar) => bar.id === id)
