'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/context'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'password' | 'details'

interface FormData {
  email: string
  name: string
  phone: string
  password: string
  confirmPassword: string
}

interface ApiResponse {
  success?: boolean
  error?: string
  isAdmin?: boolean
  user?: {
    id: string
    email: string
    name?: string
    role: string
  }
  token?: string
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  // Pre-fill email from query params (if redirected from login)
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam && step === 'email') {
      setFormData(prev => ({ ...prev, email: emailParam }))
    }
  }, [searchParams, step])

  // Email validation
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Phone validation (optional, basic)
  const isValidPhone = (phone: string): boolean => {
    if (!phone) return true // Phone is optional
    return /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(phone)
  }

  // Reset form state
  const resetForm = useCallback(() => {
    setError('')
    setSuccess('')
    setOtp('')
  }, [])

  // Update form field
  const updateField = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Handle OTP send
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    resetForm()

    if (!formData.email.trim()) {
      setError('Email is required')
      setLoading(false)
      return
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
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
        body: JSON.stringify({ 
          email: formData.email.trim().toLowerCase(), 
          otp 
        }),
      })

      const data: ApiResponse = await res.json()

      if (res.ok && data.success) {
        setSuccess('OTP verified successfully!')
        // If admin, go directly to password step (skip name/phone)
        // If user, go to details step (name, phone, password)
        setStep(isAdmin ? 'password' : 'details')
      } else {
        setError(data.error || 'Invalid OTP. Please try again.')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle signup
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!isAdmin && (!formData.name || formData.name.trim().length < 2)) {
      setError('Name must be at least 2 characters')
      setLoading(false)
      return
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      setError('Please enter a valid phone number')
      setLoading(false)
      return
    }

    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password,
          name: isAdmin ? undefined : formData.name.trim(),
          phone: isAdmin ? undefined : formData.phone.trim() || undefined,
        }),
      })

      const data: ApiResponse = await res.json()

      if (res.ok && data.token && data.user) {
        login(data.user, data.token)
        setSuccess('Account created successfully! Redirecting...')
        setTimeout(() => {
          if (data.user?.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
        }, 1000)
      } else {
        setError(data.error || 'Failed to create account. Please try again.')
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
    } else if (step === 'password' || step === 'details') {
      setStep('otp')
    }
  }

  // Password match validation
  const passwordsMatch = formData.password === formData.confirmPassword
  const isPasswordValid = formData.password.length >= 6

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Verify your email with OTP'}
            {step === 'password' && isAdmin && 'Create your admin password'}
            {step === 'details' && !isAdmin && 'Complete your profile'}
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
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  className="mt-1"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.email.trim()}
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
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
                  OTP sent to {formData.email}
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

          {step === 'password' && isAdmin && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50 text-amber-800">
                <AlertDescription>
                  <strong>Admin Account:</strong> You're signing up as an administrator.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  placeholder="Enter password (min 6 characters)"
                  className="mt-1"
                  autoFocus
                />
                {formData.password && !isPasswordValid && (
                  <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="mt-1"
                />
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !passwordsMatch || !isPasswordValid}
              >
                {loading ? 'Creating Account...' : 'Create Admin Account'}
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

          {step === 'details' && !isAdmin && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  required
                  placeholder="Enter your full name"
                  className="mt-1"
                  autoFocus
                />
                {formData.name && formData.name.trim().length < 2 && (
                  <p className="text-xs text-red-500">Name must be at least 2 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="Enter your phone number (optional)"
                  className="mt-1"
                />
                {formData.phone && !isValidPhone(formData.phone) && (
                  <p className="text-xs text-red-500">Please enter a valid phone number</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => updateField('password', e.target.value)}
                  required
                  placeholder="Enter password (min 6 characters)"
                  className="mt-1"
                />
                {formData.password && !isPasswordValid && (
                  <p className="text-xs text-red-500">Password must be at least 6 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  required
                  placeholder="Confirm your password"
                  className="mt-1"
                />
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !passwordsMatch || !isPasswordValid || formData.name.trim().length < 2}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
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
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  )
}
