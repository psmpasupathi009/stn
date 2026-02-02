'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { Search, Package, ShoppingCart, Star } from 'lucide-react'
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

const SKELETON_COUNT = 6
const GRID_CLASS =
  'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 min-w-0'

// --- Product card ---
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (id: string) => void
}) {
  return (
    <Card className="group overflow-hidden border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md hover:border-green-200 min-w-0 w-full">
      <Link href={`/products/${product.id}`} className="block min-w-0">
        <div className="aspect-square overflow-hidden bg-gray-50 relative w-full">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        <Link href={`/products/${product.id}`} className="block min-w-0">
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

// --- Sidebar category list (used inside Shadcn Sidebar + Sheet on mobile) ---
function SidebarCategoryNav({
  categories,
  selectedCategory,
  onSelectCategory,
  onSelectAndClose,
}: {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
  onSelectAndClose?: (category: string) => void
}) {
  const handleClick = useCallback(
    (category: string) => {
      onSelectCategory(category)
      onSelectAndClose?.(category)
    },
    [onSelectCategory, onSelectAndClose]
  )

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={selectedCategory === ''}
                onClick={() => handleClick('')}
              >
                All Products
              </SidebarMenuButton>
            </SidebarMenuItem>
            {categories.map((category) => (
              <SidebarMenuItem key={category}>
                <SidebarMenuButton
                  isActive={selectedCategory === category}
                  onClick={() => handleClick(category)}
                  className="line-clamp-2 text-left"
                >
                  {category}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
}

// --- Inner content (uses useSidebar for mobile sheet) ---
function ProductsPageContent() {
  const searchParams = useSearchParams()
  const categoryFromUrl = searchParams.get('category') ?? ''
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { openMobile, setOpenMobile } = useSidebar()
  const { isAuthenticated } = useAuth()

  // When user arrives from marquee (or link) with ?category=..., show that category
  useEffect(() => {
    setSelectedCategory(categoryFromUrl)
  }, [categoryFromUrl])

  useEffect(() => {
    let cancelled = false
    fetch('/api/categories', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        const names = data
          .map((c: { category: string }) => c.category)
          .filter(Boolean)
        setCategories(names)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selectedCategory) params.set('category', selectedCategory)
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    fetch(`/api/products?${params}`)
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [selectedCategory, searchQuery])

  const addToCart = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        window.location.href = '/login'
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

  const closeMobileSidebar = useCallback(() => setOpenMobile(false), [setOpenMobile])

  const sidebarNav = (
    <SidebarCategoryNav
      categories={categories}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      onSelectAndClose={closeMobileSidebar}
    />
  )

  return (
    <>
      {/* Mobile: Sheet with sidebar content (opened by SidebarTrigger in header) */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-[85vw] max-w-[320px] p-0 flex flex-col"
        >
          <SheetTitle className="sr-only">Categories</SheetTitle>
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-sidebar-border">
              <h2 className="font-semibold text-sidebar-foreground">
                Categories
              </h2>
            </div>
            <div className="flex-1 overflow-auto p-2">
              <SidebarCategoryNav
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                onSelectAndClose={closeMobileSidebar}
              />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop: Shadcn Sidebar */}
      <Sidebar side="left" className="sticky top-20 self-start rounded-xl border border-sidebar-border shadow-sm overflow-hidden max-h-[calc(100vh-5rem)]">
        <SidebarContent>{sidebarNav}</SidebarContent>
      </Sidebar>

      <SidebarInset>
        <div className="flex flex-col w-full min-w-0 overflow-x-hidden">
          <div className="container mx-auto w-full max-w-screen-2xl px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8 box-border">
            {/* Header: trigger (mobile) + title + search */}
            <div className="flex flex-col gap-4 mb-4 sm:mb-6 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <SidebarTrigger />
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate min-w-0 flex-1">
                  All Products
                </h1>
                <div className="relative flex-1 min-w-0 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none shrink-0" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-gray-200 w-full min-w-0 max-w-full"
                  />
                </div>
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className={cn(GRID_CLASS)}>
                {Array.from({ length: SKELETON_COUNT }, (_, i) => (
                  <Card key={i} className="overflow-hidden border-gray-200">
                    <div className="aspect-square bg-gray-100 animate-pulse" />
                    <CardContent className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-gray-100 rounded animate-pulse" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 md:p-12 text-center min-w-0">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No products found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try a different search or category.
                </p>
              </div>
            ) : (
              <div
                className={cn(GRID_CLASS, 'transition-opacity duration-200')}
                role="list"
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </>
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

// --- Page: wrap with SidebarProvider + Suspense for useSearchParams ---
export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden">
      <SidebarProvider className="flex gap-4 lg:gap-6 xl:gap-8 min-w-0 w-full overflow-hidden">
        <Suspense fallback={<ProductsPageFallback />}>
          <ProductsPageContent />
        </Suspense>
      </SidebarProvider>
    </div>
  )
}
