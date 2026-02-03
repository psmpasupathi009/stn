'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0f1419] text-white w-full min-w-0 overflow-x-hidden border-t border-white/5">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl py-12 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 sm:gap-12 lg:gap-16">
          {/* Brand — takes more space on lg */}
          <div className="sm:col-span-2 lg:col-span-5">
            <Link href="/home" className="inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1419] rounded">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#3CB31A]">
                STN GOLDEN HEALTHY FOODS
              </span>
            </Link>
            <p className="mt-4 text-sm text-zinc-400 leading-relaxed max-w-sm">
              Traditional cold-pressed oils, spices, and healthy products from Kovilpatti — quality you can trust.
            </p>
            {/* Social inline under brand on all screens */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Follow</span>
              <div className="flex gap-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#3CB31A] hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#3CB31A] hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-[#3CB31A] hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
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
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
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
                  className="flex items-start gap-3 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#3CB31A]/20">
                    <Mail className="w-4 h-4 text-[#3CB31A]" />
                  </span>
                  <span className="break-all pt-0.5">info@stngoldenhealthyfoods.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+919942590202"
                  className="flex items-start gap-3 text-sm text-zinc-400 hover:text-white transition-colors group"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#3CB31A]/20">
                    <Phone className="w-4 h-4 text-[#3CB31A]" />
                  </span>
                  <span className="pt-0.5">+91 99425 90202</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-zinc-400">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#3CB31A]" />
                </span>
                <span className="pt-0.5">
                  46/1, Kongu Nagar, Opp. Power House, Pollachi Main Road, Dharapuram, Tiruppur – 638 656
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-zinc-500">
            © {currentYear} STN GOLDEN HEALTHY FOODS. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-x-6 gap-y-1 text-xs text-zinc-500">
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
