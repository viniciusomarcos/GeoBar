import { describe, expect, it } from 'vitest'
import places from '../../public/data/bars.json'
import { getDemoBar, getDemoBars, parseDemoBars } from './demoBars'

describe('Demo bar details', () => {
  it('finds each bar by its stable identifier', () => {
    for (const bar of getDemoBars('pt')) {
      expect(getDemoBar(bar.id, 'pt')).toEqual(bar)
      expect(bar.highlights.length).toBeGreaterThan(0)
      expect(bar.story).not.toBe('')
      expect(bar.hours).not.toBe('')
    }
  })

  it('keeps identifiers and coordinates unchanged when details are translated', () => {
    const pt = getDemoBar('quintal-do-sol', 'pt')
    const en = getDemoBar('quintal-do-sol', 'en')

    expect(pt?.id).toBe(en?.id)
    expect(pt?.position).toEqual(en?.position)
    expect(pt?.story).not.toBe(en?.story)
    expect(pt?.hours).not.toBe(en?.hours)
  })

  it('returns no bar for an unknown identifier', () => {
    expect(getDemoBar('missing-place', 'en')).toBeUndefined()
  })

  it('accepts an empty catalog', () => {
    expect(parseDemoBars([], 'en')).toEqual([])
  })

  it.each(
    [
      null,
      'unavailable',
      [null],
      [{ ...places[0], id: 'unknown' }],
      [{ ...places[0], name: ' ' }],
      [{ ...places[0], neighborhood: null }],
      [{ ...places[0], illustration: null }],
      [{ ...places[0], illustration: 'unknown' }],
      [{ ...places[0], position: null }],
      [{ ...places[0], position: [0] }],
      [{ ...places[0], position: ['0', 0] }],
      [{ ...places[0], position: [Infinity, 0] }],
      [{ ...places[0], position: [0, 181] }]
    ].map((payload) => ({ payload }))
  )('rejects malformed catalog data %#', ({ payload }) => {
    expect(() => parseDemoBars(payload, 'en')).toThrow(
      'Invalid demo bar catalog'
    )
  })

  it('rejects duplicate marker identifiers', () => {
    expect(() => parseDemoBars([places[0], places[0]], 'en')).toThrow(
      'Duplicate demo bar identifiers'
    )
  })
})
