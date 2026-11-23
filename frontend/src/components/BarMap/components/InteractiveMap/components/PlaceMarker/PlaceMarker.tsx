import type { Marker as LeafletMarker } from 'leaflet'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { Marker, Popup, useMap } from 'react-leaflet'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import type { DemoBar } from '@/data/demoBars'
import { useExplorerSearch } from '@/hooks/useExplorerSearch'
import { captureExplorerScroll } from '@/lib/explorerScroll'
import { getBarDetailsHref } from '@/lib/explorerSearch'
import { placeIcon } from '../../mapConfig'

export const PlaceMarker = ({
  bar,
  selected
}: {
  bar: DemoBar
  selected: boolean
}) => {
  const marker = useRef<LeafletMarker>(null)
  const t = useTranslations('Explorer')
  const map = useMap()
  const search = useExplorerSearch()
  useEffect(() => {
    if (!selected) {
      return
    }
    map.setView([bar.position[0], bar.position[1]], 15, { animate: false })
    marker.current?.openPopup()
  }, [bar.position, selected, map])

  return (
    <Marker
      ref={marker}
      position={[bar.position[0], bar.position[1]]}
      icon={placeIcon}
      title={bar.name}
      alt={bar.name}
    >
      <Popup closeButton={false}>
        <Text as="strong" className="map-popup-title">
          {bar.name}
        </Text>
        <Text className="map-popup-neighborhood">
          {bar.neighborhood} · {bar.atmosphere}
        </Text>
        <Text className="map-popup-description">{bar.description}</Text>
        <Pressable
          href={getBarDetailsHref(bar.id, search)}
          onClick={captureExplorerScroll}
          className="details-link map-popup-link"
        >
          {t('viewDetails')}
        </Pressable>
      </Popup>
    </Marker>
  )
}
