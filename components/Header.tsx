'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setCartCount(data.items.length)
          }
        })
        .catch(() => {})
    }
  }, [isAuthenticated])

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Left Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link href="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Shop All
              <svg className="inline-block w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link href="/combos" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Combos
            </Link>
            <Link href="/our-story" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Our Story
            </Link>
            <Link href="/contact" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Contact
            </Link>
            <Link href="/track-order" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
              Track Order
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <Link href="/" className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              Aishwaryam Oils
            </h1>
          </Link>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Account/Login */}
            {isAuthenticated ? (
              <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full relative">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></Link>
                )}
              </Link>
            ) : (
              <Link href="/login" className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}

            {/* Cart */}
            <Link href="/cart" className="p-2 hover:bg-gray-100 rounded-full relative">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t py-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/products" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Shop All
              </Link>
              <Link href="/combos" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Combos
              </Link>
              <Link href="/our-story" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Our Story
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Contact
              </Link>
              <Link href="/track-order" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                Track Order
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/profile" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                    Profile
                  </Link>
                  {user?.role === 'admin' && (
                    <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="text-left text-gray-700 hover:text-gray-900 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
