'use client'

import Link from 'next/link'

export default function AnnouncementBar() {
  return (
    <div className="bg-gray-800 text-white text-sm py-2 px-4">
      <div className="container mx-auto flex items-center justify-center">
        <Link href="#" className="flex items-center gap-2 hover:underline">
          <span>Poor rainfall and scarce native groundnuts push groundnut oil prices up - quality uncompromised</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
