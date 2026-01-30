import nodemailer from 'nodemailer'

// Get transporter with proper fallback to SMTP_* variables
const getTransporter = () => {
  // Priority: EMAIL_* first, then SMTP_* as fallback
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS
  const emailHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || 'smtp.gmail.com'
  const emailPort = process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'
  const emailSecure = process.env.EMAIL_SECURE || process.env.SMTP_SECURE || 'false'
  
  if (!emailUser || !emailPass) {
    console.log('⚠️  Email credentials not found. Using EMAIL_USER/EMAIL_PASS or SMTP_USER/SMTP_PASS')
    return null
  }

  console.log(`📧 Configuring email transporter: ${emailUser} @ ${emailHost}:${emailPort}`)

  return nodemailer.createTransport({
    host: emailHost,
    port: parseInt(emailPort),
    secure: emailSecure === 'true',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    // Add connection timeout and better error handling
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  })
}

export async function sendOTP(email: string, otp: string) {
  const transporter = getTransporter()
  
  // If no email credentials, log OTP to console (development mode)
  if (!transporter) {
    console.log('='.repeat(50))
    console.log('📧 OTP EMAIL (Email not configured)')
    console.log('='.repeat(50))
    console.log(`To: ${email}`)
    console.log(`Subject: OTP for Login Verification`)
    console.log(`OTP: ${otp}`)
    console.log('='.repeat(50))
    console.log('⚠️  Configure EMAIL_USER and EMAIL_PASS (or SMTP_USER and SMTP_PASS) in .env')
    console.log('='.repeat(50))
    return Promise.resolve({ messageId: 'console-log' })
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@stn.com'

  const mailOptions = {
    from: `"STN Golden Healthy Foods" <${fromEmail}>`,
    to: email,
    subject: 'OTP for Login Verification - STN Golden Healthy Foods',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px; text-align: center;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">OTP Verification</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Your OTP for login to STN Golden Healthy Foods is:
          </p>
          <div style="background-color: #ffffff; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <strong style="font-size: 32px; color: #10b981; letter-spacing: 4px;">${otp}</strong>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            This OTP will expire in 10 minutes.
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            If you didn't request this OTP, please ignore this email.
          </p>
        </div>
      </div>
    `,
    // Plain text version as fallback
    text: `Your OTP for login to STN Golden Healthy Foods is: ${otp}. This OTP will expire in 10 minutes.`,
  }

  try {
    console.log(`📧 Sending OTP email to: ${email}`)
    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ OTP email sent successfully to: ${email}`, result.messageId)
    return result
  } catch (error: any) {
    console.error('❌ Email send error:', error)
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    })
    
    // Log OTP to console as fallback
    console.log('='.repeat(50))
    console.log('📧 OTP FALLBACK (Email failed)')
    console.log(`To: ${email}`)
    console.log(`OTP: ${otp}`)
    console.log('='.repeat(50))
    
    // Don't throw error - let the API handle it gracefully
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }
}

export async function sendPasswordReset(email: string, resetToken: string) {
  const transporter = getTransporter()
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
  
  // If no email credentials, log reset link to console (development mode)
  if (!transporter) {
    console.log('='.repeat(50))
    console.log('📧 PASSWORD RESET EMAIL (Email not configured)')
    console.log('='.repeat(50))
    console.log(`To: ${email}`)
    console.log(`Subject: Password Reset Request`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('='.repeat(50))
    console.log('⚠️  Configure EMAIL_USER and EMAIL_PASS (or SMTP_USER and SMTP_PASS) in .env')
    console.log('='.repeat(50))
    return Promise.resolve({ messageId: 'console-log' })
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || process.env.SMTP_USER || 'noreply@stn.com'

  const mailOptions = {
    from: `"STN Golden Healthy Foods" <${fromEmail}>`,
    to: email,
    subject: 'Password Reset Request - STN Golden Healthy Foods',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f9fafb; border-radius: 8px; padding: 30px;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #4b5563; font-size: 16px; margin-bottom: 20px;">
            Click the button below to reset your password for STN Golden Healthy Foods:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Or copy and paste this URL in your browser:
          </p>
          <p style="color: #9ca3af; font-size: 12px; word-break: break-all; background-color: #ffffff; padding: 10px; border-radius: 4px; margin: 10px 0;">
            ${resetUrl}
          </p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      </div>
    `,
    text: `Click this link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
  }

  try {
    console.log(`📧 Sending password reset email to: ${email}`)
    const result = await transporter.sendMail(mailOptions)
    console.log(`✅ Password reset email sent successfully to: ${email}`, result.messageId)
    return result
  } catch (error: any) {
    console.error('❌ Email send error:', error)
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
    })
    
    // Log reset link to console as fallback
    console.log('='.repeat(50))
    console.log('📧 PASSWORD RESET FALLBACK (Email failed)')
    console.log(`To: ${email}`)
    console.log(`Reset URL: ${resetUrl}`)
    console.log('='.repeat(50))
    
    throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`)
  }
}
