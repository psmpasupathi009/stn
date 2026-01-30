'use client'

import Link from 'next/link'

// Categories from your product JSON
const categories = [
  { 
    name: 'Healthy Mixes', 
    icon: '🌾', 
    slug: 'healthy-mixes',
    category: 'HEALTHY  MIXES'
  },
  { 
    name: 'Wood Pressed Oils', 
    icon: '🛢️', 
    slug: 'wood-pressed-oils',
    category: 'VAGAI WOOD PERSSED OIL / COLD PRESSED OIL'
  },
  { 
    name: 'Idly Podi', 
    icon: '🌶️', 
    slug: 'idly-podi',
    category: 'IDLY PODI VARIETIES'
  },
  { 
    name: 'Home Made Masala', 
    icon: '🧂', 
    slug: 'home-made-masala',
    category: 'HOME MADE MASALA'
  },
  { 
    name: 'Kovilpatti Special', 
    icon: '🍪', 
    slug: 'kovilpatti-special',
    category: 'KOVILPATTI SPECIAL'
  },
  { 
    name: 'Flour & Kali Mixes', 
    icon: '🌾', 
    slug: 'flour-kali-mixes',
    category: 'HEALTHY FLOUR & KALI MIXES'
  },
  { 
    name: 'Natural Sweeteners', 
    icon: '🍯', 
    slug: 'natural-sweeteners',
    category: 'NATURAL SWEETNERS'
  },
  { 
    name: 'Essential Millets', 
    icon: '🌾', 
    slug: 'essential-millets',
    category: 'Essential Millets'
  },
  { 
    name: 'Shop All', 
    icon: '📦', 
    slug: 'all',
    href: '/products', 
    dashed: true 
  },
]

// Map category slugs to actual category names
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

export default function CategoryIcons() {
  return (
    <div className="bg-white border-b py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
          {categories.map((category) => {
            const href = category.href || `/collections/${category.slug}`
            return (
              <Link
                key={category.name}
                href={href}
                className={`flex flex-col items-center gap-2 group ${
                  category.dashed ? 'opacity-60' : ''
                }`}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-2xl md:text-3xl transition-transform group-hover:scale-110 ${
                    category.dashed
                      ? 'border-2 border-dashed border-gray-300 bg-gray-50'
                      : 'bg-amber-900 text-white'
                  }`}
                >
                  {category.icon}
                </div>
                <span className={`text-xs md:text-sm font-medium text-center max-w-[80px] ${
                  category.dashed ? 'text-gray-600' : 'text-gray-900'
                }`}>
                  {category.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
