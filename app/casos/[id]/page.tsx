import { Header } from "@/components/layout/header"
import { CaseDetailContent } from "@/components/cases/case-detail-content"

interface CaseDetailPageProps {
  params: {
    id: string
  }
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CaseDetailContent caseId={params.id} />
    </div>
  )
}
