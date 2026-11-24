import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadApiBar, loadApiBars, parseApiBars } from './loadApiBars'
import { loadDemoBars } from './loadDemoBars'

const apiBar = {
  id: 7,
  name: 'Bar do Zé',
  address: 'Rua da Bahia, 100, Centro',
  neighborhood: 'Centro',
  category: 'buteco',
  source: 'legacy_csv',
  metadata: { opening_hours: 'Mo-Sa 17:00-23:00' },
  latitude: -19.92,
  longitude: -43.94
}

const respondWith = (body: unknown, ok = true) =>
  vi.mocked(fetch).mockResolvedValue({
    ok,
    json: async () => body
  } as Response)

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('API catalog requests', () => {
  it('loads every bar from the API with cancellation support', async () => {
    respondWith([apiBar])
    const controller = new AbortController()
    const bars = await loadApiBars('http://api.test/', 'pt', controller.signal)
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/bars/all',
      expect.objectContaining({ signal: controller.signal, cache: 'no-store' })
    )
    expect(bars).toEqual([
      {
        id: '7',
        name: 'Bar do Zé',
        neighborhood: 'Centro',
        description: 'Buteco em Centro.',
        atmosphere: 'Buteco',
        story: 'Rua da Bahia, 100, Centro',
        highlights: ['Buteco'],
        hours: 'Mo-Sa 17:00-23:00',
        illustration: 'beer',
        position: [-19.92, -43.94]
      }
    ])
  })

  it('fills in missing details with readable placeholders', () => {
    const bars = parseApiBars(
      [
        {
          ...apiBar,
          address: null,
          neighborhood: null,
          category: 'biergarten',
          metadata: {}
        }
      ],
      'en'
    )
    expect(bars[0]).toMatchObject({
      neighborhood: 'Neighborhood not informed',
      description: 'Beer garden in Belo Horizonte.',
      story: 'Address not informed',
      hours: 'Hours not informed',
      illustration: 'garden'
    })
  })

  it('uses the generic label for unknown categories', () => {
    const bars = parseApiBars([{ ...apiBar, category: 'karaoke' }], 'pt')
    expect(bars[0]).toMatchObject({ atmosphere: 'Bar' })
  })

  it('rejects failed responses', async () => {
    respondWith([], false)
    await expect(
      loadApiBars('http://api.test', 'pt', new AbortController().signal)
    ).rejects.toThrow('Unable to load')
  })

  it('rejects payloads that are not a list of bars', () => {
    expect(() => parseApiBars({ items: [] }, 'pt')).toThrow('Invalid API')
    expect(() => parseApiBars([{ ...apiBar, latitude: 'x' }], 'pt')).toThrow(
      'Invalid API'
    )
  })

  it('switches the catalog to the API when NEXT_PUBLIC_API_URL is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.test')
    respondWith([apiBar])
    const bars = await loadDemoBars('pt', new AbortController().signal)
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/bars/all',
      expect.anything()
    )
    expect(bars).toHaveLength(1)
  })
})

describe('API bar details requests', () => {
  it('loads a single bar by its numeric identifier', async () => {
    respondWith(apiBar)
    const bar = await loadApiBar('http://api.test', '7', 'pt')
    expect(fetch).toHaveBeenCalledWith(
      'http://api.test/bars/7',
      expect.objectContaining({ cache: 'no-store' })
    )
    expect(bar).toMatchObject({ id: '7', name: 'Bar do Zé' })
  })

  it('treats identifiers that are not numbers as missing without a request', async () => {
    vi.mocked(fetch).mockClear()
    expect(await loadApiBar('http://api.test', 'casa-da-esquina', 'pt')).toBe(
      undefined
    )
    expect(fetch).not.toHaveBeenCalled()
  })

  it('treats a 404 response as a missing bar', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 404 } as Response)
    expect(await loadApiBar('http://api.test', '999', 'pt')).toBe(undefined)
  })

  it('rejects server errors and invalid payloads', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response)
    await expect(loadApiBar('http://api.test', '7', 'pt')).rejects.toThrow(
      'Unable to load'
    )
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'x' })
    } as Response)
    await expect(loadApiBar('http://api.test', '7', 'pt')).rejects.toThrow(
      'Invalid API bar'
    )
  })
})
