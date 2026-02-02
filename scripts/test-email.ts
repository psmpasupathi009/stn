/**
 * Test Email Configuration
 * 
 * This script tests your email configuration by attempting to send a test email.
 * Run with: npx tsx scripts/test-email.ts
 */

import nodemailer from 'nodemailer'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env' })

function getTransporter() {
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER
  let emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
  const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'
  const emailSecure = process.env.EMAIL_SECURE || process.env.SMTP_SECURE || 'false'

  if (!emailUser || !emailPass) {
    console.error('❌ Email credentials not found!')
    console.error('')
    console.error('Please set in your .env file:')
    console.error('  EMAIL_USER=your-email@gmail.com')
    console.error('  EMAIL_PASS=your-app-password')
    console.error('')
    console.error('Or use SMTP_* variables:')
    console.error('  SMTP_USER=your-email@gmail.com')
    console.error('  SMTP_PASS=your-app-password')
    return null
  }

  // Remove spaces from App Password if present
  if (emailPass) {
    emailPass = emailPass.replace(/\s+/g, '')
  }

  console.log('📧 Email Configuration:')
  console.log(`   User: ${emailUser}`)
  console.log(`   Host: ${emailHost}`)
  console.log(`   Port: ${emailPort}`)
  console.log(`   Secure: ${emailSecure}`)
  console.log(`   Password: ${emailPass ? '***' + emailPass.slice(-4) : 'NOT SET'}`)
  console.log('')

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort),
    secure: emailSecure === 'true',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
}

async function testEmail() {
  console.log('='.repeat(60))
  console.log('🧪 Testing Email Configuration')
  console.log('='.repeat(60))
  console.log('')

  const transporter = getTransporter()
  if (!transporter) {
    process.exit(1)
  }

  const testEmail = process.env.EMAIL_USER || process.env.SMTP_USER || 'test@example.com'
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@stn.com'

  console.log('📤 Attempting to send test email...')
  console.log(`   From: ${fromEmail}`)
  console.log(`   To: ${testEmail}`)
  console.log('')

  try {
    // First, verify the connection
    await transporter.verify()
    console.log('✅ SMTP connection verified!')
    console.log('')

    // Send test email
    const result = await transporter.sendMail({
      from: `"STN Golden Healthy Foods" <${fromEmail}>`,
      to: testEmail,
      subject: 'Test Email - STN Golden Healthy Foods',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1f2937;">✅ Email Configuration Test</h2>
          <p style="color: #4b5563;">
            If you received this email, your email configuration is working correctly!
          </p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This is a test email from STN Golden Healthy Foods.
          </p>
        </div>
      `,
      text: 'If you received this email, your email configuration is working correctly!',
    })

    console.log('✅ Test email sent successfully!')
    console.log(`   Message ID: ${result.messageId}`)
    console.log('')
    console.log('='.repeat(60))
    console.log('🎉 Email configuration is working correctly!')
    console.log('='.repeat(60))
  } catch (error: unknown) {
    console.error('❌ Failed to send test email!')
    console.error('')
    console.error('Error:', error.message)
    console.error('')

    if (error.code === 'EAUTH' || error.responseCode === 535) {
      console.error('⚠️  GMAIL AUTHENTICATION ERROR')
      console.error('='.repeat(60))
      console.error('Gmail requires an App Password, not your regular password.')
      console.error('')
      console.error('To fix this:')
      console.error('1. Go to: https://myaccount.google.com/security')
      console.error('2. Enable 2-Step Verification (if not already enabled)')
      console.error('3. Go to: https://myaccount.google.com/apppasswords')
      console.error('4. Generate an App Password for "Mail"')
      console.error('5. Copy the 16-character App Password (it may have spaces)')
      console.error('6. Add it to your .env file:')
      console.error('')
      console.error('   EMAIL_USER=your-email@gmail.com')
      console.error('   EMAIL_PASS=xxxx xxxx xxxx xxxx')
      console.error('')
      console.error('   Note: Spaces in the App Password are automatically removed.')
      console.error('='.repeat(60))
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      console.error('⚠️  CONNECTION ERROR')
      console.error('='.repeat(60))
      console.error('Could not connect to the email server.')
      console.error('Please check:')
      console.error('1. Your internet connection')
      console.error('2. EMAIL_HOST and EMAIL_PORT settings')
      console.error('3. Firewall settings')
      console.error('='.repeat(60))
    } else {
      console.error('Error details:', {
        code: error.code,
        command: error.command,
        response: error.response,
        responseCode: error.responseCode,
      })
    }

    process.exit(1)
  }
}

testEmail()
