'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { Droplets, ChevronRight } from 'lucide-react'
import type { Product } from '../types'

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

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
            Shop by category — traditional oils, spices, and healthy products.
          </p>
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : productsByCategory.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No products yet.</div>
        ) : (
          <div className="space-y-14 md:space-y-16">
            {productsByCategory.map(({ category, products: categoryProducts }) => (
              <div key={category}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {category}
                  </h3>
                  <Link
                    href={`/home/products?category=${encodeURIComponent(category)}`}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors group"
                  >
                    View more products
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                  {categoryProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <Link href={`/home/products/${product.id}`} className="block flex-1 min-h-0">
                        <div className="aspect-square bg-gray-50 overflow-hidden relative">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Droplets className="w-14 h-14 sm:w-16 sm:h-16 text-green-200" />
                            </div>
                          )}
                          {product.mrp > product.salePrice && (
                            <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-600 text-white text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                              Sale
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                        <Link href={`/home/products/${product.id}`} className="flex-1 min-h-0">
                          <h4 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 hover:text-green-700 transition-colors line-clamp-2">
                            {product.name}
                          </h4>
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap mb-3">
                          <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.salePrice}</span>
                          {product.mrp > product.salePrice && (
                            <span className="text-sm sm:text-base text-gray-400 line-through">₹{product.mrp}</span>
                          )}
                        </div>
                        {product.rating != null && product.rating > 0 && (
                          <div className="flex items-center gap-1 mb-3 text-sm sm:text-base text-gray-600">
                            <span className="text-amber-500">★</span>
                            <span className="font-medium">{product.rating.toFixed(1)}</span>
                            {product.reviewCount != null && product.reviewCount > 0 && (
                              <span className="text-gray-400">({product.reviewCount})</span>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base font-medium py-3 px-4 sm:py-3.5 rounded-lg transition-colors mt-auto"
                        >
                          Add to cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-center mt-12">
          <Link href="/home/products" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors">
            View all products
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
