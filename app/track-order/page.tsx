'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<{
    id: string
    status: string
    paymentStatus: string
    totalAmount: number
    createdAt: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      // Here you would call your API to track the order
      // For now, this is a placeholder
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to track your order')
        setLoading(false)
        return
      }

      const res = await fetch(`/api/orders?orderId=${orderId}&email=${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setOrder(data)
      } else {
        setError('Order not found. Please check your order ID and email.')
      }
    } catch (err) {
      setError('Failed to track order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Track Your Order
          </h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Enter your order ID and email to track your order status
          </p>

          <form onSubmit={handleTrack} className="space-y-6 bg-gray-50 p-8 rounded-lg">
            <div>
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-black text-white hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </Button>
          </form>

          {order && (
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Order Details</h2>
              <div className="space-y-2">
                <p><strong>Order ID:</strong> {order.id}</p>
                <p><strong>Status:</strong> {order.status}</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                <p><strong>Total Amount:</strong> ₹{order.totalAmount}</p>
                <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
