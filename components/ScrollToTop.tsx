'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const SCROLL_THRESHOLD = 300

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-[99] bg-[var(--primary-green)] hover:opacity-90 text-white rounded-full p-2.5 sm:p-3 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--primary-green)] focus:ring-offset-2 touch-manipulation"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0)' }}
      aria-label="Scroll to top"
    >
      <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.5} />
    </button>
  )
}
