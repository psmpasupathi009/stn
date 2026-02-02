'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
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
import CategoryMarquee from '@/components/CategoryMarquee'

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

const HERO_ICONS: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  Droplets,
  Wheat,
  Cookie,
  Flame,
  ChefHat,
  Leaf,
}

function HeroIcon({ iconName, className }: { iconName?: string; className?: string }) {
  const Icon = iconName && HERO_ICONS[iconName] ? HERO_ICONS[iconName] : Wheat
  return <Icon className={className} strokeWidth={1.5} />
}

export default function HomePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [heroImageErrors, setHeroImageErrors] = useState<Set<number>>(new Set())
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const heroCount = heroSlides.length
  const currentIndex = Math.min(currentSlide, Math.max(0, heroCount - 1))

  const getHeroImageUrl = (slide: HeroSlide): string => {
    const url = typeof slide?.image === 'string' ? slide.image.trim() : ''
    return url.startsWith('http://') || url.startsWith('https://') ? url : ''
  }

  const hasValidHeroImage = (slide: HeroSlide, index: number): boolean => {
    return getHeroImageUrl(slide).length > 0 && !heroImageErrors.has(index)
  }

  useEffect(() => {
    let cancelled = false
    fetch('/api/hero-sections?active=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled || !Array.isArray(data)) return
        setHeroSlides(data)
        setHeroImageErrors(new Set())
      })
      .catch((err) => console.error('Hero sections fetch error:', err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- clamp slide index when heroCount changes
    setCurrentSlide((prev) => Math.min(prev, Math.max(0, heroCount - 1)))
  }, [heroCount])

  useEffect(() => {
    if (heroCount <= 1 || !isPlaying) return
    const id = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroCount), 5000)
    return () => clearInterval(id)
  }, [heroCount, isPlaying])

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/categories').then((r) => r.json()),
      fetch('/api/products').then((r) => r.json()),
    ])
      .then(([catData, prodData]) => {
        if (cancelled) return
        const names = Array.isArray(catData)
          ? catData.map((c: { category: string }) => c.category).filter(Boolean)
          : []
        setCategories(names)
        const list = Array.isArray(prodData) ? prodData : []
        const separate = list.filter(
          (p: Product) =>
            !String(p.name || '').toLowerCase().includes('combo') &&
            !String(p.category || '').toLowerCase().includes('combo')
        )
        setAllProducts(separate)
      })
      .catch((err) => console.error('Home products fetch error:', err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // 4 most recently added products per category (API returns createdAt desc)
  const RECENT_PER_CATEGORY = 4
  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>()
    categories.forEach((cat) => map.set(cat, []))
    allProducts.forEach((p) => {
      const key = (p.category || '').trim()
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    })
    return categories
      .map((cat) => ({
        category: cat,
        products: (map.get(cat) || []).slice(0, RECENT_PER_CATEGORY),
      }))
      .filter(({ products }) => products.length > 0)
  }, [allProducts, categories])

  const addToCart = async (productId: string) => {
    if (!isAuthenticated) {
      router.push('/login')
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

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroCount)
  }, [heroCount])

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroCount) % heroCount)
  }, [heroCount])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero: only when database has active hero sections */}
      {heroCount > 0 && (
        <section className="w-full bg-white py-4 sm:py-5 md:py-6">
          <div className="container mx-auto px-4">
            <div
              className="relative w-full overflow-hidden"
              style={{ height: 'calc(100vh - 220px)', minHeight: '400px', maxHeight: '650px' }}
            >
              {heroSlides.map((slide, index) => {
                const imageUrl = getHeroImageUrl(slide)
                const showImage = hasValidHeroImage(slide, index)
                return (
                  <div
                    key={slide.id ?? index}
                    className={`absolute inset-0 transition-opacity duration-700 ${
                      index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    {showImage ? (
                      <>
                        <div className="absolute inset-0">
                          <div className="relative w-full h-full">
                            <Image
                              src={imageUrl}
                              alt={slide.title || 'Hero banner'}
                              fill
                              className="object-cover object-center"
                              sizes="100vw"
                              unoptimized={!imageUrl.includes('res.cloudinary.com')}
                              onError={() => setHeroImageErrors((prev) => new Set(prev).add(index))}
                            />
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-green-100 via-green-50 to-green-200 flex items-center justify-center">
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
                    <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-0 right-0 flex justify-center z-20">
                      <Link href={slide.buttonLink || '/products'}>
                        <button className="bg-black hover:bg-gray-800 text-white px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200">
                          {slide.buttonText || 'Shop Now'}
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {heroCount > 1 && (
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-5 md:mt-6">
                <button onClick={goToPrev} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Previous slide">
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                </button>
                <span className="text-sm sm:text-base text-gray-600 font-medium tabular-nums min-w-[40px] text-center">
                  {currentIndex + 1}/{heroCount}
                </span>
                <button onClick={goToNext} className="p-2 text-gray-400 hover:text-gray-700 transition-colors" aria-label="Next slide">
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} /> : <Play className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={1.5} />}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      <CategoryMarquee />

      {/* Products by category – grid layout, no slide */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Products
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Shop by category — traditional oils, spices, and healthy products.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : productsByCategory.length === 0 ? (
            <div className="text-center py-16 text-gray-500">No products yet.</div>
          ) : (
            <div className="space-y-14 md:space-y-16">
              {productsByCategory.map(({ category, products: categoryProducts }) => (
                <div key={category}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category}
                    </h3>
                    <Link
                      href={`/products?category=${encodeURIComponent(category)}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 transition-colors group"
                    >
                      View more products
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
                    {categoryProducts.map((product) => (
                      <div
                        key={product.id}
                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-100 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                  <Link href={`/products/${product.id}`} className="block flex-1 min-h-0">
                    <div className="aspect-square bg-gray-50 overflow-hidden relative">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Droplets className="w-14 h-14 sm:w-16 sm:h-16 text-green-200" />
                        </div>
                      )}
                      {product.mrp > product.salePrice && (
                        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-600 text-white text-xs sm:text-sm font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md">
                          Sale
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                    <Link href={`/products/${product.id}`} className="flex-1 min-h-0">
                      <h4 className="font-semibold text-base sm:text-lg mb-2 text-gray-900 hover:text-green-700 transition-colors line-clamp-2">
                        {product.name}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <span className="text-lg sm:text-xl font-bold text-gray-900">₹{product.salePrice}</span>
                      {product.mrp > product.salePrice && (
                        <span className="text-sm sm:text-base text-gray-400 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                    {product.rating != null && product.rating > 0 && (
                      <div className="flex items-center gap-1 mb-3 text-sm sm:text-base text-gray-600">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium">{product.rating.toFixed(1)}</span>
                        {product.reviewCount != null && product.reviewCount > 0 && (
                          <span className="text-gray-400">({product.reviewCount})</span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base font-medium py-3 px-4 sm:py-3.5 rounded-lg transition-colors mt-auto"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/products" className="inline-flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors">
              View all products
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section - Modern Design */}
      <section className="py-12 sm:py-16 bg-linear-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">Why Customers Trust Us</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Premium Quality</h3>
              <p className="text-xs sm:text-sm text-gray-600">Carefully selected ingredients.</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Free Delivery</h3>
              <p className="text-xs sm:text-sm text-gray-600">Zero delivery charges on all orders</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Secure Checkout</h3>
              <p className="text-xs sm:text-sm text-gray-600">Encrypted & safe transactions</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Customer Support</h3>
              <p className="text-xs sm:text-sm text-gray-600">Your questions answered with care</p>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
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
