'use client'

import React, { createContext, useCallback, useContext, useState, useEffect } from 'react'

export interface AuthUser {
  id: string
  email: string
  name?: string | null
  phoneNumber?: string | null
  role: string
  isEmailVerified?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  signOut: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_ME_URL = '/api/auth/me'
const SIGN_OUT_URL = '/api/auth/signout'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const setUser = useCallback((userData: AuthUser | null) => {
    setUserState(userData)
  }, [])

  useEffect(() => {
    const ac = new AbortController()
    const fetchUser = async () => {
      try {
        const res = await fetch(AUTH_ME_URL, {
          cache: 'no-store',
          credentials: 'include',
          signal: ac.signal,
        })
        const data = await res.json()
        if (data?.user) setUserState(data.user)
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          console.error('Failed to fetch user:', err)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchUser()
    return () => ac.abort()
  }, [])

  const signOut = useCallback(async () => {
    try {
      await fetch(SIGN_OUT_URL, { method: 'POST', credentials: 'include' })
    } catch (err) {
      console.error('Failed to sign out:', err)
    } finally {
      setUserState(null)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
      }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        signOut,
        logout: signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
