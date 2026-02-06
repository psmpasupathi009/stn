import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Sort products: rated first (by rating desc), then by date desc. Shared for list/detail consistency. */
export function sortProductsByRatingAndDate<T extends { rating?: number; createdAt?: string; updatedAt?: string }>(
  list: T[]
): T[] {
  return [...list].sort((a, b) => {
    const aRating = a.rating ?? 0
    const bRating = b.rating ?? 0
    const aHasRating = aRating > 0
    const bHasRating = bRating > 0
    if (aHasRating && bHasRating) return bRating - aRating
    if (aHasRating && !bHasRating) return -1
    if (!aHasRating && bHasRating) return 1
    const aDate = a.createdAt || a.updatedAt || ''
    const bDate = b.createdAt || b.updatedAt || ''
    return bDate.localeCompare(aDate)
  })
}
