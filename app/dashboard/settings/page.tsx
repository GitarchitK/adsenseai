'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Mail, User, Bell, Crown, CreditCard, Shield,
  CheckCircle2, Sparkles, Zap,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'

export default function SettingsPage() {
  const { profile, token, isPro, isLoading } = useProfile()
  const { openCheckout } = useRazorpay()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveName = async () => {
    if (!token) return
    setSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ full_name: name || profile?.fullName }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleUpgrade = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      
      if (!res.ok) {
        const text = await res.text()
        console.error('[Settings] Upgrade error:', text)
        return
      }

      const order = await res.json()
      if (!order.orderId) return

      await openCheckout({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'AdSenseAI',
        description: 'Pro Plan — Monthly',
        order_id:    order.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature, plan: 'pro' }),
          })
          if (v.ok) window.location.href = '/dashboard/settings?upgraded=1'
        },
        prefill: { email: profile?.email ?? '' },
        theme: { color: '#7c3aed' },
      })
    } catch (err) {
      console.error('[Settings] Upgrade failed:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and subscription</p>
      </div>

      <div className="space-y-5">

        {/* Profile card */}
        <Card className="overflow-hidden border-border/60">
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profile
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Avatar row */}
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/60 to-primary text-primary-foreground text-xl font-bold flex-shrink-0">
                {(profile?.fullName?.[0] ?? profile?.email?.[0] ?? '?').toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile?.fullName ?? 'No name set'}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={profile?.fullName ?? 'Your name'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-11 bg-muted/30 border-border/80"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email" value={profile?.email ?? ''} disabled
                  className="pl-10 h-11 opacity-60 bg-muted/30 border-border/80"
                />
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed after signup.</p>
            </div>

            <Button onClick={handleSaveName} disabled={saving} className="gap-2 shadow-sm shadow-primary/20">
              {saved
                ? <><CheckCircle2 className="h-4 w-4" /> Saved!</>
                : saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* Plan card */}
        <Card className="overflow-hidden border-border/60">
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" /> Plan & Billing
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {/* Current plan */}
            <div className={`rounded-2xl p-5 ${isPro
              ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50'
              : 'bg-muted/30 border border-border/60'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isPro
                      ? <Crown className="h-4 w-4 text-amber-500" />
                      : <Zap className="h-4 w-4 text-muted-foreground" />}
                    <p className="font-bold text-foreground">{isPro ? 'Pro Plan' : 'Free Plan'}</p>
                    {isPro && (
                      <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isPro
                      ? '200 scans per month · Full AI reports · All features unlocked'
                      : '5 scans per month · Basic reports only'}
                  </p>
                </div>
                {isPro ? (
                  <Button variant="outline" size="sm" onClick={() => window.open('https://razorpay.com/support', '_blank')}>
                    Manage Billing
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleUpgrade}
                    className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25"
                  >
                    <Crown className="h-3.5 w-3.5" /> Upgrade — ₹199/mo
                  </Button>
                )}
              </div>
            </div>

            {/* Pro features grid */}
            {!isPro && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  What you get with Pro
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { icon: Zap, text: '200 scans per month' },
                    { icon: Sparkles, text: 'Full AI-powered reports' },
                    { icon: CheckCircle2, text: 'AI fix suggestions' },
                    { icon: CheckCircle2, text: 'Content rewriting tool' },
                    { icon: CheckCircle2, text: 'Privacy Policy generator' },
                    { icon: CheckCircle2, text: 'Deep policy risk analysis' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                      <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="overflow-hidden border-border/60">
          <div className="px-6 py-4 border-b border-border/60 bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Notifications
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: 'Email me when a scan completes', sub: 'Get notified as soon as results are ready', checked: true },
              { label: 'Weekly digest', sub: 'Summary of your scans every Monday', checked: true },
              { label: 'Product updates', sub: 'New features and improvements', checked: false },
            ].map(({ label, sub, checked }) => (
              <label key={label} className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  defaultChecked={checked}
                  className="mt-0.5 w-4 h-4 rounded accent-primary flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        {/* Danger zone */}
        <Card className="overflow-hidden border-red-200 dark:border-red-900/50">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
            <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
              <Shield className="h-4 w-4" /> Danger Zone
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
            <Button variant="destructive" size="sm">Delete Account</Button>
          </div>
        </Card>

      </div>
    </div>
  )
}
