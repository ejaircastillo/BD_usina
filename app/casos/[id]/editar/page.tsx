import { Header } from "@/components/layout/header"
import { CaseForm } from "@/components/cases/case-form"

interface EditCasePageProps {
  params: {
    id: string
  }
}

export default function EditCasePage({ params }: EditCasePageProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CaseForm mode="edit" caseId={params.id} />
    </div>
  )
}
