'use client'

import { useEffect, useState } from 'react'
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
  ChevronUp,
  ChevronDown,
  RotateCcw,
} from 'lucide-react'
import SortableGalleryList from '@/components/admin/SortableGalleryList'

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

/** Dashboard product form: each image is either existing URL or new file with preview. Max 5. */
type ProductImageItem = { type: 'existing'; url: string } | { type: 'new'; file: File; preview: string }

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
  refundRequested?: boolean
  refundRequestedAt?: string
  refundReason?: string
  refundReasonOther?: string
  refundComment?: string
  refundStatus?: string
  refundProcessedAt?: string
  refundAdminNotes?: string
  refundRejectionReason?: string
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

const MAX_PRODUCT_IMAGES = 5

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
  const [productImages, setProductImages] = useState<ProductImageItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())
  const [bulkStockUpdating, setBulkStockUpdating] = useState(false)

  const canAddMoreImages = productImages.length < MAX_PRODUCT_IMAGES

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
    paymentStatus: '',
    trackingNumber: '',
    courierName: '',
    expectedDelivery: '',
    adminNotes: '',
  })
  const [refundModalOrder, setRefundModalOrder] = useState<Order | null>(null)
  const [refundModalAction, setRefundModalAction] = useState<'approve' | 'reject' | 'markRefunded'>('approve')
  const [refundRejectionReason, setRefundRejectionReason] = useState('')
  const [refundAdminNotesInput, setRefundAdminNotesInput] = useState('')
  const [refundActionLoading, setRefundActionLoading] = useState(false)

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

  const addProductImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (files.length === 0) return
    const remaining = MAX_PRODUCT_IMAGES - productImages.length
    const toAdd = files.slice(0, remaining)
    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const preview = reader.result as string
        setProductImages((prev) => {
          const next = [...prev, { type: 'new' as const, file, preview }]
          return next.slice(0, MAX_PRODUCT_IMAGES)
        })
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeProductImage = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadProductImages = async (): Promise<string[]> => {
    const existing = productImages.filter((i): i is { type: 'existing'; url: string } => i.type === 'existing').map((i) => i.url)
    const newItems = productImages.filter((i): i is { type: 'new'; file: File; preview: string } => i.type === 'new')
    if (newItems.length === 0) return existing

    try {
      const uploaded: string[] = []
      for (const item of newItems) {
        const fd = new FormData()
        fd.append('file', item.file)
        const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          uploaded.push(data.url)
        }
      }
      return [...existing, ...uploaded].slice(0, MAX_PRODUCT_IMAGES)
    } catch (error) {
      console.error('Error uploading images:', error)
      return existing
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
    const allUrls = await uploadProductImages()
    const imageUrl = allUrls[0] || editingProduct?.image || null
    const images = allUrls

    setUploading(true)
    try {
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
          image: imageUrl,
          images,
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
        setProductImages([])
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
    const urls: string[] = []
    if (product.image) urls.push(product.image)
    if (product.images?.length) urls.push(...product.images.filter((u) => u && !urls.includes(u)))
    setProductImages(urls.slice(0, MAX_PRODUCT_IMAGES).map((url) => ({ type: 'existing' as const, url })))
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
    setProductImages([])
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

  const moveHero = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= heroSections.length) return
    const reordered = [...heroSections]
    ;[reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]]
    reorderHeroSections(reordered)
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
          paymentStatus: '',
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
        // Dynamic import jspdf only when user downloads (smaller initial admin bundle)
        const { default: jsPDF } = await import('jspdf')
        const pdf = generateLabelsPDF(jsPDF, labels)
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

  const generateLabelsPDF = (
    JsPDFClass: typeof import('jspdf').default,
    labels: Array<{
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
  }>
  ) => {
    const doc = new JsPDFClass({ unit: 'mm', format: 'a4' })
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
      paymentStatus: order.paymentStatus || '',
      trackingNumber: order.trackingNumber || '',
      courierName: order.courierName || '',
      expectedDelivery: order.expectedDelivery ? order.expectedDelivery.split('T')[0] : '',
      adminNotes: order.adminNotes || '',
    })
  }

  const openRefundModal = (order: Order, action: 'approve' | 'reject' | 'markRefunded') => {
    setRefundModalOrder(order)
    setRefundModalAction(action)
    setRefundRejectionReason('')
    setRefundAdminNotesInput('')
  }

  const handleRefundActionSubmit = async () => {
    if (!refundModalOrder) return
    if (refundModalAction === 'reject' && !refundRejectionReason.trim()) {
      toast.error('Rejection reason is required (customer will see this message).')
      return
    }
    setRefundActionLoading(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: refundModalOrder.id,
          refundAction: refundModalAction,
          refundRejectionReason: refundModalAction === 'reject' ? refundRejectionReason.trim() : undefined,
          refundAdminNotes: refundAdminNotesInput.trim() || undefined,
        }),
      })
      if (res.ok) {
        toast.success(
          refundModalAction === 'approve' ? 'Refund approved. You can mark as refunded after processing payment.' :
          refundModalAction === 'reject' ? 'Refund request declined. Customer will see your reason.' :
          'Order marked as refunded.'
        )
        setRefundModalOrder(null)
        fetchOrders()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to update refund status')
      }
    } catch (error) {
      console.error('Refund action error:', error)
      toast.error('Failed to update refund status')
    } finally {
      setRefundActionLoading(false)
    }
  }

  const REFUND_REASON_LABELS: Record<string, string> = {
    defective: 'Defective or damaged product',
    wrong_item: 'Wrong item received',
    damaged_in_transit: 'Damaged in transit',
    quality_issue: 'Quality not as expected',
    changed_mind: 'No longer needed / Changed mind',
    other: 'Other',
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
                ? 'bg-[#3CB31A] text-white shadow-md hover:opacity-90'
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
                ? 'bg-[#3CB31A] text-white shadow-md hover:opacity-90'
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
                ? 'bg-[#3CB31A] text-white shadow-md hover:opacity-90'
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
                ? 'bg-[#3CB31A] text-white shadow-md hover:opacity-90'
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
                className="w-full sm:w-auto bg-[#3CB31A] hover:opacity-90 text-white"
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
                      <Label className="text-sm sm:text-base">Product Images (max {MAX_PRODUCT_IMAGES})</Label>
                      <p className="text-xs text-gray-500 mt-0.5">First image is the main display image.</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {productImages.map((item, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg border bg-gray-100 overflow-hidden">
                              <Image
                                src={item.type === 'existing' ? item.url : item.preview}
                                alt={`Product ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                                sizes="96px"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProductImage(index)}
                              className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 shadow"
                              aria-label="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {canAddMoreImages && (
                          <label className="flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer bg-gray-50">
                            <Images className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Add</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={addProductImages}
                              className="sr-only"
                            />
                          </label>
                        )}
                      </div>
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
                      <Button type="submit" disabled={uploading} className="w-full sm:w-auto bg-[#3CB31A] hover:opacity-90 text-white">
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
                    <Button onClick={() => setShowForm(true)} className="bg-[#3CB31A] hover:opacity-90 text-white">
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
                    {products.length > 0 && (
                      <div className="flex items-center gap-2 p-3 border-b border-gray-200">
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
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="w-10 py-3 px-3">
                              <span className="sr-only">Select</span>
                            </th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Image</th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Name</th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Item Code</th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Category</th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Price</th>
                            <th className="py-3 px-3 font-semibold text-gray-700">Stock</th>
                            <th className="py-3 px-3 font-semibold text-gray-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {products.map((product) => (
                            <tr
                              key={product.id}
                              className={`hover:bg-gray-50 ${selectedProducts.has(product.id) ? 'bg-[#3CB31A]/5' : ''}`}
                            >
                              <td className="py-2 px-3">
                                <button
                                  type="button"
                                  onClick={() => toggleProductSelection(product.id)}
                                  className="p-1.5 rounded hover:bg-gray-200"
                                  aria-label={selectedProducts.has(product.id) ? 'Deselect' : 'Select'}
                                >
                                  {selectedProducts.has(product.id) ? (
                                    <CheckSquare className="w-4 h-4 text-[#3CB31A]" />
                                  ) : (
                                    <Square className="w-4 h-4 text-gray-400" />
                                  )}
                                </button>
                              </td>
                              <td className="py-2 px-3">
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                  {product.image ? (
                                    <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized sizes="48px" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="py-2 px-3 font-medium text-gray-900 max-w-[200px]">
                                <span className="line-clamp-2">{product.name}</span>
                              </td>
                              <td className="py-2 px-3 text-gray-600">{product.itemCode}</td>
                              <td className="py-2 px-3 text-gray-600 max-w-[140px]">
                                <span className="line-clamp-1">{product.category}</span>
                              </td>
                              <td className="py-2 px-3">
                                <span className="font-semibold text-gray-900">₹{product.salePrice}</span>
                                {product.mrp > product.salePrice && (
                                  <span className="ml-1 text-xs text-gray-400 line-through">₹{product.mrp}</span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${product.inStock ? 'bg-[#3CB31A]/15 text-[#3CB31A]' : 'bg-red-100 text-red-700'}`}>
                                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                    <Trash2 className="w-3.5 h-3.5" />
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
                      className="gap-2 bg-[#3CB31A] hover:opacity-90 text-white"
                    >
                      Update Status ({selectedOrders.size})
                    </Button>
                    <Button
                      onClick={handleBulkShip}
                      className="bg-[#3CB31A] hover:opacity-90 text-white gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Ship Selected ({selectedOrders.size})
                    </Button>
                    <Button
                      onClick={() => handleDownloadLabels()}
                      className="bg-[#3CB31A] hover:opacity-90 text-white gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF ({selectedOrders.size})
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Refund requests (compliance: reason + status + admin response) */}
            {orders.filter(o => o.refundRequested && o.paymentStatus !== 'refunded').length > 0 && (
              <Card className="mb-6 border-amber-200 bg-amber-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-amber-700" />
                    Refund requests
                  </CardTitle>
                  <p className="text-sm text-gray-600">Review and approve, reject, or mark as refunded. Rejection reason is shown to the customer.</p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-amber-200/60">
                          <th className="text-left py-2 px-2">Order</th>
                          <th className="text-left py-2 px-2">Customer</th>
                          <th className="text-left py-2 px-2">Amount</th>
                          <th className="text-left py-2 px-2">Reason</th>
                          <th className="text-left py-2 px-2">Requested</th>
                          <th className="text-left py-2 px-2">Status</th>
                          <th className="text-left py-2 px-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders
                          .filter(o => o.refundRequested && o.paymentStatus !== 'refunded')
                          .map((order) => (
                            <tr key={order.id} className="border-b border-amber-100">
                              <td className="py-2 px-2 font-mono">#{order.id.slice(-8).toUpperCase()}</td>
                              <td className="py-2 px-2">
                                <p className="font-medium">{order.user.name || '—'}</p>
                                <p className="text-xs text-gray-500">{order.user.email}</p>
                              </td>
                              <td className="py-2 px-2 font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</td>
                              <td className="py-2 px-2 max-w-[160px]">
                                <span className="text-gray-700">{REFUND_REASON_LABELS[order.refundReason || ''] || order.refundReason || '—'}</span>
                                {order.refundReason === 'other' && order.refundReasonOther && (
                                  <p className="text-xs text-gray-500 truncate" title={order.refundReasonOther}>{order.refundReasonOther}</p>
                                )}
                                {order.refundComment && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5" title={order.refundComment}>{order.refundComment}</p>
                                )}
                              </td>
                              <td className="py-2 px-2 text-gray-600">
                                {order.refundRequestedAt ? new Date(order.refundRequestedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </td>
                              <td className="py-2 px-2">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  order.refundStatus === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  order.refundStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-amber-100 text-amber-800'
                                }`}>
                                  {order.refundStatus === 'approved' ? 'Approved' : order.refundStatus === 'rejected' ? 'Rejected' : 'Under review'}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <div className="flex flex-wrap gap-1">
                                  {order.refundStatus !== 'approved' && order.refundStatus !== 'rejected' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openRefundModal(order, 'approve')}>
                                      Approve
                                    </Button>
                                  )}
                                  {order.refundStatus !== 'rejected' && (
                                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 border-red-200" onClick={() => openRefundModal(order, 'reject')}>
                                      Reject
                                    </Button>
                                  )}
                                  {(order.refundStatus === 'approved' || order.refundStatus === 'requested') && (
                                    <Button size="sm" className="h-7 text-xs bg-[#3CB31A] hover:opacity-90 text-white" onClick={() => openRefundModal(order, 'markRefunded')}>
                                      Mark refunded
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    <option value="refunded">Refunded</option>
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

            {/* Orders Summary + Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-gray-700">Pending</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Processing</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Shipped</th>
                      <th className="py-3 px-4 font-semibold text-gray-700">Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4">
                        <span className="text-xl font-bold text-yellow-800">{orders.filter(o => o.status === 'pending' && o.paymentStatus === 'paid').length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xl font-bold text-blue-800">{orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xl font-bold text-indigo-800">{orders.filter(o => ['shipped', 'out_for_delivery'].includes(o.status)).length}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xl font-bold text-neutral-800">{orders.filter(o => o.status === 'delivered').length}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Orders Table */}
            {ordersLoading ? (
              <div className="text-center py-12 mt-6">
                <div className="inline-block w-8 h-8 border-4 border-neutral-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm mt-6">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No orders found</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6 min-w-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
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
                              order.paymentStatus === 'refunded' ? 'bg-purple-100 text-purple-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            {order.refundRequested && order.paymentStatus !== 'refunded' && (
                              <span className="ml-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-800" title="Refund requested by customer">
                                Refund req.
                              </span>
                            )}
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
                      <div className="min-w-0">
                        <Label className="text-sm sm:text-base">Payment Status</Label>
                        <select
                          className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 mt-1 h-9 sm:h-10 text-sm sm:text-base"
                          value={shippingFormData.paymentStatus}
                          onChange={(e) => setShippingFormData({ ...shippingFormData, paymentStatus: e.target.value })}
                        >
                          <option value="paid">Paid</option>
                          <option value="pending">Pending</option>
                          <option value="failed">Failed</option>
                          <option value="refunded">Refunded</option>
                        </select>
                        {editingOrder.refundRequested && (
                          <p className="text-xs text-amber-600 mt-1">Customer requested refund</p>
                        )}
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
                    <Button onClick={handleUpdateOrder} className="bg-[#3CB31A] hover:opacity-90 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Refund action modal (approve / reject / mark refunded) */}
            {refundModalOrder && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                  <h3 className="text-lg font-bold mb-2">
                    {refundModalAction === 'approve' && 'Approve refund request'}
                    {refundModalAction === 'reject' && 'Decline refund request'}
                    {refundModalAction === 'markRefunded' && 'Mark as refunded'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Order #{refundModalOrder.id.slice(-8).toUpperCase()} · {refundModalOrder.user.email} · ₹{refundModalOrder.totalAmount.toLocaleString('en-IN')}
                  </p>
                  {refundModalAction === 'reject' && (
                    <div className="mb-4">
                      <Label className="text-sm font-medium">Reason to show customer (required)</Label>
                      <textarea
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[80px]"
                        placeholder="e.g. Return window has expired; product was used."
                        value={refundRejectionReason}
                        onChange={(e) => setRefundRejectionReason(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">This message will be visible to the customer.</p>
                    </div>
                  )}
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Internal notes (optional)</Label>
                    <textarea
                      className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[60px]"
                      placeholder="For your records only"
                      value={refundAdminNotesInput}
                      onChange={(e) => setRefundAdminNotesInput(e.target.value)}
                      maxLength={2000}
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setRefundModalOrder(null)} disabled={refundActionLoading}>Cancel</Button>
                    <Button onClick={handleRefundActionSubmit} disabled={refundActionLoading || (refundModalAction === 'reject' && !refundRejectionReason.trim())} className="bg-[#3CB31A] hover:opacity-90 text-white">
                      {refundActionLoading ? 'Processing...' : refundModalAction === 'reject' ? 'Decline refund' : refundModalAction === 'approve' ? 'Approve' : 'Mark as refunded'}
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
                    <Button onClick={handleBulkUpdateStatus} className="bg-[#3CB31A] hover:opacity-90 text-white w-full sm:w-auto" disabled={!bulkStatus}>
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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3 min-w-0">
              <p className="text-gray-600 text-xs">Our Story page gallery. Drag to reorder below.</p>
            </div>

            {/* Add Media - compact dashboard strip */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-4 min-w-0">
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <Images className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="font-medium text-gray-800 text-sm">Add Media</span>
              </div>
              <div className="p-3">
                <form onSubmit={addGalleryMedia} className="flex flex-wrap items-end gap-3">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => { setGalleryMediaType('image'); setGalleryMediaFile(null) }}
                      className={`py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                        galleryMediaType === 'image' ? 'bg-[#3CB31A] text-white hover:opacity-90' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Image
                    </button>
                    <button
                      type="button"
                      onClick={() => { setGalleryMediaType('video'); setGalleryMediaFile(null) }}
                      className={`py-1.5 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                        galleryMediaType === 'video' ? 'bg-[#3CB31A] text-white hover:opacity-90' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      Video
                    </button>
                  </div>
                  <label className="flex items-center gap-2 min-w-0 flex-1 max-w-[220px]">
                    <span className="text-xs text-gray-500 shrink-0">File</span>
                    <div className={`flex-1 min-w-0 border border-dashed rounded-md px-2 py-1.5 text-xs cursor-pointer truncate ${
                      galleryMediaFile ? 'border-neutral-400 bg-neutral-50 text-gray-700' : 'border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}>
                      {galleryMediaFile ? galleryMediaFile.name : 'Choose file...'}
                    </div>
                    <input
                      type="file"
                      accept={galleryMediaType === 'video' ? 'video/*' : 'image/*'}
                      onChange={(e) => setGalleryMediaFile(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                  <div className="flex-1 min-w-[120px] max-w-[180px]">
                    <Input
                      value={galleryCaption}
                      onChange={(e) => setGalleryCaption(e.target.value)}
                      placeholder="Caption (optional)"
                      className="h-8 text-xs"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={galleryUploading || !galleryMediaFile}
                    size="sm"
                    className="h-8 bg-neutral-700 hover:bg-neutral-800 text-white text-xs shrink-0"
                  >
                    {galleryUploading ? (
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </form>
                {galleryMediaFile && galleryMediaType === 'image' && (
                  <div className="mt-2 relative w-14 h-14 rounded overflow-hidden bg-gray-100 shrink-0">
                    <Image src={URL.createObjectURL(galleryMediaFile)} alt="Preview" fill className="object-cover" unoptimized sizes="56px" />
                  </div>
                )}
              </div>
            </div>

            {/* Gallery Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
                <span className="font-medium text-gray-800 text-sm">Gallery Items</span>
                <span className="text-xs text-gray-500">Drag to reorder</span>
              </div>
              {galleryLoading ? (
                <div className="py-8 text-center">
                  <div className="inline-block w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="py-8 text-center text-gray-500 text-sm">
                  <Images className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p>No media yet. Add above.</p>
                </div>
              ) : (
                <SortableGalleryList
                  items={galleryItems}
                  onReorder={reorderGallery}
                  onDelete={deleteGalleryMedia}
                />
              )}
            </div>
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
                className="w-full sm:w-auto order-1 sm:order-2 bg-[#3CB31A] hover:opacity-90 text-white"
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
                      <Button type="submit" disabled={heroLoading} className="w-full sm:w-auto bg-[#3CB31A] hover:opacity-90 text-white">
                        {heroLoading ? 'Saving...' : editingHero ? 'Update Slide' : 'Create Slide'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetHeroForm} className="w-full sm:w-auto">Cancel</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Hero Sections Table */}
            {heroSections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 mb-2">No hero slides yet</p>
                <p className="text-sm text-gray-500 mb-4">Default slides will be shown until you create custom ones.</p>
                <Button onClick={() => setShowHeroForm(true)} className="bg-[#3CB31A] hover:opacity-90 text-white">
                  Create Your First Slide
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-w-0">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="py-3 px-3 font-semibold text-gray-700 w-20">Order</th>
                        <th className="py-3 px-3 font-semibold text-gray-700">Image</th>
                        <th className="py-3 px-3 font-semibold text-gray-700">Button Text</th>
                        <th className="py-3 px-3 font-semibold text-gray-700">Button Link</th>
                        <th className="py-3 px-3 font-semibold text-gray-700">Active</th>
                        <th className="py-3 px-3 font-semibold text-gray-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {heroSections.map((hero, index) => (
                        <tr key={hero.id} className={`hover:bg-gray-50 ${hero.isActive ? 'bg-amber-50/50' : ''}`}>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1">
                              <Button type="button" variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => moveHero(index, 'up')} disabled={index === 0} aria-label="Move up">
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <span className="font-medium text-gray-700">#{index + 1}</span>
                              <Button type="button" variant="ghost" size="sm" className="p-1 h-8 w-8" onClick={() => moveHero(index, 'down')} disabled={index === heroSections.length - 1} aria-label="Move down">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="relative w-16 h-10 rounded overflow-hidden bg-gray-100 shrink-0">
                              {hero.image ? (
                                <Image src={hero.image} alt="" fill className="object-cover" unoptimized sizes="64px" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-gray-900">{hero.buttonText || 'Shop Now'}</td>
                          <td className="py-2 px-3 text-gray-600 max-w-[180px] truncate">{hero.buttonLink}</td>
                          <td className="py-2 px-3">
                            <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded ${hero.isActive ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'}`}>
                              {hero.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              <Button variant="outline" size="sm" onClick={() => toggleHeroActive(hero)} className="shrink-0">
                                {hero.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleEditHero(hero)} className="shrink-0">
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteHero(hero.id)} className="shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
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
          </>
        )}
      </div>
    </div>
  )
}
