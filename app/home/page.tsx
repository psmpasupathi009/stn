'use client'

import CategoryMarquee from '@/components/CategoryMarquee'
import HeroSection from '@/components/homepage/HeroSection'
import ProductsByCategory from '@/components/homepage/ProductsByCategory'
import TrustSection from '@/components/homepage/TrustSection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <CategoryMarquee />
      <ProductsByCategory />
      <TrustSection />
    </div>
  )
}
