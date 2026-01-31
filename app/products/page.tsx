'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/context'
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, searchQuery])

  const fetchProducts = async () => {
    try {
      let url = '/api/products?'
      if (selectedCategory) {
        url += `category=${encodeURIComponent(selectedCategory)}&`
      }
      if (searchQuery) {
        url += `search=${encodeURIComponent(searchQuery)}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((p: Product) => p.category))
      ) as string[]
      setCategories(uniqueCategories)
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

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">All Products</h1>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="max-w-md">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === ''
                  ? 'bg-amber-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found</p>
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
