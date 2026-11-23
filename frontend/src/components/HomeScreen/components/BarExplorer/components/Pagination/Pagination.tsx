import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Pressable } from '@/components/Pressable'
import { Text } from '@/components/Text'
import { resultsPerPage } from '@/lib/explorerSearch'

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  onPageChange: (page: number) => void
}

export const Pagination = ({
  page,
  totalPages,
  total,
  onPageChange
}: PaginationProps) => {
  const t = useTranslations('Explorer')
  return (
    <nav aria-label={t('pagination')} className="pagination">
      <Text className="pagination-range">
        {t('range', {
          start: (page - 1) * resultsPerPage + 1,
          end: Math.min(page * resultsPerPage, total),
          total
        })}
      </Text>
      <div className="pagination-actions">
        <Pressable
          className="pagination-button"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label={t('previousPage')}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
        </Pressable>
        <Text>{t('page', { page, totalPages })}</Text>
        <Pressable
          className="pagination-button"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label={t('nextPage')}
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </Pressable>
      </div>
    </nav>
  )
}
