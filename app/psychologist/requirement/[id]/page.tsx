import { DashboardHeader } from "@/components/psychologist/dashboard-header"
import { RequirementDetails } from "@/components/psychologist/requirement-details"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function RequirementDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/psychologist/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Link>
        </Button>
        <RequirementDetails requirementId={params.id} />
      </main>
    </div>
  )
}
