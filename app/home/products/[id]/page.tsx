'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch when product id changes only
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
      router.push('/home/login')
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product?.id, quantity }),
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-48 h-48 rounded-2xl bg-neutral-200" />
          <p className="text-neutral-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-neutral-600">Product not found</p>
        <Button onClick={() => router.push('/home/products')} variant="outline">Browse products</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Product Images */}
          <div className="min-w-0">
            <div className="aspect-square bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-4 shadow-sm relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
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
                  <div key={idx} className="aspect-square bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity relative">
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0">
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-2 leading-tight">{product.name}</h1>
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

            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  ₹{product.salePrice}
                </span>
                {product.mrp > product.salePrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ₹{product.mrp}
                    </span>
                    <span className="bg-[var(--primary-green)] text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded">
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

            {/* Value Propositions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className="text-2xl mb-2">💎</div>
                <p className="text-xs text-gray-600">PREMIUM QUALITY</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-xs text-gray-600">SATISFACTION GUARANTEED</p>
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="flex-1 min-w-0 border-2 border-[var(--primary-green)] text-[var(--primary-green)] py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                Add to cart
              </button>
              <button
                onClick={() => {
                  addToCart()
                  router.push('/home/cart')
                }}
                disabled={!product.inStock}
                className="flex-1 min-w-0 bg-[var(--primary-green)] text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
