import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/Skeleton'
import { Text } from '@/components/Text'

export const ExplorerSkeleton = () => {
  const t = useTranslations('Explorer')
  return (
    <div role="status" className="explorer-skeleton">
      <Text className="sr-only">{t('loading')}</Text>
      <Skeleton className="skeleton-map" />
      <div className="mt-4 grid gap-5 md:grid-cols-3" aria-hidden="true">
        {[0, 1, 2].map((id) => (
          <div className="skeleton-card" key={id}>
            <div className="space-y-4 p-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
