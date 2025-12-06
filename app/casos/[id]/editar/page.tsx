import { Header } from "@/components/layout/header"
import { CaseForm } from "@/components/cases/case-form"

interface EditCasePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const { id } = await params

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CaseForm mode="edit" caseId={id} />
    </div>
  )
}
