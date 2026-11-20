import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Text } from '@/components/Text'

export const EmptyState = () => {
  const t = useTranslations('Explorer')

  return (
    <div className="empty-state">
      <Search aria-hidden="true" className="mx-auto size-8 text-muted" />
      <Text as="h3" className="mt-4 text-2xl font-semibold">
        {t('emptyTitle')}
      </Text>
      <Text className="mt-2 text-muted">{t('emptyDescription')}</Text>
    </div>
  )
}
