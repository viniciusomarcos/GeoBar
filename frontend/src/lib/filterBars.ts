import type { DemoBar } from '@/data/demoBars'

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

export const filterBars = (
  bars: ReadonlyArray<DemoBar>,
  query: string,
  neighborhood: string | null
): Array<DemoBar> => {
  const normalizedQuery = normalize(query)

  return bars.filter((bar) => {
    const matchesNeighborhood =
      neighborhood === null || bar.neighborhood === neighborhood
    const matchesQuery = [bar.name, bar.neighborhood, bar.atmosphere].some(
      (value) => normalize(value).includes(normalizedQuery)
    )

    return matchesNeighborhood && matchesQuery
  })
}
