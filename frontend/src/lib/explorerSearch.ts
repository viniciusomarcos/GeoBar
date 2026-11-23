export const resultsPerPage = 12

export type ExplorerSearch = {
  query: string
  neighborhood: string | null
  page: number
  selectedId: string | null
}

export const parseExplorerSearch = (search: string): ExplorerSearch => {
  const params = new URLSearchParams(search)
  const page = Number(params.get('page'))
  return {
    query: (params.get('q') ?? '').trim(),
    neighborhood: params.get('neighborhood')?.trim() || null,
    page: Number.isSafeInteger(page) && page > 0 ? page : 1,
    selectedId: params.get('bar') || null
  }
}

export const serializeExplorerSearch = (search: ExplorerSearch) => {
  const params = new URLSearchParams()
  if (search.query) {
    params.set('q', search.query)
  }
  if (search.neighborhood) {
    params.set('neighborhood', search.neighborhood)
  }
  if (search.page > 1) {
    params.set('page', String(search.page))
  }
  if (search.selectedId) {
    params.set('bar', search.selectedId)
  }
  const query = params.toString()
  if (!query) {
    return ''
  }
  return `?${query}`
}

export const getExplorerHref = (search: ExplorerSearch) =>
  `/${serializeExplorerSearch(search)}#explore`

export const getBarDetailsHref = (id: string, search: ExplorerSearch) =>
  `/bars/${encodeURIComponent(id)}${serializeExplorerSearch(search)}`

export const paginateBars = <Bar>(
  bars: ReadonlyArray<Bar>,
  search: ExplorerSearch
) => {
  const totalPages = Math.max(1, Math.ceil(bars.length / resultsPerPage))
  const page = Math.min(search.page, totalPages)
  const start = (page - 1) * resultsPerPage
  return { page, totalPages, bars: bars.slice(start, start + resultsPerPage) }
}
