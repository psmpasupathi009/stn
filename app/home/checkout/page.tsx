'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/lib/context'
import Script from 'next/script'
import { toast } from 'sonner'
import { ShoppingBag, Truck, Shield, ChevronLeft, Package, MapPin } from 'lucide-react'

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

interface BuyNowProduct {
  id: string
  name: string
  salePrice: number
  mrp: number
  image?: string
  quantity: number
}

const GST_RATE = 0.05 // 5% GST

function CheckoutContent() {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [buyNowProduct, setBuyNowProduct] = useState<BuyNowProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [isBuyNow, setIsBuyNow] = useState(false)
  
  // Shipping address state
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCartItems(data?.items || [])
      }
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchProduct = useCallback(async (productId: string, quantity: number) => {
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const product = await res.json()
        setBuyNowProduct({
          id: product.id,
          name: product.name,
          salePrice: product.salePrice,
          mrp: product.mrp,
          image: product.image,
          quantity: quantity,
        })
      } else {
        toast.error('Product not found')
        router.push('/home/products')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      toast.error('Failed to load product')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }

    const productId = searchParams.get('productId')
    const quantity = searchParams.get('quantity') || '1'
    
    if (productId) {
      // Buy Now flow - fetch single product
      setIsBuyNow(true)
      fetchProduct(productId, parseInt(quantity))
    } else {
      // Normal checkout - fetch cart
      setIsBuyNow(false)
      fetchCart()
    }
  }, [isAuthenticated, router, searchParams, fetchProduct, fetchCart])

  // Get items for display (either buyNow product or cart items)
  const getOrderItems = () => {
    if (isBuyNow && buyNowProduct) {
      return [{
        id: 'buynow',
        quantity: buyNowProduct.quantity,
        product: {
          id: buyNowProduct.id,
          name: buyNowProduct.name,
          salePrice: buyNowProduct.salePrice,
          mrp: buyNowProduct.mrp,
          image: buyNowProduct.image,
        }
      }]
    }
    return cartItems
  }

  const orderItems = getOrderItems()

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0)
  const gstAmount = Math.round(subtotal * GST_RATE * 100) / 100
  const deliveryCharge = 0 // Free delivery
  const totalAmount = subtotal + gstAmount + deliveryCharge
  const totalSavings = orderItems.reduce((sum, item) => sum + (item.product.mrp - item.product.salePrice) * item.quantity, 0)

  const handleAddressChange = (field: string, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }))
  }

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']
    for (const field of required) {
      if (!address[field as keyof typeof address]?.trim()) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }
    if (address.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return false
    }
    if (address.pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode')
      return false
    }
    return true
  }

  const handlePayment = async () => {
    if (!validateAddress()) return
    if (orderItems.length === 0) return

    setProcessing(true)
    try {
      const shippingAddress = `${address.fullName}, ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}, ${address.city}, ${address.state} - ${address.pincode}, Phone: ${address.phone}`

      // Create order
      const orderPayload = {
        items: orderItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.salePrice,
        })),
        shippingAddress,
        gstAmount,
        deliveryCharge,
        isBuyNow,
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      })

      const data = await res.json()

      if (res.ok) {
        // Initialize Razorpay
        const options = {
          key: data.key,
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          name: 'STN Products',
          description: isBuyNow ? 'Buy Now Order' : 'Cart Order',
          order_id: data.razorpayOrderId,
          handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
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
              toast.success('Payment successful! Order placed.')
              router.push('/home/orders')
            } else {
              toast.error('Payment verification failed')
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#16a34a',
          },
        }

        const RazorpayConstructor = (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay
        const razorpay = new RazorpayConstructor(options)
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
          <div className="w-12 h-12 rounded-full bg-green-200" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (orderItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h2>
          <p className="text-gray-600 mb-6">Add some products to continue.</p>
          <Button
            onClick={() => router.push('/home/products')}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-base rounded-xl"
          >
            Browse Products
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 md:py-10 max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href={isBuyNow ? '/home/products' : '/home/cart'} className="text-gray-600 hover:text-gray-900">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Checkout</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Address & Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <Input
                      value={address.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      placeholder="Enter full name"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <Input
                      value={address.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit mobile number"
                      className="h-11"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1 *</label>
                    <Input
                      value={address.addressLine1}
                      onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
                      placeholder="House/Flat no., Building name, Street"
                      className="h-11"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2</label>
                    <Input
                      value={address.addressLine2}
                      onChange={(e) => handleAddressChange('addressLine2', e.target.value)}
                      placeholder="Landmark, Area (optional)"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <Input
                      value={address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="City"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                    <Input
                      value={address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="State"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                    <Input
                      value={address.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6-digit pincode"
                      className="h-11"
                    />
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900">Order Items ({orderItems.length})</h2>
                </div>
                <div className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                        {item.product.image ? (
                          <Image src={item.product.image} alt={item.product.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-500 mb-1">Qty: {item.quantity}</p>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">₹{item.product.salePrice}</span>
                          {item.product.mrp > item.product.salePrice && (
                            <span className="text-sm text-gray-400 line-through">₹{item.product.mrp}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-gray-900">₹{(item.product.salePrice * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({orderItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST (5%)</span>
                    <span>₹{gstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Delivery
                    </span>
                    <span className="font-medium">FREE</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-600 bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                      <span>You Save</span>
                      <span className="font-semibold">₹{totalSavings.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-green-600">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>

                {/* Pay Button */}
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-xl font-semibold text-base"
                  onClick={handlePayment}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                </Button>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>Secure payment via Razorpay</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="w-5 h-5 text-green-600" />
                    <span>Free delivery across India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function CheckoutFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  )
}
