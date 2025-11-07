'use client'

import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, XCircle, AlertCircle, Info, Loader2 } from 'lucide-react'

/**
 * Modern toast notification helpers with color-coded styling and icons
 * 
 * Usage:
 * ```tsx
 * import { useModernToast } from '@/lib/toast'
 * 
 * const toast = useModernToast()
 * toast.success({ title: "Success", description: "Operation completed" })
 * toast.error({ title: "Error", description: "Something went wrong" })
 * toast.warning({ title: "Warning", description: "Please check this" })
 * toast.info({ title: "Info", description: "For your information" })
 * toast.loading({ title: "Loading", description: "Processing..." })
 * ```
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'

interface ToastOptions {
  title: string
  description?: string
  duration?: number
}

/**
 * Hook to use modern toast notifications with color-coded styling
 * 
 * @returns Object with success, error, warning, info, and loading toast methods
 * 
 * @example
 * ```tsx
 * const toast = useModernToast()
 * 
 * // Success - Green
 * toast.success({ title: "Saved!", description: "Changes saved successfully" })
 * 
 * // Error - Red
 * toast.error({ title: "Error", description: "Something went wrong" })
 * 
 * // Warning - Yellow
 * toast.warning({ title: "Attention", description: "Please review this" })
 * 
 * // Info - Blue
 * toast.info({ title: "FYI", description: "Here's some information" })
 * 
 * // Loading - Gray (spinning icon, doesn't auto-dismiss)
 * toast.loading({ title: "Processing", description: "Please wait..." })
 * ```
 */
export function useModernToast() {
  const { toast } = useToast()

  return {
    /**
     * Success toast - Green theme with CheckCircle icon
     */
    success: (options: ToastOptions) => {
      return toast({
        ...options,
        className: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50',
        icon: CheckCircle2,
        iconClassName: 'text-green-600 dark:text-green-400',
        duration: options.duration || 4000,
      })
    },

    /**
     * Error toast - Red theme with XCircle icon
     */
    error: (options: ToastOptions) => {
      return toast({
        ...options,
        variant: 'destructive',
        className: 'border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50',
        icon: XCircle,
        iconClassName: 'text-red-600 dark:text-red-400',
        duration: options.duration || 5000,
      })
    },

    /**
     * Warning toast - Yellow theme with AlertCircle icon
     */
    warning: (options: ToastOptions) => {
      return toast({
        ...options,
        className: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50',
        icon: AlertCircle,
        iconClassName: 'text-yellow-600 dark:text-yellow-400',
        duration: options.duration || 4500,
      })
    },

    /**
     * Info toast - Blue theme with Info icon
     */
    info: (options: ToastOptions) => {
      return toast({
        ...options,
        className: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-50',
        icon: Info,
        iconClassName: 'text-blue-600 dark:text-blue-400',
        duration: options.duration || 4000,
      })
    },

    /**
     * Loading toast - Gray theme with spinning Loader icon
     * Note: Doesn't auto-dismiss (duration = Infinity)
     */
    loading: (options: ToastOptions) => {
      return toast({
        ...options,
        className: 'border-gray-400 bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-50',
        icon: Loader2,
        iconClassName: 'text-gray-600 dark:text-gray-400 animate-spin',
        duration: options.duration !== undefined ? options.duration : Infinity,
      })
    },
  }
}
