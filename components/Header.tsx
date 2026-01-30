'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  // Fetch cart count
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
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            STN Products
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-gray-900">
              Shop All
            </Link>
            <Link href="/products" className="text-gray-700 hover:text-gray-900">
              Products
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/cart" className="text-gray-700 hover:text-gray-900 relative">
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-gray-900">
                  Profile
                </Link>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" className="text-gray-700 hover:text-gray-900">
                    Admin
                  </Link>
                )}
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
