import { COMPANY, RAZORPAY_PROVIDER } from '@/lib/company'

export type InvoiceOrder = {
  id: string
  createdAt: string
  subtotal: number | null
  gstAmount: number | null
  deliveryCharge: number | null
  totalAmount: number
  paymentId: string | null
  paymentStatus: string
  shippingAddress: string
  user: { name: string | null; email: string; phoneNumber: string | null }
  items: Array<{
    productName: string
    itemCode: string | null
    weight: string | null
    quantity: number
    price: number
    amount: number
  }>
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function amountToWords(n: number): string {
  const int = Math.floor(n)
  const dec = Math.round((n - int) * 100)
  if (int === 0 && dec === 0) return 'Zero only'
  function upTo99(x: number): string {
    if (x < 20) return ONES[x]
    return (TENS[Math.floor(x / 10)] + ' ' + ONES[x % 10]).trim()
  }
  function upTo999(x: number): string {
    if (x < 100) return upTo99(x)
    return ONES[Math.floor(x / 100)] + ' Hundred ' + upTo99(x % 100)
  }
  function upTo99999(x: number): string {
    if (x < 1000) return upTo999(x)
    const th = Math.floor(x / 1000)
    return upTo99(th) + ' Thousand ' + upTo999(x % 1000)
  }
  function upTo99Lakh(x: number): string {
    if (x < 100000) return upTo99999(x)
    const l = Math.floor(x / 100000)
    return upTo99(l) + ' Lakh ' + upTo99999(x % 100000)
  }
  const str = (upTo99Lakh(int) + ' only').replace(/\s+/g, ' ').trim()
  return dec > 0 ? `${str} and ${dec}/100` : str
}

const FONT = 'helvetica'
const M = 16
const PAGE_W = 210
const HALF = PAGE_W / 2
const LINE = 0.3

export function generateInvoicePDF(
  JsPDFClass: typeof import('jspdf').default,
  order: InvoiceOrder
) {
  const doc = new JsPDFClass({ unit: 'mm', format: 'a4' })
  let y = M

  function hr() {
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(LINE)
    doc.line(M, y, PAGE_W - M, y)
    doc.setDrawColor(0, 0, 0)
    y += 6
  }

  const invNum = order.id.slice(-8).toUpperCase()
  const invDate = new Date(order.createdAt).toLocaleDateString('en-IN')

  // ----- Header: title + payment note (no PII) -----
  doc.setFontSize(12)
  doc.setFont(FONT, 'bold')
  doc.text('Tax Invoice / Bill of Supply', PAGE_W - M, y, { align: 'right' })
  y += 5
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8)
  doc.setTextColor(100, 100, 100)
  doc.text('(Original for Recipient)  •  Prepaid only. No COD.', PAGE_W - M, y, { align: 'right' })
  doc.setTextColor(0, 0, 0)
  y += 10
  hr()

  // ----- Two columns: Seller (left) | Bill To + Invoice ref (right). No email/phone. -----
  const leftW = HALF - M - 6

  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.text('Sold by', M, y)
  y += 6
  doc.setFont(FONT, 'bold')
  doc.setFontSize(10)
  doc.text(COMPANY.name, M, y)
  y += 6
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8)
  const soldByAddr = doc.splitTextToSize(COMPANY.addressInline, leftW)
  doc.text(soldByAddr, M, y)
  y += soldByAddr.length * 4 + 8
  const soldByEndY = y

  y = M + 22
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.text('Bill to', PAGE_W - M, y, { align: 'right' })
  y += 6
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8)
  doc.text(order.user.name || 'Customer', PAGE_W - M, y, { align: 'right' })
  y += 5
  const addrLines = doc.splitTextToSize(order.shippingAddress, leftW)
  addrLines.forEach((line: string) => {
    doc.text(line, PAGE_W - M, y, { align: 'right' })
    y += 4
  })
  y += 8
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text(`Invoice # ${invNum}`, PAGE_W - M, y, { align: 'right' })
  y += 4
  doc.setFont(FONT, 'normal')
  doc.text(`Date ${invDate}`, PAGE_W - M, y, { align: 'right' })

  y = Math.max(soldByEndY, y) + 12
  hr()

  // ----- Table: minimal columns, clean grid -----
  const colW = [10, 58, 18, 10, 24, 22, 28]
  const tableX = M
  const lineH = 8

  doc.setFillColor(248, 248, 248)
  doc.rect(tableX, y - 5, colW.reduce((a, b) => a + b, 0), lineH, 'F')
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.2)
  const headers = ['#', 'Description', 'Price', 'Qty', 'Amount', 'Tax', 'Total']
  let x = tableX
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  headers.forEach((h, i) => {
    doc.rect(x, y - 5, colW[i], lineH)
    doc.text(h, x + colW[i] / 2, y + 0.5, { align: 'center' })
    x += colW[i]
  })
  y += lineH

  const subtotal = order.subtotal ?? order.totalAmount - (order.gstAmount ?? 0) - (order.deliveryCharge ?? 0)
  const gst = order.gstAmount ?? 0
  const delivery = order.deliveryCharge ?? 0
  const gstRate = subtotal > 0 ? (gst / subtotal) * 100 : 0

  order.items.forEach((item, idx) => {
    const itemTax = subtotal > 0 ? (item.amount / subtotal) * gst : 0
    const itemTotal = item.amount + itemTax
    x = tableX
    doc.setFont(FONT, 'normal')
    doc.setFontSize(8)
    doc.rect(x, y - 4, colW[0], lineH)
    doc.text(String(idx + 1), x + colW[0] / 2, y + 0.5, { align: 'center' })
    x += colW[0]
    doc.rect(x, y - 4, colW[1], lineH)
    doc.text(item.productName.slice(0, 36), x + 3, y + 0.5)
    x += colW[1]
    doc.rect(x, y - 4, colW[2], lineH)
    doc.text(`₹${item.price.toFixed(2)}`, x + colW[2] - 2, y + 0.5, { align: 'right' })
    x += colW[2]
    doc.rect(x, y - 4, colW[3], lineH)
    doc.text(String(item.quantity), x + colW[3] / 2, y + 0.5, { align: 'center' })
    x += colW[3]
    doc.rect(x, y - 4, colW[4], lineH)
    doc.text(`₹${item.amount.toFixed(2)}`, x + colW[4] - 2, y + 0.5, { align: 'right' })
    x += colW[4]
    doc.rect(x, y - 4, colW[5], lineH)
    doc.text(`₹${itemTax.toFixed(2)}`, x + colW[5] - 2, y + 0.5, { align: 'right' })
    x += colW[5]
    doc.rect(x, y - 4, colW[6], lineH)
    doc.text(`₹${itemTotal.toFixed(2)}`, x + colW[6] - 2, y + 0.5, { align: 'right' })
    y += lineH
  })

  if (delivery > 0) {
    x = tableX
    doc.rect(x, y - 4, colW[0], lineH)
    doc.text(String(order.items.length + 1), x + colW[0] / 2, y + 0.5, { align: 'center' })
    x += colW[0]
    doc.rect(x, y - 4, colW[1], lineH)
    doc.text('Delivery', x + 3, y + 0.5)
    x += colW[1]
    doc.rect(x, y - 4, colW[2], lineH)
    doc.text(`₹${delivery.toFixed(2)}`, x + colW[2] - 2, y + 0.5, { align: 'right' })
    x += colW[2]
    doc.rect(x, y - 4, colW[3], lineH)
    doc.text('1', x + colW[3] / 2, y + 0.5, { align: 'center' })
    x += colW[3]
    doc.rect(x, y - 4, colW[4], lineH)
    doc.text(`₹${delivery.toFixed(2)}`, x + colW[4] - 2, y + 0.5, { align: 'right' })
    x += colW[4]
    doc.rect(x, y - 4, colW[5], lineH)
    doc.text('—', x + colW[5] / 2, y + 0.5, { align: 'center' })
    x += colW[5]
    doc.rect(x, y - 4, colW[6], lineH)
    doc.text(`₹${delivery.toFixed(2)}`, x + colW[6] - 2, y + 0.5, { align: 'right' })
    y += lineH
  }

  const totalW = colW.reduce((a, b) => a + b, 0)
  const totalLabelW = colW[0] + colW[1] + colW[2] + colW[3] + colW[4]
  doc.setFillColor(248, 248, 248)
  doc.rect(tableX, y - 4, totalW, lineH, 'F')
  doc.rect(tableX, y - 4, totalW, lineH)
  doc.setFont(FONT, 'bold')
  doc.setFontSize(9)
  doc.text('Total', tableX + 4, y + 0.5)
  const taxColX = tableX + totalLabelW
  doc.text(`₹${gst.toFixed(2)}`, taxColX + colW[5] / 2, y + 0.5, { align: 'center' })
  doc.text(`₹${order.totalAmount.toFixed(2)}`, taxColX + colW[5] + colW[6] / 2, y + 0.5, { align: 'center' })
  y += lineH + 12
  hr()

  // ----- Amount in words -----
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text('Amount (in words)', M, y)
  y += 5
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9)
  const words = amountToWords(order.totalAmount)
  doc.text(doc.splitTextToSize(words, PAGE_W - 2 * M), M, y)
  y += 10
  hr()

  // ----- Payment & signatory (only needed info) -----
  doc.setFontSize(8)
  doc.text('Payment: Prepaid (Razorpay).', M, y)
  if (order.paymentId) {
    doc.text(`Ref: ${order.paymentId}`, M + 55, y)
  }
  y += 8
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text(`For ${COMPANY.name}`, PAGE_W - M, y, { align: 'right' })
  y += 5
  doc.setFont(FONT, 'normal')
  doc.text('Authorized Signatory', PAGE_W - M, y, { align: 'right' })
  y += 10

  // ----- Payment processor (compliance only) -----
  doc.setFontSize(7)
  doc.setTextColor(90, 90, 90)
  doc.text(`Payment processed by ${RAZORPAY_PROVIDER.registeredName} (GST: ${RAZORPAY_PROVIDER.GST})`, M, y)
  doc.setTextColor(0, 0, 0)
  y += 6
  doc.setFontSize(7)
  doc.text('Tax under reverse charge: No', M, y)

  return doc
}
