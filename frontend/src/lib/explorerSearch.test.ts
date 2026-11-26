import { describe, expect, it } from 'vitest'
import {
  getBarDetailsHref,
  getExplorerHref,
  paginateBars,
  parseExplorerSearch,
  serializeExplorerSearch
} from './explorerSearch'

describe('Explorer search addresses', () => {
  it('uses an empty search and the default page size for a direct visit', () => {
    expect(parseExplorerSearch('')).toEqual({
      query: '',
      neighborhood: null,
      page: 1,
      selectedId: null
    })
    expect(serializeExplorerSearch(parseExplorerSearch(''))).toBe('')
  })

  it('ignores former page-size parameters and always returns twelve items per page', () => {
    const search = parseExplorerSearch('?size=2')
    const bars = Array.from({ length: 13 }, (_, index) => index)
    expect(paginateBars(bars, search).bars).toHaveLength(12)
    expect(getExplorerHref(search)).toBe('/#explore')
  })

  it('round-trips a filtered page and selected marker through details and back', () => {
    const search = parseExplorerSearch(
      '?q=  balcão &neighborhood=Floresta&page=2&bar=3'
    )
    const query = serializeExplorerSearch(search)
    expect(parseExplorerSearch(query)).toEqual(search)
    expect(getBarDetailsHref('3', search)).toBe(`/bars/3${query}`)
    expect(getExplorerHref(search)).toBe(`/${query}#explore`)
    expect(search.query).toBe('balcão')
  })

  it.each([
    '-1',
    '1.5',
    'abc',
    'Infinity',
    '9007199254740992'
  ])('ignores an invalid page %s', (page) => {
    expect(
      parseExplorerSearch(`?page=${page}&size=7&neighborhood= `)
    ).toMatchObject({ page: 1, neighborhood: null })
  })

  it('keeps unrelated parameters and locale out of generated search links', () => {
    const search = parseExplorerSearch(
      '?lang=en&returnTo=https://example.com&q=Quintal'
    )
    expect(getExplorerHref(search)).toBe('/?q=Quintal#explore')
    expect(getBarDetailsHref('name/with spaces', search)).toBe(
      '/bars/name%2Fwith%20spaces?q=Quintal'
    )
  })

  it('slices the requested page without changing the collection', () => {
    const bars = Array.from({ length: 13 }, (_, index) => index + 1)
    expect(paginateBars(bars, parseExplorerSearch('?page=2'))).toEqual({
      page: 2,
      totalPages: 2,
      bars: [13]
    })
    expect(bars).toHaveLength(13)
  })

  it('clamps a page beyond the last result and handles an empty collection', () => {
    const search = parseExplorerSearch('?page=999')
    expect(
      paginateBars(
        Array.from({ length: 13 }, (_, index) => index + 1),
        search
      )
    ).toEqual({
      page: 2,
      totalPages: 2,
      bars: [13]
    })
    expect(paginateBars([], search)).toEqual({
      page: 1,
      totalPages: 1,
      bars: []
    })
  })
})
