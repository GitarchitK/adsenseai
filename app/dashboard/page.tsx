'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Zap, AlertCircle, Globe, Crown, Lock, ArrowRight,
  Clock, TrendingUp, BarChart3, Sparkles, CheckCircle2,
  FileText, Search, Brain, ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'

interface ScanRow {
  id: string
  websiteUrl: string
  domain: string
  finalScore: number | null
  statusLabel: string | null
  isAiUnlocked: boolean
  createdAt: string
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 80
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800/50'
    : score >= 60
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-amber-200 dark:ring-amber-800/50'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 ring-red-200 dark:ring-red-800/50'
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 text-sm font-black flex-shrink-0 ${cls}`}>
      {score}
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  const cls = label === 'High Chance'
    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
    : label === 'Moderate'
    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>{label}</span>
}

// ── Crawl Visualizer Component ──
function CrawlVisualizer({ url }: { url: string }) {
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const domain = url ? new URL(url).hostname : 'website'
  const steps = [
    { label: 'Initializing crawler engine...', duration: 1500 },
    { label: `Discovering site architecture for ${domain}...`, duration: 2000 },
    { label: 'Checking robots.txt and sitemap.xml...', duration: 2000 },
    { label: 'Found sitemap.xml. Extracting URLs...', duration: 1500 },
    { label: 'Starting parallel crawl of 15 pages...', duration: 8000 },
    { label: 'Analyzing content quality & readability...', duration: 5000 },
    { label: 'Checking AdSense policy compliance...', duration: 5000 },
    { label: 'Generating AI revenue roadmap...', duration: 5000 },
    { label: 'Finalizing report...', duration: 2000 },
  ]

  const paths = [
    '/privacy-policy', '/about-us', '/contact', '/terms-of-service',
    '/blog/how-to-monetize', '/category/finance', '/post/12345',
    '/sitemap.xml', '/robots.txt', '/archive/2024/04',
    '/category/news', '/blog/author-profile', '/disclaimer',
  ]

  useEffect(() => {
    let active = true
    let stepIdx = 0
    let totalTime = 0

    const runStep = async () => {
      if (!active || stepIdx >= steps.length) return
      
      const step = steps[stepIdx]
      setLogs(prev => [`> ${step.label}`, ...prev].slice(0, 10))
      setCurrentStep(stepIdx)
      
      // Simulate sub-logs for the crawl step
      if (stepIdx === 4) {
        let crawlCount = 0
        const interval = setInterval(() => {
          if (crawlCount >= 8) { clearInterval(interval); return }
          const path = paths[Math.floor(Math.random() * paths.length)]
          setLogs(prev => [`> Crawling: ${path} ... [OK]`, ...prev].slice(0, 10))
          crawlCount++
        }, 800)
      }

      await new Promise(r => setTimeout(r, step.duration))
      stepIdx++
      totalTime += step.duration
      setProgress(Math.min((stepIdx / steps.length) * 100, 95))
      runStep()
    }

    runStep()
    return () => { active = false }
  }, [url])

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
          <span className="text-primary flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            Live Crawl Progress
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-violet-500 to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] leading-relaxed shadow-inner border border-white/5">
        <div className="flex flex-col-reverse gap-1 h-32 overflow-hidden">
          {logs.map((log, i) => (
            <div key={i} className={`${i === 0 ? 'text-emerald-400' : 'text-slate-400'} flex items-start gap-2`}>
              <span className="text-slate-600 shrink-0">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-violet-500/5 border border-violet-500/10">
        <Sparkles className="h-5 w-5 text-violet-500 animate-pulse flex-shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          Our AI is currently performing a deep-scan of your site's architecture and content. 
          <span className="font-bold text-foreground"> This usually takes 20-30 seconds.</span>
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, usage, token, isLoading, isPro, canScan, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [urlError, setUrlError] = useState('')
  const [recentScans, setRecentScans] = useState<ScanRow[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const [upgraded, setUpgraded] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') setUpgraded(true)
    const scanUrl = searchParams.get('scan')
    if (scanUrl && !isScanning) {
      setUrl(decodeURIComponent(scanUrl))
    }
  }, [searchParams, isScanning])

  // Auto-start scan if URL is provided in params
  useEffect(() => {
    const scanUrl = searchParams.get('scan')
    if (scanUrl && canScan && token && !isScanning && url === decodeURIComponent(scanUrl)) {
      // Small delay to ensure everything is loaded
      const timer = setTimeout(() => {
        handleScan({ preventDefault: () => {} } as React.FormEvent)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [searchParams, canScan, token, url])

  useEffect(() => {
    if (!token) return
    getToken().then(t => {
      if (!t) return
      fetch('/api/scans?limit=5', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.json())
        .then(d => setRecentScans(d.scans ?? []))
        .catch(() => {})
        .finally(() => setScansLoading(false))
    })
  }, [token, getToken])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setUrlError('')
    try { new URL(url) } catch { setUrlError('Please enter a valid URL including https://'); return }
    if (!canScan) { setUrlError('Scan limit reached. Upgrade to Pro for 200 scans/month.'); return }

    setIsScanning(true)
    try {
      const t = await getToken()
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setUrlError(data.upgrade_required ? 'Scan limit reached. Upgrade to Pro.' : (data.error ?? 'Scan failed.'))
        setIsScanning(false)
        return
      }
      sessionStorage.setItem('lastCrawlData', JSON.stringify(data))
      router.push('/dashboard/results')
    } catch {
      setUrlError('Network error. Please try again.')
      setIsScanning(false)
    }
  }

  const handleProUpgrade = async () => {
    const t = await getToken()
    if (!t) return
    const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
    const order = await res.json()
    if (!order.orderId) return

    await openCheckout({
      key: order.keyId, amount: order.amount, currency: order.currency,
      name: 'AdSenseAI', description: 'Pro Plan — ₹199/month', order_id: order.orderId,
      handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
          body: JSON.stringify({ orderId: r.razorpay_order_id, paymentId: r.razorpay_payment_id, signature: r.razorpay_signature, plan: 'pro' }),
        })
        window.location.href = '/dashboard?upgraded=1'
      },
      prefill: { email: profile?.email ?? '' },
      theme: { color: '#7c3aed' },
    })
  }

  if (isLoading) return null // AuthGuard handles the loading screen

  const firstName = profile?.fullName?.split(' ')[0]
  const monthUsed = usage?.scans_this_month ?? 0
  const monthLimit = usage?.scans_limit ?? 1
  const usagePct = Math.min((monthUsed / monthLimit) * 100, 100)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-5xl space-y-7">

        {/* ── Upgrade success banner ── */}
        {upgraded && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 px-5 py-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 text-sm">Welcome to Pro! 🎉</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Your plan has been upgraded. Enjoy 200 scans/month with full AI reports.</p>
            </div>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-foreground">
              {firstName ? `Hey ${firstName} 👋` : 'Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isPro ? '✦ Pro Plan · 200 scans/month with AI' : 'Free Plan · 5 scans/month'}
            </p>
          </div>
          {!isPro && (
            <Button
              onClick={handleProUpgrade}
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 rounded-xl"
            >
              <Crown className="h-4 w-4" /> Upgrade to Pro — ₹199/mo
            </Button>
          )}
          {isPro && (
            <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold px-3 py-1.5">
              <Crown className="h-3.5 w-3.5" /> Pro Active
            </div>
          )}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: BarChart3,  label: 'Total Scans',   value: usage?.total_scans ?? 0,  color: 'text-violet-500', bg: 'bg-violet-500/10' },
            { icon: Zap,        label: 'This Month',    value: `${monthUsed} / ${isPro ? '200' : '5'}`, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { icon: TrendingUp, label: 'Plan',          value: isPro ? 'Pro ✦' : 'Free', color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { icon: Sparkles,   label: 'AI Reports',    value: isPro ? 'Auto' : '₹19/scan', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <Card key={label} className="p-4 border-border/60 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} flex-shrink-0`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-sm font-bold text-foreground truncate">{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Usage bar (free only) ── */}
        {!isPro && (
          <Card className="p-4 border-border/60 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">Monthly Scan Usage</p>
              <p className="text-xs text-muted-foreground font-mono">{monthUsed} / {monthLimit}</p>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${usagePct >= 100 ? 'bg-red-500' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}`}
                style={{ width: `${usagePct}%` }}
              />
            </div>
            {usagePct >= 100 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Limit reached.
                <button onClick={handleProUpgrade} className="underline font-semibold">Upgrade to Pro</button> for 200 scans/month.
              </p>
            )}
          </Card>
        )}

        {/* ── Scan card ── */}
        <Card className="overflow-hidden border-border/60 rounded-2xl shadow-xl shadow-primary/5">
          <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
          <div className="p-7">
            {!isScanning ? (
              <>
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">Analyze a Website</h2>
                    <p className="text-sm text-muted-foreground">Enter any URL — get your AdSense readiness score in 30 seconds</p>
                  </div>
                </div>

                <form onSubmit={handleScan} className="space-y-3">
                  {urlError && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                      <span>{urlError}</span>
                      {urlError.includes('limit') && (
                        <button type="button" onClick={handleProUpgrade} className="ml-auto text-xs font-bold underline flex-shrink-0">Upgrade</button>
                      )}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="https://yourwebsite.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScanning || !canScan}
                        className="pl-10 h-12 text-base bg-muted/30 border-border/80 focus:bg-background transition-colors rounded-xl"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isScanning || !canScan || !url} 
                      className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                      Scan Site
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    By scanning, you agree to our Terms of Service. AI reports require Pro or ₹19 unlock.
                  </p>
                </form>

                {/* What you get after scan */}
                <div className="mt-6 pt-6 border-t border-border/60">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">What you get</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { icon: BarChart3, text: 'AdSense readiness score (0–100)', free: true },
                      { icon: CheckCircle2, text: 'Site structure & missing pages', free: true },
                      { icon: AlertCircle, text: 'Critical issues & warnings', free: true },
                      { icon: Brain, text: 'Full AI report', free: false, price: '₹19 unlock' },
                      { icon: Search, text: 'Prioritized fix suggestions', free: false, price: '₹19 unlock' },
                      { icon: FileText, text: 'Privacy Policy generator', free: false, price: 'Pro only' },
                    ].map(({ icon: Icon, text, free, price }) => (
                      <div key={text} className={`flex items-center gap-2.5 text-sm ${free ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                        {free
                          ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          : <Lock className="h-4 w-4 flex-shrink-0" />}
                        <span>{text}</span>
                        {!free && price && (
                          <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">{price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Search className="h-5 w-5 text-primary animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-foreground">Analyzing {new URL(url).hostname}</h2>
                      <p className="text-xs text-muted-foreground">This may take up to 60 seconds. Do not refresh.</p>
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
                
                <CrawlVisualizer url={url} />
              </div>
            )}
          </div>
        </Card>

        {/* ── Pro upsell (free users) ── */}
        {!isPro && (
          <Card className="p-6 border-border/60 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800/50">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/15 flex-shrink-0">
                  <Crown className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Upgrade to Pro — ₹199/month</h3>
                  <p className="text-sm text-muted-foreground mb-3">200 scans/month · AI on every scan · All tools unlocked</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {['200 scans/month', 'AI reports included', 'Content rewriting', 'Privacy Policy generator'].map(f => (
                      <span key={f} className="text-xs text-violet-700 dark:text-violet-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleProUpgrade}
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 rounded-xl flex-shrink-0"
              >
                <Crown className="h-4 w-4" /> Upgrade Now
              </Button>
            </div>
          </Card>
        )}

        {/* ── Features & Extension ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border/60 rounded-2xl bg-card group cursor-pointer hover:border-primary/40 transition-colors">
            <Link href="/dashboard/ai-tools" className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-violet-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">AI Content Tools</h3>
                  <span className="text-[10px] font-bold text-violet-600 bg-violet-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Included</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rewrite articles, generate privacy policies, and fix content issues in one click.
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-primary">
                  Explore Tools <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </Card>

          <Card className="p-6 border-border/60 rounded-2xl bg-card group cursor-pointer hover:border-primary/40 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <Link href="/dashboard/extension" className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground">Policy Shield Extension</h3>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">New</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Real-time policy protection as you browse. Get flagged for thin content instantly.
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-xs font-bold text-primary">
                  Install Extension <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </Card>
        </div>

        {/* ── Recent scans ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Recent Scans</h2>
            <Link href="/dashboard/scans">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {scansLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-[72px] rounded-2xl bg-muted/50 animate-pulse" />)}
            </div>
          ) : recentScans.length === 0 ? (
            <Card className="p-12 text-center border-dashed border-border/60 rounded-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
                <Globe className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mb-1">No scans yet</p>
              <p className="text-sm text-muted-foreground">Enter a URL above to run your first analysis</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
                  <Card className="p-4 border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted flex-shrink-0">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-foreground truncate">{scan.domain || scan.websiteUrl}</p>
                          {scan.isAiUnlocked && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">AI</span>
                          )}
                          {scan.statusLabel && <StatusBadge label={scan.statusLabel} />}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {scan.finalScore !== null && <ScoreBadge score={scan.finalScore} />}
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { href: '/dashboard/scans',    icon: BarChart3,  title: 'All Scans',         desc: 'View your complete scan history' },
            { href: '/dashboard/ai-tools', icon: Sparkles,   title: 'AI Tools',          desc: isPro ? 'Content rewriting & more' : 'Unlock with Pro' },
            { href: '/pricing',            icon: Crown,      title: 'Pricing',           desc: 'View plans & upgrade' },
          ].map(({ href, icon: Icon, title, desc }) => (
            <Link key={href} href={href}>
              <Card className="p-4 border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{title}</p>
                    <p className="text-xs text-muted-foreground truncate">{desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
