import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { MapContainer, TileLayer } from 'react-leaflet'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { BarMapProps } from '../../BarMap'
import { MapControls } from './components/MapControls'
import { MapViewport } from './components/MapViewport'
import { PlaceMarker } from './components/PlaceMarker'
import { cityCenter } from './mapConfig'

export const InteractiveMap = ({ bars, selectedId }: BarMapProps) => {
  const t = useTranslations('Map')
  const [tileError, setTileError] = useState(false)

  return (
    <div className="map-canvas">
      <MapContainer
        center={cityCenter}
        zoom={13}
        minZoom={11}
        maxZoom={19}
        scrollWheelZoom={false}
        zoomControl={false}
        className="bar-map"
        aria-label={t('label')}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          eventHandlers={{
            tileerror: () => setTileError(true),
            tileload: () => setTileError(false)
          }}
        />
        <MapViewport bars={bars} />
        <MapControls bars={bars} />
        {bars.map((bar) => (
          <PlaceMarker
            key={bar.id}
            bar={bar}
            selected={bar.id === selectedId}
          />
        ))}
      </MapContainer>
      <ShouldRender if={tileError}>
        <Text className="map-notice" role="alert">
          {t('unavailable')}
        </Text>
      </ShouldRender>
    </div>
  )
}
