import { describe, expect, it } from 'vitest'
import { getTestBars } from '@/test/bars'
import { filterBars } from './filterBars'

const bars = getTestBars('en')

describe('filterBars', () => {
  it('returns all places when no filters are applied', () => {
    expect(filterBars(bars, '', null)).toEqual(bars)
  })

  it('matches names regardless of case or surrounding whitespace', () => {
    const results = filterBars(bars, '  CASA  ', null)

    expect(results.map((bar) => bar.name)).toEqual(['Casa da Esquina'])
  })

  it('matches accented names when the search omits accents', () => {
    const results = filterBars(bars, 'balcao', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })

  it('matches neighborhood names in the search query', () => {
    const results = filterBars(bars, 'savassi', null)

    expect(results.map((bar) => bar.name)).toEqual(['Quintal do Sol'])
  })

  it('matches an address without requiring a bar name or neighborhood', () => {
    expect(filterBars(bars, 'marmore', null)).toEqual([bars[0]])
  })

  it('matches the category of a place', () => {
    const results = filterBars(bars, 'pub', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })

  it('limits results to the selected neighborhood', () => {
    const results = filterBars(bars, '', 'Santa Tereza')

    expect(results.map((bar) => bar.name)).toEqual(['Casa da Esquina'])
  })

  it('combines the search query and neighborhood filter', () => {
    expect(filterBars(bars, 'quintal', 'Savassi')).toEqual([bars[1]])
    expect(filterBars(bars, 'quintal', 'Floresta')).toEqual([])
  })

  it('returns no places when the query has no matches', () => {
    expect(filterBars(bars, 'missing place', null)).toEqual([])
  })

  it('treats a whitespace-only query as an empty search', () => {
    expect(filterBars(bars, '   ', null)).toEqual(bars)
  })

  it('accepts an empty collection', () => {
    expect(filterBars([], '', null)).toEqual([])
  })

  it('searches translated category labels in Portuguese', () => {
    const results = filterBars(getTestBars('pt'), 'pub', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })
})
