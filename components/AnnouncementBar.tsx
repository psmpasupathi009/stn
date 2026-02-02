'use client'

import Link from 'next/link'

export default function AnnouncementBar() {
  return (
    <div className="bg-gray-800 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 overflow-hidden">
      <div className="container mx-auto w-full min-w-0 flex items-center justify-center max-w-7xl">
        <Link href="#" className="flex items-center gap-1.5 sm:gap-2 hover:underline min-w-0 max-w-full">
          <span className="line-clamp-1 text-center">Poor rainfall and scarce native groundnuts push groundnut oil prices up - quality uncompromised</span>
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
