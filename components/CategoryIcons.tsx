'use client'

import Link from 'next/link'

const categories = [
  { name: 'Oils', icon: '🛢️', href: '/collections/oils' },
  { name: 'Ghee', icon: '🥛', href: '/collections/ghee' },
  { name: 'Snacks', icon: '🍪', href: '/collections/snacks' },
  { name: 'Skin & Hair', icon: '🧴', href: '/collections/skin-hair' },
  { name: 'Malt', icon: '🌾', href: '/collections/malt' },
  { name: 'Shop All', icon: '📦', href: '/products', dashed: true },
]

// Map to reference website categories
export const categoryMapping = {
  'Oils': 'VAGAI WOOD PERSSED OIL / COLD PRESSED OIL',
  'Ghee': 'Premium Ghee',
  'Snacks': 'KOVILPATTI SPECIAL',
  'Skin & Hair': 'Wellness & Care',
  'Malt': 'HEALTHY MIXES',
}

export default function CategoryIcons() {
  return (
    <div className="bg-white border-b py-6">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
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
              <span className={`text-xs md:text-sm font-medium ${
                category.dashed ? 'text-gray-600' : 'text-gray-900'
              }`}>
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
