import type { Locale } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

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

const places = [
  {
    id: 'casa-da-esquina',
    name: 'Casa da Esquina',
    neighborhood: 'Santa Tereza',
    illustration: 'beer',
    position: [-19.9165, -43.9117]
  },
  {
    id: 'quintal-do-sol',
    name: 'Quintal do Sol',
    neighborhood: 'Savassi',
    illustration: 'garden',
    position: [-19.9382, -43.9341]
  },
  {
    id: 'balcao-da-prosa',
    name: 'Balcão da Prosa',
    neighborhood: 'Floresta',
    illustration: 'music',
    position: [-19.9127, -43.9327]
  }
] as const

export const getDemoBars = (locale: Locale): Array<DemoBar> => {
  const translations = getMessages(locale).Places

  return places.map((place) => ({ ...place, ...translations[place.id] }))
}

export const getDemoBar = (id: string, locale: Locale) =>
  getDemoBars(locale).find((bar) => bar.id === id)
