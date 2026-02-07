'use client'

import Link from 'next/link'
import { COMPANY } from '@/lib/company'

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-10 sm:py-16 md:py-24 max-w-7xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 text-center mb-10">
            Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
            <p className="leading-relaxed">
              STN Golden Healthy Foods (&quot;we&quot;, &quot;our&quot;, or &quot;Company&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our
              website and services. Please read this policy carefully.
            </p>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">1. Information We Collect</h2>
              <p className="mb-3">We may collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name, email address, phone number, and shipping address when you create an account or place an order</li>
                <li>Order history, payment-related information (processed securely by our payment partners), and preferences</li>
                <li>Communications you send to us (e.g. via contact form or email)</li>
                <li>Session and necessary cookies to keep you logged in and to run checkout; these are essential for the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">2. How We Use Your Information</h2>
              <p className="mb-3">We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and fulfil your orders and send order updates</li>
                <li>Manage your account and provide customer support</li>
                <li>Send relevant offers or updates (only if you have agreed), and to improve our website and services</li>
                <li>Comply with applicable laws and protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">3. Sharing of Information</h2>
              <p className="leading-relaxed">
                We do not sell your personal information. We may share your information only with service providers who
                assist us (e.g. delivery partners, payment processors) under strict confidentiality, or when required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">4. Data Security</h2>
              <p className="leading-relaxed">
                We implement reasonable security practices and procedures in line with applicable Indian law (including the Information Technology Act, 2000 and rules thereunder) to protect your personal data against unauthorised access, alteration, or destruction. Payment details are handled by secure, compliant payment gateways. Your data may be stored and processed in India.
              </p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">5. Your Rights &amp; Grievance</h2>
              <p className="mb-3">You may request access to, correction of, or deletion of your personal data. For any privacy-related grievance or complaint, contact us at:</p>
              <p className="font-medium">
                <a href={`mailto:${COMPANY.email}`} className="text-[var(--primary-green)] hover:underline">
                  {COMPANY.email}
                </a>
              </p>
              <p className="mt-2 text-sm text-gray-600">We will respond to your request in line with applicable law.</p>
            </section>

            <section>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 mt-8">6. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. The updated version will be posted on this page with a revised &quot;Last updated&quot; date.
              </p>
            </section>

            <div className="pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                For any privacy-related questions, contact us at{' '}
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
