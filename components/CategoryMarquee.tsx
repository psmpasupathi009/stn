'use client'

import Link from 'next/link'
import Marquee from 'react-fast-marquee'
import {
  Wheat,
  Droplets,
  Flame,
  ChefHat,
  Cookie,
  FlaskConical,
  Candy,
  Leaf,
  Package,
} from 'lucide-react'

// Map category slugs to actual category names (for backward compatibility)
export const categoryMapping: Record<string, string> = {
  'healthy-mixes': 'HEALTHY  MIXES',
  'wood-pressed-oils': 'VAGAI WOOD PERSSED OIL / COLD PRESSED OIL',
  'idly-podi': 'IDLY PODI VARIETIES',
  'home-made-masala': 'HOME MADE MASALA',
  'kovilpatti-special': 'KOVILPATTI SPECIAL',
  'flour-kali-mixes': 'HEALTHY FLOUR & KALI MIXES',
  'natural-sweeteners': 'NATURAL SWEETNERS',
  'explorer-pack': 'Explorer pack / Trail pack',
  'essential-millets': 'Essential Millets',
  'all': '',
}

// Categories with proper Lucide icons
const categories = [
  {
    name: 'Healthy Mixes',
    icon: Wheat,
    slug: 'healthy-mixes',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Wood Pressed Oils',
    icon: Droplets,
    slug: 'wood-pressed-oils',
    color: 'from-yellow-500 to-amber-500',
  },
  {
    name: 'Idly Podi',
    icon: Flame,
    slug: 'idly-podi',
    color: 'from-red-500 to-orange-500',
  },
  {
    name: 'Home Made Masala',
    icon: ChefHat,
    slug: 'home-made-masala',
    color: 'from-orange-500 to-red-500',
  },
  {
    name: 'Kovilpatti Special',
    icon: Cookie,
    slug: 'kovilpatti-special',
    color: 'from-green-600 to-yellow-600',
  },
  {
    name: 'Flour & Kali Mixes',
    icon: FlaskConical,
    slug: 'flour-kali-mixes',
    color: 'from-stone-500 to-green-600',
  },
  {
    name: 'Natural Sweeteners',
    icon: Candy,
    slug: 'natural-sweeteners',
    color: 'from-yellow-400 to-amber-500',
  },
  {
    name: 'Essential Millets',
    icon: Leaf,
    slug: 'essential-millets',
    color: 'from-green-500 to-green-600',
  },
  {
    name: 'Shop All',
    icon: Package,
    slug: 'all',
    href: '/products',
    dashed: true,
    color: 'from-gray-400 to-gray-500',
  },
]

export default function CategoryMarquee() {
  return (
    <div className="bg-linear-to-r from-green-50 via-white to-green-50 border-b border-green-100 py-2.5 sm:py-3 overflow-hidden">
      <Marquee
        gradient={true}
        gradientColor="#fffbeb"
        gradientWidth={30}
        speed={35}
        pauseOnHover={true}
        className="overflow-hidden"
      >
        {categories.map((category) => {
          // Link to products page with category filter (same category names as API/sidebar)
          const categoryParam = categoryMapping[category.slug] ?? category.slug
          const href = category.href ?? (categoryParam ? `/products?category=${encodeURIComponent(categoryParam)}` : '/products')
          const IconComponent = category.icon
          return (
            <Link
              key={category.name}
              href={href}
              className="flex flex-col items-center mx-3 sm:mx-4 md:mx-5 group"
            >
              <div
                className={`w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${
                  category.dashed
                    ? 'border-2 border-dashed border-green-400 bg-green-50'
                    : `bg-linear-to-br ${category.color} shadow-md`
                }`}
              >
                <IconComponent
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 ${
                    category.dashed ? 'text-amber-600' : 'text-white'
                  }`}
                  strokeWidth={2}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium text-center mt-1.5 max-w-[60px] sm:max-w-[65px] leading-tight transition-colors ${
                  category.dashed
                    ? 'text-green-600 group-hover:text-green-700'
                    : 'text-gray-700 group-hover:text-green-800'
                }`}
              >
                {category.name}
              </span>
            </Link>
          )
        })}
      </Marquee>
    </div>
  )
}
