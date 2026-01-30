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
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${params.id}`)
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
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-4">
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
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((img, idx) => (
                <div key={idx} className="aspect-square bg-gray-200 rounded overflow-hidden">
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">Item Code: {product.itemCode}</p>
          <p className="text-gray-600 mb-4">Weight: {product.weight}</p>
          <p className="text-gray-600 mb-4">Category: {product.category}</p>

          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-bold text-green-600">
                ₹{product.salePrice}
              </span>
              {product.mrp > product.salePrice && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    ₹{product.mrp}
                  </span>
                  {discount > 0 && (
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-semibold">
                      {discount}% OFF
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-gray-600">GST: {product.gst * 100}%</p>
            <p className="text-sm text-gray-600">HSN Code: {product.hsnCode}</p>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Description</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              className="flex-1"
              onClick={addToCart}
              disabled={!product.inStock}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/cart')}
            >
              View Cart
            </Button>
          </div>

          {!product.inStock && (
            <p className="text-red-600 mt-4">This product is currently out of stock</p>
          )}
        </div>
      </div>
    </div>
  )
}
