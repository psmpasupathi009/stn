'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'

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

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
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

  useEffect(() => {
    // Strict admin check - redirect if not admin
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (user?.role !== 'admin') {
      router.push('/')
      return
    }
    fetchProducts()
    fetchCategories()
  }, [isAuthenticated, user])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const url = selectedCategory
        ? `/api/products?category=${encodeURIComponent(selectedCategory)}`
        : '/api/products'
      const res = await fetch(url)
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
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data.map((c: any) => c.category))
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchProducts()
    }
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
    setUploading(true)

    try {
      const imageUrl = await handleImageUpload()

      const token = localStorage.getItem('token')
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl || editingProduct?.image || null,
          mrp: parseFloat(formData.mrp),
          salePrice: parseFloat(formData.salePrice),
          gst: parseFloat(formData.gst || '0'),
        }),
      })

      if (res.ok) {
        setShowForm(false)
        setEditingProduct(null)
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
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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

  // Show loading or redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
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
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage products, categories, and inventory</p>
          </div>
          <Button onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setShowForm(true)
            }
          }} className="bg-black text-white hover:bg-gray-800">
            {showForm ? 'Cancel' : '+ Add New Product'}
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 grid md:grid-cols-2 gap-4">
          <div>
            <Input
              type="text"
              placeholder="Search products by name or item code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Product Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Create New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
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
                      required
                    >
                      <option value="">Select Category</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
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
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  {editingProduct?.image && !imagePreview && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                      <img
                        src={editingProduct.image}
                        alt="Current"
                        className="w-32 h-32 object-cover rounded border"
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
                  <Label htmlFor="inStock" className="cursor-pointer">
                    In Stock
                  </Label>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" disabled={uploading} className="bg-black text-white hover:bg-gray-800">
                    {uploading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        {loading ? (
          <div className="text-center py-12">Loading products...</div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No products found</p>
                <Button onClick={() => setShowForm(true)} className="bg-black text-white hover:bg-gray-800">
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-gray-100 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          🛢️
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
                      <p className="text-sm text-gray-600 mb-2">Category: {product.category}</p>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-lg font-bold text-green-600">₹{product.salePrice}</p>
                          {product.mrp > product.salePrice && (
                            <p className="text-xs text-gray-500 line-through">₹{product.mrp}</p>
                          )}
                        </div>
                        {product.rating && product.rating > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-semibold">⭐ {product.rating.toFixed(1)}</p>
                            <p className="text-xs text-gray-500">({product.reviewCount || 0} reviews)</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(product.id)}
                        >
                          Delete
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
