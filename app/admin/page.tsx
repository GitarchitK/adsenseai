'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Crown, Users, BarChart3, RefreshCw, Trash2,
  CreditCard, AlertCircle, CheckCircle2, DollarSign,
  Mail, Send, Loader2
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts'
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
  const { token, profile, isLoading, getToken } = useProfile()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentsLoading, setPaymentsLoading] = useState(false)
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'payments' | 'marketing'>('analytics')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Marketing state
  const [marketingSubject, setMarketingSubject] = useState('')
  const [marketingBody, setMarketingBody] = useState('')
  const [marketingAudience, setMarketingAudience] = useState<'all' | 'free' | 'pro'>('all')
  const [marketingSending, setMarketingSending] = useState(false)
  const [marketingResult, setMarketingResult] = useState<{success?: boolean, msg: string} | null>(null)

  const sendMarketingCampaign = async () => {
    const t = await getToken()
    if (!t) return
    if (!marketingSubject.trim() || !marketingBody.trim()) {
      setMarketingResult({ success: false, msg: 'Subject and Body are required.' })
      return
    }
    setMarketingSending(true)
    setMarketingResult(null)
    try {
      const res = await fetch('/api/admin/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ subject: marketingSubject, html: marketingBody, audience: marketingAudience })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send campaign.')
      setMarketingResult({ success: true, msg: data.message })
      setMarketingSubject('')
      setMarketingBody('')
    } catch (err: any) {
      setMarketingResult({ success: false, msg: err.message })
    } finally {
      setMarketingSending(false)
    }
  }

  const fetchUsers = async () => {
    const t = await getToken()
    if (!t) return
    setLoading(true)
    setErrorMsg(null)
    const res = await fetch('/api/admin/users?limit=1000', { headers: { Authorization: `Bearer ${t}` } })
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users ?? [])
    } else {
      if (res.status === 403) setErrorMsg("You are not authorized to view this page, or your session expired. Please log out and back in.")
    }
    setLoading(false)
  }

  const fetchPayments = async () => {
    const t = await getToken()
    if (!t) return
    setPaymentsLoading(true)
    const res = await fetch('/api/admin/users?type=payments&limit=1000', { headers: { Authorization: `Bearer ${t}` } })
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
    const t = await getToken()
    if (!t) return
    setUpdating(userId)
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ user_id: userId, plan: currentPlan === 'pro' ? 'free' : 'pro' }),
    })
    await fetchUsers()
    setUpdating(null)
  }

  const deleteUser = async (userId: string) => {
    const t = await getToken()
    if (!t) return
    setDeleting(userId)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
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

  // Generate chart data
  const chartData = [...users].reverse().reduce((acc: any[], user) => {
    const date = new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    const existing = acc.find(item => item.date === date)
    if (existing) {
      existing.users += 1
    } else {
      acc.push({ date, users: 1 })
    }
    return acc
  }, [])

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

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 bg-red-50 text-red-600 dark:bg-red-950/30 rounded-xl font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {errorMsg}
          </div>
        )}

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
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl border border-border/40 w-fit flex-wrap">
          {(['analytics', 'users', 'payments', 'marketing'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${activeTab === tab ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {tab === 'analytics' ? <><BarChart3 className="h-3.5 w-3.5 inline mr-1.5" />Analytics</> : tab === 'users' ? <><Users className="h-3.5 w-3.5 inline mr-1.5" />Users ({users.length})</> : tab === 'payments' ? <><CreditCard className="h-3.5 w-3.5 inline mr-1.5" />Payments ({payments.length})</> : <><Mail className="h-3.5 w-3.5 inline mr-1.5" />Marketing</>}
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card className="p-6 border-border/60">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-foreground">User Growth</h2>
                <p className="text-sm text-muted-foreground">New signups over time</p>
              </div>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888888' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

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
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(user.createdAt).toLocaleDateString('en-IN')} <br/>
                          <span className="text-[10px] opacity-70 font-mono">
                            {new Date(user.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
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

        {/* Marketing Tab */}
        {activeTab === 'marketing' && (
          <Card className="p-6 border-border/60">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> New Marketing Campaign</h2>
            
            {marketingResult && (
              <div className={`p-4 rounded-xl mb-6 text-sm font-semibold flex items-center gap-2 ${marketingResult.success ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600 dark:bg-red-950/30'}`}>
                {marketingResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                {marketingResult.msg}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Audience</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'free', 'pro'] as const).map(aud => (
                    <button key={aud} onClick={() => setMarketingAudience(aud)}
                      className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize border ${marketingAudience === aud ? 'bg-primary/10 border-primary text-primary' : 'bg-transparent border-border text-muted-foreground hover:bg-muted/50'}`}>
                      {aud} Users {aud === 'all' && `(${users.length})`}
                      {aud === 'free' && `(${users.filter(u => u.plan !== 'pro' && !u.razorpaySubscriptionId).length})`}
                      {aud === 'pro' && `(${users.filter(u => u.plan === 'pro' || !!u.razorpaySubscriptionId).length})`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Email Subject</label>
                <input type="text" value={marketingSubject} onChange={(e) => setMarketingSubject(e.target.value)}
                  placeholder="e.g. Special Offer: 50% Off Coaching Plan!"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 flex justify-between items-end">
                  <span>Email Body (HTML Supported)</span>
                  <span className="text-xs text-muted-foreground font-normal">Use &lt;br&gt; for line breaks, &lt;strong&gt; for bold, etc.</span>
                </label>
                <textarea value={marketingBody} onChange={(e) => setMarketingBody(e.target.value)}
                  placeholder="<p>Hey there,</p><br/><p>We are running a special discount...</p>" rows={10}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              
              <Button onClick={sendMarketingCampaign} disabled={marketingSending} className="w-full sm:w-auto min-w-[200px] h-11 gap-2 font-bold shadow-lg shadow-primary/20">
                {marketingSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending to {marketingAudience} users...</> : <><Send className="h-4 w-4" /> Send Campaign</>}
              </Button>
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
