import { Outlet } from "react-router-dom"
import { SelectionSidebar } from "@/components/selection/SelectionSidebar"
import { SelectionHeader } from "@/components/selection/SelectionHeader"

export default function SelectionLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <SelectionSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Header */}
        <SelectionHeader />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
