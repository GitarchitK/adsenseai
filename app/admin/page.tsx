'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Crown, Users, BarChart3, RefreshCw } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'

interface AdminUser {
  uid: string
  email: string
  fullName: string | null
  plan: 'free' | 'pro'
  totalScans: number
  scansToday: number
  createdAt: string
}

export default function AdminPage() {
  const { token, profile, isLoading } = useProfile()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = async () => {
    if (!token) return
    setLoading(true)
    const res = await fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlan = async (userId: string, currentPlan: string) => {
    if (!token) return
    setUpdating(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId, plan: currentPlan === 'pro' ? 'free' : 'pro' }),
    })
    await fetchUsers()
    setUpdating(null)
  }

  if (isLoading) return null

  const totalScans = users.reduce((s, u) => s + (u.totalScans || 0), 0)
  const proUsers = users.filter(u => u.plan === 'pro').length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Logged in as {profile?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{users.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{proUsers || 0}</p>
                <p className="text-xs text-muted-foreground">Pro Users</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <BarChart3 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalScans || 0}</p>
                <p className="text-xs text-muted-foreground">Total Scans</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users table */}
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Users</h2>
            <Button variant="ghost" size="sm" onClick={fetchUsers} className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Scans</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Today</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{user.fullName ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${user.plan === 'pro' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
                          {user.plan === 'pro' && <Crown className="h-3 w-3" />}
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground">{user.totalScans || 0}</td>
                      <td className="px-4 py-3 text-right text-foreground">{user.scansToday || 0}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updating === user.uid}
                          onClick={() => togglePlan(user.uid, user.plan)}
                          className="text-xs"
                        >
                          {updating === user.uid ? '...' : user.plan === 'pro' ? 'Downgrade' : 'Upgrade'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
