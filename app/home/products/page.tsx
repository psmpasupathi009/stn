'use client'

import { useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { Search, Package, ShoppingCart, Star, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

// --- Types ---
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
}

// --- Constants ---
const PLACEHOLDER_IMAGE = (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
    <Package className="w-16 h-16" strokeWidth={1.25} />
  </div>
)

// --- Product card ---
function ProductCard({
  product,
  onAddToCart,
  className,
}: {
  product: Product
  onAddToCart: (id: string) => void
  className?: string
}) {
  return (
    <Card className={cn('group overflow-hidden border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-200 rounded-2xl', className)}>
      <Link href={`/home/products/${product.id}`} className="block min-w-0">
        <div className="aspect-square overflow-hidden bg-gray-50 relative w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            PLACEHOLDER_IMAGE
          )}
          {product.mrp > product.salePrice && (
            <Badge
              variant="default"
              className="absolute top-2 left-2 text-[10px] px-1.5 py-0"
            >
              Sale
            </Badge>
          )}
        </div>
      </Link>
      <CardContent className="p-3 sm:p-4 pb-2 min-w-0 overflow-hidden">
        <Link href={`/home/products/${product.id}`} className="block min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-green-700 transition-colors min-w-0 overflow-hidden">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            ₹{product.salePrice}
          </span>
          {product.mrp > product.salePrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.mrp}
            </span>
          )}
        </div>
        {product.rating != null && product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5 text-sm text-gray-600">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount != null && product.reviewCount > 0 && (
              <span className="text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={(e) => {
            e.preventDefault()
            onAddToCart(product.id)
          }}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white gap-2"
          size="sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  )
}

// --- Products page: sidebar filter + single grid ---
function ProductsPageContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category') ?? ''
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { isAuthenticated } = useAuth()

  // Fetch categories and all products
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

  // Filter products by sidebar category + search (single list for grid)
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
    return list
  }, [allProducts, categoryFromUrl, searchQuery])

  const addToCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        window.location.href = '/home/login'
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
    [isAuthenticated]
  )

  if (loading) {
    return (
      <div className="container mx-auto px-3 sm:px-4 md:px-6 py-6 md:py-8">
        <div className="flex gap-6 lg:gap-8">
          <aside className="hidden lg:block w-56 shrink-0 space-y-2 pr-6 border-r border-gray-200">
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 bg-gray-100 rounded animate-pulse" />
            ))}
          </aside>
          <div className="flex-1 min-w-0">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="aspect-square bg-gray-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full max-w-screen-2xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Sidebar: category filter (selected view) */}
          <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:shrink-0 border-r border-gray-200 pr-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Categories
            </h2>
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/home/products"
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  !categoryFromUrl
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                All products
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
                      'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {cat}
                  </Link>
                )
              })}
            </nav>
          </aside>

          {/* Main: search + product grid */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col gap-4 mb-6 md:mb-8 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Products
                {categoryFromUrl && (
                  <span className="text-gray-500 font-normal ml-2">
                    · {categoryFromUrl}
                  </span>
                )}
              </h1>
              {/* Mobile category filter (sidebar hidden on small screens) */}
              <div className="flex flex-wrap gap-2 lg:hidden">
                <Link
                  href="/home/products"
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                    !categoryFromUrl
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
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
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                        isActive
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      )}
                    >
                      {cat}
                    </Link>
                  )
                })}
              </div>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white border-gray-200 w-full"
                />
              </div>
            </div>

            {displayedProducts.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Loading fallback when reading URL params ---
function ProductsPageFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  )
}

// --- Page: wrap with Suspense for useSearchParams ---
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden">
      <Suspense fallback={<ProductsPageFallback />}>
        <ProductsPageContent />
      </Suspense>
    </div>
  )
}
