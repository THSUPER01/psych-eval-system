import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardHeader } from '@/components/psychologist/dashboard-header'
import { RequirementsList } from '@/components/psychologist/requirements-list'
import { CreateRequirementDialog } from '@/components/psychologist/create-requirement-dialog'

export default function PsychologistDashboard() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Dashboard de Requerimientos</h1>
              <p className="text-muted-foreground">Gestiona tus evaluaciones y candidatos</p>
            </div>
            <CreateRequirementDialog />
          </div>
          <RequirementsList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
