'use client'

import Link from 'next/link'
import Marquee from 'react-fast-marquee'
import {
  Wheat,
  Droplets,
  UtensilsCrossed,
  ChefHat,
  Cookie,
  FlaskConical,
  Candy,
  Leaf,
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

// Solid green for all category icon backgrounds (#3CB31A = primary green)
const ICON_BG_GREEN = 'from-[#3CB31A] to-[#3CB31A]'

// Categories with proper Lucide icons
const categories = [
  {
    name: 'Healthy Mixes',
    icon: Wheat,
    slug: 'healthy-mixes',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Wood Pressed Oils',
    icon: Droplets,
    slug: 'wood-pressed-oils',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Idly Podi',
    icon: UtensilsCrossed,
    slug: 'idly-podi',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Home Made Masala',
    icon: ChefHat,
    slug: 'home-made-masala',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Kovilpatti Special',
    icon: Cookie,
    slug: 'kovilpatti-special',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Flour & Kali Mixes',
    icon: FlaskConical,
    slug: 'flour-kali-mixes',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Natural Sweeteners',
    icon: Candy,
    slug: 'natural-sweeteners',
    color: ICON_BG_GREEN,
  },
  {
    name: 'Essential Millets',
    icon: Leaf,
    slug: 'essential-millets',
    color: ICON_BG_GREEN,
  },
]

export default function CategoryMarquee() {
  return (
    <div
      className="category-marquee w-full min-w-0 overflow-hidden bg-white border-b border-neutral-200 py-2.5 sm:py-3 px-3 sm:px-4 md:px-6 max-w-7xl mx-auto"
      style={{ contain: 'layout' }}
    >
      <Marquee
        gradient={true}
        gradientColor="#ffffff"
        gradientWidth={40}
        speed={30}
        pauseOnHover={true}
        className="!overflow-hidden w-full"
        style={{ overflow: 'hidden' }}
      >
        <div className="flex items-end gap-3 sm:gap-5 md:gap-6 lg:gap-8 shrink-0">
          {categories.map((category) => {
            const categoryParam = categoryMapping[category.slug] ?? category.slug
            const href = category.href ?? (categoryParam ? `/home/products?category=${encodeURIComponent(categoryParam)}` : '/home/products')
            const IconComponent = category.icon
            return (
              <Link
                key={category.name}
                href={href}
                className="flex flex-col items-center shrink-0 min-w-[52px] w-[52px] sm:min-w-[64px] sm:w-[64px] md:min-w-[72px] md:w-[72px] lg:min-w-[80px] lg:w-[80px] group touch-manipulation"
              >
                {/* Fixed-height row so all icons sit on same baseline */}
                <div className="flex flex-col items-center flex-none">
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-11 lg:h-11 ${
                      category.dashed
                        ? 'border-2 border-dashed border-[#3CB31A] bg-[#3CB31A]/20'
                        : `bg-linear-to-br ${category.color} shadow-md`
                    }`}
                  >
                    <IconComponent
                      className={`shrink-0 w-4 h-4 sm:w-[18px] sm:h-[18px] md:w-5 md:h-5 lg:w-[22px] lg:h-[22px] ${
                        category.dashed ? 'text-amber-600' : 'text-white'
                      }`}
                      strokeWidth={2}
                    />
                  </div>
                </div>
                {/* Fixed min-height label area so all items align; text top-aligned in box */}
                <div className="min-h-[2.25rem] sm:min-h-[2.5rem] flex items-start justify-center pt-1 sm:pt-1.5 w-full">
                  <span
                    className={`text-[9px] sm:text-[10px] md:text-xs font-medium text-center leading-tight transition-colors line-clamp-2 w-full px-0.5 max-w-[72px] ${
                      category.dashed
                        ? 'text-neutral-600 group-hover:text-neutral-900'
                        : 'text-gray-700 group-hover:text-neutral-900'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </Marquee>
    </div>
  )
}
