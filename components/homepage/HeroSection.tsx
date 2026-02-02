'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wheat,
  Droplets,
  Cookie,
  Flame,
  ChefHat,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react'
import type { HeroSlide } from './types'

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

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([])
  const [isPlaying, setIsPlaying] = useState(true)
  const [heroImageErrors, setHeroImageErrors] = useState<Set<number>>(new Set())

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
    if (heroCount <= 1 || !isPlaying) return
    const id = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroCount), 5000)
    return () => clearInterval(id)
  }, [heroCount, isPlaying])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroCount)
  }, [heroCount])

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroCount) % heroCount)
  }, [heroCount])

  if (heroCount === 0) return null

  // Ensure hero button links always point to valid app routes (avoid 404)
  const getHeroButtonHref = (link: string | undefined): string => {
    const raw = (link || '').trim()
    if (!raw || raw === '/' || raw === '/products') return '/home/products'
    if (raw.startsWith('/home')) return raw
    // Paths like /home/collections/oils are valid; others without /home may 404
    if (raw.startsWith('/')) return `/home${raw}` // e.g. /products -> /home/products
    return '/home/products'
  }

  return (
    <section className="w-full bg-white py-4 sm:py-5 md:py-6">
      <div className="container mx-auto px-4 w-full min-w-0 max-w-7xl">
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
                <div className="absolute bottom-6 sm:bottom-8 md:bottom-10 lg:bottom-12 left-0 right-0 flex justify-center z-20 px-2">
                  <Link href={getHeroButtonHref(slide.buttonLink)} className="touch-manipulation">
                    <button type="button" className="bg-[var(--primary-green)] hover:opacity-90 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-3.5 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200 rounded-md min-h-[44px]">
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
  )
}
