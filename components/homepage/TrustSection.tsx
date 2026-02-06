'use client'

import { Gem, Truck, Lock, MessageCircle, Globe } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const TRUST_ITEMS: { title: string; description: string; icon: LucideIcon; iconClass: string; boxClass: string; colClass?: string }[] = [
  { title: 'Premium Quality', description: 'Carefully selected ingredients.', icon: Gem, iconClass: 'text-neutral-600', boxClass: 'bg-neutral-100' },
  { title: 'Free Delivery', description: 'Zero delivery charges on all orders', icon: Truck, iconClass: 'text-amber-600', boxClass: 'bg-linear-to-br from-amber-100 to-orange-100' },
  { title: 'Secure Checkout', description: 'Encrypted & safe transactions', icon: Lock, iconClass: 'text-blue-600', boxClass: 'bg-linear-to-br from-blue-100 to-indigo-100' },
  { title: 'Customer Support', description: 'Your questions answered with care', icon: MessageCircle, iconClass: 'text-purple-600', boxClass: 'bg-linear-to-br from-purple-100 to-pink-100' },
  { title: 'Pan-India Shipping', description: 'Reachable. Reliable. Nationwide.', icon: Globe, iconClass: 'text-neutral-600', boxClass: 'bg-neutral-100', colClass: 'col-span-2 md:col-span-1' },
]

const CARD_CLASS = 'bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow'
const ICON_WRAP_CLASS = 'w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center'
const ICON_SIZE_CLASS = 'w-6 h-6 sm:w-7 sm:h-7'

export default function TrustSection() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
          Why Customers Trust Us
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
          {TRUST_ITEMS.map(({ title, description, icon: Icon, iconClass, boxClass, colClass }) => (
            <div key={title} className={`${CARD_CLASS} ${colClass ?? ''}`}>
              <div className={`${ICON_WRAP_CLASS} ${boxClass}`}>
                <Icon className={`${ICON_SIZE_CLASS} ${iconClass}`} />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
