import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { FormEventHandler } from 'react'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

type SearchFormProps = {
  query: string
  onQueryChange: (query: string) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

export const SearchForm = ({
  query,
  onQueryChange,
  onSubmit
}: SearchFormProps) => {
  const t = useTranslations('Explorer')

  return (
    <form
      onSubmit={onSubmit}
      className="search-form"
      aria-label={t('formLabel')}
    >
      <Search aria-hidden="true" className="size-5 shrink-0 text-muted" />
      <Text as="label" htmlFor="bar-search" className="sr-only">
        {t('inputLabel')}
      </Text>
      <input
        id="bar-search"
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={t('placeholder')}
        className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none"
      />
      <Pressable type="submit" className="button button-dark search-button">
        {t('search')}
      </Pressable>
    </form>
  )
}
