'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'
import {
  Droplets,
  Wheat,
  Cookie,
  Flame,
  ChefHat,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Gem,
  Truck,
  Lock,
  MessageCircle,
  Globe,
  Pause,
  Play,
} from 'lucide-react'

interface Product {
  id: string
  name: string
  category: string
  salePrice: number
  mrp: number
  image?: string
  itemCode: string
  rating?: number
  reviewCount?: number
}

interface HeroSlide {
  id?: string
  title: string
  description: string
  buttonText: string
  buttonLink: string
  image?: string
  icon?: string
}

// Default hero slides (fallback if database is empty)
const defaultHeroSlides: HeroSlide[] = [
  {
    title: 'Authentic Wood Pressed Oils',
    description: 'Pure from Within',
    buttonText: 'Shop Now',
    buttonLink: '/collections/wood-pressed-oils',
    icon: 'Droplets',
    image: '',
  },
  {
    title: 'Healthy Mixes & Malt',
    description: 'For Daily Wellness',
    buttonText: 'Shop Now',
    buttonLink: '/collections/healthy-mixes',
    icon: 'Wheat',
    image: '',
  },
  {
    title: 'Kovilpatti Special',
    description: 'Authentic Regional Flavors',
    buttonText: 'Shop Now',
    buttonLink: '/collections/kovilpatti-special',
    icon: 'Cookie',
    image: '',
  },
]

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Droplets,
  Wheat,
  Cookie,
  Flame,
  ChefHat,
  Leaf,
}

function HeroIcon({ iconName, className }: { iconName?: string; className?: string }) {
  const IconComponent = iconName ? iconMap[iconName] : Wheat
  if (!IconComponent) return <Wheat className={className} strokeWidth={1.5} />
  return <IconComponent className={className} strokeWidth={1.5} />
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [healthyMixes, setHealthyMixes] = useState<Product[]>([])
  const [kovilpattiSpecial, setKovilpattiSpecial] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides)
  const [isPlaying, setIsPlaying] = useState(true)
  const { isAuthenticated } = useAuth()

  // Fetch hero sections from database
  useEffect(() => {
    const fetchHeroSections = async () => {
      try {
        const res = await fetch('/api/hero-sections?active=true')
        if (res.ok) {
          const data = await res.json()
          if (data && data.length > 0) {
            setHeroSlides(data)
          }
          // If empty, keep default slides
        }
      } catch (error) {
        console.error('Error fetching hero sections:', error)
        // Keep default slides on error
      }
    }
    fetchHeroSections()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (heroSlides.length <= 1 || !isPlaying) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length, isPlaying])

  const fetchProducts = async () => {
    try {
      const oilsRes = await fetch('/api/products?category=' + encodeURIComponent('VAGAI WOOD PERSSED OIL / COLD PRESSED OIL'))
      const oilsData = await oilsRes.json()
      setFeaturedProducts(oilsData.slice(0, 8))

      const mixesRes = await fetch('/api/products?category=' + encodeURIComponent('HEALTHY  MIXES'))
      const mixesData = await mixesRes.json()
      setHealthyMixes(mixesData.slice(0, 4))

      const kovilpattiRes = await fetch('/api/products?category=' + encodeURIComponent('KOVILPATTI SPECIAL'))
      const kovilpattiData = await kovilpattiRes.json()
      setKovilpattiSpecial(kovilpattiData.slice(0, 4))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId: string) => {
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
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

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index)
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }, [heroSlides.length])

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }, [heroSlides.length])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="w-full bg-white py-4 sm:py-5 md:py-6">
        <div className="container mx-auto px-4">
          {/* Hero Image Container */}
          <div 
            className="relative w-full overflow-hidden"
            style={{ height: 'calc(100vh - 220px)', minHeight: '400px', maxHeight: '650px' }}
          >
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id || index}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image or Gradient with Icon */}
                {slide.image && slide.image.length > 0 ? (
                  <>
                    <img
                      src={slide.image}
                      alt={slide.title || 'Hero banner'}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-50 to-green-200 flex items-center justify-center">
                    <div className="text-center px-4">
                      <HeroIcon
                        iconName={slide.icon}
                        className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 lg:w-36 lg:h-36 text-green-600 mx-auto mb-3 sm:mb-4"
                      />
                      <h2 className="text-lg sm:text-xl md:text-3xl lg:text-4xl font-bold text-gray-800 max-w-sm sm:max-w-md md:max-w-lg mx-auto leading-tight">
                        {slide.title}
                      </h2>
                    </div>
                  </div>
                )}

                {/* Shop Now Button - centered at bottom */}
                <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-0 right-0 flex justify-center z-20">
                  <Link href={slide.buttonLink || '/products'}>
                    <button className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                      {slide.buttonText || 'Shop Now'}
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Carousel Navigation - Below the image */}
          {heroSlides.length > 1 && (
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5 md:mt-6">
              <button
                onClick={goToPrev}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </button>
              
              <span className="text-sm sm:text-base text-gray-600 font-medium tabular-nums min-w-[40px] text-center">
                {currentSlide + 1}/{heroSlides.length}
              </span>
              
              <button
                onClick={goToNext}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
              </button>
              
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products - Wood Pressed Oils */}
      <section className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Authentic Oils, Pure from Within.
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Made with traditional wood-pressing — rich in flavor, clean in nature.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Droplets className="w-16 h-16 text-green-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-800 hover:text-green-700 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.mrp}
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Sale
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 px-4 rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-sm font-medium"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/products" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors">
              View all products
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Healthy Mixes Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Healthy Mixes & Malt
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Nutritious malt mixes and health powders for your daily wellness needs.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : healthyMixes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {healthyMixes.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-green-100">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-yellow-50 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Wheat className="w-16 h-16 text-green-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-800 hover:text-green-700 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.mrp}
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Sale
                          </span>
                        </>
                      )}
                    </div>
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 px-4 rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-sm font-medium"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="text-center mt-8">
            <Link href="/collections/healthy-mixes" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors">
              View all Healthy Mixes
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Kovilpatti Special Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Kovilpatti Special
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Authentic regional specialties from Kovilpatti — unique flavors and traditional recipes.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : kovilpattiSpecial.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {kovilpattiSpecial.map((product) => (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Cookie className="w-16 h-16 text-green-300" />
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-base sm:text-lg mb-2 text-gray-800 hover:text-green-700 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <>
                          <span className="text-sm text-gray-400 line-through">
                            ₹{product.mrp}
                          </span>
                          <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                            Sale
                          </span>
                        </>
                      )}
                    </div>
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-500">★</span>
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 px-4 rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-sm font-medium"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="text-center mt-8">
            <Link href="/collections/kovilpatti-special" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors">
              View all Kovilpatti Special
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section - Modern Design */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Why Customers Trust Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Premium Quality</h3>
              <p className="text-xs sm:text-sm text-gray-600">Carefully selected ingredients.</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Free Delivery</h3>
              <p className="text-xs sm:text-sm text-gray-600">Zero delivery charges on all orders</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Secure Checkout</h3>
              <p className="text-xs sm:text-sm text-gray-600">Encrypted & safe transactions</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Customer Support</h3>
              <p className="text-xs sm:text-sm text-gray-600">Your questions answered with care</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Pan-India Shipping</h3>
              <p className="text-xs sm:text-sm text-gray-600">Reachable. Reliable. Nationwide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
