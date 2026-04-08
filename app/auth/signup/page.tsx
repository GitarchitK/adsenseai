'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react'
import { signInWithGoogle } from '@/lib/auth'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setError('')
    setIsLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      const msg = (error as Error).message
      setError(
        msg.includes('popup-closed') ? 'Sign-up was cancelled.' :
        msg.includes('network') ? 'Network error. Please try again.' :
        'Google sign-up failed. Please try again.'
      )
      setIsLoading(false)
    } else {
      const returnUrl = searchParams.get('returnUrl')
      if (returnUrl) {
        router.push(`/dashboard?scan=${encodeURIComponent(returnUrl)}`)
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground mb-1">Create your account</h1>
        <p className="text-sm text-muted-foreground">Free to start — get your AdSense score in 30 seconds</p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Google CTA */}
      <Button
        className="w-full gap-3 text-[15px] font-semibold shadow-lg shadow-primary/20 rounded-xl"
        style={{ height: '52px' }}
        onClick={handleGoogle}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-5 w-5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
        ) : (
          <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {isLoading ? 'Creating account...' : 'Sign up with Google'}
      </Button>

      {/* Free plan */}
      <div className="rounded-2xl border border-border/60 bg-muted/30 p-5 space-y-3">
        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Free plan includes</p>
        {[
          '1 free site scan',
          'AdSense readiness score (0–100)',
          'Site structure & missing pages check',
          'Critical issues & warnings list',
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            {item}
          </div>
        ))}
        <div className="pt-2 border-t border-border/60 space-y-2">
          {['Full AI report (₹19 unlock)', 'Unlimited scans (₹199/mo Pro)'].map(item => (
            <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground/50">
              <Lock className="h-4 w-4 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs text-muted-foreground">Already have an account?</span>
        </div>
      </div>

      <Link href="/auth/login">
        <Button variant="outline" className="w-full h-11 gap-2 rounded-xl font-medium">
          Sign in instead <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

      <p className="text-center text-xs text-muted-foreground">
        By signing up you agree to our{' '}
        <span className="text-primary cursor-pointer hover:underline">Terms</span>
        {' '}and{' '}
        <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span>
      </p>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading...</div>}>
      <SignupForm />
    </Suspense>
  )
}
