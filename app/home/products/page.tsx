'use client'

import { useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { Search, Package, Filter, X, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProductCard from '@/components/homepage/ProductCard'

interface Product {
  id: string
  name: string
  category: string
  salePrice: number
  mrp: number
  image?: string
  itemCode: string
  rating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
}

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const categoryFromUrl = searchParams.get('category') ?? ''
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/categories', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/products', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (cancelled) return
        const names = Array.isArray(catData)
          ? catData.map((c: { category: string }) => c.category).filter(Boolean)
          : []
        setCategories(names)
        setAllProducts(Array.isArray(prodData) ? prodData : [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const hasActiveFilters = Boolean(categoryFromUrl.trim() || searchQuery.trim())

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    router.push('/home/products')
  }, [router])

  const setCategory = useCallback(
    (cat: string) => {
      if (!cat.trim()) router.push('/home/products')
      else router.push(`/home/products?category=${encodeURIComponent(cat.trim())}`)
    },
    [router]
  )

  const displayedProducts = useMemo(() => {
    let list = allProducts
    if (categoryFromUrl.trim()) {
      const catLower = categoryFromUrl.toLowerCase()
      list = list.filter((p) =>
        (p.category?.trim() || '').toLowerCase().includes(catLower)
      )
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.itemCode?.toLowerCase() || '').includes(q)
      )
    }
    const sorted = [...list].sort((a, b) => {
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
    return sorted
  }, [allProducts, categoryFromUrl, searchQuery])

  const addToCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        router.push('/home/login')
        return
      }
      try {
        const res = await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: 1 }),
        })
        if (res.ok) {
          window.dispatchEvent(new CustomEvent('cart-updated'))
          toast.success('Added to cart!')
        } else {
          const data = await res.json().catch(() => ({}))
          toast.error(data.error || 'Failed to add to cart')
        }
      } catch {
        toast.error('Failed to add to cart')
      }
    },
    [isAuthenticated, router]
  )

  const buyNow = useCallback(
    (productId: string) => {
      if (!isAuthenticated) {
        router.push('/home/login')
        return
      }
      router.push(`/home/checkout?productId=${productId}&quantity=1`)
    },
    [isAuthenticated, router]
  )

  if (loading) {
    return (
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl py-6 sm:py-8 md:py-10">
        <div className="h-7 sm:h-8 w-40 sm:w-48 bg-gray-200 rounded-lg animate-pulse mb-4 sm:mb-6" />
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="h-9 sm:h-10 w-full sm:w-64 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-9 sm:h-10 w-24 sm:w-32 bg-gray-100 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 min-w-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden bg-white min-w-0">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-4 sm:p-5 space-y-2 sm:space-y-3">
                <div className="h-4 sm:h-5 bg-gray-100 rounded w-4/5 animate-pulse" />
                <div className="h-3 sm:h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-5 sm:py-6 md:py-8 lg:py-10 max-w-7xl">
        {/* Page title - responsive typography */}
        <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
            Products
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm md:text-base mt-0.5 sm:mt-1 max-w-xl">
            Browse and filter by category. High-rated and latest products first.
          </p>
        </div>

        {/* Dashboard-style filter bar - stacks on sm, row on md+ */}
        <div className="rounded-lg sm:rounded-xl border border-gray-200 bg-white p-3 sm:p-4 md:p-5 shadow-sm mb-4 sm:mb-5 md:mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700 shrink-0">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              Filters
            </div>
            <div className="relative w-full sm:flex-1 sm:min-w-0 sm:max-w-md order-3 sm:order-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 border-gray-200 h-9 sm:h-10 w-full min-w-0"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 order-2 sm:order-3 sm:flex-1 sm:justify-end min-w-0">
              <select
                value={categoryFromUrl}
                onChange={(e) => setCategory(e.target.value)}
                className={cn(
                  'h-9 sm:h-10 rounded-lg border border-gray-200 bg-gray-50 px-3 pr-8 text-xs sm:text-sm font-medium text-gray-700 min-w-0 flex-1 sm:flex-initial sm:w-auto max-w-full',
                  'focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:ring-offset-1'
                )}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat?.trim() || ''}>
                    {cat}
                  </option>
                ))}
              </select>
              {hasActiveFilters && (
                <>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                    {displayedProducts.length} result{displayedProducts.length !== 1 ? 's' : ''}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="shrink-0 h-8 sm:h-9 gap-1 sm:gap-1.5 text-xs sm:text-sm"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Clear filters</span>
                    <span className="sm:hidden">Clear</span>
                  </Button>
                </>
              )}
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs">
              {categoryFromUrl && (
                <span className="text-gray-500">
                  Category: <span className="font-medium text-gray-700 truncate max-w-[180px] sm:max-w-none inline-block align-bottom">{categoryFromUrl}</span>
                </span>
              )}
              {searchQuery.trim() && (
                <span className="text-gray-500">
                  Search: <span className="font-medium text-gray-700">&ldquo;{searchQuery}&rdquo;</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Product grid - 1 col mobile, 2 sm, 3 lg */}
        {displayedProducts.length === 0 ? (
          <div className="rounded-xl sm:rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 md:p-16 text-center min-w-0">
            <Package className="w-12 h-12 sm:w-14 sm:h-14 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-600 font-medium text-sm sm:text-base">No products found</p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Try changing filters or search.</p>
            <Button variant="outline" size="sm" className="mt-4 text-sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 min-w-0">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                onBuyNow={buyNow}
              />
            ))}
          </div>
        )}

        {/* Category quick links - responsive spacing and text */}
        {categories.length > 0 && (
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-100">
            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              Browse by category
            </p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 min-w-0">
              <Link
                href="/home/products"
                className={cn(
                  'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0',
                  !categoryFromUrl
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All
              </Link>
              {categories.map((cat) => {
                const isActive =
                  categoryFromUrl &&
                  (cat?.trim() || '').toLowerCase() === categoryFromUrl.toLowerCase()
                return (
                  <Link
                    key={cat}
                    href={`/home/products?category=${encodeURIComponent(cat?.trim() || '')}`}
                    className={cn(
                      'px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-colors shrink-0 truncate max-w-[140px] sm:max-w-[200px] md:max-w-none',
                      isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                    title={cat}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductsPageFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 w-full min-w-0 overflow-x-hidden">
      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  )
}
