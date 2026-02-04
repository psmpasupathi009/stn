'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
  ExternalLink,
  XCircle,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import type { Order, OrderItem } from '@/lib/types'

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

// Compliant: allow cancel only before order is shipped (pending, confirmed, processing = pre-shipment)
const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing']

const REFUND_REASONS = [
  { value: 'defective', label: 'Defective or damaged product' },
  { value: 'wrong_item', label: 'Wrong item received' },
  { value: 'damaged_in_transit', label: 'Damaged in transit' },
  { value: 'quality_issue', label: 'Quality not as expected' },
  { value: 'changed_mind', label: 'No longer needed / Changed mind' },
  { value: 'other', label: 'Other (please specify below)' },
]

function OrderCard({ order, refreshOrders }: { order: Order; refreshOrders: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundForm, setRefundForm] = useState({ reason: '', reasonOther: '', comment: '' })
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleCancelConfirm = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Order cancelled. If you had paid, you can request a refund below.')
        setShowCancelModal(false)
        refreshOrders()
      } else {
        toast.error(data.error || 'Failed to cancel order')
      }
    } catch {
      toast.error('Failed to cancel order')
    } finally {
      setLoading(false)
    }
  }

  const openRefundModal = () => {
    setRefundForm({ reason: '', reasonOther: '', comment: '' })
    setShowRefundModal(true)
  }

  const handleRequestRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundForm.reason) {
      toast.error('Please select a reason for refund.')
      return
    }
    if (refundForm.reason === 'other' && !refundForm.reasonOther.trim()) {
      toast.error('Please provide details for "Other".')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'requestRefund',
          reason: refundForm.reason,
          reasonOther: refundForm.reason === 'other' ? refundForm.reasonOther.trim() : undefined,
          comment: refundForm.comment.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Refund requested. We will review and get back to you within 5–7 business days.')
        setShowRefundModal(false)
        refreshOrders()
      } else {
        toast.error(data.error || 'Failed to request refund')
      }
    } catch {
      toast.error('Failed to request refund')
    } finally {
      setLoading(false)
    }
  }

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

      {/* Order Status Tracker + Cancel / Refund */}
      <div className="p-4 sm:p-6 bg-gray-50">
        <OrderStatusTracker status={order.status} />
        {order.paymentStatus === 'paid' && order.status === 'processing' && (
          <p className="mt-2 text-sm text-gray-600">Order placed and processing. You can cancel before we ship.</p>
        )}
        
        {/* Cancel: only before shipped (pending, confirmed, processing) */}
        {order.status !== 'cancelled' && CANCELLABLE_STATUSES.includes(order.status) && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Cancel order
            </button>
            <span className="text-xs text-gray-500">(Allowed only before we ship your order)</span>
          </div>
        )}
        
        {/* Request Refund / Refund status: only for paid orders */}
        {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
          <div className="mt-4 flex flex-wrap gap-2">
              {order.status === 'delivered' && !order.refundRequested && (
                <button
                  type="button"
                  onClick={openRefundModal}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3CB31A] bg-[#3CB31A]/10 hover:bg-[#3CB31A]/20 rounded-xl border border-[#3CB31A]/30 transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  Request refund
                </button>
              )}
              {order.refundRequested && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border ${
                    order.refundStatus === 'refunded' ? 'text-green-700 bg-green-50 border-green-200' :
                    order.refundStatus === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' :
                    order.refundStatus === 'approved' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                    'text-amber-700 bg-amber-50 border-amber-200'
                  }`}>
                    <RotateCcw className="w-4 h-4" />
                    {order.refundStatus === 'refunded' ? 'Refunded' :
                     order.refundStatus === 'rejected' ? 'Refund declined' :
                     order.refundStatus === 'approved' ? 'Refund approved' : 'Refund under review'}
                  </span>
                  {order.refundStatus === 'rejected' && order.refundRejectionReason && (
                    <p className="text-xs text-red-600 mt-1 w-full">Reason: {order.refundRejectionReason}</p>
                  )}
                </div>
              )}
          </div>
        )}
        {order.paymentStatus === 'paid' && order.status === 'cancelled' && !order.refundRequested && (
            <div className="mt-4">
              <button
                type="button"
                onClick={openRefundModal}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#3CB31A] bg-[#3CB31A]/10 hover:bg-[#3CB31A]/20 rounded-xl border border-[#3CB31A]/30 transition-colors disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Request refund
              </button>
            </div>
          )}
          {order.status === 'cancelled' && order.refundRequested && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-xl border ${
                order.refundStatus === 'refunded' ? 'text-green-700 bg-green-50 border-green-200' :
                order.refundStatus === 'rejected' ? 'text-red-700 bg-red-50 border-red-200' :
                order.refundStatus === 'approved' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                'text-amber-700 bg-amber-50 border-amber-200'
              }`}>
                <RotateCcw className="w-4 h-4" />
                {order.refundStatus === 'refunded' ? 'Refunded' :
                 order.refundStatus === 'rejected' ? 'Refund declined' :
                 order.refundStatus === 'approved' ? 'Refund approved' : 'Refund under review'}
              </span>
              {order.refundStatus === 'rejected' && order.refundRejectionReason && (
                <p className="text-xs text-red-600 mt-1 w-full">Reason: {order.refundRejectionReason}</p>
              )}
            </div>
          )}

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

      {/* Refund Request Modal (reason required, compliance-friendly) */}
      {showRefundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-lg font-bold text-gray-900">Request refund</h3>
              <p className="text-sm text-gray-600 mt-1">Order #{order.id.slice(-8).toUpperCase()} · ₹{order.totalAmount.toLocaleString('en-IN')}</p>
            </div>
            <form onSubmit={handleRequestRefundSubmit} className="p-4 sm:p-6 space-y-4">
              <p className="text-sm text-gray-600">Please select a reason for your refund request. We will review it within 5–7 business days, per our refund policy.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for refund <span className="text-red-500">*</span></label>
                <select
                  required
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select reason...</option>
                  {REFUND_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              {refundForm.reason === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Please specify <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={refundForm.reasonOther}
                    onChange={(e) => setRefundForm({ ...refundForm, reasonOther: e.target.value })}
                    placeholder="Describe your reason..."
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{refundForm.reasonOther.length}/500</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional details (optional)</label>
                <textarea
                  value={refundForm.comment}
                  onChange={(e) => setRefundForm({ ...refundForm, comment: e.target.value })}
                  placeholder="Any other information that may help us..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">{refundForm.comment.length}/1000</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowRefundModal(false)} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#3CB31A] hover:opacity-90 text-white" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel order confirmation modal (compliance: clear policy + confirm) */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Cancel order?</h3>
            <p className="text-sm text-gray-600 mb-2">
              Order #{order.id.slice(-8).toUpperCase()} · ₹{order.totalAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-sm font-medium text-gray-800 mb-2">
              When can you cancel? You can cancel <strong>anytime before we ship</strong> your order (while it is Pending, Confirmed, or Processing). Once we have shipped your order, cancellation is not possible, as per standard practice and consumer policy.
            </p>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. See our <strong>Terms</strong> and <strong>Shipping &amp; Returns</strong> for full policy.
            </p>
            {order.paymentStatus === 'paid' && (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                If you have already paid, you can request a refund from this page after cancellation. Refunds are processed as per our refund policy.
              </p>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCancelModal(false)} disabled={loading}>
                Keep order
              </Button>
              <Button type="button" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={handleCancelConfirm} disabled={loading}>
                {loading ? 'Cancelling...' : 'Yes, cancel order'}
              </Button>
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

  const fetchOrders = useCallback(async () => {
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
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    fetchOrders()
  }, [isAuthenticated, router, fetchOrders])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filter === 'all') return true
      if (filter === 'active') return !['delivered', 'cancelled'].includes(order.status) && order.paymentStatus === 'paid'
      if (filter === 'delivered') return order.status === 'delivered'
      if (filter === 'cancelled') return order.status === 'cancelled'
      return true
    })
  }, [orders, filter])

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
              <OrderCard key={order.id} order={order} refreshOrders={fetchOrders} />
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
