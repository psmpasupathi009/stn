'use client'

import { useEffect, useState } from 'react'
import { jsPDF } from 'jspdf'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import {
  Package,
  Image as ImageIcon,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  ShoppingBag,
  Truck,
  Download,
  CheckSquare,
  Square,
  Search,
  Filter,
  RefreshCw,
  X,
  Images,
  Video,
} from 'lucide-react'
import SortableGalleryList from '@/components/admin/SortableGalleryList'
import SortableHeroGrid from '@/components/admin/SortableHeroGrid'

interface Product {
  id: string
  name: string
  category: string
  itemCode: string
  weight: string
  mrp: number
  salePrice: number
  gst: number
  hsnCode: string
  image?: string
  images?: string[]
  description?: string
  inStock: boolean
  rating?: number
  reviewCount?: number
}

interface HeroSection {
  id: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  image?: string
  icon?: string
  order: number
  isActive: boolean
}

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image?: string
    itemCode: string
    weight: string
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
  adminNotes?: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name?: string
    email: string
    phoneNumber?: string
  }
  items: OrderItem[]
}

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-neutral-100 text-neutral-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
]

const CATEGORIES = [
  'HEALTHY  MIXES',
  'IDLY PODI VARIETIES',
  'HOME MADE MASALA',
  'VAGAI WOOD PERSSED OIL / COLD PRESSED OIL',
  'KOVILPATTI SPECIAL',
  'HEALTHY FLOUR & KALI MIXES',
  'NATURAL SWEETNERS',
  'Explorer pack / Trail pack',
  'Essential Millets',
]

interface GalleryItem {
  id: string
  url: string
  type: string
  caption?: string
  order: number
}

type TabType = 'products' | 'hero' | 'orders' | 'gallery'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('products')
  
  // Products state
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    itemCode: '',
    weight: '',
    mrp: '',
    salePrice: '',
    gst: '',
    hsnCode: '',
    description: '',
    inStock: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkStockUpdating, setBulkStockUpdating] = useState(false)

  // Hero sections state
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [showHeroForm, setShowHeroForm] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null)
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/home/products',
    icon: '',
    order: 0,
    isActive: true,
  })
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null)
  const [heroLoading, setHeroLoading] = useState(false)

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [orderStatusFilter, setOrderStatusFilter] = useState('all')
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all')
  const [orderDateFrom, setOrderDateFrom] = useState('')
  const [orderDateTo, setOrderDateTo] = useState('')
  const [orderSearch, setOrderSearch] = useState('')
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [bulkStatus, setBulkStatus] = useState('')
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false)
  const [shippingFormData, setShippingFormData] = useState({
    status: '',
    trackingNumber: '',
    courierName: '',
    expectedDelivery: '',
    adminNotes: '',
  })

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [galleryMediaFile, setGalleryMediaFile] = useState<File | null>(null)
  const [galleryMediaType, setGalleryMediaType] = useState<'image' | 'video'>('image')
  const [galleryCaption, setGalleryCaption] = useState('')
  const [galleryUploading, setGalleryUploading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    if (user?.role?.toUpperCase() !== 'ADMIN') {
      router.push('/home')
      return
    }
    fetchProducts()
    fetchCategories()
    fetchHeroSections()
    fetchOrders()
    fetchGallery()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when auth is ready; fetch fns are stable in intent
  }, [isAuthenticated, user, router])

  // Products functions
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = selectedCategory
        ? `/api/products?category=${encodeURIComponent(selectedCategory)}`
        : '/api/products'
      const res = await fetch(url, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        let filtered = data
        if (searchQuery) {
          filtered = data.filter((p: Product) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }
        setProducts(filtered)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.map((c: { category: string }) => c.category))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Hero sections functions
  const fetchHeroSections = async () => {
    try {
      const res = await fetch('/api/hero-sections?active=false', { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setHeroSections(data)
      }
    } catch (error) {
      console.error('Error fetching hero sections:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role?.toUpperCase() === 'ADMIN') {
      fetchProducts()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchProducts when category/search change only
  }, [selectedCategory, searchQuery])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUpload = async (): Promise<string | null> => {
    if (!imageFile) return editingProduct?.image || null

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      }
      return null
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const categoryValue = formData.category === '__other__' ? newCategoryName.trim() : formData.category
    if (!categoryValue) {
      toast.error('Please select or enter a category.')
      return
    }
    setUploading(true)

    try {
      const imageUrl = await handleImageUpload()

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          category: categoryValue,
          image: imageUrl || editingProduct?.image || null,
          mrp: parseFloat(formData.mrp),
          salePrice: parseFloat(formData.salePrice),
          gst: parseFloat(formData.gst || '0'),
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingProduct(null)
        setNewCategoryName('')
        setFormData({
          name: '',
          category: '',
          itemCode: '',
          weight: '',
          mrp: '',
          salePrice: '',
          gst: '',
          hsnCode: '',
          description: '',
          inStock: true,
        })
        setImageFile(null)
        setImagePreview(null)
        fetchProducts()
        fetchCategories()
        toast.success(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      itemCode: product.itemCode,
      weight: product.weight,
      mrp: product.mrp.toString(),
      salePrice: product.salePrice.toString(),
      gst: product.gst.toString(),
      hsnCode: product.hsnCode,
      description: product.description || '',
      inStock: product.inStock,
    })
    setImagePreview(product.image || null)
    setImageFile(null)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        fetchProducts()
        alert('Product deleted successfully!')
      } else {
        toast.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const toggleProductSelection = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set())
    } else {
      setSelectedProducts(new Set(products.map((p) => p.id)))
    }
  }

  const handleBulkStockChange = async (inStock: boolean) => {
    const ids = Array.from(selectedProducts)
    if (ids.length === 0) return
    setBulkStockUpdating(true)
    try {
      const results = await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ inStock }),
          })
        )
      )
      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !(r as PromiseFulfilledResult<Response>).value.ok))
      if (failed.length > 0) {
        toast.error(`Failed to update ${failed.length} product(s)`)
      } else {
        toast.success(`${ids.length} product(s) set to ${inStock ? 'In Stock' : 'Out of Stock'}`)
        setSelectedProducts(new Set())
        fetchProducts()
      }
    } catch (error) {
      console.error('Bulk stock update error:', error)
      toast.error('Failed to update stock')
    } finally {
      setBulkStockUpdating(false)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingProduct(null)
    setNewCategoryName('')
    setFormData({
      name: '',
      category: '',
      itemCode: '',
      weight: '',
      mrp: '',
      salePrice: '',
      gst: '',
      hsnCode: '',
      description: '',
      inStock: true,
    })
    setImageFile(null)
    setImagePreview(null)
  }

  // Hero section handlers
  const handleHeroImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHeroImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setHeroImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHeroImageUpload = async (): Promise<string | null> => {
    if (!heroImageFile) return editingHero?.image || null

    try {
      const formData = new FormData()
      formData.append('file', heroImageFile)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (res.ok) {
        const data = await res.json()
        return data.url
      }
      return null
    } catch (error) {
      console.error('Error uploading hero image:', error)
      return null
    }
  }

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate image for new slides
    if (!editingHero && !heroImageFile && !heroImagePreview) {
      toast.error('Please upload a banner image')
      return
    }
    
    setHeroLoading(true)

    try {
      const imageUrl = await handleHeroImageUpload()

      const url = editingHero
        ? `/api/hero-sections/${editingHero.id}`
        : '/api/hero-sections'
      const method = editingHero ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: heroFormData.title || 'Hero Slide',
          description: heroFormData.description || '',
          buttonText: heroFormData.buttonText || 'Shop Now',
          buttonLink: heroFormData.buttonLink || '/home/products',
          icon: heroFormData.icon || '',
          order: heroFormData.order,
          isActive: heroFormData.isActive,
          image: imageUrl || editingHero?.image || null,
        }),
      })

      if (res.ok) {
        resetHeroForm()
        fetchHeroSections()
        toast.success(editingHero ? 'Hero slide updated!' : 'Hero slide created!')
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save hero slide')
      }
    } catch (error) {
      console.error('Error saving hero slide:', error)
      toast.error('Failed to save hero slide')
    } finally {
      setHeroLoading(false)
    }
  }

  const handleEditHero = (hero: HeroSection) => {
    setEditingHero(hero)
    setHeroFormData({
      title: hero.title || '',
      description: hero.description || '',
      buttonText: hero.buttonText || 'Shop Now',
      buttonLink: hero.buttonLink || '/home/products',
      icon: hero.icon || '',
      order: hero.order,
      isActive: hero.isActive,
    })
    setHeroImagePreview(hero.image || null)
    setHeroImageFile(null)
    setShowHeroForm(true)
  }

  const handleDeleteHero = async (id: string) => {
    if (!confirm('Delete this hero section?')) return

    try {
      const res = await fetch(`/api/hero-sections/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (res.ok) {
        fetchHeroSections()
        toast.success('Hero section deleted!')
      } else {
        toast.error('Failed to delete hero section')
      }
    } catch (error) {
      console.error('Error deleting hero section:', error)
      toast.error('Failed to delete hero section')
    }
  }

  const toggleHeroActive = async (hero: HeroSection) => {
    try {
      const res = await fetch(`/api/hero-sections/${hero.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...hero, isActive: !hero.isActive }),
      })

      if (res.ok) {
        fetchHeroSections()
      }
    } catch (error) {
      console.error('Error toggling hero section:', error)
    }
  }

  const reorderHeroSections = async (orderedItems: HeroSection[]) => {
    try {
      const res = await fetch('/api/hero-sections', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: orderedItems.map((h) => h.id) }),
      })
      if (res.ok) {
        const data = await res.json()
        setHeroSections(data)
        toast.success('Order updated')
      } else toast.error('Failed to update order')
    } catch {
      toast.error('Failed to update order')
    }
  }

  const resetHeroForm = () => {
    setShowHeroForm(false)
    setEditingHero(null)
    setHeroFormData({
      title: '',
      description: '',
      buttonText: 'Shop Now',
      buttonLink: '/home/products',
      icon: '',
      order: 0,
      isActive: true,
    })
    setHeroImageFile(null)
    setHeroImagePreview(null)
  }

  // Orders functions
  const fetchOrders = async (overrides?: { status?: string; payment?: string; dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      setOrdersLoading(true)
      const status = overrides?.status ?? orderStatusFilter
      const payment = overrides?.payment ?? orderPaymentFilter
      const dateFrom = overrides?.dateFrom ?? orderDateFrom
      const dateTo = overrides?.dateTo ?? orderDateTo
      const search = overrides?.search ?? orderSearch

      const params = new URLSearchParams()
      if (status !== 'all') params.append('status', status)
      if (payment !== 'all') params.append('paymentStatus', payment)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { credentials: 'include' })
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated && user?.role?.toUpperCase() === 'ADMIN') {
      fetchOrders()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, orderStatusFilter, orderPaymentFilter, orderDateFrom, orderDateTo])

  const clearOrderFilters = () => {
    setOrderStatusFilter('all')
    setOrderPaymentFilter('all')
    setOrderDateFrom('')
    setOrderDateTo('')
    setOrderSearch('')
    fetchOrders({ status: 'all', payment: 'all', dateFrom: '', dateTo: '', search: '' })
    toast.success('Filters cleared')
  }

  const handleOrderSelect = (orderId: string) => {
    setSelectedOrders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedOrders.size === orders.filter(o => o.paymentStatus === 'paid').length) {
      setSelectedOrders(new Set())
    } else {
      setSelectedOrders(new Set(orders.filter(o => o.paymentStatus === 'paid').map((o) => o.id)))
    }
  }

  // Gallery functions
  const fetchGallery = async () => {
    try {
      setGalleryLoading(true)
      const res = await fetch('/api/gallery')
      if (res.ok) {
        const data = await res.json()
        setGalleryItems(data)
      }
    } catch (error) {
      console.error('Error fetching gallery:', error)
      toast.error('Failed to fetch gallery')
    } finally {
      setGalleryLoading(false)
    }
  }

  const addGalleryMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!galleryMediaFile) {
      toast.error('Please select an image or video')
      return
    }
    setGalleryUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', galleryMediaFile)
      const uploadRes = await fetch('/api/upload/media', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { url } = await uploadRes.json()
      const type = galleryMediaType
      const res = await fetch('/api/gallery', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, type, caption: galleryCaption || null }),
      })
      if (res.ok) {
        toast.success('Media added to gallery')
        setGalleryMediaFile(null)
        setGalleryCaption('')
        fetchGallery()
      } else {
        toast.error('Failed to add media')
      }
    } catch (error) {
      console.error('Error adding gallery media:', error)
      toast.error('Failed to add media')
    } finally {
      setGalleryUploading(false)
    }
  }

  const deleteGalleryMedia = async (id: string) => {
    if (!confirm('Remove this from gallery?')) return
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE', credentials: 'include' })
      if (res.ok) {
        toast.success('Removed from gallery')
        fetchGallery()
      } else toast.error('Failed to remove')
    } catch {
      toast.error('Failed to remove')
    }
  }

  const reorderGallery = async (orderedIds: string[]) => {
    try {
      const res = await fetch('/api/gallery', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: orderedIds }),
      })
      if (res.ok) {
        const data = await res.json()
        setGalleryItems(data)
        toast.success('Order updated')
      } else toast.error('Failed to update order')
    } catch {
      toast.error('Failed to update order')
    }
  }

  const handleUpdateOrder = async () => {
    if (!editingOrder) return

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: editingOrder.id,
          ...shippingFormData,
        }),
      })

      if (res.ok) {
        toast.success('Order updated successfully')
        setEditingOrder(null)
        setShippingFormData({
          status: '',
          trackingNumber: '',
          courierName: '',
          expectedDelivery: '',
          adminNotes: '',
        })
        fetchOrders()
      } else {
        toast.error('Failed to update order')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      toast.error('Failed to update order')
    }
  }

  const handleBulkShip = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders to ship')
      return
    }

    const courierName = prompt('Enter courier name (e.g., BlueDart, DTDC, Delhivery):')
    if (!courierName) return

    const expectedDelivery = prompt('Enter expected delivery date (YYYY-MM-DD):')

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: Array.from(selectedOrders),
          status: 'shipped',
          courierName,
          expectedDelivery: expectedDelivery || undefined,
        }),
      })

      if (res.ok) {
        toast.success(`${selectedOrders.size} orders marked as shipped`)
        setSelectedOrders(new Set())
        fetchOrders()
      } else {
        toast.error('Failed to update orders')
      }
    } catch (error) {
      console.error('Error bulk shipping:', error)
      toast.error('Failed to update orders')
    }
  }

  const handleBulkUpdateStatus = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Please select orders')
      return
    }
    if (!bulkStatus) {
      toast.error('Please select a status')
      return
    }

    try {
      const payload: Record<string, unknown> = {
        orderIds: Array.from(selectedOrders),
        status: bulkStatus,
      }
      if (bulkStatus === 'shipped') {
        const courierName = prompt('Courier name (optional):')
        const expectedDelivery = prompt('Expected delivery date YYYY-MM-DD (optional):')
        if (courierName) payload.courierName = courierName
        if (expectedDelivery) payload.expectedDelivery = expectedDelivery
      }

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success(`${selectedOrders.size} order(s) updated to ${ORDER_STATUSES.find(s => s.value === bulkStatus)?.label || bulkStatus}`)
        setSelectedOrders(new Set())
        setShowBulkStatusModal(false)
        setBulkStatus('')
        fetchOrders()
      } else {
        toast.error('Failed to update orders')
      }
    } catch (error) {
      console.error('Error bulk update:', error)
      toast.error('Failed to update orders')
    }
  }

  const handleDownloadLabels = async (orderIdsArg?: string[]) => {
    const ids = orderIdsArg ?? Array.from(selectedOrders)
    if (ids.length === 0) {
      toast.error('Please select orders to download labels')
      return
    }

    try {
      const res = await fetch('/api/admin/orders/labels', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: ids }),
      })

      if (res.ok) {
        const { labels } = await res.json()
        
        // Generate PDF and download
        const pdf = generateLabelsPDF(labels)
        const filename = `shipping-labels-${new Date().toISOString().slice(0, 10)}.pdf`
        pdf.save(filename)
        toast.success(`Downloaded ${ids.length} label(s) as PDF`)
      } else {
        toast.error('Failed to generate labels')
      }
    } catch (error) {
      console.error('Error downloading labels:', error)
      toast.error('Failed to generate labels')
    }
  }

  const generateLabelsPDF = (labels: Array<{
    orderId: string
    orderDate: string
    customerName: string
    customerEmail: string
    customerPhone: string
    shippingAddress: string
    totalAmount: number
    itemCount: number
    items: Array<{ name: string; itemCode: string; weight: string; quantity: number; price: number }>
    trackingNumber?: string
    courierName?: string
  }>) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = margin

    labels.forEach((label, idx) => {
      if (idx > 0) {
        doc.addPage()
        y = margin
      }

      // Header
      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text('STN PRODUCTS', margin, y)
      y += 6
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Premium Quality Traditional Products', margin, y)
      y += 10
      doc.setTextColor(0, 0, 0)

      // Order ID & Date
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Order #${label.orderId.slice(-8).toUpperCase()}`, margin, y)
      doc.text(new Date(label.orderDate).toLocaleDateString('en-IN'), pageWidth - margin, y, { align: 'right' })
      y += 8

      // Ship To
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('SHIP TO:', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      const shipLines = doc.splitTextToSize(`${label.customerName}\n${label.shippingAddress}\nPhone: ${label.customerPhone || 'N/A'}`, pageWidth - 2 * margin)
      doc.text(shipLines, margin, y)
      y += shipLines.length * 5 + 8

      // Items table
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`ITEMS (${label.itemCount}):`, margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      label.items.forEach((item) => {
        doc.text(`${item.name} (${item.itemCode})`, margin, y)
        doc.text(`Qty: ${item.quantity} | ${item.weight}`, pageWidth - margin, y, { align: 'right' })
        y += 5
      })
      y += 5

      // Total & Courier
      doc.setFont('helvetica', 'bold')
      doc.text(`Total: ₹${label.totalAmount.toLocaleString('en-IN')}`, margin, y)
      if (label.courierName) {
        doc.text(`Courier: ${label.courierName}`, pageWidth - margin, y, { align: 'right' })
      }
      y += 6
      if (label.trackingNumber) {
        doc.setFont('helvetica', 'normal')
        doc.text(`Tracking: ${label.trackingNumber}`, margin, y)
        y += 6
      }
    })

    return doc
  }

  const getStatusColor = (status: string) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status)
    return statusObj?.color || 'bg-gray-100 text-gray-800'
  }

  const openEditOrder = (order: Order) => {
    setEditingOrder(order)
    setShippingFormData({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      courierName: order.courierName || '',
      expectedDelivery: order.expectedDelivery ? order.expectedDelivery.split('T')[0] : '',
      adminNotes: order.adminNotes || '',
    })
  }

  if (!isAuthenticated || user?.role?.toUpperCase() !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Access denied. Admin only.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 md:px-6 py-6 sm:py-8 overflow-x-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Manage products, hero sections, and site content</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 bg-white rounded-lg p-1.5 sm:p-2 shadow-sm w-full min-w-0">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-medium transition-all min-w-0 flex-1 sm:flex-initial ${
              activeTab === 'products'
                ? 'bg-neutral-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-medium transition-all min-w-0 flex-1 sm:flex-initial ${
              activeTab === 'orders'
                ? 'bg-neutral-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            Orders
            {orders.filter(o => o.status === 'pending' && o.paymentStatus === 'paid').length > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shrink-0">
                {orders.filter(o => o.status === 'pending' && o.paymentStatus === 'paid').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-medium transition-all min-w-0 flex-1 sm:flex-initial ${
              activeTab === 'hero'
                ? 'bg-neutral-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            Hero
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-md text-sm sm:text-base font-medium transition-all min-w-0 flex-1 sm:flex-initial ${
              activeTab === 'gallery'
                ? 'bg-neutral-700 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Images className="w-4 h-4 shrink-0" />
            Gallery
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mb-4 sm:mb-6">
              <Button
                onClick={() => {
                  if (showForm) resetForm()
                  else setShowForm(true)
                }}
                className="w-full sm:w-auto bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2 shrink-0" />
                {showForm ? 'Cancel' : 'Add New Product'}
              </Button>
            </div>

            {/* Bulk stock actions */}
            {selectedProducts.size > 0 && (
              <div className="mb-4 sm:mb-6 flex flex-wrap items-center gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="text-sm font-medium text-neutral-700">
                  {selectedProducts.size} product(s) selected
                </span>
                <Button
                  size="sm"
                  onClick={() => handleBulkStockChange(true)}
                  disabled={bulkStockUpdating}
                  className="bg-[#3CB31A] hover:opacity-90 text-white"
                >
                  Set In Stock
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkStockChange(false)}
                  disabled={bulkStockUpdating}
                >
                  Set Out of Stock
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedProducts(new Set())}>
                  Clear selection
                </Button>
              </div>
            )}

            {/* Search and Filter */}
            <div className="mb-4 sm:mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white w-full min-w-0"
              />
              <select
                className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 bg-white text-sm sm:text-base h-9 sm:h-10"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Product Form */}
            {showForm && (
              <Card className="mb-6 sm:mb-8 shadow-lg overflow-hidden">
                <CardHeader className="bg-neutral-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    {editingProduct ? <Pencil className="w-5 h-5 shrink-0" /> : <Plus className="w-5 h-5 shrink-0" />}
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Product Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter product name"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Category *</Label>
                        <select
                          className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 mt-1 text-sm sm:text-base h-9 sm:h-10"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required={formData.category !== '__other__' || !newCategoryName.trim()}
                        >
                          <option value="">Select Category</option>
                          {[...new Set([...CATEGORIES, ...categories])].filter(Boolean).sort().map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="__other__">+ Add new category</option>
                        </select>
                        {formData.category === '__other__' && (
                          <Input
                            className="mt-2 w-full min-w-0"
                            placeholder="Type new category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Item Code *</Label>
                        <Input
                          value={formData.itemCode}
                          onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                          required
                          placeholder="e.g., STNHM001"
                          disabled={!!editingProduct}
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Weight</Label>
                        <Input
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 250 gms"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">MRP (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          required
                          placeholder="0.00"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Sale Price (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          required
                          placeholder="0.00"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">GST</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={formData.gst}
                          onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                          placeholder="0.05"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">HSN Code</Label>
                        <Input
                          value={formData.hsnCode}
                          onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                          placeholder="e.g., 1107"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <Label className="text-sm sm:text-base">Description</Label>
                      <textarea
                        className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 mt-1 text-sm sm:text-base min-h-[100px] sm:min-h-[120px]"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                      />
                    </div>
                    <div className="min-w-0">
                      <Label className="text-sm sm:text-base">Product Image</Label>
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full min-w-0" />
                      {(imagePreview || editingProduct?.image) && (
                        <div className="mt-4 relative w-24 h-24 sm:w-32 sm:h-32">
                          <Image
                            src={imagePreview || editingProduct?.image || ''}
                            alt="Preview"
                            width={128}
                            height={128}
                            className="object-cover rounded-lg border shadow-sm"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="inStock"
                          checked={formData.inStock}
                          onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                      </div>
                      <p className="text-xs text-gray-500">Uncheck to set product as Out of Stock (status shown on product page)</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                      <Button type="submit" disabled={uploading} className="w-full sm:w-auto bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm} className="w-full sm:w-auto">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Products List */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <p className="text-gray-600 mb-4">Showing {products.length} product{products.length !== 1 ? 's' : ''}</p>
                {products.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Package className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-4">No products found</p>
                    <Button onClick={() => setShowForm(true)} className="bg-linear-to-r from-amber-500 to-orange-500">
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <>
                    {products.length > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          type="button"
                          onClick={selectAllProducts}
                          className="flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900"
                        >
                          {selectedProducts.size === products.length ? (
                            <CheckSquare className="w-4 h-4 text-[#3CB31A]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                          <span>{selectedProducts.size === products.length ? 'Deselect all' : 'Select all'}</span>
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 min-w-0">
                    {products.map((product) => (
                      <Card key={product.id} className={`overflow-hidden hover:shadow-lg transition-shadow bg-white min-w-0 ${selectedProducts.has(product.id) ? 'ring-2 ring-[#3CB31A]' : ''}`}>
                        <div className="aspect-square bg-neutral-100 relative min-h-0">
                          <button
                            type="button"
                            onClick={() => toggleProductSelection(product.id)}
                            className="absolute top-2 left-2 z-10 w-8 h-8 rounded-md bg-white/90 shadow flex items-center justify-center hover:bg-white border border-neutral-200"
                            aria-label={selectedProducts.has(product.id) ? 'Deselect product' : 'Select product'}
                          >
                            {selectedProducts.has(product.id) ? (
                              <CheckSquare className="w-4 h-4 text-[#3CB31A]" />
                            ) : (
                              <Square className="w-4 h-4 text-neutral-400" />
                            )}
                          </button>
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-neutral-300" />
                            </div>
                          )}
                          {!product.inStock && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                              Out of Stock
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{product.itemCode}</p>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-1">{product.category}</p>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-lg font-bold text-green-600">₹{product.salePrice}</p>
                              {product.mrp > product.salePrice && (
                                <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                              <Pencil className="w-3 h-3 mr-1" /> Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {/* Orders Header & Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 min-w-0">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Order Management</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchOrders()}
                  className="gap-2 shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 shrink-0 ${ordersLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-w-0">
                {selectedOrders.size > 0 && (
                  <>
                    <Button
                      onClick={() => setShowBulkStatusModal(true)}
                      variant="outline"
                      className="gap-2"
                    >
                      Update Status ({selectedOrders.size})
                    </Button>
                    <Button
                      onClick={handleBulkShip}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Ship Selected ({selectedOrders.size})
                    </Button>
                    <Button
                      onClick={() => handleDownloadLabels()}
                      className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF ({selectedOrders.size})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Order ID, Name, Email..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Status</label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Payment</label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  >
                    <option value="all">All Payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">From Date</label>
                  <Input
                    type="date"
                    value={orderDateFrom}
                    onChange={(e) => setOrderDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">To Date</label>
                  <Input
                    type="date"
                    value={orderDateTo}
                    onChange={(e) => setOrderDateTo(e.target.value)}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button onClick={() => fetchOrders()} className="flex-1 gap-2">
                    <Filter className="w-4 h-4" />
                    Apply
                  </Button>
                  <Button variant="outline" onClick={clearOrderFilters} className="gap-2 shrink-0" title="Clear all filters">
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* Orders Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="bg-yellow-50 border-yellow-200 min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-yellow-700">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-800">
                    {orders.filter(o => o.status === 'pending' && o.paymentStatus === 'paid').length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <p className="text-sm text-blue-700">Processing</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-indigo-50 border-indigo-200 min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-indigo-700">Shipped</p>
                  <p className="text-xl sm:text-2xl font-bold text-indigo-800">
                    {orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-neutral-50 border-neutral-200 min-w-0">
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-neutral-700">Delivered</p>
                  <p className="text-xl sm:text-2xl font-bold text-neutral-800">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            {ordersLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-neutral-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                          >
                            {selectedOrders.size === orders.filter(o => o.paymentStatus === 'paid').length ? (
                              <CheckSquare className="w-4 h-4 text-neutral-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Order</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Customer</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Items</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Amount</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Status</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Payment</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Date</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {orders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            {order.paymentStatus === 'paid' && (
                              <button onClick={() => handleOrderSelect(order.id)}>
                                {selectedOrders.has(order.id) ? (
                                  <CheckSquare className="w-4 h-4 text-neutral-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <p className="font-mono font-medium truncate max-w-[80px] sm:max-w-none">#{order.id.slice(-8).toUpperCase()}</p>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <p className="font-medium truncate max-w-[100px] sm:max-w-none">{order.user.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{order.user.email}</p>
                            {order.user.phoneNumber && (
                              <p className="text-xs text-gray-500">{order.user.phoneNumber}</p>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <p className="text-xs sm:text-sm">{order.items.reduce((sum, i) => sum + i.quantity, 0)} items</p>
                            <p className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[150px]">
                              {order.items.map(i => i.product.name).join(', ')}
                            </p>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <p className="font-semibold text-xs sm:text-sm">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(order.status)}`}>
                              {ORDER_STATUSES.find(s => s.value === order.status)?.label || order.status}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                              order.paymentStatus === 'paid' ? 'bg-neutral-100 text-neutral-800' :
                              order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <p className="text-xs sm:text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            <p className="text-[10px] sm:text-xs text-gray-500">{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                          </td>
                          <td className="px-2 sm:px-4 py-2 sm:py-3">
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditOrder(order)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadLabels([order.id])}
                                className="h-8 w-8 p-0"
                                disabled={order.paymentStatus !== 'paid'}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Edit Order Modal */}
            {editingOrder && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="p-6 border-b">
                    <h3 className="text-xl font-bold">Edit Order #{editingOrder.id.slice(-8).toUpperCase()}</h3>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Customer Details</h4>
                      <p><strong>Name:</strong> {editingOrder.user.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {editingOrder.user.email}</p>
                      <p><strong>Phone:</strong> {editingOrder.user.phoneNumber || 'N/A'}</p>
                      <p className="mt-2"><strong>Shipping Address:</strong></p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{editingOrder.shippingAddress}</p>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-semibold mb-2">Order Items</h4>
                      <div className="space-y-2">
                        {editingOrder.items.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden shrink-0">
                              {item.product.image && (
                                <Image src={item.product.image} alt={item.product.name} width={48} height={48} className="object-cover" unoptimized />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-xs text-gray-500">{item.product.itemCode} • {item.product.weight}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{item.price} × {item.quantity}</p>
                              <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 text-right">
                        <p className="text-lg font-bold">Total: ₹{editingOrder.totalAmount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    {/* Status Update Form */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Order Status</Label>
                        <select
                          className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 mt-1 h-9 sm:h-10 text-sm sm:text-base"
                          value={shippingFormData.status}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, status: e.target.value })}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>Courier Name</Label>
                        <Input
                          value={shippingFormData.courierName}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, courierName: e.target.value })}
                          placeholder="e.g., BlueDart, DTDC"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Tracking Number</Label>
                        <Input
                          value={shippingFormData.trackingNumber}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, trackingNumber: e.target.value })}
                          placeholder="Enter tracking number"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Expected Delivery</Label>
                        <Input
                          type="date"
                          value={shippingFormData.expectedDelivery}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, expectedDelivery: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Admin Notes (Internal)</Label>
                        <textarea
                          className="w-full rounded-md border border-gray-300 px-3 py-2 mt-1"
                          rows={2}
                          value={shippingFormData.adminNotes}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, adminNotes: e.target.value })}
                          placeholder="Internal notes..."
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-6 border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditingOrder(null)}>Cancel</Button>
                    <Button onClick={handleUpdateOrder} className="bg-neutral-700 hover:bg-neutral-800 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Bulk Update Status Modal */}
            {showBulkStatusModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
                <div className="bg-white rounded-2xl w-full max-w-md p-4 sm:p-6 my-4 min-w-0 mx-2">
                  <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Update Status for {selectedOrders.size} Order(s)</h3>
                  <div className="space-y-3 sm:space-y-4 min-w-0">
                    <div className="min-w-0">
                      <Label className="text-sm sm:text-base">New Status</Label>
                      <select
                        className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 mt-1 h-9 sm:h-10 text-sm sm:text-base"
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                      >
                        <option value="">Select status...</option>
                        {ORDER_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-4 sm:mt-6">
                    <Button variant="outline" onClick={() => { setShowBulkStatusModal(false); setBulkStatus('') }} className="w-full sm:w-auto">Cancel</Button>
                    <Button onClick={handleBulkUpdateStatus} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto" disabled={!bulkStatus}>
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4 sm:mb-6 min-w-0">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">About Page Gallery</h2>
                <p className="text-gray-600 text-xs sm:text-sm">Upload images and videos for Our Story page. Drag to reorder.</p>
              </div>
            </div>

            {/* Add Media Form */}
            <Card className="mb-6 sm:mb-8 shadow-lg overflow-hidden min-w-0">
              <CardHeader className="bg-neutral-50 border-b p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-gray-800 text-lg sm:text-xl">
                  <Images className="w-5 h-5 shrink-0 text-neutral-600" />
                  Add Media
                </CardTitle>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Images and videos shown on the Our Story page</p>
              </CardHeader>
              <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                <form onSubmit={addGalleryMedia} className="space-y-4 sm:space-y-6 min-w-0">
                  {/* Media type tabs */}
                  <div className="min-w-0">
                    <Label className="text-sm sm:text-base font-medium block mb-2">Media Type</Label>
                    <div className="flex gap-2 min-w-0">
                      <button
                        type="button"
                        onClick={() => { setGalleryMediaType('image'); setGalleryMediaFile(null) }}
                        className={`flex-1 min-w-0 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                          galleryMediaType === 'image'
                            ? 'bg-neutral-700 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => { setGalleryMediaType('video'); setGalleryMediaFile(null) }}
                        className={`flex-1 min-w-0 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg text-sm sm:text-base font-medium transition-all flex items-center justify-center gap-1.5 sm:gap-2 touch-manipulation ${
                          galleryMediaType === 'video'
                            ? 'bg-neutral-700 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Video className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        Video
                      </button>
                    </div>
                  </div>

                  {/* File upload zone */}
                  <div className="min-w-0">
                    <Label className="text-sm sm:text-base font-medium block mb-2">Select File</Label>
                    <label className="block min-w-0">
                      <div className={`border-2 border-dashed rounded-xl p-4 sm:p-6 md:p-8 text-center transition-all cursor-pointer min-w-0 ${
                        galleryMediaFile
                          ? 'border-neutral-400 bg-neutral-50'
                          : 'border-gray-300 hover:border-neutral-300 hover:bg-gray-50'
                      }`}>
                        {galleryMediaFile ? (
                          <div className="space-y-2">
                            {galleryMediaType === 'image' ? (
                              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100">
                                <Image
                                  src={URL.createObjectURL(galleryMediaFile)}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-emerald-600" />
                              </div>
                            )}
                            <p className="text-sm font-medium text-gray-700 truncate max-w-xs mx-auto">{galleryMediaFile.name}</p>
                            <p className="text-xs text-gray-500">Click to change file</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                              <Images className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-600 font-medium">Drop file here or click to browse</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {galleryMediaType === 'image' ? 'PNG, JPG, WebP up to 10MB' : 'MP4, WebM, MOV up to 50MB'}
                            </p>
                          </>
                        )}
                        <input
                          type="file"
                          accept={galleryMediaType === 'video' ? 'video/*' : 'image/*'}
                          onChange={(e) => setGalleryMediaFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </div>
                    </label>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Caption (optional)</Label>
                    <Input
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      placeholder="Brief description for the gallery"
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={galleryUploading || !galleryMediaFile}
                    className="w-full sm:w-auto bg-neutral-700 hover:bg-neutral-800 text-white px-6 py-3"
                  >
                    {galleryUploading ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add to Gallery
                      </span>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Gallery List with Drag Reorder */}
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <CardTitle>Gallery Items</CardTitle>
                <p className="text-sm text-gray-500 mt-1">Drag the handle to reorder. Changes reflect on Our Story page.</p>
              </CardHeader>
              <CardContent>
                {galleryLoading ? (
                  <div className="py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-neutral-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : galleryItems.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Images className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No media in gallery yet. Add images or videos above.</p>
                  </div>
                ) : (
                  <SortableGalleryList
                    items={galleryItems}
                    onReorder={reorderGallery}
                    onDelete={deleteGalleryMedia}
                  />
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Hero Sections Tab */}
        {activeTab === 'hero' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-4 sm:mb-6 min-w-0">
              <p className="text-gray-600 text-sm sm:text-base order-2 sm:order-1">
                Manage hero carousel slides. Active slides will be shown on the homepage.
              </p>
              <Button
                onClick={() => {
                  if (showHeroForm) resetHeroForm()
                  else setShowHeroForm(true)
                }}
                className="w-full sm:w-auto order-1 sm:order-2 bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2 shrink-0" />
                {showHeroForm ? 'Cancel' : 'Add Hero Slide'}
              </Button>
            </div>

            {/* Hero Form - Simplified */}
            {showHeroForm && (
              <Card className="mb-6 sm:mb-8 shadow-lg overflow-hidden min-w-0">
                <CardHeader className="bg-neutral-50 p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    {editingHero ? <Pencil className="w-5 h-5 shrink-0" /> : <Plus className="w-5 h-5 shrink-0" />}
                    {editingHero ? 'Edit Hero Slide' : 'Create Hero Slide'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
                  <form onSubmit={handleHeroSubmit} className="space-y-4 sm:space-y-6 min-w-0">
                    {/* Background Image - Required */}
                    <div className="min-w-0">
                      <Label className="text-sm sm:text-base font-semibold">Banner Image *</Label>
                      <p className="text-xs sm:text-sm text-gray-500 mb-2">Upload a high-quality banner image (recommended: 1920x600px or 16:5 ratio)</p>
                      <Input type="file" accept="image/*" onChange={handleHeroImageChange} className="w-full min-w-0" />
                      {(heroImagePreview || editingHero?.image) && (
                        <div className="mt-4 relative w-full max-w-2xl h-36 sm:h-48 min-w-0">
                          <Image
                            src={heroImagePreview || editingHero?.image || ''}
                            alt="Preview"
                            fill
                            className="object-cover rounded-lg border shadow-sm"
                            unoptimized
                          />
                        </div>
                      )}
                      {!heroImagePreview && !editingHero?.image && (
                        <div className="mt-4 w-full max-w-2xl h-48 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                          <div className="text-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                            <p>No image selected</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Button Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Button Text</Label>
                        <Input
                          value={heroFormData.buttonText}
                          onChange={(e) => setHeroFormData({ ...heroFormData, buttonText: e.target.value })}
                          placeholder="Shop Now"
                          className="mt-1 w-full min-w-0"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Button Link *</Label>
                        <Input
                          value={heroFormData.buttonLink}
                          onChange={(e) => setHeroFormData({ ...heroFormData, buttonLink: e.target.value })}
                          required
                          placeholder="/home/products or /home/collections/oils"
                          className="mt-1 w-full min-w-0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Where should the button go when clicked?</p>
                      </div>
                    </div>

                    {/* Display Order */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0">
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Display Order</Label>
                        <Input
                          type="number"
                          min="0"
                          value={heroFormData.order}
                          onChange={(e) => setHeroFormData({ ...heroFormData, order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          className="mt-1 w-full min-w-0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                      </div>
                      <div className="flex items-end pb-2 min-w-0">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="heroActive"
                            checked={heroFormData.isActive}
                            onChange={(e) => setHeroFormData({ ...heroFormData, isActive: e.target.checked })}
                            className="h-4 w-4 shrink-0"
                          />
                          <Label htmlFor="heroActive" className="cursor-pointer text-sm sm:text-base">Active (visible on homepage)</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
                      <Button type="submit" disabled={heroLoading} className="w-full sm:w-auto bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        {heroLoading ? 'Saving...' : editingHero ? 'Update Slide' : 'Create Slide'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetHeroForm} className="w-full sm:w-auto">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Hero Sections List */}
            {heroSections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No hero slides yet</p>
                <p className="text-sm text-gray-500 mb-4">Default slides will be shown until you create custom ones.</p>
                <Button onClick={() => setShowHeroForm(true)} className="bg-linear-to-r from-amber-500 to-orange-500">
                  Create Your First Slide
                </Button>
              </div>
            ) : (
              <>
              <div className="mb-2 text-sm text-gray-500">Drag the handle on hover to reorder</div>
              <SortableHeroGrid<HeroSection>
                items={heroSections}
                onReorder={reorderHeroSections}
                renderCard={(hero) => (
                  <Card className={`overflow-hidden transition-all hover:shadow-lg ${hero.isActive ? 'ring-2 ring-green-400' : ''}`}>
                    <div className="relative w-full h-40 bg-linear-to-br from-amber-100 to-orange-100">
                      {hero.image ? (
                        <Image src={hero.image} alt="Hero slide" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-neutral-300" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${hero.isActive ? 'bg-amber-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {hero.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-white font-medium">
                          #{hero.order + 1}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Button Link:</p>
                        <p className="text-sm font-medium text-green-700 truncate">{hero.buttonLink}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Button Text:</p>
                        <p className="text-sm font-medium text-gray-800">{hero.buttonText || 'Shop Now'}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleHeroActive(hero)}
                          className={`flex-1 min-w-0 ${hero.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-neutral-600 border-neutral-200 hover:bg-neutral-50'}`}
                        >
                          {hero.isActive ? <><EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" /> Hide</> : <><Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" /> Show</>}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditHero(hero)} className="flex-1 min-w-0">
                          <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteHero(hero.id)} className="shrink-0">
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
