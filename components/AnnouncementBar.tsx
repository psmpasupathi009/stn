'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

const ANNOUNCEMENT_TEXT =
  'Poor rainfall and scarce native groundnuts push groundnut oil prices up - quality uncompromised'

export default function AnnouncementBar() {
  return (
    <div className="bg-gray-800 text-white text-xs sm:text-sm py-2 px-3 sm:px-4 overflow-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 max-w-7xl flex items-center justify-center">
        <Link href="#" className="flex items-center gap-1.5 sm:gap-2 hover:underline min-w-0 max-w-full">
          <span className="line-clamp-1 text-center">{ANNOUNCEMENT_TEXT}</span>
          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" strokeWidth={2} />
        </Link>
      </div>
    </div>
  )
}
