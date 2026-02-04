'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#2a8f14] border-t border-[#2a8f14] text-white w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
          {/* Brand — takes more space on lg */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/home" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#2a8f14] rounded">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                STN GOLDEN HEALTHY FOODS
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/90 leading-relaxed max-w-sm">
              Traditional cold-pressed oils, spices, and healthy products from Kovilpatti — quality you can trust.
            </p>
            {/* Social inline under brand on all screens — original brand colors, rounded bg, high visibility */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">Follow</span>
              <div className="flex gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1877F2] hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#E4405F] hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#FF0000] hover:opacity-90 transition-opacity shadow-sm"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold text-white mb-4">Quick links</h3>
            <ul className="space-y-3">
              {[
                { href: '/home/products', label: 'Shop All' },
                { href: '/home/our-story', label: 'Our Story' },
                { href: '/home/contact', label: 'Contact' },
                { href: '/home/track-order', label: 'Track Order' },
                { href: '/home/orders', label: 'My Orders' },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-white/90 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
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
                  href="mailto:info@stngoldenhealthyfoods.com"
                  className="flex items-start gap-3 text-sm text-white/90 hover:text-white transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity shadow-sm">
                    <Mail className="w-4 h-4 text-[#2a8f14]" />
                  </span>
                  <span className="break-all pt-0.5">info@stngoldenhealthyfoods.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919942590202"
                  className="flex items-start gap-3 text-sm text-white/90 hover:text-white transition-colors group"
                >
                  <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity shadow-sm">
                    <Phone className="w-4 h-4 text-[#2a8f14]" />
                  </span>
                  <span className="pt-0.5">+91 99425 90202</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-white/90">
                <span className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#2a8f14]" />
                </span>
                <span className="pt-0.5">
                  46/1, Kongu Nagar, Opp. Power House, Pollachi Main Road, Dharapuram, Tiruppur – 638 656
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-white/80">
            © {currentYear} STN GOLDEN HEALTHY FOODS. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-1 text-xs text-white/80">
            <Link href="/home/contact" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/home/contact" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/home/contact" className="hover:text-white transition-colors">
              Shipping & returns
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
