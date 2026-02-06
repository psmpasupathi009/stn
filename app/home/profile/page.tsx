'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/home/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <div className="container mx-auto w-full min-w-0 px-3 sm:px-4 md:px-6 py-8 sm:py-10 md:py-12 max-w-7xl">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={user.email} disabled />
              </div>
              <div>
                <Label>Name</Label>
                <Input value={user.name || ''} disabled />
              </div>
              <div>
                <Label>Role</Label>
                <Input value={user.role} disabled />
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 overflow-hidden rounded-lg border border-gray-200">
              {/* Indian flag tricolor: Saffron → White → Green */}
              {(user.role?.toUpperCase() === 'ADMIN') && (
                <Button
                  className="w-full rounded-none border-0 border-b border-gray-200 bg-[#FF9933] text-white hover:bg-[#E88B2E] hover:opacity-95 py-3 font-medium"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full rounded-none border-0 border-b border-gray-200 bg-white text-gray-800 hover:bg-gray-50 font-medium py-3"
                onClick={() => router.push('/home/orders')}
              >
                My Orders
              </Button>
              <Button
                className="w-full rounded-none border-0 bg-[#138808] text-white hover:bg-[#0F6B06] hover:opacity-95 font-medium py-3"
                onClick={logout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}
