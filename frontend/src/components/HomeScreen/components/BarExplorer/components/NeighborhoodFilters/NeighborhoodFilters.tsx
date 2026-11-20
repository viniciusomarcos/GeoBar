import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

type NeighborhoodFiltersProps = {
  neighborhoods: ReadonlyArray<string>
  selected: string | null
  onSelect: (neighborhood: string | null) => void
}

export const NeighborhoodFilters = ({
  neighborhoods,
  selected,
  onSelect
}: NeighborhoodFiltersProps) => {
  const t = useTranslations('Explorer')

  return (
    <fieldset className="mt-6 flex flex-wrap gap-2">
      <Text as="legend" className="sr-only">
        {t('neighborhoods')}
      </Text>
      <Pressable
        aria-pressed={selected === null}
        onClick={() => onSelect(null)}
        className="filter-chip"
      >
        {t('allNeighborhoods')}
      </Pressable>
      {neighborhoods.map((neighborhood) => (
        <Pressable
          key={neighborhood}
          aria-pressed={selected === neighborhood}
          onClick={() => onSelect(neighborhood)}
          className="filter-chip"
        >
          {neighborhood}
        </Pressable>
      ))}
    </fieldset>
  )
}
