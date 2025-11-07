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

  const activeHref = useMemo(() => {
    let matched = ""
    for (const item of allNavigation) {
      const href = item.href
      const exactMatch = pathname === href
      const nestedMatch = pathname.startsWith(`${href}/`)
      if ((exactMatch || nestedMatch) && href.length > matched.length) {
        matched = href
      }
    }
    return matched
  }, [allNavigation, pathname])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
        <h1 className="text-lg font-semibold text-[#0046BE]">Mundo Súper - Selección</h1>
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
          "fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-white to-[#F0F7FF] border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b bg-white">
            <Link href="/dashboard/selection" className="flex items-center gap-2">
              <Image
                src="/images/Logo.png"
                alt="Logo Mundo Súper"
                width={140}
                height={48}
                className="object-contain"
                priority
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {allNavigation.map((item) => {
              const isActive = item.href === activeHref
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-[#0046BE] to-[#00AEEF] text-white shadow-lg shadow-blue-200"
                      : "text-gray-700 hover:bg-white hover:shadow-md"
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
            <div className="rounded-2xl bg-gradient-to-br from-[#E6F2FF] to-[#F0E6FF] p-4 text-center border border-[#00AEEF]/20">
              <div className="flex justify-center mb-2">
                <Image
                  src="/images/Recurso%209.png"
                  alt="Astronauta"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <p className="text-xs font-semibold text-[#0046BE]">Explora los módulos</p>
              <p className="text-xs text-gray-600 mt-1">Pruebas y asignaciones</p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-4 bg-white">
            <Link
              href="/dashboard/selection/configuracion"
              className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-[#F7941D]/10 hover:to-[#F7941D]/5 transition-all duration-200"
            >
              <Settings className="mr-3 h-5 w-5 text-[#F7941D]" />
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
