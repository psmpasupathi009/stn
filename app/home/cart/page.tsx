'use client'

import { useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { useCartStore } from '@/lib/stores/cart-store'
import { toast } from 'sonner'

export default function CartPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { cart, loading, fetchCart } = useCartStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    fetchCart()
  }, [isAuthenticated, router, fetchCart])

  const updateQuantity = useCallback(async (itemId: string, newQuantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        useCartStore.getState().fetchCart()
      }
    } catch {
      toast.error('Failed to update cart')
    }
  }, [])

  const removeItem = useCallback(async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        useCartStore.getState().fetchCart()
      }
    } catch {
      toast.error('Failed to remove item')
    }
  }, [])

  const total = useMemo(
    () =>
      cart?.items?.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0) ?? 0,
    [cart]
  )

  const handleCheckout = useCallback(() => {
    if (!cart || cart.items.length === 0) return
    router.push('/home/checkout')
  }, [cart, router])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-200" />
          <p className="text-neutral-600">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center text-4xl">🛒</div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Your cart is empty</h2>
          <p className="text-neutral-600 mb-6">Add some products to get started!</p>
          <Button
            onClick={() => router.push('/home/products')}
            className="bg-[var(--primary-green)] hover:opacity-90 text-white px-8 py-6 text-base rounded-xl"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 max-w-7xl">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-6 sm:mb-8">Shopping Cart</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          <div className="md:col-span-2 space-y-4 min-w-0">
            {cart.items.map((item) => (
              <div key={item.id} className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-3 sm:gap-5">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400 text-2xl">🛢️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-neutral-900 mb-1 truncate">{item.product.name}</h3>
                    <p className="text-amber-600 font-semibold mb-3">₹{item.product.salePrice} each</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-600 font-medium"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 hover:bg-neutral-100 text-neutral-600 font-medium"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-600 hover:text-red-700 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-900 text-lg">₹{(item.product.salePrice * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-white border border-neutral-200 rounded-xl p-6 sticky top-24 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-4 border-t border-neutral-200">
                  <span>Total</span>
                  <span className="text-amber-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                className="w-full bg-[var(--primary-green)] hover:opacity-90 text-white py-6 rounded-xl font-semibold"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
