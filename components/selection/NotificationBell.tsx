"use client"

import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

type Props = { userDoc?: string }

export function NotificationBell({ userDoc }: Props) {
  const { toast } = useToast()
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications(userDoc)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] leading-[18px] text-center px-[3px]">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="border-b px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-semibold">Notificaciones</p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => markAllAsRead.mutate()}
              disabled={unreadCount === 0 || markAllAsRead.isPending}
              title="Marcar todas como leídas"
            >
              {markAllAsRead.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Cargando…</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Sin notificaciones</div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className="p-4 hover:bg-accent/30">
                  <div className="flex items-start gap-3">
                    <Badge variant={n.read ? "outline" : "default"} className="shrink-0 mt-0.5">
                      {n.type.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate">{n.titulo}</p>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      {n.descripcion && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.descripcion}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        {!n.read && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7"
                            onClick={() => markAsRead.mutate(n.id)}
                          >
                            Marcar como leída
                          </Button>
                        )}
                        {n.link && (
                          <Link href={n.link} className="text-xs text-primary hover:underline">
                            Ver detalle
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export default NotificationBell
