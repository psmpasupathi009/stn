import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const password = process.argv[3]

  if (!email || !password) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password>')
    process.exit(1)
  }

  try {
    const hashedPassword = await hashPassword(password)

    // Create admin in Admin table
    await prisma.admin.upsert({
      where: { email },
      update: {
        password: hashedPassword,
      },
      create: {
        email,
        password: hashedPassword,
      },
    })

    console.log(`✓ Admin created/updated: ${email}`)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
