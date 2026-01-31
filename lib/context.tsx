'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name?: string | null
  phoneNumber?: string | null
  role: string
  isEmailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  signOut: () => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, fetch current user from session cookie
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
          credentials: 'include',
        })
        const data = await res.json()
        if (data.user) {
          setUserState(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [])

  const setUser = (userData: User | null) => {
    setUserState(userData)
  }

  const signOut = async () => {
    try {
      // Call signout API to clear cookie
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Failed to sign out:', error)
    } finally {
      // Clear user state and any local storage
      setUserState(null)
      if (typeof window !== 'undefined') {
        // Clear any remaining localStorage items
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('cart')
      }
    }
  }

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
