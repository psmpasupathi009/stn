'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/context'
import { toast } from 'sonner'

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

const heroSlides = [
  {
    title: 'Authentic Wood Pressed Oils, Pure from Within.',
    description: 'Made with traditional wood-pressing — rich in flavor, clean in nature. Cold-pressed oils that preserve the true goodness of nature.',
    buttonText: 'Shop Wood Pressed Oils',
    buttonLink: '/collections/wood-pressed-oils',
    icon: '🛢️',
  },
  {
    title: 'Healthy Mixes & Malt for Daily Wellness.',
    description: 'Nutritious malt mixes and health powders crafted the traditional way — from beetroot malt to ABC malt, nourishing your family every day.',
    buttonText: 'Shop Healthy Mixes',
    buttonLink: '/collections/healthy-mixes',
    icon: '🌾',
  },
  {
    title: 'Kovilpatti Special - Authentic Regional Flavors.',
    description: 'Authentic regional specialties from Kovilpatti — unique flavors and traditional recipes that bring the taste of home to your kitchen.',
    buttonText: 'Shop Kovilpatti Special',
    buttonLink: '/collections/kovilpatti-special',
    icon: '🍪',
  },
  {
    title: 'Idly Podi Varieties - Traditional South Indian Spices.',
    description: 'Traditional South Indian spice powders to enhance your breakfast experience — authentic flavors that make every meal special.',
    buttonText: 'Shop Idly Podi',
    buttonLink: '/collections/idly-podi',
    icon: '🌶️',
  },
  {
    title: 'Home Made Masala - Freshly Ground Spices.',
    description: 'Freshly ground spices and masala blends made with traditional methods — bringing authentic flavors to your kitchen.',
    buttonText: 'Shop Masala',
    buttonLink: '/collections/home-made-masala',
    icon: '🧂',
  },
  {
    title: 'Essential Millets - Nutritious & Wholesome.',
    description: 'Nutritious millets for a healthy and balanced diet — traditional grains that have been nourishing families for generations.',
    buttonText: 'Shop Millets',
    buttonLink: '/collections/essential-millets',
    icon: '🌾',
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [healthyMixes, setHealthyMixes] = useState<Product[]>([])
  const [kovilpattiSpecial, setKovilpattiSpecial] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    // Auto-play carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchProducts = async () => {
    try {
      // Fetch wood pressed oils for featured section
      const oilsRes = await fetch('/api/products?category=' + encodeURIComponent('VAGAI WOOD PERSSED OIL / COLD PRESSED OIL'))
      const oilsData = await oilsRes.json()
      setFeaturedProducts(oilsData.slice(0, 8))
      
      // Fetch healthy mixes
      const mixesRes = await fetch('/api/products?category=' + encodeURIComponent('HEALTHY  MIXES'))
      const mixesData = await mixesRes.json()
      setHealthyMixes(mixesData.slice(0, 4))
      
      // Fetch Kovilpatti special
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

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
  }

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel Section */}
      <section className="relative bg-linear-to-br from-amber-50 via-orange-50 to-amber-100 py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Slides */}
            <div className="relative h-[500px] md:h-[600px]">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                >
                  <div className="grid md:grid-cols-2 gap-12 items-center h-full">
                    <div className="text-center md:text-left">
                      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        {slide.title}
                      </h1>
                      <p className="text-xl md:text-2xl text-gray-700 mb-8">
                        {slide.description}
                      </p>
                      <Link href={slide.buttonLink}>
                        <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                          {slide.buttonText}
                        </Button>
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="aspect-square bg-amber-200 rounded-lg overflow-hidden shadow-2xl">
                        <div className="w-full h-full flex items-center justify-center text-6xl md:text-8xl">
                          {slide.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/80 hover:bg-white rounded-full p-3 shadow-lg transition-all"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? 'w-8 bg-amber-900'
                      : 'w-2 bg-gray-400 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - Wood Pressed Oils */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Authentic Oils, Pure from Within.
            </h2>
            <p className="text-lg text-gray-600">
              Made with traditional wood-pressing — rich in flavor, clean in nature.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:opacity-90 transition-opacity">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-amber-900">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          ₹{product.mrp}
                        </span>
                      )}
                      {product.mrp > product.salePrice && (
                        <span className="bg-black text-white text-xs px-2 py-1">
                          Sale
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Add to cart
                    </button>
                    <p className="text-sm text-gray-500 mt-2">Sold out</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link href="/products">
              <span className="text-amber-900 font-semibold hover:underline">
                View all →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Healthy Mixes Section */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Healthy Mixes & Malt
            </h2>
            <p className="text-lg text-gray-600">
              Nutritious malt mixes and health powders for your daily wellness needs.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : healthyMixes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthyMixes.map((product) => (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:opacity-90 transition-opacity">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          🌾
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-amber-900">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.mrp}
                          </span>
                          <span className="bg-black text-white text-xs px-2 py-1">
                            Sale
                          </span>
                        </>
                      )}
                    </div>
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="text-center mt-8">
            <Link href="/collections/healthy-mixes">
              <span className="text-amber-900 font-semibold hover:underline">
                View all Healthy Mixes →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Kovilpatti Special Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kovilpatti Special
            </h2>
            <p className="text-lg text-gray-600">
              Authentic regional specialties from Kovilpatti — unique flavors and traditional recipes.
            </p>
          </div>
          {loading ? (
            <div className="text-center py-12">Loading products...</div>
          ) : kovilpattiSpecial.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kovilpattiSpecial.map((product) => (
                <div key={product.id} className="group">
                  <Link href={`/products/${product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 group-hover:opacity-90 transition-opacity">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          🍪
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="text-center">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-semibold text-lg mb-2 hover:text-amber-900">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">
                        ₹{product.salePrice}
                      </span>
                      {product.mrp > product.salePrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            ₹{product.mrp}
                          </span>
                          <span className="bg-black text-white text-xs px-2 py-1">
                            Sale
                          </span>
                        </>
                      )}
                    </div>
                    {product.rating && product.rating > 0 && (
                      <div className="flex items-center justify-center gap-1 mb-3">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-sm font-semibold">{product.rating.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                      </div>
                    )}
                    <button
                      onClick={() => addToCart(product.id)}
                      className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                    >
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          <div className="text-center mt-8">
            <Link href="/collections/kovilpatti-special">
              <span className="text-amber-900 font-semibold hover:underline">
                View all Kovilpatti Special →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Customers Trust Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-semibold mb-2">Premium Quality</h3>
              <p className="text-sm text-gray-600">Carefully selected ingredients.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🚚</div>
              <h3 className="font-semibold mb-2">Free Delivery</h3>
              <p className="text-sm text-gray-600">Zero delivery charges on all orders</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-semibold mb-2">Secure Checkout</h3>
              <p className="text-sm text-gray-600">Encrypted & safe transactions</p>
            </div>
            <div>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-sm text-gray-600">Your questions answered with care</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🇮🇳</div>
              <h3 className="font-semibold mb-2">Pan-India Shipping</h3>
              <p className="text-sm text-gray-600">Reachable. Reliable. Nationwide.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
