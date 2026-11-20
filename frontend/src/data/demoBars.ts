import { getMessages } from '@/i18n/messages'
import type { Locale } from '@/i18n/routing'

export type DemoBar = Readonly<{
  id: string
  name: string
  neighborhood: string
  description: string
  atmosphere: string
  illustration: 'beer' | 'garden' | 'music'
}>

const places = [
  {
    id: 'casa-da-esquina',
    name: 'Casa da Esquina',
    neighborhood: 'Santa Tereza',
    illustration: 'beer'
  },
  {
    id: 'quintal-do-sol',
    name: 'Quintal do Sol',
    neighborhood: 'Savassi',
    illustration: 'garden'
  },
  {
    id: 'balcao-da-prosa',
    name: 'Balcão da Prosa',
    neighborhood: 'Floresta',
    illustration: 'music'
  }
] as const

export const getDemoBars = (locale: Locale): Array<DemoBar> => {
  const translations = getMessages(locale).Places

  return places.map((place) => ({ ...place, ...translations[place.id] }))
}
