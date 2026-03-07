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

/** Product image + images merged, deduped. First item is primary. */
export function getProductImages(product: { image?: string | null; images?: string[] | null } | null): string[] {
  if (!product) return []
  const list: string[] = []
  if (product.image) list.push(product.image)
  if (product.images?.length) {
    for (const url of product.images) {
      if (url && !list.includes(url)) list.push(url)
    }
  }
  return list
}

/** Use variant's images; if none, use first variant in list that has images (one upload can show for all variants). */
export function getProductImagesWithVariantFallback(
  product: { image?: string | null; images?: string[] | null } | null,
  variantList: { image?: string | null; images?: string[] | null }[] = []
): string[] {
  const own = getProductImages(product)
  if (own.length > 0) return own
  for (const v of variantList) {
    if (v && v !== product) {
      const imgs = getProductImages(v)
      if (imgs.length > 0) return imgs
    }
  }
  return []
}

/** Display name for variant: variantLabel (e.g. "Small") or weight or itemCode. */
export function getVariantDisplayName(p: { variantLabel?: string | null; weight?: string | null; itemCode?: string | null } | null): string {
  if (!p) return ''
  const v = (p as { variantLabel?: string | null }).variantLabel?.trim()
  if (v) return v
  const w = p.weight?.trim()
  if (w) return w
  return p.itemCode?.trim() || ''
}
