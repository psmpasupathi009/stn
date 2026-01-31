'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import Script from 'next/script'
import { toast } from 'sonner'

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    salePrice: number
    mrp: number
    image?: string
  }
}

interface Cart {
  id: string
  items: CartItem[]
}

export default function CartPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    fetchCart()
  }, [isAuthenticated])

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCart(data)
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQuantity }),
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        fetchCart()
      }
    } catch (error) {
      console.error('Error updating cart:', error)
      toast.error('Failed to update cart')
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        fetchCart()
      }
    } catch (error) {
      console.error('Error removing item:', error)
      toast.error('Failed to remove item')
    }
  }

  const calculateTotal = () => {
    if (!cart) return 0
    return cart.items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) return

    setProcessing(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.salePrice,
          })),
          shippingAddress: 'Address will be collected during checkout',
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Initialize Razorpay
        const options = {
          key: data.key,
          amount: data.order.totalAmount * 100,
          currency: 'INR',
          name: 'STN Products',
          description: 'Order Payment',
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.order.id,
              }),
            })

            if (verifyRes.ok) {
              window.dispatchEvent(new CustomEvent('cart-updated'))
              toast.success('Payment successful!')
              router.push('/orders')
            } else {
              toast.error('Payment verification failed')
            }
          },
          prefill: {
            email: '',
            contact: '',
          },
          theme: {
            color: '#10b981',
          },
        }

        const razorpay = new (window as any).Razorpay(options)
        razorpay.open()
      } else {
        toast.error(data?.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      toast.error('Error processing checkout')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-200" />
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
            onClick={() => router.push('/products')}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-base rounded-xl"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-5">
                    <div className="w-24 h-24 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
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
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-4 border-t border-neutral-200">
                    <span>Total</span>
                    <span className="text-amber-600">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white py-6 rounded-xl font-semibold"
                  onClick={handleCheckout}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Proceed to Checkout'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
