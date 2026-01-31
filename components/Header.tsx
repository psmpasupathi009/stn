'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/context'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Search,
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
  { href: '/track-order', label: 'Track Order' },
]

const SHOP_LINKS = [
  { href: '/collections/wood-pressed-oils', label: 'Wood Pressed Oils' },
  { href: '/collections/healthy-mixes', label: 'Healthy Mixes' },
  { href: '/collections/idly-podi', label: 'Idly Podi Varieties' },
  { href: '/collections/home-made-masala', label: 'Home Made Masala' },
  { href: '/collections/kovilpatti-special', label: 'Kovilpatti Special' },
  { href: '/collections/flour-kali-mixes', label: 'Flour & Kali Mixes' },
  { href: '/collections/natural-sweeteners', label: 'Natural Sweeteners' },
  { href: '/collections/essential-millets', label: 'Essential Millets' },
  { href: '/collections/explorer-pack', label: 'Explorer Pack' },
]

export default function Header() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showShopDropdown, setShowShopDropdown] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`)
    else router.push('/products')
    setSearchOpen(false)
    setSearchQuery('')
  }

  const openSearch = () => {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

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
    } else {
      setCartCount(0)
    }
  }, [isAuthenticated, refreshCartCount])

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
          {/* Left: Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <div
              className="relative"
              onMouseEnter={() => setShowShopDropdown(true)}
              onMouseLeave={() => setShowShopDropdown(false)}
            >
              <button
                type="button"
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-50 transition-colors"
              >
                Shop All
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showShopDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              {showShopDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-2 z-50">
                  {SHOP_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/products"
                    className="block px-4 py-2.5 text-sm font-medium text-neutral-900 border-t border-neutral-100 mt-1 pt-2"
                  >
                    Shop All Products
                  </Link>
                </div>
              )}
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-50 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2.5 rounded-full text-neutral-600 hover:bg-neutral-100"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            <Menu size={24} strokeWidth={2} />
          </button>

          {/* Logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center lg:relative lg:left-0 lg:translate-x-0"
          >
            <img
              src="/STN LOGO.png"
              alt="STN Golden Healthy Foods"
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          {/* Right: Search (inline in navbar), Profile, Cart */}
          <div className="flex items-center gap-0.5 flex-1 min-w-0 lg:flex-initial lg:min-w-0 justify-end lg:max-w-[320px]">
            {/* Desktop: always-visible search input in navbar */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 min-w-0 max-w-[200px] items-center gap-1.5 rounded-full bg-neutral-100 border border-transparent focus-within:bg-white focus-within:border-neutral-300 focus-within:ring-2 focus-within:ring-neutral-200 pl-3 pr-2 py-1.5 transition-all"
            >
              <Search size={18} className="text-neutral-400 shrink-0" strokeWidth={2} />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 min-w-0 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                aria-label="Search products"
              />
            </form>
            {/* Mobile: search icon opens inline search */}
            {!searchOpen ? (
              <button
                type="button"
                onClick={openSearch}
                className={`lg:hidden ${iconButtonClass}`}
                aria-label="Search"
              >
                <Search size={ICON_SIZE} strokeWidth={2} />
              </button>
            ) : (
              <form
                onSubmit={handleSearch}
                className="lg:hidden flex flex-1 min-w-0 items-center gap-1 rounded-full bg-neutral-100 border border-neutral-200 pl-3 pr-2 py-1.5"
              >
                <Search size={18} className="text-neutral-400 shrink-0" strokeWidth={2} />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => setSearchOpen(false)}
                  placeholder="Search..."
                  className="flex-1 min-w-0 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                  aria-label="Search products"
                />
                <button type="submit" className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600" aria-label="Submit search">
                  <Search size={18} strokeWidth={2} />
                </button>
              </form>
            )}

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
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-600 rounded-full border-2 border-white"
                      title="Admin"
                    />
                  )}
                </Link>
                {user?.role?.toUpperCase() === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className="hidden sm:flex ml-0.5 p-2 rounded-full text-amber-700 hover:bg-amber-50"
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
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
            >
              <ShoppingCart size={ICON_SIZE} strokeWidth={2} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-xs font-semibold rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
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
                      className="px-3 py-2.5 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-lg flex items-center gap-2"
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
