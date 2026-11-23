import { describe, expect, it, vi } from 'vitest'
import places from '../../public/data/bars.json'
import { getDemoBars } from './demoBars'
import { loadDemoBars } from './loadDemoBars'

describe('Demo catalog requests', () => {
  it('loads the static catalog in the requested language with cancellation support', async () => {
    const controller = new AbortController()
    expect(await loadDemoBars('pt', controller.signal)).toEqual(
      getDemoBars('pt')
    )
    expect(fetch).toHaveBeenCalledWith(
      '/data/bars.json',
      expect.objectContaining({ signal: controller.signal, cache: 'no-store' })
    )
  })

  it('rejects failed responses instead of presenting them as empty results', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)
    await expect(
      loadDemoBars('en', new AbortController().signal)
    ).rejects.toThrow('Unable to load')
  })

  it('rejects a catalog that cannot be parsed', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ error: 'Unavailable' })
    } as Response)
    await expect(
      loadDemoBars('en', new AbortController().signal)
    ).rejects.toThrow('Invalid demo')
  })

  it('rejects unsupported coordinates, illustrations, and missing required fields', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [{ ...places[0], position: [91, 0] }]
    } as Response)
    await expect(
      loadDemoBars('en', new AbortController().signal)
    ).rejects.toThrow('Invalid demo')
  })
})
