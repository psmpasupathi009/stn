import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto w-full min-w-0 max-w-7xl px-3 sm:px-4 md:px-6 py-3 flex items-center justify-between">
          <Link
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded font-medium">
            Admin
          </span>
        </div>
      </div>
      {children}
    </div>
  )
}
