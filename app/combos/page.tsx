'use client'

import { useEffect, useState } from 'react'
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

export default function CombosPage() {
  const [combos, setCombos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      // Fetch combo products (products with "combo" in name or category)
      const res = await fetch('/api/products?search=combo')
      const data = await res.json()
      setCombos(data)
    } catch (error) {
      console.error('Error fetching combos:', error)
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
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Special Combo Packs
          </h1>
          <p className="text-lg text-gray-600">
            Save more with our specially curated combo packs
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading combos...</div>
        ) : combos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No combo packs available at the moment</p>
            <Link href="/products">
              <button className="text-amber-900 font-semibold hover:underline">
                View All Products →
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {combos.map((combo) => (
              <div key={combo.id} className="group">
                <Link href={`/products/${combo.id}`}>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:opacity-90 transition-opacity">
                    {combo.image ? (
                      <img
                        src={combo.image}
                        alt={combo.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        📦
                      </div>
                    )}
                  </div>
                </Link>
                <div className="text-center">
                  <Link href={`/products/${combo.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-amber-900">
                      {combo.name}
                    </h3>
                  </Link>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{combo.salePrice}
                    </span>
                    {combo.mrp > combo.salePrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{combo.mrp}
                        </span>
                        <span className="bg-black text-white text-xs px-2 py-1">
                          Sale
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(combo.id)}
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
