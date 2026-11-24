import { notFound } from 'next/navigation'
import { BarDetailsScreen } from '@/components/BarDetailsScreen'
import { getDemoBar, getDemoBars } from '@/data/demoBars'
import { loadApiBar } from '@/data/loadApiBars'
import { defaultLocale } from '@/i18n/config'

type BarPageProps = { params: Promise<{ id: string }> }

// Bares vindos da API não são conhecidos no build, então a página
// precisa aceitar ids que não foram gerados com antecedência.
export const dynamicParams = true

export const generateStaticParams = () =>
  getDemoBars(defaultLocale).map(({ id }) => ({ id }))

const findBar = async (id: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (apiUrl) {
    return loadApiBar(apiUrl, id, defaultLocale)
  }
  return getDemoBar(id, defaultLocale)
}

const BarDetailsPage = async ({ params }: BarPageProps) => {
  const { id } = await params
  const bar = await findBar(id)
  if (!bar) {
    notFound()
  }
  return <BarDetailsScreen bar={bar} />
}

export default BarDetailsPage
