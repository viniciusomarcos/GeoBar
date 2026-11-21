import { DomEvent, latLngBounds } from 'leaflet'
import { LocateFixed, Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import { Pressable } from '@/components/Pressable'
import type { BarMapProps } from '../../../../BarMap'
import { cityCenter } from '../../mapConfig'

export const MapControls = ({ bars }: Pick<BarMapProps, 'bars'>) => {
  const map = useMap()
  const t = useTranslations('Map')
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controls = container.current
    if (!controls) {
      return
    }
    DomEvent.disableClickPropagation(controls)
    DomEvent.disableScrollPropagation(controls)
  }, [])
  const resetView = () => {
    if (bars.length === 0) {
      map.setView(cityCenter, 13)
      return
    }
    map.fitBounds(
      latLngBounds(bars.map((bar) => [bar.position[0], bar.position[1]])),
      { padding: [48, 48], maxZoom: 15 }
    )
  }

  return (
    <div className="map-controls" ref={container}>
      <Pressable
        className="icon-button"
        aria-label={t('zoomIn')}
        title={t('zoomIn')}
        onClick={() => map.zoomIn()}
      >
        <Plus className="size-5" aria-hidden="true" />
      </Pressable>
      <Pressable
        className="icon-button"
        aria-label={t('zoomOut')}
        title={t('zoomOut')}
        onClick={() => map.zoomOut()}
      >
        <Minus className="size-5" aria-hidden="true" />
      </Pressable>
      <Pressable
        className="icon-button"
        aria-label={t('reset')}
        title={t('reset')}
        onClick={resetView}
      >
        <LocateFixed className="size-5" aria-hidden="true" />
      </Pressable>
    </div>
  )
}
