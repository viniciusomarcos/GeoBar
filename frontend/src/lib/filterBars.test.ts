import { describe, expect, it } from 'vitest'
import { getDemoBars } from '@/data/demoBars'
import { filterBars } from './filterBars'

const demoBars = getDemoBars('en')

describe('filterBars', () => {
  it('returns all places when no filters are applied', () => {
    expect(filterBars(demoBars, '', null)).toEqual(demoBars)
  })

  it('matches names regardless of case or surrounding whitespace', () => {
    const results = filterBars(demoBars, '  CASA  ', null)

    expect(results.map((bar) => bar.name)).toEqual(['Casa da Esquina'])
  })

  it('matches accented names when the search omits accents', () => {
    const results = filterBars(demoBars, 'balcao', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })

  it('matches neighborhood names in the search query', () => {
    const results = filterBars(demoBars, 'savassi', null)

    expect(results.map((bar) => bar.name)).toEqual(['Quintal do Sol'])
  })

  it('matches the atmosphere of a place', () => {
    const results = filterBars(demoBars, 'live music', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })

  it('limits results to the selected neighborhood', () => {
    const results = filterBars(demoBars, '', 'Santa Tereza')

    expect(results.map((bar) => bar.name)).toEqual(['Casa da Esquina'])
  })

  it('combines the search query and neighborhood filter', () => {
    expect(filterBars(demoBars, 'quintal', 'Savassi')).toEqual([demoBars[1]])
    expect(filterBars(demoBars, 'quintal', 'Floresta')).toEqual([])
  })

  it('returns no places when the query has no matches', () => {
    expect(filterBars(demoBars, 'missing place', null)).toEqual([])
  })

  it('treats a whitespace-only query as an empty search', () => {
    expect(filterBars(demoBars, '   ', null)).toEqual(demoBars)
  })

  it('accepts an empty collection', () => {
    expect(filterBars([], '', null)).toEqual([])
  })

  it('searches translated atmosphere labels in Portuguese', () => {
    const results = filterBars(getDemoBars('pt'), 'musica ao vivo', null)

    expect(results.map((bar) => bar.name)).toEqual(['Balcão da Prosa'])
  })
})
