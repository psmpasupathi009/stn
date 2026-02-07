'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { 
  Package, 
  MapPin,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Copy,
  Truck,
  XCircle,
  RotateCcw,
  RefreshCw,
  Share2,
  FileText,
} from 'lucide-react'
import { generateInvoicePDF, type InvoiceOrder } from '@/lib/invoice-pdf'
import { toast } from 'sonner'
import type { Order, OrderItem } from '@/lib/types'

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

function StatusBadge({ status }: { status: string }) {
  const label = STATUS_LABELS[status] || status
  const isCancelled = status === 'cancelled'
  const isDelivered = status === 'delivered'
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
        isCancelled ? 'bg-red-100 text-red-700' :
        isDelivered ? 'bg-[#3CB31A]/15 text-[#3CB31A]' :
        'bg-neutral-100 text-neutral-700'
      }`}
    >
      {label}
    </span>
  )
}

// Compliant: allow cancel only before order is shipped (pending, confirmed, processing = pre-shipment)
const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing']

function BuyAgainButton({ order }: { order: Order }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBuyAgain = async () => {
    setLoading(true)
    try {
      for (const item of order.items) {
        await fetch('/api/cart', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: item.product.id, quantity: item.quantity }),
        })
      }
      window.dispatchEvent(new CustomEvent('cart-updated'))
      toast.success('Items added to cart')
      router.push('/home/cart')
    } catch {
      toast.error('Could not add items to cart')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleBuyAgain}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#3CB31A] hover:opacity-90 rounded-xl transition-opacity disabled:opacity-50 shadow-sm"
    >
      {loading ? (
        <RefreshCw className="w-4 h-4 animate-spin" />
      ) : (
        <RefreshCw className="w-4 h-4" />
      )}
      Buy again
    </button>
  )
}

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

  const shareOrder = async () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/home/track-order?orderId=${encodeURIComponent(order.id)}` : ''
    const title = `Order #${order.id.slice(-8).toUpperCase()} - STN Golden Healthy Foods`
    const text = `Track this order: ${url}`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        toast.success('Link shared!')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') copyShareLink(url)
      }
    } else {
      copyShareLink(url)
    }
  }

  const copyShareLink = (url: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Sharing not supported')
      return
    }
    navigator.clipboard.writeText(url).then(
      () => toast.success('Track link copied to clipboard'),
      () => toast.error('Could not copy link')
    )
  }

  const firstImage = order.items[0]?.product?.image
  const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0)
  const isDelivered = order.status === 'delivered'
  const isCancelled = order.status === 'cancelled'

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
      isCancelled ? 'border-red-100 shadow-sm' :
      isDelivered ? 'border-[#3CB31A]/20 shadow-md' :
      'border-neutral-200 shadow-md'
    }`}>
      {/* Accent strip by status */}
      <div className={`h-1 w-full ${
        isCancelled ? 'bg-red-200' :
        isDelivered ? 'bg-[#3CB31A]/30' :
        'bg-neutral-200'
      }`} />
      <div className="p-4 sm:p-6 border-b border-neutral-100">
        <div className="flex gap-4 sm:gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-neutral-100 shrink-0 overflow-hidden ring-2 ring-neutral-100 ring-offset-2">
            {firstImage ? (
              <Image
                src={firstImage}
                alt=""
                fill
                className="object-cover"
                unoptimized
                sizes="96px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-8 h-8 text-neutral-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg sm:text-xl text-neutral-900">Order #{order.id.slice(-8).toUpperCase()}</h3>
                <button onClick={copyOrderId} className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors" aria-label="Copy order ID">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 shrink-0" />
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={order.status} />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' ? 'bg-[#3CB31A]/15 text-[#3CB31A]' :
                  order.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className={`text-2xl sm:text-3xl font-bold ${
                order.paymentStatus === 'paid' && !isCancelled ? 'text-[#3CB31A]' : 'text-neutral-900'
              }`}>
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-4 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100">
        <div className="flex flex-wrap items-center gap-2">
          {order.paymentStatus === 'paid' && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/orders/${order.id}?invoice=true`, { credentials: 'include' })
                  if (!res.ok) return toast.error('Could not load invoice')
                  const { order: inv } = (await res.json()) as { order: InvoiceOrder }
                  const jsPDF = (await import('jspdf')).default
                  const doc = generateInvoicePDF(jsPDF, inv)
                  doc.save(`invoice-${order.id.slice(-8).toUpperCase()}-${new Date(order.createdAt).toISOString().slice(0, 10)}.pdf`)
                  toast.success('Invoice downloaded')
                } catch {
                  toast.error('Failed to generate invoice')
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" />
              Download invoice
            </button>
          )}
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <Link
              href={`/home/track-order?orderId=${encodeURIComponent(order.id)}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#3CB31A] bg-white border border-[#3CB31A]/40 hover:bg-[#3CB31A]/10 rounded-xl transition-colors shadow-sm"
            >
              <Truck className="w-4 h-4" />
              Track order
            </Link>
          )}
          {order.status !== 'cancelled' && (
            <button
              type="button"
              onClick={shareOrder}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors shadow-sm"
              aria-label="Share order"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          )}
          {order.status === 'delivered' && (
            <BuyAgainButton order={order} />
          )}
          {order.status !== 'cancelled' && CANCELLABLE_STATUSES.includes(order.status) && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              <XCircle className="w-4 h-4" />
              Cancel order
            </button>
          )}
          {order.paymentStatus === 'paid' && order.status === 'delivered' && !order.refundRequested && (
            <button
              type="button"
              onClick={openRefundModal}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Request refund
            </button>
          )}
          {order.paymentStatus === 'paid' && order.status === 'cancelled' && !order.refundRequested && (
            <button
              type="button"
              onClick={openRefundModal}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-[#3CB31A] bg-white border border-[#3CB31A]/40 hover:bg-[#3CB31A]/10 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Request refund
            </button>
          )}
          {order.refundRequested && (
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
          )}
        </div>
        {order.status === 'cancelled' && (
          <p className="mt-3 text-sm text-red-600 font-medium bg-red-50/80 rounded-lg px-3 py-2">This order has been cancelled.</p>
        )}
        {order.trackingNumber && order.status !== 'cancelled' && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-neutral-600 bg-white/60 rounded-lg px-3 py-2">
            <span className="font-medium">Tracking:</span>
            <span className="font-mono">{order.trackingNumber}</span>
            {order.courierName && <span className="text-neutral-500">· {order.courierName}</span>}
          </div>
        )}
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full py-3.5 px-4 flex items-center justify-center gap-2 text-sm font-medium text-neutral-600 hover:text-[#3CB31A] hover:bg-[#3CB31A]/5 transition-all duration-200 border-t border-neutral-100"
      >
        {isExpanded ? 'Hide' : 'View'} order details
        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="p-4 sm:p-6 border-t border-neutral-100 bg-neutral-50/50">
          <h4 className="font-semibold text-neutral-900 mb-4">Order items</h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white border border-neutral-100 shadow-sm hover:shadow transition-shadow">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg overflow-hidden shrink-0">
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

          {order.shippingAddress && (
            <div className="mt-6 p-4 bg-white rounded-xl border border-neutral-100">
              <h5 className="font-medium text-sm text-neutral-800 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-neutral-500" />
                Shipping address
              </h5>
              <p className="text-sm text-neutral-600 whitespace-pre-wrap">{order.shippingAddress}</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-neutral-200 space-y-2">
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Subtotal</span>
              <span>₹{(order.subtotal || order.totalAmount - (order.gstAmount || 0)).toLocaleString('en-IN')}</span>
            </div>
            {order.gstAmount && (
              <div className="flex justify-between text-sm text-neutral-600">
                <span>GST (5%)</span>
                <span>₹{order.gstAmount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-neutral-600">
              <span>Delivery</span>
              <span className="text-neutral-700">FREE</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-neutral-200">
              <span className="text-neutral-900">Total</span>
              <span className="text-neutral-900">₹{order.totalAmount.toLocaleString('en-IN')}</span>
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

  const activeCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status) && o.paymentStatus === 'paid').length

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-gradient-to-b from-[#3CB31A]/[0.03] to-neutral-50">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 max-w-4xl">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">My Orders</h1>
            <p className="text-sm text-neutral-600 mt-1">View orders and track delivery</p>
          </div>
          {orders.length > 0 && (
            <p className="text-sm text-neutral-500">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
              {filter !== 'all' && ` (${filter})`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {[
            { value: 'all', label: 'All Orders' },
            { value: 'active', label: 'Active' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3CB31A] focus-visible:ring-offset-2 ${
                filter === tab.value
                  ? 'bg-[#3CB31A] text-white shadow-lg shadow-[#3CB31A]/25 scale-[1.02]'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 border border-neutral-200'
              }`}
            >
              {tab.label}
              {tab.value === 'active' && activeCount > 0 && (
                <span className={`ml-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                  filter === tab.value ? 'bg-white/30' : 'bg-neutral-100 text-neutral-600'
                }`}>
                  {activeCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders list or empty state */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-8 sm:p-14 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#3CB31A]/10 to-neutral-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-[#3CB31A]/60" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h2>
            <p className="text-neutral-600 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
              {filter === 'all'
                ? 'When you place an order, it will appear here. Start shopping to see your first order.'
                : 'No orders match this filter. Try another tab.'}
            </p>
            <Button
              onClick={() => router.push('/home/products')}
              className="bg-[#3CB31A] hover:bg-[#34a017] text-white rounded-xl px-8 py-3 font-semibold shadow-lg shadow-[#3CB31A]/20 transition-all"
            >
              Start shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-5 sm:space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} refreshOrders={fetchOrders} />
            ))}
          </div>
        )}

        <div className="mt-8 sm:mt-10 flex justify-center">
          <Link
            href="/home/track-order"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-neutral-700 bg-white border border-neutral-200 hover:border-[#3CB31A]/40 hover:text-[#3CB31A] hover:bg-[#3CB31A]/5 transition-all shadow-sm"
          >
            <Truck className="w-4 h-4" />
            Track order with Order ID &amp; email
          </Link>
        </div>
      </div>
    </div>
  )
}
