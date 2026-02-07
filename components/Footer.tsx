'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'
import { COMPANY } from '@/lib/company'

const QUICK_LINKS = [
  { href: '/home/products', label: 'Shop All' },
  { href: '/home/our-story', label: 'Our Story' },
  { href: '/home/contact', label: 'Contact' },
  { href: '/home/track-order', label: 'Track Order' },
  { href: '/home/orders', label: 'My Orders' },
] as const

const SOCIAL_LINKS = [
  { href: COMPANY.facebookUrl, label: 'Facebook', icon: Facebook, color: 'text-[#1877F2]' },
  { href: COMPANY.instagramUrl, label: 'Instagram', icon: Instagram, color: 'text-[#E4405F]' },
  { href: COMPANY.youtubeUrl, label: 'YouTube', icon: Youtube, color: 'text-[#FF0000]' },
] as const

const LINK_CLASS = 'text-sm text-white/90 hover:text-white transition-colors'
const ICON_BTN_CLASS = 'w-10 h-10 rounded-full bg-white flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#2a8f14] border-t border-[#2a8f14] text-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-5">
            <Link
              href="/home"
              className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a8f14] rounded"
            >
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {COMPANY.name}
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/90 leading-relaxed max-w-sm">
              Traditional cold-pressed oils, spices, and healthy products from Kovilpatti — quality you can trust.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">Follow</span>
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className={`${ICON_BTN_CLASS} ${color}`}
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white mb-4">Quick links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={LINK_CLASS}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-start gap-3 text-sm text-white/90 hover:text-white transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity shadow-sm">
                    <Mail className="w-4 h-4 text-[#2a8f14]" />
                  </span>
                  <span className="break-all pt-0.5">{COMPANY.email}</span>
                </a>
              </li>
              {COMPANY.phones.map((phone, i) => (
                <li key={i}>
                  <a
                    href={`tel:+91${COMPANY.phoneNumbers[i]}`}
                    className="flex items-start gap-3 text-sm text-white/90 hover:text-white transition-colors group"
                  >
                    <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity shadow-sm">
                      <Phone className="w-4 h-4 text-[#2a8f14]" />
                    </span>
                    <span className="pt-0.5">{phone}</span>
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-3 text-sm text-white/90">
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#2a8f14]" />
                </span>
                <span className="pt-0.5 whitespace-pre-line">{COMPANY.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-white/80">
            © {currentYear} {COMPANY.name}. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-1 text-xs text-white/80">
            <Link href="/home/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/home/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/home/shipping-returns" className="hover:text-white transition-colors">
              Shipping & returns
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
