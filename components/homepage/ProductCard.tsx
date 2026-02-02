'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Droplets, ShoppingCart, Zap, ArrowRight } from 'lucide-react'

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

export default function ProductCard({ product, onAddToCart, onBuyNow, className = '' }: ProductCardProps) {
  const hasDiscount = product.mrp > product.salePrice
  const discountPercent = hasDiscount 
    ? Math.round(((product.mrp - product.salePrice) / product.mrp) * 100) 
    : 0

  return (
    <div className={`group bg-white rounded-xl border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden min-w-0 w-full ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link href={`/home/products/${product.id}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name || 'Product'}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
              <Droplets className="w-12 h-12 sm:w-16 sm:h-16 text-green-300" />
            </div>
          )}
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Product Name */}
        <Link href={`/home/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-snug mb-1.5 sm:mb-2 line-clamp-2 hover:text-green-600 transition-colors min-h-[2.25rem] sm:min-h-[2.5rem] text-left">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating != null && product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-xs sm:text-sm ${i < Math.round(product.rating!) ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price and Explore Button */}
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3 min-w-0">
          <div className="flex items-baseline gap-1.5 sm:gap-2 flex-wrap min-w-0">
            <span className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
              ₹{product.salePrice?.toLocaleString('en-IN') || '0'}
            </span>
            {hasDiscount && (
              <span className="text-xs sm:text-sm text-gray-400 line-through shrink-0">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link 
            href={`/home/products/${product.id}`}
            className="hidden group-hover:flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-all shrink-0"
          >
            Explore
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onBuyNow(product.id)
            }}
            className="flex-1 min-w-0 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-1 sm:gap-1.5 transition-colors touch-manipulation"
          >
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
            <span className="truncate">Buy Now</span>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="flex-1 min-w-0 bg-white border-2 border-gray-900 hover:bg-gray-100 text-gray-900 text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg flex items-center justify-center transition-colors touch-manipulation shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
