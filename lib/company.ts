/**
 * Company details – single source for address, phone, email across the site.
 */

export const COMPANY = {
  name: 'STN GOLDEN HEALTHY FOODS',
  email: 'info@stngoldenhealthyfoods.com',
  /** Primary phone numbers (with country code for tel: links) */
  phones: ['+91 80568 20603', '+91 80722 89011'] as const,
  /** Raw numbers for display without spaces */
  phoneNumbers: ['8056820603', '8072289011'] as const,
  /**
   * Registered / business address
   */
  address: `4/1430, Sivan Kovil 2nd Street,
Sankar Nagar,
New Appaneri - Kovilpatti
628502
Tamil Nadu, India`,
  /** Single-line address for inline text (e.g. Terms) */
  addressInline: '4/1430, Sivan Kovil 2nd Street, Sankar Nagar, New Appaneri - Kovilpatti, 628502, Tamil Nadu, India',
  /** Facebook page */
  facebookUrl: 'https://www.facebook.com/share/1BjANsRQoH/',
  /** Instagram profile */
  instagramUrl: 'https://www.instagram.com/stngoldenhealthyfoods?igsh=MmZsaWl2dGtoZWpj',
  /** YouTube channel */
  youtubeUrl: 'https://youtube.com/@stngoldenkvp-2023?si=aoA7JQ3T-gooUF9o',
} as const

export const COMPANY_PHONE_PRIMARY = COMPANY.phones[0]
export const COMPANY_PHONE_TEL = `tel:${COMPANY.phoneNumbers[0].replace(/\s/g, '')}`

/** Razorpay payment provider details for invoice / compliance (as per invoice.pdf) */
export const RAZORPAY_PROVIDER = {
  registeredName: 'Razorpay Payments Private Limited',
  CIN: 'U62099KA2024PTC188982',
  PAN: 'AANCR6717K',
  TAN: 'BLRR30567F',
  GST: '29AANCR6717K1ZN',
} as const
