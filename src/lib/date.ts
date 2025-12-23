import { format, parseISO } from "date-fns"
import type { Locale } from "date-fns"

const hasTimezone = (value: string) => /[zZ]|[+-]\d{2}:?\d{2}$/.test(value)

export const parseUtcDate = (value?: string | null) => {
  if (!value) return null
  const normalized = hasTimezone(value) ? value : `${value}Z`
  const date = parseISO(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

export const formatUtcToLocal = (
  value: string | null | undefined,
  formatStr: string,
  options?: { locale?: Locale }
) => {
  const date = parseUtcDate(value)
  if (!date) return "Fecha invalida"
  return format(date, formatStr, options)
}
