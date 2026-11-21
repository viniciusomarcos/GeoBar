import { describe, expect, it } from 'vitest'
import { getDemoBar, getDemoBars } from './demoBars'

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
})
