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

  const handleUpgrade = () => {
    onClose()
    window.location.href = '/dashboard'
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
                {feature ? `Unlock ${feature}` : 'Get the Coaching Plan'}
              </h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                To access advanced AI features, you need an active Coaching Plan. Scan your website to get a personalized roadmap and unlock these tools.
              </p>
            </div>

            {/* CTA */}
            <Button
              className="w-full h-12 gap-2 text-base font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 rounded-xl mt-4"
              onClick={handleUpgrade}
            >
              <Crown className="h-5 w-5" /> Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
