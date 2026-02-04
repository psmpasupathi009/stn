'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { 
  Package, 
  CheckCircle2, 
  Truck, 
  MapPin,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Copy,
  ExternalLink
} from 'lucide-react'
import { toast } from 'sonner'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image?: string
    weight?: string
  }
}

interface Order {
  id: string
  totalAmount: number
  subtotal?: number
  gstAmount?: number
  status: string
  paymentStatus: string
  shippingAddress: string
  trackingNumber?: string
  courierName?: string
  shippedAt?: string
  expectedDelivery?: string
  deliveredAt?: string
  items: OrderItem[]
  createdAt: string
}

const ORDER_STEPS = [
  { status: 'pending', label: 'Order Placed', icon: ShoppingBag },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { status: 'processing', label: 'Processing', icon: Package },
  { status: 'shipped', label: 'Shipped', icon: Truck },
  { status: 'out_for_delivery', label: 'Out for Delivery', icon: MapPin },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle2 },
]

function getStatusIndex(status: string): number {
  const index = ORDER_STEPS.findIndex(s => s.status === status)
  return index >= 0 ? index : 0
}

function OrderStatusTracker({ status }: { status: string }) {
  const currentIndex = getStatusIndex(status)
  const isCancelled = status === 'cancelled'

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">This order has been cancelled</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="flex justify-between mb-2">
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex
          const Icon = step.icon

          return (
            <div key={step.status} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isCompleted
                    ? 'bg-[#3CB31A] border-[#3CB31A] text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-[#3CB31A]/30' : ''}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className={`text-xs mt-2 text-center ${isCompleted ? 'text-[#3CB31A] font-medium' : 'text-gray-400'}`}>
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
      {/* Progress Line */}
      <div className="absolute top-4 sm:top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10 mx-4 sm:mx-5">
        <div
          className="h-full bg-[#3CB31A] transition-all duration-500"
          style={{ width: `${(currentIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id)
    toast.success('Order ID copied!')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Order Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">Order #{order.id.slice(-8).toUpperCase()}</h3>
              <button onClick={copyOrderId} className="text-gray-400 hover:text-gray-600">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">₹{order.totalAmount.toLocaleString('en-IN')}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                order.paymentStatus === 'paid' ? 'bg-[#3CB31A]/15 text-[#3CB31A]' :
                order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Tracker */}
      {order.paymentStatus === 'paid' && (
        <div className="p-4 sm:p-6 bg-gray-50">
          <OrderStatusTracker status={order.status} />
          
          {/* Shipping Info */}
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <p className="text-xs text-gray-500">Tracking Number</p>
                  <p className="font-mono font-medium">{order.trackingNumber}</p>
                </div>
                {order.courierName && (
                  <div>
                    <p className="text-xs text-gray-500">Courier</p>
                    <p className="font-medium">{order.courierName}</p>
                  </div>
                )}
                {order.expectedDelivery && (
                  <div>
                    <p className="text-xs text-gray-500">Expected Delivery</p>
                    <p className="font-medium">
                      {new Date(order.expectedDelivery).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Items */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-center gap-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {isExpanded ? 'Hide' : 'Show'} Order Details
        <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Order Items */}
      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-gray-100">
          <h4 className="font-semibold mb-4">Order Items</h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
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
                  <Link href={`/home/products/${item.product.id}`} className="font-medium hover:text-[#3CB31A] line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    {item.product.weight && `${item.product.weight} • `}
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-500">₹{item.price} each</p>
                </div>
              </div>
            ))}
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Shipping Address
              </h5>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{order.shippingAddress}</p>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{(order.subtotal || order.totalAmount - (order.gstAmount || 0)).toLocaleString('en-IN')}</span>
            </div>
            {order.gstAmount && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">GST (5%)</span>
                <span>₹{order.gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Delivery</span>
              <span className="text-neutral-700">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, router])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status) && order.paymentStatus === 'paid'
    if (filter === 'delivered') return order.status === 'delivered'
    if (filter === 'cancelled') return order.status === 'cancelled'
    return true
  })

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neutral-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'active', label: 'Active' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-[#3CB31A] text-white hover:opacity-90'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
              {tab.value === 'active' && orders.filter(o => !['delivered', 'cancelled'].includes(o.status) && o.paymentStatus === 'paid').length > 0 && (
                <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                  {orders.filter(o => !['delivered', 'cancelled'].includes(o.status) && o.paymentStatus === 'paid').length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "When you place an order, it will appear here." 
                : "No orders match this filter."}
            </p>
            <Button
              onClick={() => router.push('/home/products')}
              className="bg-[#3CB31A] hover:opacity-90 text-white"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {/* Track Order Link */}
        <div className="mt-8 text-center">
          <Link
            href="/home/track-order"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#3CB31A] font-medium"
          >
            Track order with Order ID
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
