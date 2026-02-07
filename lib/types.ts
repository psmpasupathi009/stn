/**
 * Shared types across app – single source of truth for faster refactors and smaller bundles.
 * Import from '@/lib/types' instead of defining inline.
 */

// —— Order (customer orders, track-order, admin) ——
export interface OrderItemProduct {
  id: string
  name: string
  image?: string
  weight?: string
}

export interface OrderItem {
  id: string
  quantity: number
  price: number
  product: OrderItemProduct
}

export interface Order {
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
  refundRequested?: boolean
  refundRequestedAt?: string
  refundReason?: string
  refundReasonOther?: string
  refundComment?: string
  refundStatus?: string
  refundProcessedAt?: string
  refundRejectionReason?: string
  items: OrderItem[]
  createdAt: string
}

// —— Product (listing, detail, cards) ——
export interface Product {
  id: string
  name: string
  category: string
  salePrice: number
  mrp: number
  image?: string
  images?: string[]
  itemCode?: string
  weight?: string
  description?: string
  inStock?: boolean
  gst?: number
  hsnCode?: string
  rating?: number
  reviewCount?: number
  createdAt?: string
  updatedAt?: string
}

// —— Cart ——
export interface CartItemProduct {
  id: string
  name: string
  salePrice: number
  mrp: number
  image?: string
}

export interface CartItem {
  id: string
  quantity: number
  product: CartItemProduct
}

export interface Cart {
  id: string
  items: CartItem[]
}

// —— Review (product detail) ——
export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment: string | null
  createdAt: string
  user: { name: string | null; email: string }
}

// —— Buy Now (checkout) ——
export interface BuyNowProduct {
  id: string
  name: string
  salePrice: number
  mrp: number
  image?: string
  quantity: number
}

// —— About (Our Story page sections) ——
export interface AboutSection {
  id: string
  title: string
  content: string
  image?: string
  imageLeft: boolean
  order: number
}
