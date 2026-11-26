import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Locale } from '@/i18n/config'
import { apiBars as places } from '@/test/bars'
import { useBarCatalog } from './useBarCatalog'

const response = (): Response =>
  ({ ok: true, json: async () => places }) as Response

describe('Bar catalog requests', () => {
  it('waits for a response and recovers from a failed request on retry', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Offline'))
    const { result } = renderHook(() => useBarCatalog('en'))
    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('error'))

    act(() => result.current.retry())

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.bars).toHaveLength(3)
  })

  it('ignores an outdated response after changing language', async () => {
    const pending = Promise.withResolvers<Response>()
    vi.mocked(fetch).mockReturnValueOnce(pending.promise)
    const view = renderHook(
      ({ locale }: { locale: Locale }) => useBarCatalog(locale),
      { initialProps: { locale: 'en' } }
    )
    view.rerender({ locale: 'pt' })
    await waitFor(() => expect(view.result.current.status).toBe('success'))

    await act(async () => pending.resolve(response()))

    expect(view.result.current.bars[0].category).toBe('Bar')
  })

  it('ignores errors from an aborted request', async () => {
    const pending = Promise.withResolvers<Response>()
    vi.mocked(fetch).mockReturnValueOnce(pending.promise)
    const view = renderHook(
      ({ locale }: { locale: Locale }) => useBarCatalog(locale),
      { initialProps: { locale: 'en' } }
    )
    view.rerender({ locale: 'pt' })
    await waitFor(() => expect(view.result.current.status).toBe('success'))

    await act(async () => pending.reject(new Error('Aborted')))

    expect(view.result.current.status).toBe('success')
  })
})
