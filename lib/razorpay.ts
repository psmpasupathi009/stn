import Razorpay from 'razorpay'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export interface RazorpayOrderOptions {
  amount: number // in paise
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export async function createRazorpayOrder(options: RazorpayOrderOptions) {
  return await razorpay.orders.create(options)
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
  const crypto = require('crypto')
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
  hmac.update(razorpay_order_id + '|' + razorpay_payment_id)
  const generated_signature = hmac.digest('hex')
  return generated_signature === razorpay_signature
}
