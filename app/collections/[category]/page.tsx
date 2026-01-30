'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context'

interface Product {
  id: string
  name: string
  category: string
  salePrice: number
  mrp: number
  image?: string
  itemCode: string
}

const categoryMap: Record<string, string> = {
  'oils': 'VAGAI WOOD PERSSED OIL / COLD PRESSED OIL',
  'ghee': 'Premium Ghee',
  'snacks': 'KOVILPATTI SPECIAL',
  'skin-hair': 'Wellness & Care',
  'malt': 'HEALTHY MIXES',
  'all': '',
}

const categoryTitles: Record<string, { title: string; description: string }> = {
  'oils': {
    title: 'Authentic Oils, Pure from Within.',
    description: 'Made with traditional wood-pressing — rich in flavor, clean in nature.',
  },
  'ghee': {
    title: 'Pure Ghee, Crafted with Care.',
    description: 'Buffalo & Cow Ghee, slow-prepared the traditional way — rich, wholesome, and full of flavor.',
  },
  'snacks': {
    title: 'Snacks Made From the Heart.',
    description: 'Homemade bites crafted with love — from sesame laddus to millet cookies.',
  },
  'skin-hair': {
    title: 'Wellness & Care',
    description: 'Natural products for your skin and hair care needs.',
  },
  'malt': {
    title: 'Healthy Mixes & Malt',
    description: 'Nutritious mixes and malt products for your daily wellness.',
  },
}

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = (params.category as string) || ''
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [categorySlug])

  const fetchProducts = async () => {
    try {
      const category = categoryMap[categorySlug] || categorySlug
      const url = category
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products'
      const res = await fetch(url)
      const data = await res.json()
      setProducts(data)
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
      const token = localStorage.getItem('token')
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      })

      if (res.ok) {
        alert('Product added to cart!')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  const categoryInfo = categoryTitles[categorySlug] || {
    title: 'All Products',
    description: 'Explore our complete collection',
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {categoryInfo.title}
          </h1>
          <p className="text-lg text-gray-600">
            {categoryInfo.description}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products found in this category</p>
            <Link href="/products">
              <button className="text-amber-900 font-semibold hover:underline">
                View All Products →
              </button>
            </Link>
          </div>
        ) : (
          <>
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
                    <div className="flex items-center justify-center gap-2 mb-3">
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
            <div className="text-center mt-12">
              <Link href="/products">
                <span className="text-amber-900 font-semibold hover:underline">
                  View all products →
                </span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
