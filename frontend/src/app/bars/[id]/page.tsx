import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { BarDetailsScreen } from '@/components/BarDetailsScreen'
import { getDemoBar } from '@/data/demoBars'
import { loadApiBar } from '@/data/loadApiBars'
import { defaultLocale } from '@/i18n/config'

type BarPageProps = { params: Promise<{ id: string }> }

const findBar = async (id: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return loadApiBar(apiUrl, id, defaultLocale)
  }
  return getDemoBar(id, defaultLocale)
}

const BarDetailsPage = async ({ params }: BarPageProps) => {
  // API identifiers and uncached details must be resolved at request time.
  await connection()
  const { id } = await params
  const bar = await findBar(id)
  if (!bar) {
    notFound()
  }
  return <BarDetailsScreen bar={bar} />
}

export default BarDetailsPage
