'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Search,
  Calendar,
  CreditCard,
  ArrowRight,
} from 'lucide-react'

import type { Order, OrderItem } from '@/lib/types'

const TRACKING_STEPS = [
  { 
    status: 'pending', 
    label: 'Order Placed', 
    description: 'Your order has been placed successfully',
    icon: ShoppingBag 
  },
  { 
    status: 'confirmed', 
    label: 'Order Confirmed', 
    description: 'Your order has been confirmed',
    icon: CheckCircle2 
  },
  { 
    status: 'processing', 
    label: 'Processing', 
    description: 'Your order is being prepared',
    icon: Package 
  },
  { 
    status: 'shipped', 
    label: 'Shipped', 
    description: 'Your order is on the way',
    icon: Truck 
  },
  { 
    status: 'out_for_delivery', 
    label: 'Out for Delivery', 
    description: 'Your order will be delivered today',
    icon: MapPin 
  },
  { 
    status: 'delivered', 
    label: 'Delivered', 
    description: 'Your order has been delivered',
    icon: CheckCircle2 
  },
]

function getStatusIndex(status: string): number {
  const index = TRACKING_STEPS.findIndex(s => s.status === status)
  return index >= 0 ? index : 0
}

function TimelineTracker({ order }: { order: Order }) {
  const currentIndex = getStatusIndex(order.status)
  const isCancelled = order.status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Package className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-xl font-bold text-red-700 mb-2">Order Cancelled</h3>
        <p className="text-red-600 mb-4">This order has been cancelled.</p>
        {order.paymentStatus === 'paid' && (
          <>
            <p className="text-sm text-gray-700 mb-3">If you had paid for this order, you can request a refund from My Orders.</p>
            <Link href="/home/orders">
              <Button className="bg-[var(--primary-green)] hover:opacity-90 text-white gap-2">
                Go to My Orders
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      {TRACKING_STEPS.map((step, index) => {
        const isCompleted = index <= currentIndex
        const isCurrent = index === currentIndex
        const Icon = step.icon

        // Get timestamp for this step
        let timestamp = ''
        if (index === 0 && order.createdAt) {
          timestamp = new Date(order.createdAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        } else if (step.status === 'shipped' && order.shippedAt) {
          timestamp = new Date(order.shippedAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        } else if (step.status === 'delivered' && order.deliveredAt) {
          timestamp = new Date(order.deliveredAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })
        }

        return (
          <div key={step.status} className="flex gap-4 pb-8 last:pb-0">
            {/* Timeline Line & Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-neutral-600 border-neutral-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-neutral-200' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              {index < TRACKING_STEPS.length - 1 && (
                <div className={`w-0.5 flex-1 mt-2 ${isCompleted ? 'bg-neutral-500' : 'bg-gray-200'}`} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h4 className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </h4>
                  <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                    {step.description}
                  </p>
                </div>
                {timestamp && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {timestamp}
                  </span>
                )}
              </div>

              {/* Show shipping info when shipped */}
              {step.status === 'shipped' && isCompleted && order.trackingNumber && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tracking: </span>
                      <span className="font-mono font-medium">{order.trackingNumber}</span>
                    </div>
                    {order.courierName && (
                      <div>
                        <span className="text-gray-500">Courier: </span>
                        <span className="font-medium">{order.courierName}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Show expected delivery when applicable */}
              {step.status === 'out_for_delivery' && isCurrent && order.expectedDelivery && (
                <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-700">
                    <span className="font-medium">Expected by: </span>
                    {new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    const trimmedOrderId = orderId.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedOrderId || !trimmedEmail) {
      setError('Please enter both Order ID and Email')
      setLoading(false)
      return
    }

    try {
      const params = new URLSearchParams({
        orderId: trimmedOrderId,
        email: trimmedEmail,
      })
      const res = await fetch(`/api/orders?${params.toString()}`, {
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        setError('Order not found. Please check your order ID and email.')
      }
    } catch {
      setError('Failed to track order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <Search className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your order ID and email to see the delivery status
          </p>
        </div>

        {/* Track Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-5">
            <div>
              <Label htmlFor="orderId" className="text-sm font-medium text-gray-700">
                Order ID
              </Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Full ID or last 8 chars (e.g., 439011)"
                className="mt-1.5 h-12"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter the email used for order"
                className="mt-1.5 h-12"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-neutral-800 hover:bg-neutral-900 text-white text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Tracking...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Track Order
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Order Header */}
            <div className="p-6 bg-neutral-800 text-white">
              <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                  <p className="text-neutral-300 text-sm mb-1">Order ID</p>
                  <h2 className="text-2xl font-bold">#{order.id.slice(-8).toUpperCase()}</h2>
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm mb-1">Total Amount</p>
                  <p className="text-2xl font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-neutral-400" />
                  <span className={order.paymentStatus === 'paid' ? 'text-white' : 'text-yellow-200'}>
                    {order.paymentStatus === 'paid' ? 'Payment Complete' : 'Payment ' + order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            {order.paymentStatus === 'paid' ? (
              <div className="p-6 md:p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
                <TimelineTracker order={order} />
              </div>
            ) : (
              <div className="p-6 text-center">
                <Clock className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Pending</h3>
                <p className="text-gray-600">
                  Please complete your payment to start order processing.
                </p>
              </div>
            )}

            {/* Order Items */}
            <div className="p-6 md:p-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="relative w-16 h-16 bg-white rounded-lg overflow-hidden shrink-0 border border-gray-200">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="p-6 md:p-8 border-t border-gray-100 bg-gray-50">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Shipping Address
                </h3>
                <p className="text-gray-600 whitespace-pre-wrap">{order.shippingAddress}</p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Need help?{' '}
            <Link href="/home/contact" className="text-neutral-700 hover:text-neutral-900 font-medium">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
