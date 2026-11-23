import { act, renderHook } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Text } from '@/components/Text'
import { updateExplorerSearch, useExplorerSearch } from './useExplorerSearch'

describe('Explorer navigation', () => {
  it('keeps the server snapshot deterministic before reading browser filters', () => {
    window.history.replaceState(null, '', '/?q=Quintal')
    const SearchSnapshot = () => (
      <Text>{useExplorerSearch().query || 'All bars'}</Text>
    )
    expect(renderToString(<SearchSnapshot />)).toContain('All bars')
  })
  it('publishes search updates while keeping the current anchor', () => {
    window.history.replaceState(null, '', '/#explore')
    const { result } = renderHook(useExplorerSearch)

    act(() =>
      updateExplorerSearch({ query: 'Balcão', neighborhood: 'Floresta' })
    )

    expect(result.current.query).toBe('Balcão')
    expect(result.current.neighborhood).toBe('Floresta')
    expect(window.location.hash).toBe('#explore')
    expect(new URLSearchParams(window.location.search).get('q')).toBe('Balcão')
  })

  it('replaces an invalid page without adding another history entry', () => {
    window.history.replaceState(null, '', '/?page=99')
    const { result } = renderHook(useExplorerSearch)
    const length = window.history.length

    act(() => updateExplorerSearch({ page: 2 }, { replace: true }))

    expect(result.current.page).toBe(2)
    expect(window.history.length).toBe(length)
  })

  it('restores filters on a browser history event', () => {
    const { result } = renderHook(useExplorerSearch)
    act(() => {
      window.history.replaceState(null, '', '/?q=Quintal')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current.query).toBe('Quintal')
    expect(result.current.page).toBe(1)
  })
})
