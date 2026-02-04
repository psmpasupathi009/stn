'use client'

import * as React from 'react'
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS, type SlotProps } from 'input-otp'
import { cn } from '@/lib/utils'

function InputOTPSlot({ char, hasFakeCaret, isActive, placeholderChar, className, ...props }: SlotProps & React.ComponentProps<'div'>) {
  return (
    <div
      data-slot
      data-active={isActive}
      className={cn(
        'relative flex h-10 w-8 min-w-[2rem] sm:h-12 sm:w-10 sm:min-w-[2.5rem] md:h-14 md:min-w-12 shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-base sm:text-lg font-mono font-semibold tabular-nums transition-colors',
        'group-hover:border-gray-400',
        'group-focus-within:border-gray-950 group-focus-within:ring-2 group-focus-within:ring-gray-950 group-focus-within:ring-offset-1',
        'data-[active=true]:border-gray-950 data-[active=true]:ring-2 data-[active=true]:ring-gray-950 data-[active=true]:ring-offset-1',
        'outline-none',
        className
      )}
      {...props}
    >
      <div className="group-has-[input[data-input-otp-placeholder-shown]]:opacity-20">
        {char ?? placeholderChar}
      </div>
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-5 w-px animate-caret-blink bg-gray-950 sm:h-6" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-separator
      role="separator"
      className="flex h-10 w-1.5 sm:h-12 sm:w-4 md:h-14 shrink-0 items-center justify-center"
      {...props}
    >
      <div className="h-0.5 w-1.5 rounded-full bg-gray-300 sm:h-1 sm:w-2" />
    </div>
  )
}

const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  Omit<React.ComponentProps<typeof OTPInput>, 'render' | 'children'>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'group flex items-center justify-center gap-x-1.5 sm:gap-x-2 has-[:disabled]:opacity-50 max-w-full overflow-x-auto',
      'min-w-0 px-0.5',
      containerClassName
    )}
    className={cn('contents', className)}
    placeholder=" "
    pattern={REGEXP_ONLY_DIGITS}
    inputMode="numeric"
    autoComplete="one-time-code"
    {...props}
    render={({ slots }) => (
      <>
        {slots.slice(0, 3).map((slot, idx) => (
          <InputOTPSlot key={idx} {...slot} />
        ))}
        <InputOTPSeparator />
        {slots.slice(3).map((slot, idx) => (
          <InputOTPSlot key={idx} {...slot} />
        ))}
      </>
    )}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentProps<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator, OTPInputContext as InputOTPContext }
