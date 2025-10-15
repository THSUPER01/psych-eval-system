import { CandidateForm } from "@/components/candidate/candidate-form"

export default function CandidateDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background py-12 px-4">
      <CandidateForm token="demo" />
    </div>
  )
}
