import { MapPin } from 'lucide-react'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'
import type { Bar } from '@/data/bar'

export const BarOverview = ({ bar }: { bar: Bar }) => {
  return (
    <section className="bar-overview" aria-labelledby="bar-title">
      <div className="bar-overview-copy">
        <Text className="location-label">
          <MapPin aria-hidden="true" className="size-4" />
          {bar.neighborhood}
        </Text>
        <Text as="h1" id="bar-title" className="bar-title">
          {bar.name}
        </Text>
        <ShouldRender if={Boolean(bar.address)}>
          <Text className="bar-description">{bar.address}</Text>
        </ShouldRender>
        <Text as="span" className="category-badge mt-5">
          {bar.category}
        </Text>
      </div>
    </section>
  )
}
