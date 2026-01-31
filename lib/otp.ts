import { prisma } from './prisma'
import { generateOTP } from './auth'

export type OTPType = 'SIGNUP' | 'FORGOT_PASSWORD'

/**
 * Create an OTP record
 */
export async function createOTP(
  email: string,
  type: OTPType,
  expiresInMinutes: number = 10
) {
  const code = generateOTP()
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  // Delete any existing OTPs for this email and type
  await prisma.otp.deleteMany({
    where: {
      email: email.toLowerCase(),
      type,
    },
  })

  // Create new OTP
  return prisma.otp.create({
    data: {
      email: email.toLowerCase(),
      code,
      type,
      expiresAt,
    },
  })
}

/**
 * Verify an OTP
 */
export async function verifyOTP(
  email: string,
  code: string,
  type: OTPType
): Promise<boolean> {
  const otp = await prisma.otp.findFirst({
    where: {
      email: email.toLowerCase(),
      code,
      type,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (!otp) {
    return false
  }

  // Delete the OTP after verification
  await prisma.otp.delete({
    where: { id: otp.id },
  })

  return true
}

/**
 * Delete expired OTPs (cleanup function)
 */
export async function deleteExpiredOTPs() {
  await prisma.otp.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  })
}
