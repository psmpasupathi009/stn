'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Maximize2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { AboutSection } from '@/lib/types'
import { getDefaultAboutSectionsWithIds } from '@/lib/about-sections'

interface GalleryItem {
  id: string
  url: string
  type: string
  caption?: string
  order: number
}

export default function OurStoryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [viewItem, setViewItem] = useState<GalleryItem | null>(null)
  const [aboutSections, setAboutSections] = useState<AboutSection[]>(getDefaultAboutSectionsWithIds())

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setGallery(Array.isArray(data) ? data : []))
      .catch(() => setGallery([]))
  }, [])

  useEffect(() => {
    fetch('/api/about-sections')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAboutSections(data)
      })
      .catch(() => {})
  }, [])

  const currentIndex = viewItem ? gallery.findIndex((i) => i.id === viewItem.id) : -1
  const hasPrev = gallery.length > 1 && currentIndex > 0
  const hasNext = gallery.length > 1 && currentIndex >= 0 && currentIndex < gallery.length - 1

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasPrev) return
    const prevIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1
    setViewItem(gallery[prevIndex])
  }

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasNext) return
    const nextIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1
    setViewItem(gallery[nextIndex])
  }

  useEffect(() => {
    if (!viewItem || gallery.length === 0) return
    const idx = gallery.findIndex((i) => i.id === viewItem.id)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewItem(null)
      if (e.key === 'ArrowLeft') setViewItem(gallery[idx === 0 ? gallery.length - 1 : idx - 1])
      if (e.key === 'ArrowRight') setViewItem(gallery[idx === gallery.length - 1 ? 0 : idx + 1])
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [viewItem, gallery])

  return (
    <div className="bg-white min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-8 sm:py-12 md:py-16 lg:py-20 max-w-7xl">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-10 sm:mb-14 text-center">
          Our Story
        </h1>

        {/* 3 alternating image + content sections */}
        <div className="space-y-12 sm:space-y-16 md:space-y-20 lg:space-y-24 mb-14 sm:mb-16">
          {aboutSections.map((section) => (
            <section
              key={section.id}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center max-w-6xl mx-auto"
            >
              {/* Text block: mobile order alternates (2nd, 1st, 2nd); lg: left or right by imageLeft */}
              <div
                className={`flex flex-col justify-center ${
                  section.imageLeft ? 'order-1 lg:order-2' : 'order-2 lg:order-1'
                }`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-5">
                  {section.title}
                </h2>
                <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                  {section.content}
                </p>
              </div>
              {/* Image block */}
              <div
                className={`relative w-full aspect-[4/3] sm:aspect-[3/2] max-h-[320px] sm:max-h-[380px] md:max-h-[420px] rounded-2xl overflow-hidden bg-neutral-100 ${
                  section.imageLeft ? 'order-2 lg:order-1' : 'order-1 lg:order-2'
                }`}
              >
                {section.image ? (
                  <Image
                    src={section.image}
                    alt={section.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Gallery Section - unchanged */}
            {gallery.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {gallery.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setViewItem(item)}
                      className="group relative w-full rounded-xl overflow-hidden bg-gray-100 aspect-square sm:aspect-[4/3] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      {item.type === 'video' ? (
                        <>
                          <video
                            src={item.url}
                            className="w-full h-full object-cover pointer-events-none"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <span className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                              <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <Image
                            src={item.url}
                            alt={item.caption || 'Gallery'}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            unoptimized
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="w-10 h-10 text-white drop-shadow-lg" />
                          </div>
                        </>
                      )}
                      {item.caption && (
                        <p className="absolute bottom-0 left-0 right-0 p-3 text-sm text-white bg-gradient-to-t from-black/70 to-transparent text-left line-clamp-2">
                          {item.caption}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lightbox / Full-screen viewer */}
            {viewItem && (
              <div
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-6 md:p-8"
                onClick={() => setViewItem(null)}
                role="dialog"
                aria-modal="true"
                aria-label="View media"
              >
                <button
                  type="button"
                  onClick={() => setViewItem(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                  aria-label="Close"
                >
                  <X className="w-6 h-6 sm:w-8 sm:h-8" />
                </button>

                {/* Left / Previous */}
                {gallery.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                )}

                {/* Right / Next */}
                {gallery.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
                  </button>
                )}

                <div
                  className="relative w-full max-w-4xl max-h-[90vh] flex flex-col items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {viewItem.type === 'video' ? (
                    <video
                      src={viewItem.url}
                      controls
                      autoPlay
                      className="w-full max-h-[80vh] rounded-lg"
                      playsInline
                    />
                  ) : (
                    <div className="relative w-full max-h-[85vh]">
                      <Image
                        src={viewItem.url}
                        alt={viewItem.caption || 'Gallery'}
                        width={1200}
                        height={800}
                        className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
                        unoptimized
                      />
                    </div>
                  )}
                  {viewItem.caption && (
                    <p className="mt-4 text-white text-center text-sm sm:text-base max-w-2xl">
                      {viewItem.caption}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-gray-50 p-8 rounded-lg mb-12">
              <p className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
                At STN GOLDEN HEALTHY FOODS, we believe food is not just fuel—it&apos;s a foundation for
                a healthier life.
              </p>
              <p className="text-lg text-gray-700 text-center">
                Our mission is to revive traditional oil-making practices while delivering reliable,
                high-quality products to homes, retailers, and businesses across the market.
              </p>
            </div>

            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-neutral-800 mb-8">
                Pure. Honest. Naturally Cold-Pressed.
              </p>
              <Link href="/home/products">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800 px-8 py-6 text-lg">
                  Explore Our Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  )
}
