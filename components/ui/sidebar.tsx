'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { PanelLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// --- Context ---
type SidebarContext = {
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider')
  return ctx
}

// --- Provider ---
const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const [openMobile, setOpenMobile] = React.useState(false)
  const [open, setOpen] = React.useState(true)
  const value: SidebarContext = {
    open,
    setOpen,
    openMobile,
    setOpenMobile,
  }
  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={ref}
        className={cn('flex min-h-0 w-full', className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = 'SidebarProvider'

// --- Sidebar (desktop: aside; mobile: content for Sheet) ---
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: 'left' | 'right' }
>(({ className, side = 'left', children, ...props }, ref) => (
  <div
    ref={ref}
    data-side={side}
    className={cn(
      'flex h-full w-full flex-col bg-sidebar text-sidebar-foreground',
      'hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col',
      'border-r border-sidebar-border',
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Sidebar.displayName = 'Sidebar'

// --- Sidebar content (scrollable) ---
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2', className)}
    {...props}
  />
))
SidebarContent.displayName = 'SidebarContent'

// --- Sidebar group ---
const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group"
    className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
    {...props}
  />
))
SidebarGroup.displayName = 'SidebarGroup'

// --- Sidebar group label ---
const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70',
      'outline-none ring-sidebar-ring transition-[margin,opacity] duration-200',
      className
    )}
    {...props}
  />
))
SidebarGroupLabel.displayName = 'SidebarGroupLabel'

// --- Sidebar group content ---
const SidebarGroupContent = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="group-content"
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    {...props}
  />
))
SidebarGroupContent.displayName = 'SidebarGroupContent'

// --- Sidebar menu ---
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn('flex w-full min-w-0 flex-col gap-1', className)}
    {...props}
  />
))
SidebarMenu.displayName = 'SidebarMenu'

// --- Sidebar menu item ---
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn('list-none', className)}
    {...props}
  />
))
SidebarMenuItem.displayName = 'SidebarMenuItem'

// --- Sidebar menu button ---
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isActive?: boolean
  }
>(({ className, asChild = false, isActive, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      ref={ref}
      data-sidebar="menu-button"
      data-active={isActive}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium',
        'outline-none ring-sidebar-ring transition-[width,height,padding,margin] duration-200',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'focus-visible:ring-2 active:bg-sidebar-accent',
        isActive && 'bg-sidebar-accent text-sidebar-accent-foreground',
        className
      )}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = 'SidebarMenuButton'

// --- Sidebar trigger (opens sidebar on mobile) ---
const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { setOpenMobile } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      className={cn('lg:hidden', className)}
      onClick={() => setOpenMobile(true)}
      aria-label="Open sidebar"
      {...props}
    >
      <PanelLeft className="h-5 w-5" />
    </Button>
  )
})
SidebarTrigger.displayName = 'SidebarTrigger'

// --- Sidebar inset (main content area) ---
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <main
    ref={ref}
    className={cn(
      'relative flex min-h-0 flex-1 flex-col',
      'w-full min-w-0 overflow-hidden',
      className
    )}
    {...props}
  />
))
SidebarInset.displayName = 'SidebarInset'

// --- Sidebar rail (optional) ---
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-sidebar="rail"
    aria-label="Toggle Sidebar"
    tabIndex={-1}
    title="Toggle Sidebar"
    className={cn(
      'absolute right-0 top-0 z-10 hidden h-6 w-3 -translate-y-1/2 translate-x-1/2',
      'items-center justify-center rounded-sm border border-sidebar-border bg-sidebar',
      'text-sidebar-foreground opacity-0 transition-opacity duration-200',
      'hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-sidebar-ring',
      'group-hover:opacity-100 lg:flex',
      className
    )}
    {...props}
  >
    <div className="h-4 w-0.5 rounded-full bg-current" />
  </button>
))
SidebarRail.displayName = 'SidebarRail'

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}
