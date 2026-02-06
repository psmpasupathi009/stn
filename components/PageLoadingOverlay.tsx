'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef, useCallback } from 'react'

const SHOW_AFTER_MS = 280
const HIDE_AFTER_MS = 400
const INITIAL_LOAD_MS = 700
const FADE_OUT_MS = 200
const LOADING_IMAGE = '/stn loading image.png'

export function PageLoadingOverlay() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const prevPath = useRef<string | null>(null)
  const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimers = useCallback(() => {
    if (showTimer.current) {
      clearTimeout(showTimer.current)
      showTimer.current = null
    }
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  useEffect(() => {
    const isFirstMount = prevPath.current === null
    if (isFirstMount) {
      prevPath.current = pathname
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null
        setFadeOut(true)
        setTimeout(() => setVisible(false), FADE_OUT_MS)
      }, INITIAL_LOAD_MS)
      return clearTimers
    }

    if (prevPath.current === pathname) return

    clearTimers()
    prevPath.current = pathname

    showTimer.current = setTimeout(() => {
      showTimer.current = null
      setFadeOut(false)
      setVisible(true)
      hideTimer.current = setTimeout(() => {
        hideTimer.current = null
        setFadeOut(true)
        setTimeout(() => setVisible(false), FADE_OUT_MS)
      }, HIDE_AFTER_MS)
    }, SHOW_AFTER_MS)

    return clearTimers
  }, [pathname, clearTimers])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white [contain:paint] transition-opacity duration-200 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      role="status"
      aria-live="polite"
      aria-busy={!fadeOut}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOADING_IMAGE}
        alt="Loading"
        decoding="async"
        fetchPriority="high"
        className="h-36 w-auto sm:h-44 md:h-52 object-contain animate-pulse opacity-90"
      />
    </div>
  )
}
