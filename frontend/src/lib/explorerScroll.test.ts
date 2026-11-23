import { beforeEach, describe, expect, it, vi } from 'vitest'
import { captureExplorerScroll, consumeExplorerScroll } from './explorerScroll'

beforeEach(() => consumeExplorerScroll(''))

describe('Explorer scroll restoration', () => {
  it('captures the search scroll position and consumes it once on return', () => {
    window.history.replaceState(null, '', '/?q=Quintal')
    vi.stubGlobal('scrollY', 480)
    captureExplorerScroll()
    expect(consumeExplorerScroll('?q=Quintal')).toBe(480)
    expect(consumeExplorerScroll('?q=Quintal')).toBeNull()
  })

  it('restores a saved position after a full reload', () => {
    sessionStorage.setItem(
      'geobar.searchPosition',
      JSON.stringify({ search: '?page=2', top: 1200 })
    )
    expect(consumeExplorerScroll('?page=2')).toBe(1200)
  })

  it('does not overwrite a search position from the details page', () => {
    window.history.replaceState(null, '', '/bars/casa-da-esquina')
    captureExplorerScroll()
    expect(consumeExplorerScroll('')).toBeNull()
  })

  it('keeps a position in memory when storage access is denied', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked')
    })
    vi.stubGlobal('scrollY', 320)
    captureExplorerScroll()
    expect(consumeExplorerScroll('')).toBe(320)
  })

  it.each([
    'null',
    '{',
    '{"search":"","top":-5}',
    '{"search":"other","top":120}',
    '{"search":"","top":"120"}'
  ])('ignores an unusable stored position %s', (stored) => {
    sessionStorage.setItem('geobar.searchPosition', stored)
    expect(consumeExplorerScroll('')).toBeNull()
  })
})
