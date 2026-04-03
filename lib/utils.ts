import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ReadingStatus } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STATUS_LABELS: Record<ReadingStatus, string> = {
  want_to_read: "Want to Read",
  reading: "Reading",
  finished: "Finished",
  abandoned: "Abandoned",
}

export const STATUS_COLORS: Record<ReadingStatus, string> = {
  want_to_read: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  reading: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  finished: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
  abandoned: "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300",
}

export function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(new Date(dateStr))
}

export function estimatePages(pageCount: number | null, status: ReadingStatus, startedAt: string | null, finishedAt: string | null) {
  if (!pageCount || !startedAt) return null
  const end = finishedAt ? new Date(finishedAt) : new Date()
  const start = new Date(startedAt)
  const days = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  return Math.round(pageCount / days)
}
