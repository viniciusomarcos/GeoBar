'use client'

import { MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'
import { MapPlaceholder } from './components/MapPlaceholder'

const InteractiveMap = dynamic(
  () =>
    import('./components/InteractiveMap').then(
      (module) => module.InteractiveMap
    ),
  { ssr: false, loading: MapPlaceholder }
)

export type BarMapProps = {
  bars: ReadonlyArray<Bar>
  selectedId: string | null
}

export const BarMap = ({ bars, selectedId }: BarMapProps) => {
  const t = useTranslations('Map')

  return (
    <section
      id="bar-map"
      className="map-panel scroll-mt-6"
      aria-label={t('label')}
    >
      <div className="map-heading">
        <Text as="h3" className="flex items-center gap-2 font-semibold">
          <MapPin className="size-4" aria-hidden="true" />
          {t('title')}
        </Text>
      </div>
      <InteractiveMap bars={bars} selectedId={selectedId} />
      <Text className="map-footnote">{t('hint')}</Text>
    </section>
  )
}
