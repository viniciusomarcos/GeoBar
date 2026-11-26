import { useTranslations } from 'next-intl'
import { ShouldRender } from '@/components/ShouldRender'
import type { Bar } from '@/data/bar'
import { EmptyState } from './components/EmptyState'
import { PlaceCard } from './components/PlaceCard'

type ResultsProps = {
  bars: ReadonlyArray<Bar>
  onSelect: (id: string) => void
}

export const Results = ({ bars, onSelect }: ResultsProps) => {
  const t = useTranslations('Explorer')

  return (
    <ShouldRender if={bars.length > 0} fallback={<EmptyState />}>
      <ul aria-label={t('places')} className="mt-4 grid gap-5 md:grid-cols-3">
        {bars.map((bar) => (
          <li key={bar.id}>
            <PlaceCard bar={bar} onSelect={() => onSelect(bar.id)} />
          </li>
        ))}
      </ul>
    </ShouldRender>
  )
}
