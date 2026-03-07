'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'
import { useCartStore } from '@/lib/stores/cart-store'
import { toast } from 'sonner'
import { Star, MessageSquare, User, ChevronLeft, Share2 } from 'lucide-react'
import Link from 'next/link'
import { cn, getProductImagesWithVariantFallback, getVariantDisplayName } from '@/lib/utils'
import type { Product, Review } from '@/lib/types'

function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const filled = Math.min(5, Math.max(0, Math.round(value)))
  const sizeClass = size === 'sm' ? 'w-4 h-4 sm:w-4 sm:h-4' : 'w-4 h-4 sm:w-5 sm:h-5'
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} shrink-0 ${
            i <= filled ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  )
}

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState<Product | null>(null)
  const [otherVariants, setOtherVariants] = useState<Product[]>([])
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [zoomHover, setZoomHover] = useState(false)
  const [zoomLens, setZoomLens] = useState({
    x: 0.5,
    y: 0.5,
    cursorX: 0,
    cursorY: 0,
    width: 0,
    height: 0,
  })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const productId = params.id as string

  // All variants: current product + same-name others (Amazon-style: select variant on same page)
  const allVariants = useMemo(() => {
    if (!product) return []
    const name = (product.name || '').trim().toLowerCase()
    const others = otherVariants.filter(
      (p) => (p.name || '').trim().toLowerCase() === name && p.id !== product.id
    )
    return [product, ...others]
  }, [product, otherVariants])

  const displayProduct = useMemo(() => {
    if (selectedVariantId && allVariants.length) {
      const found = allVariants.find((p) => p.id === selectedVariantId)
      if (found) return found
    }
    return product
  }, [product, allVariants, selectedVariantId])

  // Keep selected variant in sync with URL (e.g. when navigating to this product)
  useEffect(() => {
    if (product && productId) setSelectedVariantId(productId)
  }, [productId, product?.id])

  const allImages = useMemo(
    () => getProductImagesWithVariantFallback(displayProduct, allVariants),
    [displayProduct, allVariants]
  )
  const mainImageUrl = allImages[selectedImageIndex] ?? null

  const LENS_WIDTH = 220
  const LENS_HEIGHT = 220
  const ZOOM_LEVEL = 4

  const handleMainImageMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const halfW = LENS_WIDTH / 2
    const halfH = LENS_HEIGHT / 2
    let cursorX = e.clientX - rect.left
    let cursorY = e.clientY - rect.top
    cursorX = Math.max(halfW, Math.min(rect.width - halfW, cursorX))
    cursorY = Math.max(halfH, Math.min(rect.height - halfH, cursorY))
    setZoomLens({
      x,
      y,
      cursorX,
      cursorY,
      width: rect.width,
      height: rect.height,
    })
  }, [])

  const handleMainImageMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setZoomHover(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const halfW = LENS_WIDTH / 2
    const halfH = LENS_HEIGHT / 2
    const cursorX = Math.max(halfW, Math.min(rect.width - halfW, e.clientX - rect.left))
    const cursorY = Math.max(halfH, Math.min(rect.height - halfH, e.clientY - rect.top))
    setZoomLens({
      x,
      y,
      cursorX,
      cursorY,
      width: rect.width,
      height: rect.height,
    })
  }, [])

  const handleMainImageMouseLeave = useCallback(() => {
    setZoomHover(false)
  }, [])

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
        // Fetch same-name variants (e.g. 500g, 1kg) for "Other variants" section
        const name = (data.name || '').trim()
        if (name) {
          fetch(`/api/products?search=${encodeURIComponent(name)}`)
            .then((r) => r.ok ? r.json() : [])
            .then((arr: Product[]) => {
              const sameName = Array.isArray(arr)
                ? arr.filter((p) => (p.name || '').trim().toLowerCase() === name.toLowerCase() && p.id !== data.id)
                : []
              setOtherVariants(sameName)
            })
            .catch(() => setOtherVariants([]))
        } else {
          setOtherVariants([])
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }, [productId])

  const fetchReviews = useCallback(async () => {
    if (!productId) return
    setReviewsLoading(true)
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setReviewsLoading(false)
    }
  }, [productId])

  useEffect(() => {
    if (!productId) return
    let cancelled = false
    setLoading(true)
    setReviewsLoading(true)
    Promise.all([fetchProduct(), fetchReviews()]).finally(() => {
      if (!cancelled) {
        setLoading(false)
        setReviewsLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [productId, fetchProduct, fetchReviews])

  useEffect(() => {
    setSelectedImageIndex(0)
  }, [productId, displayProduct?.id])

  const addToCart = async () => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: displayProduct?.id, quantity }),
      })

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
        useCartStore.getState().fetchCart()
        toast.success('Added to cart!')
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const submitReview = async () => {
    if (!isAuthenticated) {
      router.push('/home/login')
      return
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating (1–5 stars)')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product?.id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
        }),
      })

      if (res.ok) {
        toast.success('Review submitted!')
        setReviewRating(0)
        setReviewComment('')
        fetchProduct()
        fetchReviews()
      } else {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const displayRating = displayProduct?.rating ?? 0
  const displayReviewCount = displayProduct?.reviewCount ?? 0

  const shareProduct = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const title = product?.name ? `${product.name} | STN Golden Healthy Foods` : 'Product | STN Golden Healthy Foods'
    const text = product?.name ? `Check out ${product.name}` : 'Check out this product'

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        toast.success('Link shared!')
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(url)
        }
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (url: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      toast.error('Sharing not supported')
      return
    }
    navigator.clipboard.writeText(url).then(
      () => toast.success('Link copied to clipboard'),
      () => toast.error('Could not copy link')
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-neutral-200" />
          <p className="text-neutral-600 text-sm sm:text-base">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-neutral-600 text-center">Product not found</p>
        <Button onClick={() => router.push('/home/products')} variant="outline">
          Browse products
        </Button>
      </div>
    )
  }

  const htmlTagRegex = /<[a-z][\s\S]*>/i
  const descriptionHtml = product.description
    ? htmlTagRegex.test(product.description)
      ? product.description
      : `<p>${String(product.description).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`
    : ''

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">
        <div className="mb-4 sm:mb-6">
          <Link
            href="/home/products"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
          {/* Product Images: main with Amazon-style hover zoom lens */}
          <div className="min-w-0 space-y-4">
            <div
              ref={imageContainerRef}
              className="aspect-square bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative select-none"
              onMouseEnter={handleMainImageMouseEnter}
              onMouseLeave={handleMainImageMouseLeave}
              onMouseMove={handleMainImageMouseMove}
            >
              {mainImageUrl ? (
                <>
                  <Image
                    src={mainImageUrl}
                    alt={displayProduct?.name ?? product.name}
                    fill
                    className="object-cover pointer-events-none"
                    unoptimized
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    draggable={false}
                  />
                  {/* Zoom box: follows cursor, shows 4x zoom of the area under it */}
                  {zoomHover && zoomLens.width > 0 && (
                    <div
                      className="absolute overflow-hidden rounded-lg border-2 border-white bg-white shadow-xl ring-2 ring-neutral-900/10 pointer-events-none"
                      style={{
                        width: LENS_WIDTH,
                        height: LENS_HEIGHT,
                        left: zoomLens.cursorX - LENS_WIDTH / 2,
                        top: zoomLens.cursorY - LENS_HEIGHT / 2,
                      }}
                    >
                      <div
                        className="absolute bg-cover bg-no-repeat"
                        style={{
                          width: zoomLens.width * ZOOM_LEVEL,
                          height: zoomLens.height * ZOOM_LEVEL,
                          left: LENS_WIDTH / 2 - zoomLens.x * zoomLens.width * ZOOM_LEVEL,
                          top: LENS_HEIGHT / 2 - zoomLens.y * zoomLens.height * ZOOM_LEVEL,
                          backgroundImage: `url(${mainImageUrl})`,
                          backgroundSize: `${zoomLens.width * ZOOM_LEVEL}px ${zoomLens.height * ZOOM_LEVEL}px`,
                          backgroundPosition: '0 0',
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl sm:text-6xl">
                  🛢️
                </div>
              )}
            </div>
            {allImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      'aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer transition-all relative ring-2 ring-offset-2 ring-offset-white',
                      selectedImageIndex === idx
                        ? 'ring-neutral-900 opacity-100'
                        : 'ring-transparent hover:opacity-90 opacity-70'
                    )}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="120px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex flex-col">
            <div className="flex items-start justify-between gap-3 mb-2 sm:mb-3">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
                  {product.name}
                </h1>
                {(displayProduct?.variantLabel || displayProduct?.weight || displayProduct?.itemCode) && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {getVariantDisplayName(displayProduct)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={shareProduct}
                className="shrink-0 p-2 rounded-full border border-neutral-300 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
                aria-label="Share this product"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Rating & review count - always visible */}
            <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
              <StarRating value={displayRating} />
              <span className="text-sm text-neutral-600">
                {displayRating > 0 ? displayRating.toFixed(1) : '0'} · {displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Amazon-style variant selector: all variants on same page, select to see price */}
            {allVariants.length > 1 && (
              <div className="mb-4 sm:mb-5">
                <label className="block text-sm font-medium text-neutral-900 mb-2">Select variant</label>
                <div className="flex flex-wrap gap-2">
                  {allVariants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVariantId(v.id)
                        router.replace(`/home/products/${v.id}`, { scroll: false })
                      }}
                      className={cn(
                        'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#3CB31A] focus:ring-offset-2',
                        selectedVariantId === v.id
                          ? 'border-[#3CB31A] bg-[#3CB31A]/10 text-neutral-900'
                          : 'border-neutral-300 bg-white text-neutral-700 hover:border-neutral-400 hover:bg-neutral-50'
                      )}
                      aria-pressed={selectedVariantId === v.id}
                      aria-label={`${getVariantDisplayName(v)} — ₹${v.salePrice?.toLocaleString('en-IN')}`}
                    >
                      <span className="font-medium">{getVariantDisplayName(v) || 'Variant'}</span>
                      <span className="ml-1.5 text-neutral-500">₹{v.salePrice?.toLocaleString('en-IN')}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price - reflects selected variant */}
            <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                ₹{(displayProduct?.salePrice ?? 0).toLocaleString('en-IN')}
              </span>
              {displayProduct && displayProduct.mrp > displayProduct.salePrice && (
                <span className="text-lg sm:text-xl text-neutral-500 line-through">
                  ₹{displayProduct.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {displayProduct && (
                <span
                  className={`text-xs sm:text-sm font-medium px-2.5 py-1 rounded-md ${
                    displayProduct.inStock
                      ? 'bg-[#3CB31A] text-white'
                      : 'bg-neutral-400 text-white'
                  }`}
                >
                  {displayProduct.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              )}
            </div>
            <p className="text-sm text-neutral-600 mb-5 sm:mb-6">Shipping calculated at checkout.</p>

            {/* Quantity */}
            <div className="mb-5 sm:mb-6">
              <label className="block text-sm font-medium text-neutral-900 mb-2">Quantity</label>
              <div className="flex items-center border border-neutral-300 rounded-lg w-fit">
                <button
                  type="button"
                  className="px-4 py-2.5 hover:bg-neutral-100 rounded-l-lg transition-colors"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span className="w-12 text-center text-neutral-900 font-medium" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="px-4 py-2.5 hover:bg-neutral-100 rounded-r-lg transition-colors"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Value props */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
              {[
                { icon: '💎', label: 'Premium' },
                { icon: '✓', label: 'Satisfaction' },
                { icon: '🚚', label: 'Shipping' },
                { icon: '🔒', label: 'Secure' },
              ].map(({ icon, label }) => (
                <div key={label} className="text-center py-2 px-1">
                  <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-xl sm:text-2xl mb-1 bg-[#3CB31A]/15 text-[#3CB31A] border-2 border-[#3CB31A]">
                    {icon}
                  </span>
                  <p className="text-[10px] sm:text-xs text-neutral-600 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-4 mb-6 sm:mb-8">
              <button
                onClick={addToCart}
                disabled={!displayProduct?.inStock}
                className="flex-1 min-w-0 border-2 border-neutral-300 text-neutral-700 py-3 px-5 sm:px-6 rounded-xl font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart
              </button>
              <button
                onClick={() => {
                  addToCart()
                  router.push('/home/cart')
                }}
                disabled={!displayProduct?.inStock}
                className="flex-1 min-w-0 bg-(--primary-green) text-white py-3 px-5 sm:px-6 rounded-xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy now
              </button>
            </div>

            {displayProduct && !displayProduct.inStock && (
              <p className="text-red-600 text-sm sm:text-base mt-4">This variant is currently out of stock.</p>
            )}
          </div>
        </div>

        {/* Description - full width, above Reviews */}
        {product.description && (
          <div className="mt-8 pt-6 border-t border-neutral-200 w-full min-w-0">
            <h2 className="text-base sm:text-lg md:text-lg font-semibold text-neutral-900 mb-2 sm:mb-3">Description</h2>
            <div className="w-full min-w-0 max-w-full rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2.5 sm:px-4 sm:py-3 md:px-5 md:py-4 overflow-x-hidden">
              <div
                className="prose prose-sm sm:prose-base md:prose-base text-neutral-700 leading-relaxed [&_p]:mb-2 [&_p]:whitespace-normal [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_strong]:font-semibold [&_a]:text-[#3CB31A] [&_a]:underline **:max-w-full"
                style={{ wordBreak: 'normal', overflowWrap: 'break-word' } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            </div>
          </div>
        )}

        {/* Reviews section - compact */}
        <section className="mt-8 pt-6 border-t border-neutral-200" aria-label="Reviews">
          <div className="flex items-center gap-1.5 mb-4">
            <MessageSquare className="w-4 h-4 text-neutral-600" />
            <h2 className="text-base font-semibold text-neutral-900">
              Reviews {displayReviewCount > 0 && `(${displayReviewCount})`}
            </h2>
          </div>

          {/* Write review - compact */}
          {isAuthenticated ? (
            <Card className="mb-4 rounded-lg border-gray-200 shadow-sm">
              <CardHeader className="p-3 pb-0">
                <CardTitle className="text-sm font-semibold">Write a review</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Label htmlFor="review-rating" className="text-xs shrink-0">Rating</Label>
                  <div id="review-rating" className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        className="p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
                        onMouseEnter={() => setHoverRating(r)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setReviewRating(r)}
                        aria-label={`${r} star${r > 1 ? 's' : ''}`}
                      >
                        <Star
                          className={cn(
                            'w-5 h-5 transition-colors',
                            (hoverRating || reviewRating) >= r
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-200'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 items-end">
                  <textarea
                    id="review-comment"
                    placeholder="Comment (optional)"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className={cn(
                      'flex-1 min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs ring-offset-white',
                      'placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1',
                      'disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                    )}
                    maxLength={500}
                    rows={2}
                  />
                  <Button
                    onClick={submitReview}
                    disabled={submittingReview || reviewRating < 1}
                    size="sm"
                    className="bg-neutral-700 hover:bg-neutral-800 shrink-0 h-8"
                  >
                    {submittingReview ? '…' : 'Submit'}
                  </Button>
                </div>
                <p className="text-[10px] text-gray-500">{`${reviewComment.length}/500`}</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="mb-4 rounded-lg border-gray-200 bg-gray-50/50">
              <CardContent className="p-3 flex flex-wrap items-center gap-2">
                <p className="text-xs text-gray-600">Sign in to leave a review.</p>
                <Link href="/home/login">
                  <Button variant="outline" size="sm" className="h-7 text-xs">
                    Sign in
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Review list - compact, scrollable */}
          {reviewsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse h-14 rounded-md bg-gray-100" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-xs py-3">No reviews yet.</p>
          ) : (
            <div className="space-y-1.5">
              <p className="text-[10px] text-gray-500">
                All {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} — {reviews.length > 3 ? 'scroll down to see more' : 'see below'}
              </p>
              {/* Fixed height = ~3 review cards visible; all comments in list, scroll to read rest */}
              <div
                className="reviews-scroll overflow-y-auto overflow-x-hidden rounded-md border border-gray-200 bg-gray-50/50 pr-1.5 scroll-smooth"
                style={{ height: '260px' }}
                aria-label={`All ${reviews.length} reviews, scroll to read all`}
              >
                <ul className="space-y-2 p-0.5 list-none m-0 pb-1">
                  {reviews.map((r, index) => (
                    <li key={r.id ? String(r.id) : `review-${index}`} className="shrink-0">
                      <Card className="rounded-md border-gray-200 overflow-hidden">
                        <CardContent className="p-2.5">
                          <div className="flex items-start gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                              <User className="h-3 w-3" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {r.user?.name || r.user?.email?.split('@')[0] || 'Customer'}
                                </p>
                                <StarRating value={r.rating} size="sm" />
                                <span className="text-[10px] text-gray-500">
                                  {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                              {r.comment && (
                                <p className="text-xs text-gray-700 leading-snug mt-0.5 line-clamp-2">{r.comment}</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
