'use client'

import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export default function ShippingReturnsPage() {
  return (
    <div className="bg-white min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-10 sm:py-16 md:py-24 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Shipping &amp; Returns
          </h1>
          <p className="text-sm text-gray-500 text-center mb-10">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="leading-relaxed">
              At STN Golden Healthy Foods, we want you to receive your order in perfect condition. Please read our shipping
              and returns policy below.
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">Cancellation</h2>
              <p className="mb-3">
                You may cancel an order from the <strong>My Orders</strong> page <strong>anytime before we ship</strong> your order (i.e. while the order is <strong>Pending</strong>, <strong>Confirmed</strong>, or <strong>Processing</strong>). Once we have shipped the order, cancellation is not available, in line with standard practice and consumer policy. If you had paid for a cancelled order, you can submit a refund request from My Orders; refunds are subject to our Returns &amp; Refunds policy below.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">Shipping</h2>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery areas</h3>
              <p className="mb-3">
                We ship across India. Delivery timelines and charges may vary by location and will be shown at checkout.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery time</h3>
              <p className="mb-3">
                Orders are processed on business days. Typically, you can expect delivery within 5–10 business days from
                dispatch, depending on your location and courier availability. We will send you tracking details once your
                order is shipped.
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Packaging</h3>
              <p className="leading-relaxed">
                We pack our oils and food products with care to prevent leakage and damage in transit. If you receive a
                damaged or leaking package, please contact us with photos so we can resolve it promptly.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">Returns &amp; Refunds</h2>
              <p className="mb-3">
                Because we sell edible products (oils, spices, and food items), we follow a fair and hygienic returns policy:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  <strong>Wrong or damaged product:</strong> If you receive the wrong item or a product that is damaged, defective,
                  or leaking, please contact us within 48 hours of delivery with order details and photos. We will arrange
                  replacement or refund as appropriate.
                </li>
                <li>
                  <strong>Unopened and sealed items:</strong> If you wish to return an unopened, sealed product in its original
                  condition within 7 days of delivery, we may offer a refund or exchange subject to inspection. Contact us first
                  to get approval and return instructions.
                </li>
                <li>
                  <strong>Opened food products:</strong> For health and safety reasons, we cannot accept returns of opened or
                  partially used food, oils, or spices unless the product is defective. In case of defect, contact us with
                  details and we will assist you.
                </li>
              </ul>
              <p className="mt-4 leading-relaxed">
                Refunds, when applicable, will be processed to the original payment method within 7–10 business days after we
                receive and verify the return (if required).
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">Contact Us</h2>
              <p className="leading-relaxed">
                For any shipping or returns queries, reach us at{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-[var(--primary-green)] hover:underline">
                  {COMPANY.email}
                </a>
                {' '}or call{' '}
                {COMPANY.phones.map((phone, i) => (
                  <span key={i}>
                    {i > 0 && ' / '}
                    <a href={`tel:+91${COMPANY.phoneNumbers[i]}`} className="text-[var(--primary-green)] hover:underline">
                      {phone}
                    </a>
                  </span>
                ))}
                . We are happy to help.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200">
              <Link href="/home" className="inline-block text-[var(--primary-green)] font-semibold hover:opacity-90">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
