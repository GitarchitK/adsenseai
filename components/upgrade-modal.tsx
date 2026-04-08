'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Crown, X, Zap, CheckCircle2, Sparkles, FileText,
  Search, BookOpen, Shield, TrendingUp,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'

interface UpgradeModalProps {
  open: boolean
  onClose: () => void
  /** Which feature triggered the modal — shown in the headline */
  feature?: string
  onSuccess?: () => void
}

const proFeatures = [
  { icon: Sparkles,  text: 'Full AI-powered scan reports' },
  { icon: BookOpen,  text: 'Article content analyzer' },
  { icon: FileText,  text: 'Privacy Policy generator' },
  { icon: TrendingUp, text: 'Content rewriting tool' },
  { icon: Search,    text: 'SEO optimization suggestions' },
  { icon: Shield,    text: 'Deep policy risk analysis' },
  { icon: Zap,       text: '200 scans every month' },
  { icon: CheckCircle2, text: 'Priority AdSense approval support' },
]

export function UpgradeModal({ open, onClose, feature, onSuccess }: UpgradeModalProps) {
  const { profile, token, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const handleUpgrade = async () => {
    setError('')
    setLoading(true)
    try {
      const t = await getToken()
      if (!t) { setError('Please sign in again.'); setLoading(false); return }

      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { Authorization: `Bearer ${t}` },
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('[UpgradeModal] Error response:', text)
        try {
          const errData = JSON.parse(text)
          setError(errData.error ?? `Error ${res.status}`)
        } catch {
          setError(`Server error (${res.status}). Please try again later.`)
        }
        setLoading(false)
        return
      }

      const order = await res.json()

      await openCheckout({
        key:         order.keyId,
        amount:      order.amount,
        currency:    order.currency,
        name:        'AdSenseAI',
        description: 'Pro Plan — ₹199/month · 200 scans · All AI tools',
        order_id:    order.orderId,
        handler: async (r: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({
              orderId:   r.razorpay_order_id,
              paymentId: r.razorpay_payment_id,
              signature: r.razorpay_signature,
              plan:      'pro',
            }),
          })
          if (verifyRes.ok) {
            onClose()
            onSuccess?.()
            // Reload to refresh plan state
            window.location.href = '/dashboard?upgraded=1'
          } else {
            setError('Payment verification failed. Contact support.')
          }
        },
        prefill:  { email: profile?.email ?? '' },
        theme:    { color: '#7c3aed' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      })
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error('[UpgradeModal]', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md bg-card rounded-3xl shadow-2xl border border-border/60 pointer-events-auto overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Gradient top bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-7">
            {/* Icon + headline */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 mb-4">
                <Crown className="h-8 w-8 text-violet-500" />
              </div>
              <h2 className="text-xl font-black text-foreground mb-1">
                {feature ? `Unlock ${feature}` : 'Stop AdSense Rejections'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                {feature 
                  ? `The ${feature} is a Pro-exclusive tool. Upgrade to unlock it plus 200 scans/month with AI on every scan.`
                  : 'Free plan gives you 5 scans/month with basic reports. Pro gives you 200 scans + full AI on every scan.'}
              </p>
            </div>

            {/* Feature list */}
            <div className="rounded-2xl bg-muted/40 border border-border/60 p-4 mb-5 space-y-2.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Everything in Pro
              </p>
              {proFeatures.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/15 flex-shrink-0">
                    <Icon className="h-3 w-3 text-violet-500" />
                  </div>
                  {text}
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="flex items-baseline justify-center gap-1 mb-5">
              <span className="text-4xl font-black text-foreground">₹199</span>
              <span className="text-muted-foreground text-sm">/month</span>
              <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                Cancel anytime
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 dark:text-red-400 text-center mb-3">{error}</p>
            )}

            {/* CTA */}
            <Button
              className="w-full h-12 gap-2 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 rounded-xl"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading
                ? <><div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" /> Processing...</>
                : <><Crown className="h-5 w-5" /> Upgrade to Pro — ₹199/mo</>}
            </Button>

            <p className="text-center text-xs text-muted-foreground mt-3">
              🔒 Secured by Razorpay · PCI-DSS compliant · No hidden fees
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
