import { Header } from "@/components/layout/header"
import { CaseForm } from "@/components/cases/case-form"

export default function NewCasePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <CaseForm mode="create" />
    </div>
  )
}
