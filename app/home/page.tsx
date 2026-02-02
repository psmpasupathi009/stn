'use client'

import CategoryMarquee from '@/components/CategoryMarquee'
import HeroSection from './components/HeroSection'
import ProductsByCategory from './components/ProductsByCategory'
import TrustSection from './components/TrustSection'

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
