import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-green)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-0 touch-manipulation",
          {
            "bg-[var(--primary-green)] text-white hover:opacity-90": variant === "default",
            "bg-red-600 text-white hover:bg-red-700": variant === "destructive",
            "border border-gray-300 bg-transparent hover:bg-gray-100": variant === "outline",
            "bg-gray-200 text-gray-900 hover:bg-gray-300": variant === "secondary",
            "hover:bg-gray-100": variant === "ghost",
            "text-[var(--primary-green)] underline-offset-4 hover:underline": variant === "link",
            "h-9 sm:h-10 px-3 sm:px-4 py-2": size === "default",
            "h-8 sm:h-9 rounded-md px-2.5 sm:px-3 text-xs sm:text-sm": size === "sm",
            "h-10 sm:h-11 rounded-md px-6 sm:px-8": size === "lg",
            "h-9 w-9 sm:h-10 sm:w-10 shrink-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
