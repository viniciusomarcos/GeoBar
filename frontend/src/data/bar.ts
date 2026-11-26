import type { ApiBar } from './apiBar'

export type Bar = Readonly<{
  id: string
  name: string
  neighborhood: string
  address: string | null
  category: string
  description: string
  hours: string | null
  position: readonly [latitude: number, longitude: number]
  distanceMeters?: number
  apiData: ApiBar
}>
