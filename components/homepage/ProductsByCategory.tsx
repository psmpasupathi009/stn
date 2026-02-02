'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'
import type { Product } from './types'
import ProductCard from './ProductCard'

const RECENT_PER_CATEGORY = 4

export default function ProductsByCategory() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (cancelled) return
        const names = Array.isArray(catData)
          ? catData.map((c: { category: string }) => c.category).filter(Boolean)
          : []
        setCategories(names)
        const list = Array.isArray(prodData) ? prodData : []
        const separate = list.filter(
          (p: Product) =>
            !String(p.name || '').toLowerCase().includes('combo') &&
            !String(p.category || '').toLowerCase().includes('combo')
        )
        setAllProducts(separate)
      })
      .catch((err) => console.error('Home products fetch error:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>()
    categories.forEach((cat) => map.set(cat, []))
    allProducts.forEach((p) => {
      const key = (p.category || '').trim()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    return categories
      .map((cat) => ({
        category: cat,
        products: (map.get(cat) || []).slice(0, RECENT_PER_CATEGORY),
      }))
      .filter(({ products }) => products.length > 0)
  }, [allProducts, categories])

  const addToCart = async (productId: string) => {
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
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const buyNow = (productId: string) => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    // Direct to checkout with product ID for instant buy
    router.push(`/home/checkout?productId=${productId}&quantity=1`)
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Our Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Shop by category — traditional oils, spices, and healthy products.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productsByCategory.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No products yet.</div>
        ) : (
          <div className="space-y-12 md:space-y-16">
            {productsByCategory.map(({ category, products: categoryProducts }) => (
              <div key={category}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-200">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {category}
                  </h3>
                  <Link
                    href={`/home/products?category=${encodeURIComponent(category)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors group"
                  >
                    View All
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 min-w-0">
                  {categoryProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                      onBuyNow={buyNow}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-14">
          <Link 
            href="/home/products" 
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Browse All Products
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
