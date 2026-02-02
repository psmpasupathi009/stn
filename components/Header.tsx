'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState, useEffect, useCallback } from 'react'
import {
  User,
  ShoppingCart,
  Menu,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'

const ICON_SIZE = 22
const NAV_LINKS = [
  { href: '/our-story', label: 'Our Story' },
  { href: '/contact', label: 'Contact' },
  { href: '/orders', label: 'My Orders' },
  { href: '/track-order', label: 'Track Order' },
]

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showShopDropdown, setShowShopDropdown] = useState(false)

  const refreshCartCount = useCallback(() => {
    if (!isAuthenticated) return
    fetch('/api/cart', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data?.items) {
          const total = data.items.reduce((s: number, i: { quantity?: number }) => s + (i.quantity || 1), 0)
          setCartCount(total)
        } else if (data?.error) setCartCount(0)
      })
      .catch(() => setCartCount(0))
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      refreshCartCount()
    }
  }, [isAuthenticated, refreshCartCount])

  const displayCartCount = isAuthenticated ? cartCount : 0

  useEffect(() => {
    const handler = () => refreshCartCount()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [refreshCartCount])

  const iconButtonClass =
    'p-2.5 rounded-full text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-1'

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-17">
          {/* Left: Menu icon with dropdown */}
          <div className="flex items-center gap-3">
            <div
              className="relative"
              onMouseEnter={() => setShowShopDropdown(true)}
              onMouseLeave={() => setShowShopDropdown(false)}
            >
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-50 transition-colors"
                aria-label="Menu"
              >
                <Menu size={20} strokeWidth={2} />
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showShopDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {showShopDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Company Name */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
          >
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#3CB31A' }}>
              STN Golden Healthy Foods
            </h1>
          </Link>

          {/* Right: Profile, Cart */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <div className="relative flex items-center">
                <Link
                  href="/profile"
                  className={iconButtonClass}
                  aria-label="Profile"
                >
                  <User size={ICON_SIZE} strokeWidth={2} />
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: '#3CB31A' }}
                      title="Admin"
                    />
                  )}
                </Link>
                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden sm:flex ml-0.5 p-2 rounded-full hover:bg-green-50"
                    style={{ color: '#3CB31A' }}
                    aria-label="Admin dashboard"
                  >
                    <LayoutDashboard size={ICON_SIZE} strokeWidth={2} />
                  </Link>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className={iconButtonClass}
                aria-label="Log in"
              >
                <User size={ICON_SIZE} strokeWidth={2} />
              </Link>
            )}

            <Link
              href="/cart"
              className={`${iconButtonClass} relative`}
              aria-label={`Cart${displayCartCount > 0 ? `, ${displayCartCount} items` : ''}`}
            >
              <ShoppingCart size={ICON_SIZE} strokeWidth={2} />
              {displayCartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                  {displayCartCount > 99 ? '99+' : displayCartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="lg:hidden border-t border-neutral-200 py-4">
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/products"
                className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Shop All
              </Link>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    href="/profile"
                    className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-2"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User size={18} /> Profile
                  </Link>
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-3 py-2.5 text-sm font-medium hover:bg-green-50 rounded-lg flex items-center gap-2"
                      style={{ color: '#3CB31A' }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <LayoutDashboard size={18} /> Admin Dashboard
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setShowMobileMenu(false)
                    }}
                    className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 rounded-lg flex items-center gap-2 text-left w-full"
                  >
                    <LogOut size={18} /> Logout
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
