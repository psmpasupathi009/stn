import Link from 'next/link'
import Image from 'next/image'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full min-w-0 flex-col items-center justify-center overflow-x-hidden bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:px-10 lg:py-12">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-4 sm:max-w-sm md:max-w-md sm:gap-5 md:gap-6">
        <Link
          href="/home"
          className="flex min-w-0 max-w-full items-center justify-center gap-2 self-center font-semibold text-gray-900 transition-colors hover:text-green-800 text-sm sm:text-base md:text-lg"
        >
          <Image
            src="/STN LOGO.png"
            alt="STN GOLDEN HEALTHY FOODS"
            width={36}
            height={36}
            className="h-7 w-7 shrink-0 rounded-md sm:h-8 sm:w-8 md:h-9 md:w-9"
          />
          <span className="truncate">STN GOLDEN HEALTHY FOODS</span>
        </Link>
        <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5 md:p-6 lg:p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
