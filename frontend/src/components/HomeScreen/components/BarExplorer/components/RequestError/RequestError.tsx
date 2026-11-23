import { CircleAlert, RotateCw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'

export const RequestError = ({ onRetry }: { onRetry: () => void }) => {
  const t = useTranslations('Explorer')
  return (
    <div className="empty-state request-error">
      <CircleAlert aria-hidden="true" className="mx-auto size-8" />
      <Text as="h3" className="mt-4 text-2xl font-semibold">
        {t('errorTitle')}
      </Text>
      <Text className="mt-2 text-muted">{t('errorDescription')}</Text>
      <Pressable className="button button-dark mt-6" onClick={onRetry}>
        <RotateCw aria-hidden="true" className="size-4" />
        {t('retry')}
      </Pressable>
    </div>
  )
}
