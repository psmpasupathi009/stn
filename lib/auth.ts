import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Check if email matches ADMIN_EMAIL from .env
 */
export async function isAdminEmail(email: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
    return true
  }
  
  // Also check if user exists with admin role
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { role: true },
  })
  
  return user?.role === 'ADMIN'
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
}

/**
 * Create a new user, or complete signup if user exists without password
 */
export async function createUser(data: {
  email: string
  password: string
  name?: string
  phoneNumber?: string
  role?: string
}) {
  const email = data.email.toLowerCase()
  const hashedPassword = await hashPassword(data.password)
  const isAdmin = await isAdminEmail(data.email)
  const role = isAdmin ? 'ADMIN' : (data.role || 'USER')

  const existing = await prisma.user.findUnique({
    where: { email },
  })

  if (existing) {
    if (existing.password) {
      throw new Error('Account already exists')
    }
    return prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        name: data.name ?? existing.name,
        phoneNumber: data.phoneNumber ?? existing.phoneNumber,
        isEmailVerified: true,
      },
    })
  }

  return prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: data.name,
      phoneNumber: data.phoneNumber,
      role,
      isEmailVerified: true,
    },
  })
}

/**
 * Update user password
 */
export async function updateUserPassword(email: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)
  
  return prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { password: hashedPassword },
  })
}
