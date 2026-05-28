'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Mail, User, Crown, CreditCard, Shield,
  CheckCircle2, Sparkles, Zap, LogOut, ExternalLink,
  BarChart3, BookOpen, Wrench, ArrowRight,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth'

export default function SettingsPage() {
  const { profile, token, isPro, isLoading, usage } = useProfile()
  const { openCheckout } = useRazorpay()
  const router = useRouter()
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
      if (!res.ok) return
      const order = await res.json()
      if (!order.orderId) return
      await openCheckout({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'AdSense Checker AI', description: 'Pro Plan — Monthly', order_id: order.orderId,
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

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const initial = (profile?.fullName?.[0] ?? profile?.email?.[0] ?? '?').toUpperCase()
  const scansUsed = usage?.scans_this_month ?? 0
  const scansLimit = isPro ? 200 : 5
  const scansPct = Math.min(100, Math.round((scansUsed / scansLimit) * 100))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-2xl space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account and subscription</p>
      </div>

      {/* ── Profile hero card ── */}
      <Card className="p-6 border-border/60 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="relative flex items-start gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/70 to-primary text-primary-foreground text-2xl font-black flex-shrink-0 shadow-lg shadow-primary/20">
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-lg font-black text-foreground truncate">{profile?.fullName ?? 'No name set'}</p>
              {isPro ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  <Crown className="h-2.5 w-2.5" /> PRO
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                  FREE
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{profile?.email}</p>

            {/* Usage bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3" /> Scans this month
                </span>
                <span className={`font-black tabular-nums ${scansPct >= 80 ? 'text-red-600 dark:text-red-400' : 'text-foreground'}`}>
                  {scansUsed} / {scansLimit}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${scansPct >= 80 ? 'bg-red-500' : scansPct >= 60 ? 'bg-amber-500' : 'bg-primary'}`}
                  style={{ width: `${scansPct}%` }}
                />
              </div>
              {!isPro && scansUsed >= 4 && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {scansLimit - scansUsed} scan{scansLimit - scansUsed !== 1 ? 's' : ''} remaining — <button onClick={handleUpgrade} className="underline font-bold">upgrade for 200/month</button>
                </p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs text-muted-foreground hover:text-red-500 flex-shrink-0">
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </div>
      </Card>

      {/* ── Edit profile ── */}
      <Card className="p-6 border-border/60 rounded-2xl space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">Profile</p>
            <p className="text-xs text-muted-foreground">Update your display name</p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={profile?.fullName ?? 'Your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-11 bg-muted/30 border-border/80 rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email" value={profile?.email ?? ''} disabled
                className="pl-10 h-11 opacity-50 bg-muted/30 border-border/80 rounded-xl"
              />
            </div>
            <p className="text-xs text-muted-foreground">Email is linked to your Google account and cannot be changed.</p>
          </div>
        </div>

        <Button onClick={handleSaveName} disabled={saving} className="gap-2 rounded-xl h-10">
          {saved ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Card>

      {/* ── Plan & billing ── */}
      <Card className="p-6 border-border/60 rounded-2xl space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">Plan & Billing</p>
            <p className="text-xs text-muted-foreground">Your current subscription</p>
          </div>
        </div>

        {isPro ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800/50">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5 text-amber-500" />
                  <p className="font-black text-foreground">Pro Plan</p>
                  <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>
                <p className="text-sm text-muted-foreground">₹199/month · 200 scans · All AI tools · Full reports</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => window.open('https://razorpay.com/support', '_blank')}>
                <ExternalLink className="h-3.5 w-3.5" /> Manage Billing
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { icon: BarChart3, text: '200 scans/month' },
                { icon: Sparkles, text: 'Full AI reports' },
                { icon: BookOpen, text: 'Article Analyzer' },
                { icon: Wrench, text: 'Content Rewriter' },
                { icon: CheckCircle2, text: 'Privacy Policy Gen' },
                { icon: Zap, text: 'Priority support' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />{text}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current free plan */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-foreground text-sm">Free Plan</p>
                <p className="text-xs text-muted-foreground">5 scans/month · Basic overview only</p>
              </div>
              <span className="text-[10px] font-black bg-muted text-muted-foreground px-2 py-1 rounded-full">CURRENT</span>
            </div>

            {/* Pro upgrade card */}
            <div className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">MOST POPULAR</div>
              <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-black text-foreground">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">₹199/month · Cancel anytime</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5">
                {[
                  '200 scans per month',
                  'Full AI-powered reports',
                  'Prioritised fix list',
                  '30-day action plan',
                  'Article Deep Analyzer',
                  'Content Rewriter tool',
                  'Privacy Policy generator',
                  'SEO optimization tool',
                ].map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary flex-shrink-0" />{f}
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUpgrade}
                className="w-full gap-2 h-11 rounded-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25"
              >
                <Crown className="h-4 w-4" /> Upgrade to Pro — ₹199/month <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-[11px] text-muted-foreground mt-2">No hidden fees · Cancel anytime from billing</p>
            </div>
          </div>
        )}
      </Card>

      {/* ── Danger zone ── */}
      <Card className="p-6 border-red-200 dark:border-red-900/50 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-red-700 dark:text-red-400 text-sm">Danger Zone</p>
            <p className="text-xs text-muted-foreground">Irreversible actions</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all scan history. This action cannot be undone.
        </p>
        <Button variant="destructive" size="sm" className="rounded-xl gap-2">
          <Shield className="h-3.5 w-3.5" /> Delete Account
        </Button>
      </Card>

    </div>
  )
}
