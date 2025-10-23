"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  FolderKanban,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard/selection", icon: LayoutDashboard },
  { name: "Requerimientos", href: "/dashboard/selection/requerimientos", icon: FolderKanban },
  { name: "Candidatos", href: "/dashboard/selection/candidatos", icon: Users },
  { name: "Pruebas", href: "/dashboard/selection/pruebas", icon: ClipboardList },
  { name: "Asignaciones", href: "/dashboard/selection/asignaciones", icon: FileText },
  { name: "Resultados", href: "/dashboard/selection/resultados", icon: BarChart3 },
]

const adminNavigation = [
  { name: "Gestión de Usuarios", href: "/dashboard/selection/admin/usuarios", icon: Shield, adminOnly: true },
]

export function SelectionSidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()

  const isAdmin = useMemo(() => {
    return user?.RolApp === "66" || user?.RolApp === 66
  }, [user])

  const allNavigation = useMemo(() => {
    if (isAdmin) {
      return [...navigation, ...adminNavigation]
    }
    return navigation
  }, [isAdmin])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Sistema de Selección</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b">
            <Link href="/dashboard/selection" className="flex items-center gap-2">
              <Image
                src="/images/Logo.png"
                alt="Logo Super de Alimentos"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {allNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Decorative */}
          <div className="px-4 pb-4 hidden lg:block">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image
                  src="/images/Recurso%209.png"
                  alt="Astronauta"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-medium text-gray-700">Explora los módulos</p>
              <p className="text-xs text-gray-500 mt-1">Pruebas y asignaciones</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-4">
            <Link
              href="/dashboard/selection/configuracion"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Settings className="mr-3 h-5 w-5" />
              Configuración
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
