import { Header } from "@/components/layout/header"
import { CaseDetailContent } from "@/components/cases/case-detail-content"

interface CaseDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CaseDetailContent caseId={id} />
    </div>
  )
}
