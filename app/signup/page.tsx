'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/context'
import Link from 'next/link'

export default function SignupPage() {
  const [step, setStep] = useState<'email' | 'otp' | 'password' | 'details'>('email')
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!formData.email) {
      setError('Email is required')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('OTP sent to your email!')
        setStep('otp')
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
        body: JSON.stringify({ email: formData.email, otp }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess('OTP verified successfully!')
        setStep('details')
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Validation
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters')
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
      // Set password
      const passwordRes = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email, 
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        }),
      })

      const passwordData = await passwordRes.json()

      if (passwordRes.ok) {
        login(passwordData.user, passwordData.token)
        setSuccess('Account created successfully!')
        setTimeout(() => {
          if (passwordData.user.role === 'admin') {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
        }, 1000)
      } else {
        setError(passwordData.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your email to get started'}
            {step === 'otp' && 'Verify your email with OTP'}
            {step === 'details' && 'Complete your profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              {success}
            </div>
          )}

          {step === 'email' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
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
              <div>
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="mt-1 text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-2">
                  OTP sent to {formData.email}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('email')
                  setOtp('')
                  setError('')
                }}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter your phone number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  placeholder="Enter password (min 6 characters)"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  placeholder="Confirm your password"
                  className="mt-1"
                />
                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || formData.password !== formData.confirmPassword}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep('otp')
                  setFormData({ ...formData, password: '', confirmPassword: '', name: '', phone: '' })
                }}
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
