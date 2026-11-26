import { describe, expect, it } from 'vitest'
import { extractBarMetadata } from './barMetadata'

describe('extractBarMetadata', () => {
  it('extracts Comida di Buteco badge, contacts, links, cuisine, and amenities', () => {
    const info = extractBarMetadata({
      dataset: 'comida_di_buteco_2026',
      description: 'Clássico de esquina em BH',
      phone: '+55 31 3222-0000',
      website: 'https://www.barclassico.com.br/cardapio',
      instagram: '@bar.classico',
      cuisine: 'brazilian;petiscos_mineiros',
      outdoor_seating: 'yes',
      wheelchair: 'yes',
      internet_access: 'wlan'
    })

    expect(info).toEqual({
      isComidaDiButeco: true,
      description: 'Clássico de esquina em BH',
      phone: '+55 31 3222-0000',
      websiteUrl: 'https://www.barclassico.com.br/cardapio',
      websiteLabel: 'barclassico.com.br',
      instagramUrl: 'https://instagram.com/bar.classico',
      instagramHandle: '@bar.classico',
      cuisine: 'brazilian, petiscos mineiros',
      amenities: {
        outdoorSeating: true,
        wheelchair: true,
        wifi: true
      }
    })
  })

  it('normalizes full Instagram URLs and ignores invalid protocols or handles', () => {
    const fromUrl = extractBarMetadata({
      instagram: 'https://instagram.com/boteco_bh/',
      website: 'javascript:alert(1)'
    })
    expect(fromUrl.instagramUrl).toBe('https://instagram.com/boteco_bh')
    expect(fromUrl.instagramHandle).toBe('@boteco_bh')
    expect(fromUrl.websiteUrl).toBeNull()

    const invalid = extractBarMetadata({
      instagram: 'https://instagram.com/',
      website: 'not-a-url',
      cuisine: ' ; '
    })
    expect(invalid.instagramUrl).toBeNull()
    expect(invalid.websiteUrl).toBeNull()
    expect(invalid.cuisine).toBeNull()

    const badHandle = extractBarMetadata({
      instagram: 'invalid handle!!'
    })
    expect(badHandle.instagramUrl).toBeNull()
  })

  it('returns empty defaults for sparse or non-string metadata', () => {
    const empty = extractBarMetadata({
      phone: 12345,
      description: '   ',
      outdoor_seating: 'no',
      wheelchair: 'no',
      internet_access: 'no'
    })

    expect(empty).toEqual({
      isComidaDiButeco: false,
      description: null,
      phone: null,
      websiteUrl: null,
      websiteLabel: null,
      instagramUrl: null,
      instagramHandle: null,
      cuisine: null,
      amenities: {
        outdoorSeating: false,
        wheelchair: false,
        wifi: false
      }
    })
  })
})
