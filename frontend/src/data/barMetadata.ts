export type BarAmenities = Readonly<{
  outdoorSeating: boolean
  wheelchair: boolean
  wifi: boolean
}>

export type BarMetadataInfo = Readonly<{
  isComidaDiButeco: boolean
  description: string | null
  phone: string | null
  websiteUrl: string | null
  websiteLabel: string | null
  instagramUrl: string | null
  instagramHandle: string | null
  cuisine: string | null
  amenities: BarAmenities
}>

const readText = (
  metadata: Record<string, unknown>,
  key: string
): string | null => {
  const value = metadata[key]
  if (typeof value !== 'string') {
    return null
  }
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

const parseSafeHttpUrl = (raw: string | null): URL | null => {
  if (!raw) {
    return null
  }
  try {
    const parsed = new URL(raw)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const parseInstagram = (
  raw: string | null
): { url: string | null; handle: string | null } => {
  if (!raw) {
    return { url: null, handle: null }
  }
  const parsedUrl = parseSafeHttpUrl(raw)
  if (parsedUrl) {
    const segment = parsedUrl.pathname.split('/').filter(Boolean)[0]
    if (!segment) {
      return { url: null, handle: null }
    }
    return {
      url: `https://instagram.com/${segment}`,
      handle: `@${segment}`
    }
  }
  const handle = raw.replace(/^@+/, '').trim()
  if (!/^[a-zA-Z0-9._]+$/.test(handle)) {
    return { url: null, handle: null }
  }
  return {
    url: `https://instagram.com/${handle}`,
    handle: `@${handle}`
  }
}

const formatCuisine = (raw: string | null): string | null => {
  if (!raw) {
    return null
  }
  const items = raw
    .split(/[;,]/)
    .map((item) => item.trim().replace(/_/g, ' '))
    .filter(Boolean)
  return items.length > 0 ? items.join(', ') : null
}

const isPositiveFlag = (
  raw: string | null,
  accepted: ReadonlyArray<string>
): boolean => {
  if (!raw) {
    return false
  }
  return accepted.includes(raw.toLowerCase())
}

export const extractBarMetadata = (
  metadata: Record<string, unknown>
): BarMetadataInfo => {
  const website = parseSafeHttpUrl(readText(metadata, 'website'))
  const instagram = parseInstagram(readText(metadata, 'instagram'))

  return {
    isComidaDiButeco: readText(metadata, 'dataset') === 'comida_di_buteco_2026',
    description: readText(metadata, 'description'),
    phone: readText(metadata, 'phone'),
    websiteUrl: website ? website.toString() : null,
    websiteLabel: website ? website.hostname.replace(/^www\./, '') : null,
    instagramUrl: instagram.url,
    instagramHandle: instagram.handle,
    cuisine: formatCuisine(readText(metadata, 'cuisine')),
    amenities: {
      outdoorSeating: isPositiveFlag(readText(metadata, 'outdoor_seating'), [
        'yes'
      ]),
      wheelchair: isPositiveFlag(readText(metadata, 'wheelchair'), [
        'yes',
        'limited'
      ]),
      wifi: isPositiveFlag(readText(metadata, 'internet_access'), [
        'yes',
        'wlan',
        'free'
      ])
    }
  }
}
