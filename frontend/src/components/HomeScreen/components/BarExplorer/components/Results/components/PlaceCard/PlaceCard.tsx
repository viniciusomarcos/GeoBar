import { MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'
import { useExplorerSearch } from '@/hooks/useExplorerSearch'
import { captureExplorerScroll } from '@/lib/explorerScroll'
import { getBarDetailsHref } from '@/lib/explorerSearch'

export const PlaceCard = ({
  bar,
  onSelect
}: {
  bar: Bar
  onSelect: () => void
}) => {
  const t = useTranslations('Explorer')
  const search = useExplorerSearch()
  const detailsHref = getBarDetailsHref(bar.id, search)

  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return t('distanceMeters', { meters: Math.round(meters) })
    }
    return t('distanceKm', { km: (meters / 1000).toFixed(1) })
  }

  return (
    <article className="place-card">
      <div className="place-card-content">
        <div className="flex flex-wrap items-center gap-2">
          <Text as="span" className="category-badge">
            {bar.category}
          </Text>
          <ShouldRender if={bar.distanceMeters !== undefined}>
            <Text as="span" className="distance-badge">
              {formatDistance(bar.distanceMeters ?? 0)}
            </Text>
          </ShouldRender>
        </div>
        <Text className="mt-4 flex items-center gap-1.5 text-sm text-muted">
          <MapPin aria-hidden="true" className="size-4" />
          {bar.neighborhood}
        </Text>
        <Text as="h3" className="mt-3 text-2xl font-semibold tracking-tight">
          <Pressable
            href={detailsHref}
            onClick={captureExplorerScroll}
            className="place-title-link"
          >
            {bar.name}
          </Pressable>
        </Text>
        <ShouldRender if={Boolean(bar.address)}>
          <Text className="place-address">{bar.address}</Text>
        </ShouldRender>
        <div className="place-actions">
          <Pressable
            href={detailsHref}
            onClick={captureExplorerScroll}
            className="details-link"
          >
            {t('viewDetails')}
          </Pressable>
          <Pressable
            href="#bar-map"
            onClick={onSelect}
            className="view-map-button"
          >
            <MapPin aria-hidden="true" className="size-4" />
            {t('viewOnMap')}
          </Pressable>
        </div>
      </div>
    </article>
  )
}
