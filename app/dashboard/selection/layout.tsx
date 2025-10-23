import { SelectionSidebar } from "@/components/selection/SelectionSidebar"
import { SelectionHeader } from "@/components/selection/SelectionHeader"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function SelectionDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <SelectionSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Header */}
          <SelectionHeader />

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
