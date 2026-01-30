'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'

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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Fetch oils category products
      const res = await fetch('/api/products?category=VAGAI WOOD PERSSED OIL / COLD PRESSED OIL&limit=8')
      const data = await res.json()
      setFeaturedProducts(data.slice(0, 8))
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

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Authentic Oils, Pure from Within.
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 mb-8">
                Made with traditional wood-pressing — rich in flavor, clean in nature.
              </p>
              <Link href="/products">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                  Shop Now
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="aspect-square bg-amber-200 rounded-lg overflow-hidden shadow-2xl">
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🛢️
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Oils */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Authentic Oils, Pure from Within.
            </h2>
            <p className="text-lg text-gray-600">
              Made with traditional wood-pressing — rich in flavor, clean in nature.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
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
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                      {product.mrp > product.salePrice && (
                        <span className="bg-black text-white text-xs px-2 py-1">
                          Sale
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Add to cart
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Sold out</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/products">
              <span className="text-amber-900 font-semibold hover:underline">
                View all →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Ghee Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pure Ghee, Crafted with Care.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Buffalo & Cow Ghee, slow-prepared the traditional way — rich, wholesome, and full of flavor.
          </p>
          <Link href="/collections/ghee">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Snacks Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Snacks Made From the Heart.
            </h2>
            <p className="text-lg text-gray-600">
              Homemade bites crafted with love — from sesame laddus to millet cookies.
            </p>
          </div>
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
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
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
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
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                      {product.mrp > product.salePrice && (
                        <span className="bg-black text-white text-xs px-2 py-1">
                          Sale
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Add to cart
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Sold out</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/products">
              <span className="text-amber-900 font-semibold hover:underline">
                View all →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Customers Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">Carefully selected ingredients.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">Zero delivery charges on all orders</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p className="text-sm text-gray-600">Encrypted & safe transactions</p>
            </div>
            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-sm text-gray-600">Your questions answered with care</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🇮🇳</div>
              <h3 className="font-semibold mb-2">Pan-India Shipping</h3>
              <p className="text-sm text-gray-600">Reachable. Reliable. Nationwide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
