import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Pressable } from '@/components/Pressable'
import { ShouldRender } from '@/components/ShouldRender'
import { Text } from '@/components/Text'

const COLLAPSED_LIMIT = 6

type NeighborhoodFiltersProps = {
  neighborhoods: ReadonlyArray<string>
  selected: string | null
  onSelect: (neighborhood: string | null) => void
}

const getVisibleNeighborhoods = (
  neighborhoods: ReadonlyArray<string>,
  selected: string | null,
  expanded: boolean
): ReadonlyArray<string> => {
  if (expanded || neighborhoods.length <= COLLAPSED_LIMIT) {
    return neighborhoods
  }
  const preview = neighborhoods.slice(0, COLLAPSED_LIMIT)
  if (selected === null || preview.includes(selected)) {
    return preview
  }
  if (!neighborhoods.includes(selected)) {
    return preview
  }
  return [selected, ...preview.slice(0, COLLAPSED_LIMIT - 1)]
}

export const NeighborhoodFilters = ({
  neighborhoods,
  selected,
  onSelect
}: NeighborhoodFiltersProps) => {
  const t = useTranslations('Explorer')
  const [expanded, setExpanded] = useState(false)
  const canExpand = neighborhoods.length > COLLAPSED_LIMIT
  const visible = getVisibleNeighborhoods(neighborhoods, selected, expanded)
  const hiddenCount = neighborhoods.length - visible.length

  return (
    <fieldset className="neighborhood-bar">
      <Text as="legend" className="sr-only">
        {t('neighborhoods')}
      </Text>
      <div className={expanded ? 'neighborhood-panel' : 'neighborhood-row'}>
        <Pressable
          aria-pressed={selected === null}
          onClick={() => onSelect(null)}
          className="filter-chip"
        >
          {t('allNeighborhoods')}
        </Pressable>
        {visible.map((neighborhood) => (
          <Pressable
            key={neighborhood}
            aria-pressed={selected === neighborhood}
            onClick={() => onSelect(neighborhood)}
            className="filter-chip"
          >
            {neighborhood}
          </Pressable>
        ))}
        <ShouldRender if={canExpand}>
          <Pressable
            aria-expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
            className="neighborhood-toggle"
          >
            <ShouldRender if={!expanded}>
              <ChevronDown aria-hidden="true" className="size-4" />
              {t('showAllNeighborhoods', { count: hiddenCount })}
            </ShouldRender>
            <ShouldRender if={expanded}>
              <ChevronUp aria-hidden="true" className="size-4" />
              {t('hideNeighborhoods')}
            </ShouldRender>
          </Pressable>
        </ShouldRender>
      </div>
    </fieldset>
  )
}
