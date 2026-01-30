import { prisma } from '../lib/prisma'
import { hashPassword } from '../lib/auth'

async function main() {
  const args = process.argv.slice(2)
  
  if (args.length < 2) {
    console.error('Usage: tsx scripts/create-admin.ts <email> <password>')
    console.error('Note: The email must match ADMIN_EMAIL in your .env file')
    process.exit(1)
  }

  const [email, password] = args

  try {
    const hashedPassword = await hashPassword(password)

    // Create or update user with admin role
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      },
      create: {
        email,
        password: hashedPassword,
        role: 'admin',
        isVerified: true,
      },
    })

    console.log(`✓ Admin user created/updated: ${email}`)
    console.log(`  User ID: ${user.id}`)
    console.log(`  Role: ${user.role}`)
    console.log(`\n⚠️  Make sure ADMIN_EMAIL=${email} is set in your .env file`)
  } catch (error) {
    console.error('Error creating admin:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
