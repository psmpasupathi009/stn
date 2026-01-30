'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/context'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'password'

interface ApiResponse {
  success?: boolean
  error?: string
  isAdmin?: boolean
  user?: {
    id: string
    email: string
    name?: string
    role: string
    password?: boolean
  }
  token?: string
}

export default function LoginPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  // Email validation
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Reset form state
  const resetForm = useCallback(() => {
    setError('')
    setSuccess('')
    setOtp('')
    setPassword('')
  }, [])

  // Handle OTP send
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetForm()

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

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data: ApiResponse = await res.json()

      if (res.ok && data.success) {
        setIsAdmin(data.isAdmin || false)
        setSuccess('OTP sent to your email! Please check your inbox.')
        setStep('otp')
      } else {
        setError(data.error || 'Failed to send OTP. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      })

      const data: ApiResponse = await res.json()

      if (res.ok && data.success) {
        // Check if user has password set
        if (data.user?.password === false || !data.token) {
          // User doesn't have password, redirect to signup
          setError('Please complete your account setup. Redirecting to signup...')
          setTimeout(() => {
            router.push(`/signup?email=${encodeURIComponent(email)}`)
          }, 2000)
        } else if (data.token && data.user) {
          // User has password and token, login directly
          login(data.user, data.token)
          setSuccess('Login successful! Redirecting...')
          setTimeout(() => {
            if (data.user?.role === 'admin') {
              router.push('/admin/dashboard')
            } else {
              router.push('/')
            }
          }, 500)
        } else {
          // User has password but needs to enter it
          setStep('password')
          setSuccess('OTP verified! Please enter your password')
        }
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      })

      const data: ApiResponse = await res.json()

      if (res.ok && data.token && data.user) {
        login(data.user, data.token)
        setSuccess('Login successful! Redirecting...')
        setTimeout(() => {
          if (data.user?.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
        }, 500)
      } else {
        setError(data.error || 'Invalid password. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    resetForm()
    if (step === 'otp') {
      setStep('email')
    } else if (step === 'password') {
      setStep('otp')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {step === 'email' && 'Sign In'}
            {step === 'otp' && 'Verify Email'}
            {step === 'password' && 'Enter Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your email to receive an OTP'}
            {step === 'otp' && `We sent a 6-digit code to ${email}`}
            {step === 'password' && 'Enter your password to complete login'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="mt-1"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-Digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="000000"
                  maxLength={6}
                  className="mt-1 text-center text-2xl tracking-widest font-mono"
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your email for the verification code
                </p>
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="mt-1"
                  autoComplete="current-password"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !password}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <Link href="/forgot-password" className="text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={loading}
              >
                Back
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
