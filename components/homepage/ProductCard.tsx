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
    <div className={`group bg-white rounded-xl border border-gray-200 hover:border-green-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}>
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link href={`/home/products/${product.id}`}>
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name || 'Product'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
              <Droplets className="w-16 h-16 text-green-300" />
            </div>
          )}
        </Link>
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <Link href={`/home/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight mb-2 line-clamp-2 hover:text-green-600 transition-colors min-h-[2.5rem] text-center">
            {product.name || 'Unnamed Product'}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating != null && product.rating > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-sm ${i < Math.round(product.rating!) ? 'text-amber-400' : 'text-gray-200'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              ({product.reviewCount || 0})
            </span>
          </div>
        )}

        {/* Price and Explore Button */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-xl font-bold text-gray-900">
              ₹{product.salePrice?.toLocaleString('en-IN') || '0'}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                ₹{product.mrp?.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <Link 
            href={`/home/products/${product.id}`}
            className="hidden group-hover:flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-all"
          >
            Explore
            <ArrowRight className="w-4 h-4" />
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
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Buy Now
          </button>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart(product.id)
            }}
            className="flex-1 bg-white border-2 border-gray-900 hover:bg-gray-100 text-gray-900 text-xs sm:text-sm font-semibold py-2 sm:py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
