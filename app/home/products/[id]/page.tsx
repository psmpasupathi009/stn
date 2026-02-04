'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import { Star, MessageSquare, User, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const productId = params.id as string

  const fetchProduct = useCallback(async () => {
    if (!productId) return
    try {
      const res = await fetch(`/api/products/${productId}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
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
    if (productId) {
      fetchProduct()
      fetchReviews()
    }
  }, [productId, fetchProduct, fetchReviews])

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
        body: JSON.stringify({ productId: product?.id, quantity }),
      })

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('cart-updated'))
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

  const displayRating = product?.rating ?? 0
  const displayReviewCount = product?.reviewCount ?? 0

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

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-6 sm:py-8 md:py-10 lg:py-12 max-w-7xl">
        {/* Back link */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/home/products"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="min-w-0 space-y-4">
            <div className="aspect-square bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm relative">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl sm:text-6xl">
                  🛢️
                </div>
              )}
            </div>
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {product.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square bg-neutral-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative"
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                      sizes="120px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="min-w-0 flex flex-col">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-neutral-900 mb-2 sm:mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & review count - always visible */}
            <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
              <StarRating value={displayRating} />
              <span className="text-sm text-neutral-600">
                {displayRating > 0 ? displayRating.toFixed(1) : '0'} · {displayReviewCount} {displayReviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
              <span className="text-2xl sm:text-3xl font-bold text-neutral-900">
                ₹{product.salePrice.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.salePrice && (
                  <span className="text-lg sm:text-xl text-neutral-500 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              <span
                className={`text-xs sm:text-sm font-medium px-2.5 py-1 rounded-md ${
                  product.inStock
                    ? 'bg-[#3CB31A] text-white'
                    : 'bg-neutral-400 text-white'
                }`}
              >
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <button
                onClick={addToCart}
                disabled={!product.inStock}
                className="flex-1 min-w-0 border-2 border-neutral-300 text-neutral-700 py-3 px-5 sm:px-6 rounded-xl font-semibold hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to cart
              </button>
              <button
                onClick={() => {
                  addToCart()
                  router.push('/home/cart')
                }}
                disabled={!product.inStock}
                className="flex-1 min-w-0 bg-[var(--primary-green)] text-white py-3 px-5 sm:px-6 rounded-xl font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy now
              </button>
            </div>

            {product.description && (
              <div className="border-t border-neutral-200 pt-5 sm:pt-6">
                <h2 className="text-base sm:text-lg font-semibold text-neutral-900 mb-2">Description</h2>
                <p className="text-neutral-700 text-sm sm:text-base leading-relaxed">{product.description}</p>
              </div>
            )}

            {!product.inStock && (
              <p className="text-red-600 text-sm sm:text-base mt-4">This product is currently out of stock.</p>
            )}
          </div>
        </div>

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
                <p className="text-[10px] text-gray-500">{reviewComment.length}/500</p>
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
                    <li key={r.id ? String(r.id) : `review-${index}`} className="flex-shrink-0">
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
