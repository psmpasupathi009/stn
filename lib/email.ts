import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

let cachedTransporter: Transporter | null = null
let gmailHintLogged = false

function getTransporter(): Transporter | null {
  if (cachedTransporter) return cachedTransporter

  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  let pass = process.env.EMAIL_PASS || process.env.SMTP_PASS
  const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'
  const secure = process.env.EMAIL_SECURE || process.env.SMTP_SECURE || 'false'

  if (!user || !pass) {
    if (!gmailHintLogged) {
      console.warn('⚠️ Email not configured: set EMAIL_USER and EMAIL_PASS (or SMTP_*) in .env. OTP will log to console.')
      gmailHintLogged = true
    }
    return null
  }

  pass = pass.replace(/\s+/g, '')

  cachedTransporter = nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: secure === 'true',
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })

  return cachedTransporter
}

function logAuthHint(): void {
  if (gmailHintLogged) return
  gmailHintLogged = true
  console.warn('⚠️ Gmail: use an App Password (not account password). See https://support.google.com/mail/answer/185833 → set EMAIL_PASS in .env')
}

function logFallbackOTP(to: string, otp: string, label: string): void {
  console.warn(`📧 ${label} | To: ${to} | OTP: ${otp}`)
}

export interface SendResult {
  messageId: string
  accepted?: string[]
}

const FALLBACK_IDS = ['console', 'console-fallback'] as const
export function wasEmailSent(result: SendResult): boolean {
  return Boolean(result.messageId && !FALLBACK_IDS.includes(result.messageId as (typeof FALLBACK_IDS)[number]))
}

const FROM = () =>
  process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@stn.com'

export async function sendOTP(email: string, otp: string): Promise<SendResult> {
  const to = normalizeEmail(email)
  if (!isValidEmail(to)) throw new Error('Invalid email format')

  const transporter = getTransporter()
  if (!transporter) {
    logFallbackOTP(to, otp, 'OTP (email not configured)')
    return { messageId: 'console' }
  }

  const mailOptions = {
    from: `"STN Golden Healthy Foods" <${FROM()}>`,
    to,
    subject: 'OTP for Login Verification - STN Golden Healthy Foods',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">OTP Verification</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Your OTP for login to STN Golden Healthy Foods is:</p>
          <div style="background-color: #ffffff; border: 2px solid #d97706; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <strong style="font-size: 32px; color: #d97706; letter-spacing: 4px;">${otp}</strong>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">This OTP will expire in 10 minutes.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
    text: `Your OTP for login to STN Golden Healthy Foods is: ${otp}. This OTP will expire in 10 minutes.`,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    return { messageId: result.messageId ?? 'sent', accepted: result.accepted }
  } catch (err) {
    const error = err as { code?: string; responseCode?: number; message?: string }
    const isAuth = error.code === 'EAUTH' || error.responseCode === 535
    if (isAuth) logAuthHint()
    logFallbackOTP(to, otp, 'OTP (send failed)')
    return { messageId: 'console-fallback', accepted: [to] }
  }
}

export async function sendPasswordReset(email: string, resetToken: string): Promise<SendResult> {
  const to = normalizeEmail(email)
  if (!isValidEmail(to)) throw new Error('Invalid email format')

  const transporter = getTransporter()
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`

  if (!transporter) {
    console.warn(`📧 Password reset (email not configured) | To: ${to} | URL: ${resetUrl}`)
    return { messageId: 'console' }
  }

  const mailOptions = {
    from: `"STN Golden Healthy Foods" <${FROM()}>`,
    to,
    subject: 'Password Reset Request - STN Golden Healthy Foods',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #d97706; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Or copy: ${resetUrl}</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>
      </div>
    `,
    text: `Reset your password: ${resetUrl}. Link expires in 1 hour.`,
  }

  try {
    const result = await transporter.sendMail(mailOptions)
    return { messageId: result.messageId ?? 'sent', accepted: result.accepted }
  } catch (err) {
    const error = err as { code?: string; responseCode?: number }
    if (error.code === 'EAUTH' || error.responseCode === 535) logAuthHint()
    console.warn(`📧 Password reset (send failed) | To: ${to} | URL: ${resetUrl}`)
    return { messageId: 'console-fallback', accepted: [to] }
  }
}
