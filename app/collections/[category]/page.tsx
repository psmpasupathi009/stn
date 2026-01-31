'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { categoryMapping } from '@/components/CategoryMarquee'
import { toast } from 'sonner'

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

const categoryTitles: Record<string, { title: string; description: string }> = {
  'healthy-mixes': {
    title: 'Healthy Mixes & Malt',
    description: 'Nutritious malt mixes and health powders for your daily wellness needs.',
  },
  'wood-pressed-oils': {
    title: 'Authentic Oils, Pure from Within.',
    description: 'Made with traditional wood-pressing — rich in flavor, clean in nature.',
  },
  'idly-podi': {
    title: 'Idly Podi Varieties',
    description: 'Traditional South Indian spice powders to enhance your breakfast experience.',
  },
  'home-made-masala': {
    title: 'Home Made Masala',
    description: 'Freshly ground spices and masala blends made with traditional methods.',
  },
  'kovilpatti-special': {
    title: 'Kovilpatti Special',
    description: 'Authentic regional specialties from Kovilpatti — unique flavors and traditional recipes.',
  },
  'flour-kali-mixes': {
    title: 'Healthy Flour & Kali Mixes',
    description: 'Nutritious flour blends and kali mixes for wholesome cooking.',
  },
  'natural-sweeteners': {
    title: 'Natural Sweeteners',
    description: 'Pure, unrefined sweeteners for a healthier lifestyle.',
  },
  'explorer-pack': {
    title: 'Explorer Pack / Trail Pack',
    description: 'Sample packs to explore our range of products.',
  },
  'essential-millets': {
    title: 'Essential Millets',
    description: 'Nutritious millets for a healthy and balanced diet.',
  },
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = (params.category as string) || ''
  const actualCategory = categoryMapping[categorySlug] || categorySlug
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [categorySlug])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = actualCategory
        ? `/api/products?category=${encodeURIComponent(actualCategory)}`
        : '/api/products'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
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
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const categoryInfo = categoryTitles[categorySlug] || {
    title: actualCategory || 'All Products',
    description: 'Browse our collection of premium products.',
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {categoryInfo.description}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found in this category.</p>
            <Link href="/products">
              <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                View All Products
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="group">
                <Link href={`/products/${product.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:opacity-90 transition-opacity">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🛢️
                      </div>
                    )}
                  </div>
                </Link>
                <div className="text-center">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-amber-900">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{product.salePrice}
                    </span>
                    {product.mrp > product.salePrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.mrp}
                        </span>
                        <span className="bg-black text-white text-xs px-2 py-1">
                          Sale
                        </span>
                      </>
                    )}
                  </div>
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                  <button
                    onClick={() => addToCart(product.id)}
                    className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
