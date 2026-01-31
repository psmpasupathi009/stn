'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/lib/context'
import { PasswordInput } from '@/components/ui/password-input'
import { ResendOTP } from '@/components/ui/resend-otp'
import { InputOTP } from '@/components/ui/input-otp'
import Link from 'next/link'

type Step = 'email' | 'otp' | 'password'

interface FormData {
  email: string
  name: string
  phoneNumber: string
  password: string
  confirmPassword: string
}

function SignupForm() {
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('email')
  const [formData, setFormData] = useState<FormData>({
    email: searchParams.get('email') || '',
    name: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Step 1: Send signup request (email + name)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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

    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name is required and must be at least 2 characters')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
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

  const handleResendOTP = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtp('') // Clear old OTP - new code was sent
        setSuccess('New OTP sent to your email! Please enter the new code.')
        setError('')
        return true
      }
      setError(data.error || 'Failed to resend OTP')
      return false
    } catch {
      setError('Network error. Please try again.')
      return false
    }
  }

  // Step 2: Verify OTP
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
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          code: otp,
          type: 'SIGNUP',
        }),
      })

      const data = await res.json()

      if (res.ok && data.verified) {
        setSuccess('OTP verified! Please create your password.')
        setStep('password')
      } else {
        setError(data.error || 'Invalid or expired OTP')
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 3: Create account with password
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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
      const res = await fetch('/api/auth/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          name: formData.name.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.user) {
        // Cookie is set by server, just update user state
        setUser(data.user)
        setSuccess('Account created successfully! Redirecting...')
        
        setTimeout(() => {
          if (data.user.role === 'ADMIN') {
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

  const handleBack = () => {
    setError('')
    setSuccess('')
    if (step === 'otp') {
      setStep('email')
      setOtp('')
    } else if (step === 'password') {
      setStep('otp')
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
    }
  }

  const passwordsMatch = formData.password === formData.confirmPassword
  const isPasswordValid = formData.password.length >= 6

  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col items-center justify-center overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:max-w-sm md:max-w-md sm:gap-5 md:gap-6">
        <Link
          href="/"
          className="flex min-w-0 max-w-full items-center justify-center gap-2 self-center font-semibold text-gray-900 transition-colors hover:text-amber-800 text-sm sm:text-base md:text-lg"
        >
          <img src="/STN LOGO.png" alt="STN" className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8 md:h-9 md:w-9" />
          <span className="truncate">STN Golden Healthy Foods</span>
        </Link>
        <div className="w-full min-w-0">
        <Card className="rounded-xl">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your details to get started'}
            {step === 'otp' && 'Verify your email with OTP'}
            {step === 'password' && 'Create your password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {step === 'email' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="your.email@example.com"
                  className="mt-1"
                  autoComplete="email"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter your full name"
                  className="mt-1"
                  autoComplete="name"
                />
                {formData.name && formData.name.trim().length < 2 && (
                  <p className="text-xs text-red-500">Name must be at least 2 characters</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="Enter your phone number (optional)"
                  className="mt-1"
                  autoComplete="tel"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !formData.email.trim() || formData.name.trim().length < 2}
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
                <Label>Enter 6-Digit OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="mt-1 justify-center"
                />
                <p className="text-xs text-gray-500 text-center break-all">
                  OTP sent to {formData.email}
                </p>
                <ResendOTP onResend={handleResendOTP} className="mt-1" />
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
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <PasswordInput
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
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
                <PasswordInput
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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
      </div>
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
