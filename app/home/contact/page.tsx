'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { COMPANY } from '@/lib/company'

type ContactFormState = { name: string; email: string; phone: string; message: string }

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormState>({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = useCallback((field: keyof ContactFormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      console.log('Form submitted:', formData)
      setSubmitted(true)
      setTimeout(() => setSubmitted(false), 3000)
    },
    [formData]
  )

  return (
    <div className="bg-white min-h-screen w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-10 sm:py-14 md:py-20 lg:py-24 max-w-7xl">
        <div className="max-w-3xl mx-auto min-w-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-gray-600 text-center mb-8 sm:mb-12 px-1">
            We&apos;d love to hear from you. Send us a message and we&apos;ll respond as soon as possible.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-sm text-gray-600 mb-4">For orders, complaints, or grievances, please use the details below. We will respond as soon as possible.</p>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                  <a href={`mailto:${COMPANY.email}`} className="text-neutral-700 hover:underline">
                    {COMPANY.email}
                  </a>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Mobile</h3>
                  <div className="flex flex-col gap-1">
                    {COMPANY.phones.map((phone, i) => (
                      <a key={i} href={`tel:+91${COMPANY.phoneNumbers[i]}`} className="text-neutral-700 hover:underline">
                        {phone}
                      </a>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                  <p className="text-gray-700 whitespace-pre-line">{COMPANY.address}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    <a href="#" className="text-gray-600 hover:text-neutral-800">
                      Facebook
                    </a>
                    <a href="#" className="text-gray-600 hover:text-neutral-800">
                      Instagram
                    </a>
                    <a href="#" className="text-gray-600 hover:text-neutral-800">
                      YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={formData.name} onChange={handleChange('name')} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={handleChange('email')} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" value={formData.phone} onChange={handleChange('phone')} />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={handleChange('message')}
                    className="w-full min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-1 resize-y min-h-[120px]"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-neutral-800 text-white hover:bg-neutral-900"
                >
                  {submitted ? 'Message Sent!' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
