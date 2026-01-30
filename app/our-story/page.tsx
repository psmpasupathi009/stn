'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function OurStoryPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-16 md:py-24">
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

            <div className="bg-amber-50 border-l-4 border-amber-900 p-6 mb-12">
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

            <div className="bg-gray-50 p-8 rounded-lg mb-12">
              <p className="text-xl md:text-2xl font-semibold text-gray-900 text-center mb-4">
                At STN GOLDEN HEALTHY FOODS, we believe food is not just fuel—it's a foundation for
                a healthier life.
              </p>
              <p className="text-lg text-gray-700 text-center">
                Our mission is to revive traditional oil-making practices while delivering reliable,
                high-quality products to homes, retailers, and businesses across the market.
              </p>
            </div>

            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-amber-900 mb-8">
                Pure. Honest. Naturally Cold-Pressed.
              </p>
              <Link href="/products">
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
