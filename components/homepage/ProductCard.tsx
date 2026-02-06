'use client'

import { memo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Droplets, ShoppingCart, ArrowRight, Star } from 'lucide-react'

export interface ProductCardProps {
  product: {
    id: string
    name: string
    category?: string
    salePrice: number
    mrp: number
    image?: string
    itemCode?: string
    rating?: number
    reviewCount?: number
  }
  onAddToCart: (id: string) => void
  onBuyNow: (id: string) => void
  className?: string
}

function ProductCard({ product, onAddToCart, onBuyNow, className = '' }: ProductCardProps) {
  const hasDiscount = product.mrp > product.salePrice
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.salePrice) / product.mrp) * 100)
    : 0
  const rating = product.rating ?? 0

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-gray-100 hover:border-neutral-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden min-w-0 w-full ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Link href={`/home/products/${product.id}`} className="block size-full">
          {product.image ? (
            <>
              <Image
                src={product.image}
                alt={product.name || 'Product'}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <Droplets className="w-12 h-12 sm:w-16 sm:h-16 text-neutral-300" />
            </div>
          )}
        </Link>

        {/* Discount Badge - pill style */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-[#3CB31A] text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
            −{discountPercent}%
          </div>
        )}

        {/* Rating badge - top right, average only */}
        {rating > 0 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur-md text-amber-600 rounded-full pl-2 pr-2.5 py-1 shadow-lg border border-amber-200/50">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
            <span className="text-xs font-bold tabular-nums">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5">
        <Link href={`/home/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug mb-2 line-clamp-2 hover:text-neutral-700 transition-colors min-h-[2.25rem] sm:min-h-[2.5rem] text-left">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>

        {/* Price and Explore */}
        <div className="flex items-end justify-between gap-2 mb-4 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap min-w-0">
            <span className="text-lg sm:text-xl font-bold text-gray-900 tabular-nums">
              ₹{product.salePrice?.toLocaleString('en-IN') || '0'}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through tabular-nums">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link
            href={`/home/products/${product.id}`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors shrink-0 group/link"
          >
            Explore
            <ArrowRight className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBuyNow(product.id)
            }}
            className="flex-1 min-w-0 bg-[var(--primary-green)] hover:opacity-90 text-white text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-xl flex items-center justify-center shadow-md transition-all touch-manipulation"
          >
            <span className="truncate">Buy Now</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="flex-1 min-w-0 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-semibold py-2.5 sm:py-3 rounded-xl flex items-center justify-center transition-all touch-manipulation shrink-0"
          >
            <ShoppingCart className="w-4 h-4 text-[var(--primary-green)]" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ProductCard)
