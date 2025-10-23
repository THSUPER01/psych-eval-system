"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { notificationsService, type AppNotification } from "@/lib/services/notificationsService"

export function useNotifications(userDoc?: string) {
  const enabled = Boolean(userDoc)
  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery<AppNotification[]>({
    queryKey: ['notifications', userDoc],
    queryFn: () => notificationsService.getNotifications(userDoc as string),
    enabled,
    refetchInterval: 15000, // poll every 15s
  })

  const unreadCount = (data || []).filter(n => !n.read).length

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsService.markAsRead(userDoc as string, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userDoc] }),
  })

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(userDoc as string),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', userDoc] }),
  })

  return {
    notifications: data || [],
    isLoading,
    isError,
    unreadCount,
    refetch,
    markAsRead,
    markAllAsRead,
  }
}
