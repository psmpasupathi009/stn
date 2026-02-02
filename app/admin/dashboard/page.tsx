'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'
import {
  Package,
  Image as ImageIcon,
  Layers,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

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

type TabType = 'products' | 'hero'

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

  // Hero sections state
  const [heroSections, setHeroSections] = useState<HeroSection[]>([])
  const [showHeroForm, setShowHeroForm] = useState(false)
  const [editingHero, setEditingHero] = useState<HeroSection | null>(null)
  const [heroFormData, setHeroFormData] = useState({
    title: '',
    description: '',
    buttonText: 'Shop Now',
    buttonLink: '/products',
    icon: '',
    order: 0,
    isActive: true,
  })
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null)
  const [heroLoading, setHeroLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role?.toUpperCase() !== 'ADMIN') {
      router.push('/home')
      return
    }
    fetchProducts()
    fetchCategories()
    fetchHeroSections()
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
      alert('Please select or enter a category.')
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
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!')
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Failed to save product')
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
        alert('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Failed to delete product')
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
      alert('Please upload a banner image')
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
          buttonLink: heroFormData.buttonLink || '/products',
          icon: heroFormData.icon || '',
          order: heroFormData.order,
          isActive: heroFormData.isActive,
          image: imageUrl || editingHero?.image || null,
        }),
      })

      if (res.ok) {
        resetHeroForm()
        fetchHeroSections()
        alert(editingHero ? 'Hero slide updated!' : 'Hero slide created!')
      } else {
        const errorData = await res.json()
        alert(errorData.error || 'Failed to save hero slide')
      }
    } catch (error) {
      console.error('Error saving hero slide:', error)
      alert('Failed to save hero slide')
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
      buttonLink: hero.buttonLink || '/products',
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
        alert('Hero section deleted!')
      } else {
        alert('Failed to delete hero section')
      }
    } catch (error) {
      console.error('Error deleting hero section:', error)
      alert('Failed to delete hero section')
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

  const resetHeroForm = () => {
    setShowHeroForm(false)
    setEditingHero(null)
    setHeroFormData({
      title: '',
      description: '',
      buttonText: 'Shop Now',
      buttonLink: '/products',
      icon: '',
      order: 0,
      isActive: true,
    })
    setHeroImageFile(null)
    setHeroImagePreview(null)
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
    <div className="bg-linear-to-br from-gray-50 to-green-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage products, hero sections, and site content</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'products'
                ? 'bg-linear-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Products
          </button>
          <button
            onClick={() => setActiveTab('hero')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-medium transition-all ${
              activeTab === 'hero'
                ? 'bg-linear-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Hero Sections
          </button>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <div></div>
              <Button
                onClick={() => {
                  if (showForm) resetForm()
                  else setShowForm(true)
                }}
                className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancel' : 'Add New Product'}
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 grid md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Search products by name or item code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white"
              />
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 bg-white"
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
              <Card className="mb-8 shadow-lg">
                <CardHeader className="bg-linear-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2">
                    {editingProduct ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingProduct ? 'Edit Product' : 'Create New Product'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Product Name *</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          placeholder="Enter product name"
                        />
                      </div>
                      <div>
                        <Label>Category *</Label>
                        <select
                          className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                            className="mt-2"
                            placeholder="Type new category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            required
                          />
                        )}
                      </div>
                      <div>
                        <Label>Item Code *</Label>
                        <Input
                          value={formData.itemCode}
                          onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                          required
                          placeholder="e.g., STNHM001"
                          disabled={!!editingProduct}
                        />
                      </div>
                      <div>
                        <Label>Weight</Label>
                        <Input
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          placeholder="e.g., 250 gms"
                        />
                      </div>
                      <div>
                        <Label>MRP (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.mrp}
                          onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                          required
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Sale Price (₹) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.salePrice}
                          onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                          required
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>GST</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={formData.gst}
                          onChange={(e) => setFormData({ ...formData, gst: e.target.value })}
                          placeholder="0.05"
                        />
                      </div>
                      <div>
                        <Label>HSN Code</Label>
                        <Input
                          value={formData.hsnCode}
                          onChange={(e) => setFormData({ ...formData, hsnCode: e.target.value })}
                          placeholder="e.g., 1107"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Description</Label>
                      <textarea
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Product description..."
                      />
                    </div>
                    <div>
                      <Label>Product Image</Label>
                      <Input type="file" accept="image/*" onChange={handleImageChange} />
                      {(imagePreview || editingProduct?.image) && (
                        <div className="mt-4 relative w-32 h-32">
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
                    <div className="flex gap-4">
                      <Button type="submit" disabled={uploading} className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                        <div className="aspect-square bg-linear-to-br from-green-50 to-green-100 relative">
                          {product.image ? (
                            <Image src={product.image} alt={product.name} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-green-200" />
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
                )}
              </>
            )}
          </>
        )}

        {/* Hero Sections Tab */}
        {activeTab === 'hero' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">
                Manage hero carousel slides. Active slides will be shown on the homepage.
              </p>
              <Button
                onClick={() => {
                  if (showHeroForm) resetHeroForm()
                  else setShowHeroForm(true)
                }}
                className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showHeroForm ? 'Cancel' : 'Add Hero Slide'}
              </Button>
            </div>

            {/* Hero Form - Simplified */}
            {showHeroForm && (
              <Card className="mb-8 shadow-lg">
                <CardHeader className="bg-linear-to-r from-green-50 to-green-100">
                  <CardTitle className="flex items-center gap-2">
                    {editingHero ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {editingHero ? 'Edit Hero Slide' : 'Create Hero Slide'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleHeroSubmit} className="space-y-6">
                    {/* Background Image - Required */}
                    <div>
                      <Label className="text-base font-semibold">Banner Image *</Label>
                      <p className="text-sm text-gray-500 mb-2">Upload a high-quality banner image (recommended: 1920x600px or 16:5 ratio)</p>
                      <Input type="file" accept="image/*" onChange={handleHeroImageChange} />
                      {(heroImagePreview || editingHero?.image) && (
                        <div className="mt-4 relative w-full max-w-2xl h-48">
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
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Button Text</Label>
                        <Input
                          value={heroFormData.buttonText}
                          onChange={(e) => setHeroFormData({ ...heroFormData, buttonText: e.target.value })}
                          placeholder="Shop Now"
                        />
                      </div>
                      <div>
                        <Label>Button Link *</Label>
                        <Input
                          value={heroFormData.buttonLink}
                          onChange={(e) => setHeroFormData({ ...heroFormData, buttonLink: e.target.value })}
                          required
                          placeholder="/products or /collections/wood-pressed-oils"
                        />
                        <p className="text-xs text-gray-500 mt-1">Where should the button go when clicked?</p>
                      </div>
                    </div>

                    {/* Display Order */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Display Order</Label>
                        <Input
                          type="number"
                          min="0"
                          value={heroFormData.order}
                          onChange={(e) => setHeroFormData({ ...heroFormData, order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                        <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                      </div>
                      <div className="flex items-end pb-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="heroActive"
                            checked={heroFormData.isActive}
                            onChange={(e) => setHeroFormData({ ...heroFormData, isActive: e.target.checked })}
                            className="h-4 w-4"
                          />
                          <Label htmlFor="heroActive" className="cursor-pointer">Active (visible on homepage)</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                      <Button type="submit" disabled={heroLoading} className="bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                        {heroLoading ? 'Saving...' : editingHero ? 'Update Slide' : 'Create Slide'}
                      </Button>
                      <Button type="button" variant="outline" onClick={resetHeroForm}>Cancel</Button>
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {heroSections.map((hero) => (
                  <Card key={hero.id} className={`overflow-hidden transition-all hover:shadow-lg ${hero.isActive ? 'ring-2 ring-green-400' : ''}`}>
                    {/* Image Preview */}
                    <div className="relative w-full h-40 bg-linear-to-br from-amber-100 to-orange-100">
                      {hero.image ? (
                        <Image src={hero.image} alt="Hero slide" fill className="object-cover" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-green-300" />
                        </div>
                      )}
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${hero.isActive ? 'bg-amber-500 text-white' : 'bg-gray-500 text-white'}`}>
                          {hero.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {/* Order Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-black/60 text-white font-medium">
                          #{hero.order + 1}
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <CardContent className="p-4">
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Button Link:</p>
                        <p className="text-sm font-medium text-green-700 truncate">{hero.buttonLink}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Button Text:</p>
                        <p className="text-sm font-medium text-gray-800">{hero.buttonText || 'Shop Now'}</p>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleHeroActive(hero)}
                          className={`flex-1 ${hero.isActive ? 'text-orange-600 border-orange-200 hover:bg-orange-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                        >
                          {hero.isActive ? <><EyeOff className="w-4 h-4 mr-1" /> Hide</> : <><Eye className="w-4 h-4 mr-1" /> Show</>}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditHero(hero)} className="flex-1">
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteHero(hero.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
