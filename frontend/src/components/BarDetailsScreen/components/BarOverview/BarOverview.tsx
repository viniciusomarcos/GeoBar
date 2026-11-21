import { Beer, MapPin, Music2, TreePine } from 'lucide-react'
import { Text } from '@/components/Text'
import type { DemoBar } from '@/data/demoBars'

const illustrations = { beer: Beer, garden: TreePine, music: Music2 }

export const BarOverview = ({ bar }: { bar: DemoBar }) => {
  const Illustration = illustrations[bar.illustration]

  return (
    <section className="bar-overview" aria-labelledby="bar-title">
      <div className="bar-overview-copy">
        <Text className="location-label">
          <MapPin aria-hidden="true" className="size-4" />
          {bar.neighborhood} · Belo Horizonte
        </Text>
        <Text as="h1" id="bar-title" className="bar-title">
          {bar.name}
        </Text>
        <Text className="bar-description">{bar.description}</Text>
        <Text className="bar-atmosphere">{bar.atmosphere}</Text>
      </div>
      <div
        className={`bar-overview-art place-art-${bar.illustration}`}
        aria-hidden="true"
      >
        <Illustration strokeWidth={1.1} />
        <Text as="span" className="bar-art-label">
          {bar.neighborhood}
        </Text>
      </div>
    </section>
  )
}
