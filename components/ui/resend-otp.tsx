'use client'

import { useState, useEffect, useCallback } from 'react'

const COOLDOWN_SECONDS = 60

interface ResendOTPProps {
  onResend: () => Promise<boolean>
  cooldownSeconds?: number
  className?: string
}

export function ResendOTP({ onResend, cooldownSeconds = COOLDOWN_SECONDS, className = '' }: ResendOTPProps) {
  const [secondsLeft, setSecondsLeft] = useState(cooldownSeconds)
  const [resending, setResending] = useState(false)

  const resetCooldown = useCallback(() => {
    setSecondsLeft(cooldownSeconds)
  }, [cooldownSeconds])

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [secondsLeft])

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) return
    setResending(true)
    try {
      const ok = await onResend()
      if (ok) {
        resetCooldown()
      }
    } finally {
      setResending(false)
    }
  }

  const canResend = secondsLeft <= 0 && !resending

  return (
    <p className={`text-center text-sm text-gray-600 ${className}`}>
      {canResend ? (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-blue-600 hover:text-blue-700 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded transition-colors"
        >
          {resending ? 'Sending...' : 'Resend OTP'}
        </button>
      ) : (
        <span>
          Resend OTP in{' '}
          <span className="font-medium tabular-nums">{Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}</span>
        </span>
      )}
    </p>
  )
}
