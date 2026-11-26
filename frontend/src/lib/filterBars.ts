import type { Bar } from '@/data/bar'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

export const filterBars = (
  bars: ReadonlyArray<Bar>,
  query: string,
  neighborhood: string | null
): Array<Bar> => {
  const normalizedQuery = normalize(query)

  return bars.filter((bar) => {
    const matchesNeighborhood =
      neighborhood === null || bar.neighborhood === neighborhood
    const matchesQuery = [
      bar.name,
      bar.neighborhood,
      bar.category,
      bar.address ?? ''
    ].some((value) => normalize(value).includes(normalizedQuery))

    return matchesNeighborhood && matchesQuery
  })
}
