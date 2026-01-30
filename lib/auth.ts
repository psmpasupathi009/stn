import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// Support both JWT_SECRET and AUTH_SECRET for flexibility
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function isAdminEmail(email: string): Promise<boolean> {
  // Check if email matches ADMIN_EMAIL from .env
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
    return true
  }
  
  // Also check if user exists with admin role
  const user = await prisma.user.findUnique({
    where: { email },
    select: { role: true },
  })
  
  return user?.role === 'admin'
}
