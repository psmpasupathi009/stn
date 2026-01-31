'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const { setUser } = useAuth()

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
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
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
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

  // Proceed to password step without consuming OTP - verification happens on reset submit
  const handleContinueToPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }
    setSuccess('Enter your new password below.')
    setStep('password')
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(),
          password,
          code: otp,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success && data.user) {
        // Cookie is set by server, just update user state
        setUser(data.user)
        setSuccess('Password reset successfully! Redirecting...')
        setTimeout(() => {
          if (data.user.role === 'ADMIN') {
            router.push('/admin/dashboard')
          } else {
            router.push('/')
          }
        }, 1000)
      } else {
        setError(data.error || 'Failed to reset password. Please try again.')
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
      setPassword('')
      setConfirmPassword('')
    }
  }

  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col items-center justify-center overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:max-w-sm md:max-w-md sm:gap-5 md:gap-6">
        <Link
          href="/"
          className="flex min-w-0 max-w-full items-center justify-center gap-2 self-center font-semibold text-gray-900 transition-colors hover:text-green-800 text-sm sm:text-base md:text-lg"
        >
          <img src="/STN LOGO.png" alt="STN" className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8 md:h-9 md:w-9" />
          <span className="truncate">STN Golden Healthy Foods</span>
        </Link>
        <div className="w-full min-w-0">
        <Card className="rounded-xl">
        <CardHeader className="space-y-1 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-center">
            {step === 'email' && 'Reset Password'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'password' && 'Set New Password'}
          </CardTitle>
          <CardDescription className="text-center">
            {step === 'email' && 'Enter your email to receive an OTP'}
            {step === 'otp' && (
              <>
                We sent a 6-digit code to <span className="break-all font-medium">{email}</span>
              </>
            )}
            {step === 'password' && 'Enter your new password'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
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
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
              <p className="text-sm text-center text-gray-600">
                Remember your password?{' '}
                <Link href="/login" className="text-blue-600 hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleContinueToPassword} className="space-y-4">
              <div className="space-y-2">
                <Label>Enter 6-Digit OTP</Label>
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  className="mt-1 justify-center"
                />
                <p className="text-xs text-gray-500 text-center">
                  Check your email for the verification code
                </p>
                <ResendOTP onResend={handleResendOTP} className="mt-1" />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={otp.length !== 6}
              >
                Continue
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleBack}
              >
                Back
              </Button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  className="mt-1"
                  autoComplete="new-password"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  className="mt-1"
                  autoComplete="new-password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-500">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading || !password || password !== confirmPassword}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
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
