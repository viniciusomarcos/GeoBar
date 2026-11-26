import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { BarDetailsScreen } from '@/components/BarDetailsScreen'
import { getApiUrl } from '@/data/apiConfig'
import { loadApiBar } from '@/data/loadApiBars'
import { defaultLocale } from '@/i18n/config'

type BarPageProps = { params: Promise<{ id: string }> }

const BarDetailsPage = async ({ params }: BarPageProps) => {
  // API identifiers and uncached details must be resolved at request time.
  await connection()
  const { id } = await params
  const bar = await loadApiBar(getApiUrl(), id, defaultLocale)
  if (!bar) {
    notFound()
  }
  return <BarDetailsScreen bar={bar} />
}

export default BarDetailsPage
