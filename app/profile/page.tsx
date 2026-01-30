'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/context'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [showAdminDashboard, setShowAdminDashboard] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>
      <div className="grid md:grid-cols-3 gap-8">
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
            <CardContent className="space-y-4">
              {user.role === 'admin' && (
                <Button
                  className="w-full"
                  onClick={() => setShowAdminDashboard(!showAdminDashboard)}
                >
                  {showAdminDashboard ? 'Hide' : 'Show'} Admin Dashboard
                </Button>
              )}
              {user.role === 'admin' && showAdminDashboard && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/admin/dashboard')}
                >
                  Go to Admin Dashboard
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={() => router.push('/orders')}>
                My Orders
              </Button>
              <Button variant="destructive" className="w-full" onClick={logout}>
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
