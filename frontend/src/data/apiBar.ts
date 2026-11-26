export type ApiBar = Readonly<{
  id: number
  name: string
  address: string | null
  neighborhood: string | null
  category: string
  metadata: Record<string, unknown>
  latitude: number
  longitude: number
}>
