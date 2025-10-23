"use client"

import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/useAuth"
import { NotificationBell } from "@/components/selection/NotificationBell"

export function SelectionHeader() {
  const { user, userRole, logout } = useAuth()

  const nombreCompleto = user?.nombreColaborador || "Usuario"
  
  const initials = nombreCompleto
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "US"

  const rolNombre = userRole?.rolRol || "Psicólogo"

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div className="hidden lg:block">
        <h2 className="text-xl font-semibold text-gray-900">Sistema de Selección</h2>
        <p className="text-sm text-gray-500">Gestión integral de candidatos</p>
      </div>

      <div className="flex-1 lg:hidden" />

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <NotificationBell userDoc={user?.documento} />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-white text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{nombreCompleto}</p>
                <p className="text-xs text-gray-500">{rolNombre}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
