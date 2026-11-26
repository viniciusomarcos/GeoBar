import { afterEach, describe, expect, it, vi } from 'vitest'
import { getApiUrl } from './apiConfig'

afterEach(() => vi.unstubAllEnvs())

describe('API configuration', () => {
  it('uses the public backend when no override is configured', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', undefined)
    expect(getApiUrl()).toBe('https://geobar-api.onrender.com')
  })

  it('uses a configured backend URL', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://127.0.0.1:8000')
    expect(getApiUrl()).toBe('http://127.0.0.1:8000')
  })

  it('keeps using real data when the override is empty', () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '')
    expect(getApiUrl()).toBe('https://geobar-api.onrender.com')
  })
})
