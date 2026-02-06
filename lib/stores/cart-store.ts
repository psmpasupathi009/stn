'use client'

import { create } from 'zustand'
import type { Cart, CartItem } from '@/lib/types'

/** Cart state: items from API, loading flag, and fetch/set actions. */
type CartState = {
  cart: Cart | null
  loading: boolean
  fetchCart: () => Promise<void>
  setCart: (cart: Cart | null) => void
}

function countFromCart(cart: Cart | null): number {
  if (!cart?.items?.length) return 0
  return cart.items.reduce((sum, i) => sum + (i.quantity || 0), 0)
}

const CART_API = '/api/cart'

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  loading: false,

  setCart: (cart) => set({ cart }),

  fetchCart: async () => {
    set({ loading: true })
    try {
      const res = await fetch(CART_API, { credentials: 'include' })
      if (!res.ok) {
        set({ cart: null, loading: false })
        return
      }
      const data = await res.json()
      const cart: Cart | null =
        data?.items != null
          ? { id: data.id ?? '', items: data.items as CartItem[] }
          : null
      set({ cart, loading: false })
    } catch {
      set({ cart: null, loading: false })
    }
  },
}))

/** Selector for cart item count; use instead of full cart when only count is needed. */
export function useCartCount(): number {
  const cart = useCartStore((s) => s.cart)
  return countFromCart(cart)
}
