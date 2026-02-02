'use client'

import { Gem, Truck, Lock, MessageCircle, Globe } from 'lucide-react'

export default function TrustSection() {
  return (
    <section className="py-12 sm:py-16 bg-linear-to-br from-gray-50 to-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12 text-gray-900">
          Why Customers Trust Us
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-center">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Premium Quality</h3>
            <p className="text-xs sm:text-sm text-gray-600">Carefully selected ingredients.</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Free Delivery</h3>
            <p className="text-xs sm:text-sm text-gray-600">Zero delivery charges on all orders</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Secure Checkout</h3>
            <p className="text-xs sm:text-sm text-gray-600">Encrypted & safe transactions</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Customer Support</h3>
            <p className="text-xs sm:text-sm text-gray-600">Your questions answered with care</p>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow col-span-2 md:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 text-gray-800">Pan-India Shipping</h3>
            <p className="text-xs sm:text-sm text-gray-600">Reachable. Reliable. Nationwide.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
