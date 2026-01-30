'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/lib/context'

interface Product {
  id: string
  name: string
  category: string
  itemCode: string
  weight: string
  mrp: number
  salePrice: number
  gst: number
  hsnCode: string
  image?: string
  images?: string[]
  description?: string
  inStock: boolean
  rating?: number
  reviewCount?: number
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchProduct()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const productId = params.id as string
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/login')
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
        body: JSON.stringify({ productId: product?.id, quantity }),
      })

      if (res.ok) {
        alert('Product added to cart!')
      } else {
        alert('Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart')
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-12 text-center">Product not found</div>
  }

  const discount = product.mrp > product.salePrice
    ? Math.round(((product.mrp - product.salePrice) / product.mrp) * 100)
    : 0

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-6xl">
                  🛢️
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((img, idx) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="w-20 h-20 rounded-full bg-amber-900 text-white flex items-center justify-center text-2xl font-bold mb-4">
                A
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(product.rating!) ? 'text-yellow-400' : 'text-gray-300'}>
                        ⭐
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{product.salePrice}
                </span>
                {product.mrp > product.salePrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.mrp}
                    </span>
                    <span className="bg-black text-white text-sm px-3 py-1">
                      Sale
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-4">Shipping calculated at checkout.</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-900">Quantity</label>
              <div className="flex items-center gap-2 border border-gray-300 rounded w-fit">
                <button
                  className="px-4 py-2 hover:bg-gray-100"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  readOnly
                  className="w-16 text-center border-0 focus:ring-0"
                />
                <button
                  className="px-4 py-2 hover:bg-gray-100"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {product.salePrice < 299 && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded">
                <p className="text-sm text-gray-700">
                  Cash on Delivery is available only for orders above ₹299. Please add more items to proceed.
                </p>
              </div>
            )}

            {/* Value Propositions */}
            <div className="grid grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl mb-2">💎</div>
                <p className="text-xs text-gray-600">PREMIUM QUALITY</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-xs text-gray-600">SATISFACTION GUARANTEED</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <p className="text-xs text-gray-600">CASH ON DELIVERY</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🚚</div>
                <p className="text-xs text-gray-600">FREE SHIPPING</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔒</div>
                <p className="text-xs text-gray-600">SECURE ONLINE SHOPPING</p>
              </div>
            </div>

            <div className="flex gap-4 mb-6">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="flex-1 border-2 border-black text-black py-3 px-6 rounded hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart
              </button>
              <button
                onClick={() => {
                  addToCart()
                  router.push('/cart')
                }}
                className="flex-1 bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors"
              >
                Buy it now
              </button>
            </div>

            {product.description && (
              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
            )}

            {!product.inStock && (
              <p className="text-red-600 mt-4">This product is currently out of stock</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
