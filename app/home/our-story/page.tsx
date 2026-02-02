'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { X, Maximize2 } from 'lucide-react'

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

  useEffect(() => {
    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setGallery(Array.isArray(data) ? data : []))
      .catch(() => setGallery([]))
  }, [])

  useEffect(() => {
    if (!viewItem) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewItem(null)
    }
    document.addEventListener('keydown', onEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onEscape)
      document.body.style.overflow = ''
    }
  }, [viewItem])

  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto w-full max-w-full min-w-0 px-3 sm:px-4 md:px-6 py-10 sm:py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-12 text-center">
            Our Story
          </h1>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8 text-gray-700 leading-relaxed">
              <p className="text-lg mb-6">
                We are two brothers hailing from small town called kovilpatti in the southern part of tamilnadu.
                Basically we are from middleclass family our elder brother who having small petty shop in our
                home town, from that resources we were started this cold pressed oil firm on of 2023.
              </p>
              <p className="text-lg mb-6">
                The initial two years were an absolute challenge, once our customers come to knew about our
                product quality and its goodness and then gradually our sales increased. Now we are selling 25
                plus products along with wood pressed oil.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-700 p-6 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Our Vision and Mission
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                With 21st Century witnessing ever-growing awareness on eating healthy, businesses are
                catching up to changing needs of the world. Oil forms a major component of our daily
                health. So we concentrate on to give our traditional oil to people same as our ancients
                used in their time.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                At <strong>STN GOLDEN HEALTHY FOODS</strong>, we are dedicated to producing pure, natural, and
                traditionally extracted wood-pressed oils that preserve the true goodness of nature. Rooted in
                age-old extraction methods and supported by modern quality standards, our oils are crafted to
                deliver authentic taste, nutrition, and wellness.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Why Wood Pressed Oil?
              </h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                We source premium-grade seeds directly from trusted farmers and carefully process them using
                wooden cold-press techniques without heat or chemicals. This ensures that essential nutrients,
                natural aroma, and original flavor remain intact—just as nature intended.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                Quality and purity are at the heart of everything we do. From sourcing to extraction, filtration,
                and packaging, every step follows strict hygiene and quality controls. Our oils are free from
                additives, preservatives, and artificial processing, making them ideal for healthy cooking,
                traditional wellness, and everyday use.
              </p>
            </div>

            {/* Gallery Section */}
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
              <p className="text-2xl md:text-3xl font-bold text-green-700 mb-8">
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
    </div>
  )
}
