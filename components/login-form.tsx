'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PasswordInput } from '@/components/ui/password-input'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (res.ok && data.user) {
        setUser(data.user)
        if (data.user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/home')
        }
      } else {
        setError(data.error || 'Invalid email or password')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-5 md:gap-6">
      <div className="flex flex-col gap-1.5 sm:gap-2 text-center">
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">Sign in</h1>
        <p className="text-xs text-gray-500 sm:text-sm">
          Enter your email and password to access your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="text-xs sm:text-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSignIn} className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            autoFocus
            required
            className="h-10 sm:h-11 md:h-12 text-base sm:text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <div className="flex flex-wrap items-center justify-between gap-1">
            <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
            <Link
              href="/home/forgot-password"
              className="text-xs text-gray-500 hover:text-gray-900 hover:underline underline-offset-4 sm:text-sm shrink-0"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            className="h-10 sm:h-11 md:h-12 text-base sm:text-sm"
          />
        </div>
        <Button
          type="submit"
          className="h-10 w-full sm:h-11 md:h-12 text-sm sm:text-base"
          disabled={loading || !email.trim() || !password}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-500 sm:text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/home/signup"
          className="font-medium text-gray-900 hover:underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
