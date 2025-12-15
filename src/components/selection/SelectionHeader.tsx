import { LogOut, Bell } from "lucide-react"
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
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 shadow-sm">
      <div className="hidden lg:block">
        <h2 className="text-xl font-bold bg-gradient-to-r from-[#0046BE] to-[#00AEEF] bg-clip-text text-transparent">
          Sistema de Selección
        </h2>
        <p className="text-sm text-gray-600">Gestión integral de candidatos</p>
      </div>

      <div className="flex-1 lg:hidden" />

      <div className="flex items-center space-x-4">
        {/* Notifications - Placeholder */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 rounded-xl hover:bg-[#E6F2FF] transition-all">
              <Avatar className="h-8 w-8 ring-2 ring-[#00AEEF]/30">
                <AvatarFallback className="bg-gradient-to-br from-[#0046BE] to-[#8E2FA0] text-white text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-800">{nombreCompleto}</p>
                <p className="text-xs text-gray-500">{rolNombre}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg">
            <DropdownMenuLabel className="text-[#0046BE]">Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg">
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg">
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-red-600 rounded-lg hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
