'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Crown, Users, BarChart3, RefreshCw, Trash2,
  CreditCard, AlertCircle, CheckCircle2, DollarSign,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'

interface AdminUser {
  uid: string
  email: string
  fullName: string | null
  plan: 'free' | 'pro'
  totalScans: number
  scansThisMonth: number
  createdAt: string
}

interface Payment {
  id: string
  userId?: string
  email?: string
  name?: string
  plan?: string
  amount?: number
  currency?: string
  status?: string
  razorpaySubscriptionId?: string
  razorpayPaymentId?: string
  createdAt?: string
}

export default function AdminPage() {
  const { token, profile, isLoading } = useProfile()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

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

  const fetchPayments = async () => {
    if (!token) return
    setPaymentsLoading(true)
    const res = await fetch('/api/admin/users?type=payments', { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) {
      const data = await res.json()
      setPayments(data.payments ?? [])
    }
    setPaymentsLoading(false)
  }

  useEffect(() => { fetchUsers() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeTab === 'payments' && payments.length === 0) fetchPayments()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const deleteUser = async (userId: string) => {
    if (!token) return
    setDeleting(userId)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ user_id: userId }),
    })
    if (res.ok) {
      setUsers(prev => prev.filter(u => u.uid !== userId))
    }
    setDeleting(null)
    setConfirmDelete(null)
  }

  if (isLoading) return null

  const totalScans = users.reduce((s, u) => s + (u.totalScans || 0), 0)
  const proUsers = users.filter(u => u.plan === 'pro').length
  const totalRevenue = payments.reduce((s, p) => s + (p.amount ?? 0), 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchUsers(); fetchPayments() }} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: 'Total Users', value: users.length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
            { icon: Crown, label: 'Pro Users', value: proUsers, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' },
            { icon: BarChart3, label: 'Total Scans', value: totalScans, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
            { icon: DollarSign, label: 'Revenue (₹)', value: `₹${(totalRevenue / 100).toLocaleString('en-IN')}`, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400' },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="p-4 border-border/60">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-black text-foreground">{value}</p>
                  <p className="text-[11px] text-muted-foreground">{label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 w-fit">
          {(['users', 'payments'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'users' ? <><Users className="h-3.5 w-3.5 inline mr-1.5" />Users ({users.length})</> : <><CreditCard className="h-3.5 w-3.5 inline mr-1.5" />Payments ({payments.length})</>}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="overflow-hidden border-border/60">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Plan</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Total Scans</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground">This Month</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Joined</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uid} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{user.fullName ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${user.plan === 'pro' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
                            {user.plan === 'pro' && <Crown className="h-3 w-3" />}
                            {user.plan.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{user.totalScans || 0}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-foreground">{user.scansThisMonth || 0}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(user.createdAt).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" disabled={updating === user.uid}
                              onClick={() => togglePlan(user.uid, user.plan)} className="text-xs h-7 px-2">
                              {updating === user.uid ? '...' : user.plan === 'pro' ? 'Downgrade' : 'Upgrade'}
                            </Button>
                            {confirmDelete === user.uid ? (
                              <div className="flex items-center gap-1">
                                <Button variant="destructive" size="sm" className="text-xs h-7 px-2 gap-1"
                                  disabled={deleting === user.uid}
                                  onClick={() => deleteUser(user.uid)}>
                                  {deleting === user.uid ? '...' : <><AlertCircle className="h-3 w-3" /> Confirm</>}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-xs h-7 px-2"
                                  onClick={() => setConfirmDelete(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => setConfirmDelete(user.uid)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No users found.</div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <Card className="overflow-hidden border-border/60">
            {paymentsLoading ? (
              <div className="p-8 text-center text-muted-foreground text-sm">Loading payments...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">User</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Plan</th>
                      <th className="text-right px-4 py-3 font-semibold text-muted-foreground">Amount</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Payment ID</th>
                      <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{p.name ?? '—'}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                            <Crown className="h-3 w-3" /> {(p.plan ?? 'pro').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹{((p.amount ?? 0) / 100).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${p.status === 'paid' || !p.status ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'bg-muted text-muted-foreground'}`}>
                            {(p.status === 'paid' || !p.status) && <CheckCircle2 className="h-3 w-3" />}
                            {p.status ?? 'paid'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground font-mono">
                          {p.razorpayPaymentId ?? p.razorpaySubscriptionId ?? p.id?.slice(0, 16) ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {payments.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">No payments found.</div>
                )}
              </div>
            )}
          </Card>
        )}

      </div>
    </div>
  )
}
