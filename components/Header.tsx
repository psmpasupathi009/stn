'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { useState, useEffect, useRef } from 'react'
import { useCartStore, useCartCount } from '@/lib/stores/cart-store'
import {
  User,
  ShoppingBasket,
  ShoppingCart,
  Menu,
  LayoutDashboard,
  X,
  LogOut,
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
] as const

const NAV_LINK_CLASS =
  'px-5 py-3.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 hover:text-neutral-900 transition-colors border-b border-neutral-100 uppercase tracking-wide'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const cartCount = useCartCount()
  const fetchCart = useCartStore((s) => s.fetchCart)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [profileOpen])

  useEffect(() => {
    if (isAuthenticated) fetchCart()
  }, [isAuthenticated, fetchCart])

  useEffect(() => {
    const handler = () => fetchCart()
    window.addEventListener('cart-updated', handler)
    return () => window.removeEventListener('cart-updated', handler)
  }, [fetchCart])

  const displayCartCount = isAuthenticated ? cartCount : 0

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
                    <Link href="/home/login" className={NAV_LINK_CLASS} onClick={() => setMenuOpen(false)}>
                      Login
                    </Link>
                  )}
                  <Link href="/home/products" className={NAV_LINK_CLASS} onClick={() => setMenuOpen(false)}>
                    Shop All
                  </Link>
                  {NAV_LINKS.map((link) => (
                    <Link key={link.href} href={link.href} className={NAV_LINK_CLASS} onClick={() => setMenuOpen(false)}>
                      {link.label}
                    </Link>
                  ))}
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <Link href="/admin/dashboard" className={NAV_LINK_CLASS} onClick={() => setMenuOpen(false)}>
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

          {/* Right: Profile dropdown, Admin, My Orders (bag), Cart */}
          <div className="flex items-center gap-1">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProfileOpen((o) => !o)
                  }}
                  className={`${iconButtonClass} relative`}
                  aria-label="Profile"
                  aria-expanded={profileOpen}
                  aria-haspopup="true"
                  title="Profile"
                >
                  <User size={ICON_SIZE} strokeWidth={2} />
                  {user?.role?.toUpperCase() === 'ADMIN' && (
                    <span
                      className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-white"
                      aria-hidden
                    />
                  )}
                </button>
                {profileOpen && user && (
                  <div
                    className="absolute right-0 top-full mt-2 w-[min(calc(100vw-2rem),320px)] sm:w-80 rounded-xl border border-[var(--primary-green)]/20 bg-white shadow-xl z-[100] overflow-hidden"
                    role="menu"
                  >
                    {/* Account block - white card */}
                    <div className="px-4 py-3 border-b border-neutral-100 bg-white">
                      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Account
                      </p>
                      <p className="text-sm sm:text-base font-medium text-neutral-900 truncate" title={user.email}>
                        {user.email}
                      </p>
                      <p className="text-xs sm:text-sm text-neutral-600 truncate mt-0.5">{user.name || '—'}</p>
                    </div>
                    {/* Actions - green theme buttons */}
                    <div className="p-2 sm:p-3 space-y-1">
                      {user.role?.toUpperCase() === 'ADMIN' && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-3 w-full px-3 py-2.5 sm:py-3 rounded-lg text-sm font-medium text-[var(--primary-green)] bg-[var(--primary-green)]/10 hover:bg-[var(--primary-green)]/20 border border-[var(--primary-green)]/30 transition-colors"
                          onClick={() => setProfileOpen(false)}
                          role="menuitem"
                        >
                          <LayoutDashboard size={18} strokeWidth={2} className="shrink-0" />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        href="/home/orders"
                        className="flex items-center gap-3 w-full px-3 py-2.5 sm:py-3 rounded-lg text-sm font-medium text-white bg-[var(--primary-green)] hover:opacity-90 transition-opacity"
                        onClick={() => setProfileOpen(false)}
                        role="menuitem"
                      >
                        <ShoppingBasket size={18} strokeWidth={2} className="shrink-0" />
                        My Orders
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-3 w-full px-3 py-2.5 sm:py-3 rounded-lg text-sm font-medium text-neutral-600 bg-neutral-100 hover:bg-neutral-200 border border-neutral-200 transition-colors"
                        onClick={() => {
                          setProfileOpen(false)
                          logout()
                        }}
                        role="menuitem"
                      >
                        <LogOut size={18} strokeWidth={2} className="shrink-0" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
