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

  return (
    <article className="place-card">
      <div className="place-card-content">
        <Text as="span" className="category-badge">
          {bar.category}
        </Text>
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
