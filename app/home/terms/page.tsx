'use client'

import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-10 sm:py-16 md:py-24 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 text-center mb-10">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="leading-relaxed">
              Welcome to STN Golden Healthy Foods. By accessing or using our website and services, you agree to be bound by these
              Terms of Service. Please read them carefully.
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">1. Use of Website</h2>
              <p className="leading-relaxed">
                You may use this website only for lawful purposes and in accordance with these terms. You must not use the site
                to violate any laws, infringe others&apos; rights, or transmit harmful or offensive content. We reserve the right to
                suspend or terminate access at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">2. Orders and Payment</h2>
              <p className="mb-3">When you place an order:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You represent that all information provided is accurate and that you are authorised to use the payment method.</li>
                <li>We reserve the right to refuse or cancel orders (e.g. pricing errors, stock unavailability, or suspected fraud).</li>
                <li>Prices are as displayed at the time of order; we may correct obvious errors and will notify you of any significant change.</li>
                <li>You may cancel your order from <strong>My Orders</strong> <strong>anytime before we ship</strong> your order (i.e. while the order is <strong>Pending</strong>, <strong>Confirmed</strong>, or <strong>Processing</strong>). Once we have shipped the order, cancellation is not possible, in line with standard e‑commerce and consumer policy. Cancellation cannot be undone. For cancelled paid orders, our Refund policy (see Shipping &amp; Returns) applies.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">3. Products and Descriptions</h2>
              <p className="leading-relaxed">
                We strive to display our products accurately. We do not warrant that product descriptions, images, or other content
                are error-free. We sell food and edible products; consumption is at your own responsibility and in accordance with
                any dietary or health advice you may have received.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">4. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on this website (including text, logos, images, and design) is the property of STN Golden Healthy Foods
                or its licensors and is protected by applicable intellectual property laws. You may not copy, modify, or use our
                content for commercial purposes without our prior written consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                To the fullest extent permitted by law, STN Golden Healthy Foods shall not be liable for any indirect, incidental,
                special, or consequential damages arising from your use of the website or products. Our total liability for any
                claim related to your order or use of the site shall not exceed the amount you paid for the relevant order.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">6. Governing Law</h2>
              <p className="leading-relaxed">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the
                courts of Tiruppur, Tamil Nadu, or such other courts as may have jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">7. Changes</h2>
              <p className="leading-relaxed">
                We may update these Terms of Service from time to time. Continued use of the website after changes constitutes
                acceptance of the revised terms. Please check this page periodically for updates.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">8. Grievance Redressal &amp; Complaints</h2>
              <p className="leading-relaxed">
                For any complaint, grievance, or dispute regarding your order or our services, please contact us first at{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-[var(--primary-green)] hover:underline">{COMPANY.email}</a>
                {' '}or call {COMPANY.phones.join(' / ')}. We will endeavour to resolve your concern promptly. Our registered address: {COMPANY.addressInline}. If your concern remains unresolved, you may approach the appropriate consumer dispute redressal forum under the Consumer Protection Act, 2019.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                For questions about these terms, contact us at{' '}
                <a href={`mailto:${COMPANY.email}`} className="text-[var(--primary-green)] hover:underline">
                  {COMPANY.email}
                </a>
                .
              </p>
              <Link href="/home" className="inline-block mt-6 text-[var(--primary-green)] font-semibold hover:opacity-90">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
