'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState, useEffect, useCallback } from 'react'
import {
  User,
  ShoppingBasket,
  ShoppingCart,
  Menu,
  LayoutDashboard,
  X,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet'

const ICON_SIZE = 22
const NAV_LINKS = [
  { href: '/home/our-story', label: 'Our Story' },
  { href: '/home/contact', label: 'Contact' },
  { href: '/home/orders', label: 'My Orders' },
  { href: '/home/track-order', label: 'Track Order' },
]

export default function Header() {
  const { user, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

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
    'p-2.5 rounded-full text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[var(--primary-green)]'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[var(--primary-green)] border-b border-white/10 shadow-md">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-17">
          {/* Left: Menu / Close menu toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 rounded-md transition-colors uppercase tracking-wide"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <>
                  <X size={20} strokeWidth={2} />
                  <span className="hidden sm:inline">Close menu</span>
                </>
              ) : (
                <>
                  <Menu size={20} strokeWidth={2} />
                  <span className="hidden sm:inline">Menu</span>
                </>
              )}
            </button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetContent side="left" className="w-[280px] sm:w-[340px] p-0 flex flex-col bg-neutral-50 border-neutral-200 shadow-2xl">
                <SheetHeader className="p-4 border-b border-neutral-200 flex flex-row items-center justify-between space-y-0">
                  <SheetTitle className="text-base font-semibold uppercase tracking-wide text-neutral-900">
                    Menu
                  </SheetTitle>
                  <SheetClose asChild>
                    <button
                      type="button"
                      className="p-2 rounded-full hover:bg-neutral-200 transition-colors"
                      aria-label="Close menu"
                    >
                      <X size={20} strokeWidth={2} />
                    </button>
                  </SheetClose>
                </SheetHeader>
                <nav className="flex flex-col py-4 flex-1 overflow-y-auto">
                  {!isAuthenticated && (
                    <Link
                      href="/home/login"
                      className="px-5 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 transition-colors border-b border-neutral-100 uppercase tracking-wide"
                      onClick={() => setMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                  <Link
                    href="/home/products"
                    className="px-5 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 transition-colors border-b border-neutral-100 uppercase tracking-wide"
                    onClick={() => setMenuOpen(false)}
                  >
                    Shop All
                  </Link>
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-5 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 transition-colors border-b border-neutral-100 uppercase tracking-wide"
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <Link
                      href="/admin/dashboard"
                      className="px-5 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 transition-colors border-b border-neutral-100 uppercase tracking-wide"
                      onClick={() => setMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Center: Company Name only */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            title="STN GOLDEN HEALTHY FOODS"
          >
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white whitespace-nowrap">
              <span className="sm:hidden">STN</span>
              <span className="hidden sm:inline">STN GOLDEN HEALTHY FOODS</span>
            </h1>
          </Link>

          {/* Right: Profile, Admin, My Orders (bag), Cart */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <Link
                href="/home/profile"
                className={`${iconButtonClass} relative`}
                aria-label="Profile"
                title="Profile"
              >
                <User size={ICON_SIZE} strokeWidth={2} />
                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-white"
                    aria-hidden
                  />
                )}
              </Link>
            ) : (
              <Link
                href="/home/login"
                className={iconButtonClass}
                aria-label="Log in"
                title="Log in"
              >
                <User size={ICON_SIZE} strokeWidth={2} />
              </Link>
            )}
            {user?.role?.toUpperCase() === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex ml-0.5 p-2 rounded-full hover:bg-white/20 text-white"
                aria-label="Admin Dashboard"
                title="Admin Dashboard"
              >
                <LayoutDashboard size={ICON_SIZE} strokeWidth={2} />
              </Link>
            )}
            <Link
              href="/home/orders"
              className={iconButtonClass}
              aria-label="My Orders"
              title="My Orders"
            >
              <ShoppingBasket size={ICON_SIZE} strokeWidth={2} />
            </Link>
            <Link
              href="/home/cart"
              className={`${iconButtonClass} relative`}
              aria-label={displayCartCount > 0 ? `Cart (${displayCartCount} items)` : 'Cart'}
              title="Cart"
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
      </div>
    </header>
  )
}
