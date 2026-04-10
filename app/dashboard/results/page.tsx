'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, AlertTriangle,
  ShieldCheck, Search, Sparkles, UserCheck, FileText, Lightbulb,
  Globe, Lock, Zap, Calendar, TrendingUp, BarChart3,
  BookOpen, Clock, Eye, Link2, Brain, Target, DollarSign, Copy, CheckCheck,
} from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
import type { CrawlResponse } from '@/types'
import type { ScoreBreakdown } from '@/lib/scores'
import type { AIReport, FixSuggestion } from '@/services/ai-report'

interface CrawlResult extends CrawlResponse {
  scores?: ScoreBreakdown
  ai_report?: AIReport
  scan_id?: string
  plan?: string
  crawl_data?: CrawlResponse | null
  isAiUnlocked?: boolean
}

// ── Colour helpers ────────────────────────────────────────────────────────────
const sc = (s: number) =>
  s >= 80 ? 'text-emerald-600 dark:text-emerald-400'
  : s >= 60 ? 'text-amber-600 dark:text-amber-400'
  : 'text-red-600 dark:text-red-400'

const bc = (s: number) =>
  s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500'

const imp = (i: FixSuggestion['impact']) =>
  i === 'high'   ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  : i === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  : 'bg-muted text-muted-foreground'

const catIcon = (c: FixSuggestion['category']) => {
  const cls = 'h-4 w-4'
  switch (c) {
    case 'Content': return <FileText className={cls} />
    case 'Policy':  return <ShieldCheck className={cls} />
    case 'SEO':     return <Search className={cls} />
    case 'UX':      return <UserCheck className={cls} />
    case 'Trust':   return <CheckCircle2 className={cls} />
  }
}

// ── Article count (mirrors crawler logic) ─────────────────────────────────────
function countArticles(pages: CrawlResult['pages']): number {
  const excluded = ['/category/','/tag/','/author/','/page/','/search','/wp-admin',
    '/login','/signup','/account','/dashboard','/privacy','/about','/contact','/terms','/policy','/feed','/sitemap']
  const signals = [/\d{4}\/\d{2}\/\d{2}/,/\d{4}\/\d{2}\//,/\/blog\//,/\/news\//,/\/article\//,/\/post\//,/\/stories\//]
  return pages.filter(p => {
    try {
      const path = new URL(p.url).pathname.toLowerCase()
      if (path === '/' || excluded.some(e => path.includes(e))) return false
      if (signals.some(r => r.test(path))) return true
      const segs = path.split('/').filter(Boolean)
      return p.word_count >= 250 && segs.length >= 2 && (segs[segs.length - 1] ?? '').includes('-')
    } catch { return p.word_count >= 300 }
  }).length
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score, status }: { score: number; status: string }) {
  const r = 52, circ = 2 * Math.PI * r, offset = circ - (score / 100) * circ
  const stroke = status === 'high' ? '#10b981' : status === 'moderate' ? '#f59e0b' : '#ef4444'
  return (
    <div className="relative flex items-center justify-center w-36 h-36 flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/25" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={stroke} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
      </svg>
      <div className="text-center z-10">
        <span className={`text-4xl font-bold tabular-nums ${sc(score)}`}>{score}</span>
        <span className="block text-[11px] text-muted-foreground font-medium mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

function WeightBar({ label, score, weight, plain }: { label: string; score: number; weight: string; plain?: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 flex-shrink-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{weight}</p>
      </div>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bc(score)}`} style={{ width: `${score}%` }} />
      </div>
      <div className="text-right flex-shrink-0 w-16">
        <span className={`text-sm font-bold font-mono tabular-nums ${sc(score)}`}>{score}</span>
        {plain && <p className="text-[9px] text-muted-foreground leading-tight">{plain}</p>}
      </div>
    </div>
  )
}

function StatPill({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-muted/40 border border-border/50">
      <div className="text-primary flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-black text-foreground tabular-nums">{value}{sub && <span className="text-xs font-normal text-muted-foreground ml-1">{sub}</span>}</p>
      </div>
    </div>
  )
}

function IssueRow({ text, type }: { text: string; type: 'critical' | 'warning' | 'info' }) {
  const cfg = {
    critical: { icon: <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />, bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40' },
    warning:  { icon: <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />, bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40' },
    info:     { icon: <Lightbulb className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />, bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40' },
  }[type]
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg}`}>
      {cfg.icon}
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResultsPage() {
  const { isPro, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [data, setData] = useState<CrawlResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [aiReport, setAiReport] = useState<AIReport | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'plan' | 'pages'>('overview')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('lastCrawlData')
      if (s) {
        const parsed = JSON.parse(s) as CrawlResult
        setData(parsed)
        if (parsed.ai_report) setAiReport(parsed.ai_report)
      } else {
        setError('No scan data found. Please run a scan first.')
      }
    } catch { setError('Failed to load results.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if ((isPro || data?.isAiUnlocked) && data && !aiReport && !isUnlocking) handleUnlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPro, data, aiReport])

  const handleUnlock = async () => {
    setUnlockError('')
    setIsUnlocking(true)
    try {
      const t = await getToken()
      if (!t) { setUnlockError('Please sign in again.'); setIsUnlocking(false); return }
      const scanId = data?.scan_id ?? 'temp_' + Date.now()

      if (isPro) {
        const res = await fetch('/api/razorpay/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
          body: JSON.stringify({ action: 'pro_unlock', scanId, crawlData: data?.crawl_data ?? data }),
        })
        if (res.ok) {
          const result = await res.json()
          if (result.ai_report) {
            setAiReport(result.ai_report)
            sessionStorage.setItem('lastCrawlData', JSON.stringify({ ...data, ai_report: result.ai_report }))
          }
        } else {
          const err = await res.json().catch(() => ({}))
          setUnlockError(err.error ?? 'Failed to generate report.')
        }
        setIsUnlocking(false)
        return
      }

      const orderRes = await fetch('/api/razorpay/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ action: 'create_order_direct', scanId }),
      })
      if (!orderRes.ok) {
        const err = await orderRes.json().catch(() => ({}))
        setUnlockError(err.error ?? 'Server error. Please try again.')
        setIsUnlocking(false)
        return
      }
      const order = await orderRes.json()
      if (!order.orderId) { setUnlockError('Could not create payment order.'); setIsUnlocking(false); return }

      await openCheckout({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'AdSenseAI', description: 'Full AI Report — One-time ₹19', order_id: order.orderId,
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          try {
            // Build a clean CrawlResponse — strip non-crawl fields before sending
            const crawlPayload = data?.crawl_data ?? data
            const verifyRes = await fetch('/api/razorpay/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
              body: JSON.stringify({
                action:    'verify',
                scanId:    data?.scan_id ?? scanId,
                orderId:   r.razorpay_order_id,
                paymentId: r.razorpay_payment_id,
                signature: r.razorpay_signature,
                crawlData: crawlPayload,
              }),
            })
            const result = await verifyRes.json()
            if (verifyRes.ok && result.ai_report) {
              setAiReport(result.ai_report)
              sessionStorage.setItem('lastCrawlData', JSON.stringify({ ...data, ai_report: result.ai_report, isAiUnlocked: true }))
            } else {
              const msg = result.error ?? 'Report generation failed after payment. Contact support.'
              setUnlockError(msg)
              console.error('[Verify]', result)
            }
          } catch (err) {
            console.error('[Verify handler]', err)
            setUnlockError('Payment succeeded but report failed. Contact support.')
          } finally {
            setIsUnlocking(false)
          }
        },
        prefill: {}, theme: { color: '#7c3aed' },
        modal: { ondismiss: () => setIsUnlocking(false) },
      })
      // Don't set isUnlocking false here — handler does it
      return
    } catch (err) {
      console.error('[Unlock]', err)
      setUnlockError('Something went wrong. Please try again.')
      setIsUnlocking(false)
    }
  }

  const handleUpgrade = async () => {
    const t = await getToken()
    if (!t) return
    const res = await fetch('/api/razorpay/order', { method: 'POST', headers: { Authorization: `Bearer ${t}` } })
    const order = await res.json()
    if (!order.orderId) return
    await openCheckout({
      key: order.keyId, amount: order.amount, currency: order.currency,
      name: 'AdSenseAI', description: 'Pro Plan — ₹199/month', order_id: order.orderId,
      handler: async () => { window.location.href = '/dashboard?upgraded=1' },
      prefill: {}, theme: { color: '#7c3aed' },
    })
  }

  const copyChecklist = (fixes: AIReport['fix_suggestions']) => {
    const text = fixes.map((f, i) => `${i + 1}. [${f.impact.toUpperCase()}] ${f.title}\n   ${f.description}`).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading results...</p>
      </div>
    </div>
  )

  if (error || !data) return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <Link href="/dashboard"><Button variant="ghost" className="gap-2 mb-4"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <Card className="p-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/30">
        <div className="flex gap-3"><AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" /><p className="text-red-800 dark:text-red-300">{error}</p></div>
      </Card>
    </div>
  )

  const det = data.scores
  const ai  = aiReport
  const finalScore   = ai?.final_score   ?? det?.final_score   ?? 0
  const status       = ai?.status        ?? det?.status        ?? 'low'
  const statusLabel  = ai?.status_label  ?? det?.status_label  ?? 'Low'
  const qualityScore = ai?.quality_score ?? det?.quality_score ?? 0
  const policyScore  = ai?.policy_score  ?? det?.policy_score  ?? 0
  const seoScore     = ai?.seo_score     ?? det?.seo_score     ?? 0
  const uxScore      = ai?.ux_score      ?? det?.ux_score      ?? 0
  const trustScore   = ai?.trust_score   ?? det?.trust_score   ?? 0
  const missingPages = det?.missing_pages ?? []
  const isAiUnlocked = !!ai || !!data.isAiUnlocked
  // Scores before unlock are structural estimates from crawl data (word count, H1s, meta, required pages)
  // Scores after unlock are AI-analyzed (content quality, policy compliance, originality, etc.)
  const scoresAreEstimates = !isAiUnlocked
  const articleCount = countArticles(data.pages)
  const avgWords     = data.pages.length ? Math.round(data.pages.reduce((s, p) => s + p.word_count, 0) / data.pages.length) : 0
  const crawlSecs    = (data.crawl_time_ms / 1000).toFixed(1)

  const tabs = [
    { id: 'overview', label: 'Overview',    icon: BarChart3   },
    { id: 'issues',   label: 'Fix List',    icon: AlertCircle },
    { id: 'plan',     label: 'Action Plan', icon: Calendar    },
    { id: 'pages',    label: 'Pages',       icon: FileText    },
  ] as const

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
              <Globe className="h-6 w-6 text-primary flex-shrink-0" />
              {data.domain}
            </h1>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              Scanned {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              <span className="mx-1">·</span>
              <span>{crawlSecs}s crawl time</span>
            </p>
          </div>
          <div className="flex-shrink-0">
            {isAiUnlocked ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-black uppercase tracking-widest border border-violet-200 dark:border-violet-800/50">
                <Sparkles className="h-4 w-4" /> AI Report Active
              </div>
            ) : isPro ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-muted text-muted-foreground text-xs font-black uppercase tracking-widest border border-border/60">
                <div className="h-3.5 w-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                Generating Report...
              </div>
            ) : (
              <Button onClick={handleUnlock} disabled={isUnlocking} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 rounded-xl px-5">
                {isUnlocking ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Lock className="h-4 w-4" />}
                Unlock Full AI Report — ₹19
              </Button>
            )}
            {unlockError && <p className="text-xs text-red-500 mt-2 text-right">{unlockError}</p>}
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatPill icon={<FileText className="h-4 w-4" />} label="Pages Crawled" value={data.total_pages} sub={data.sitemap_total && data.sitemap_total > data.total_pages ? `of ${data.sitemap_total} found` : undefined} />
          <StatPill icon={<BookOpen className="h-4 w-4" />} label="Articles Found" value={articleCount} sub={articleCount >= 25 ? '✓ Good' : `/ 25 needed`} />
          <StatPill icon={<Eye className="h-4 w-4" />}      label="Avg Word Count" value={avgWords} sub="words" />
          <StatPill icon={<Target className="h-4 w-4" />}   label="Readiness Score" value={`${finalScore}/100`} />
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-2xl border border-border/40 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 justify-center ${
                activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW TAB                                                       */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">

            {/* Score card — always shown */}
            <Card className="p-6 md:p-8 border-border/60 rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <ScoreRing score={finalScore} status={status} />
                  <div className="text-center sm:text-left space-y-2">
                    <p className={`text-xs font-black uppercase tracking-[0.2em] ${sc(finalScore)}`}>AdSense Readiness</p>
                    <h2 className="text-2xl font-black text-foreground">{statusLabel}</h2>
                    {isAiUnlocked && ai ? (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{ai.content.summary}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                        {finalScore >= 80 ? "Strong site — ready to apply for AdSense."
                          : finalScore >= 60 ? "Potential detected. Fix key issues before applying."
                          : "Significant issues found. AdSense will likely reject in current state."}
                      </p>
                    )}
                    {scoresAreEstimates && (
                      <div className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                        <AlertTriangle className="h-3 w-3" /> Structural estimate — unlock AI for full analysis
                      </div>
                    )}
                    {isAiUnlocked && ai && (
                      <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full ${
                        ai.adsense_ready ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'}`}>
                        {ai.adsense_ready ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                        {ai.adsense_ready ? 'AdSense Ready' : 'Fix Recommended'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-4 bg-muted/20 p-5 rounded-2xl border border-border/40">
                  {scoresAreEstimates && (
                    <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">Based on site structure only. Unlock AI for content & policy scores.</p>
                  )}
                  <WeightBar label="Content Quality"   score={qualityScore} weight="35% weight" plain={qualityScore >= 80 ? 'Great writing' : qualityScore >= 60 ? 'Needs work' : 'Too thin/generic'} />
                  <WeightBar label="Policy Compliance" score={policyScore}  weight="30% weight" plain={policyScore >= 80 ? 'No violations' : policyScore >= 60 ? 'Minor issues' : 'Violations found'} />
                  <WeightBar label="SEO Performance"   score={seoScore}     weight="15% weight" plain={seoScore >= 80 ? 'Well optimised' : seoScore >= 60 ? 'Partially done' : 'Missing basics'} />
                  <WeightBar label="User Experience"   score={uxScore}      weight="10% weight" plain={uxScore >= 80 ? 'Easy to use' : uxScore >= 60 ? 'Some friction' : 'Hard to navigate'} />
                  <WeightBar label="Trust Signals"     score={trustScore}   weight="10% weight" plain={trustScore >= 80 ? 'Looks legit' : trustScore >= 60 ? 'Needs pages' : 'Missing pages'} />
                </div>
              </div>
            </Card>

            {/* When to Apply — always shown, richer when unlocked */}
            <Card className={`p-5 rounded-2xl border-2 ${
              isAiUnlocked && ai
                ? ai.adsense_ready ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
                : finalScore >= 70 ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20'
            }`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1">
                  <Zap className={`h-5 w-5 flex-shrink-0 mt-0.5 ${finalScore >= 70 ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <div>
                    <p className="font-bold text-foreground text-sm mb-1">When to Apply</p>
                    <p className="text-sm text-foreground font-semibold">
                      {isAiUnlocked && ai ? ai.application_timeline
                        : finalScore >= 80 ? 'Your site looks ready — apply to AdSense now.'
                        : finalScore >= 65 ? 'Apply in 1–2 weeks after fixing the issues below.'
                        : finalScore >= 50 ? 'Apply in 3–4 weeks after improving content and fixing policy issues.'
                        : 'Wait 6–8 weeks — significant work needed before applying.'}
                    </p>
                    {isAiUnlocked && ai?.application_timeline_reason && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ai.application_timeline_reason}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setActiveTab('plan')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1 flex-shrink-0">
                  View Plan <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </Card>

            {/* Mandatory Pages Checklist */}
            {data.site_structure && (
              <Card className="p-5 border-border/60 rounded-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Compliance Checklist</p>
                    <p className="text-xs text-muted-foreground">Mandatory pages required for AdSense approval</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Privacy',     found: data.site_structure.has_privacy },
                    { label: 'Terms',       found: data.site_structure.has_terms },
                    { label: 'Disclaimer',  found: data.site_structure.has_disclaimer },
                    { label: 'About Us',    found: data.site_structure.has_about },
                    { label: 'Contact Us',  found: data.site_structure.has_contact },
                  ].map((p) => (
                    <div key={p.label} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-bold transition-colors ${
                      p.found 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400'
                    }`}>
                      {p.found ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                      {p.label}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Issues — always shown, richer when unlocked */}
            <Card className="p-5 border-border/60 rounded-2xl">
              <p className="text-xs font-black uppercase tracking-widest text-foreground mb-3 flex items-center gap-2">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                {isAiUnlocked && ai && ai.top_issues.length > 0 ? 'Top Issues Found' : 'Quick Wins — Fix These First'}
              </p>
              <div className="space-y-2">
                {isAiUnlocked && ai && ai.top_issues.length > 0 ? (
                  ai.top_issues.map((issue, i) => <IssueRow key={i} text={issue} type="critical" />)
                ) : (
                  (() => {
                    const wins: { text: string; type: 'critical' | 'warning' | 'info' }[] = []
                    if (!data.site_structure?.has_privacy)    wins.push({ text: 'Add a Privacy Policy page — required for AdSense approval', type: 'critical' })
                    if (!data.site_structure?.has_about)      wins.push({ text: 'Add an About Us page — builds trust with Google reviewers', type: 'critical' })
                    if (!data.site_structure?.has_contact)    wins.push({ text: 'Add a Contact page — AdSense requires a way to reach you', type: 'critical' })
                    if (!data.site_structure?.has_terms)      wins.push({ text: 'Add a Terms of Service page — shows site legitimacy', type: 'warning' })
                    if (!data.site_structure?.has_disclaimer) wins.push({ text: 'Add a Disclaimer page — important for finance/health niches', type: 'warning' })
                    const noH1 = data.pages.filter(p => p.headings.h1.length === 0).length
                    if (noH1 > 0) wins.push({ text: `${noH1} page${noH1 > 1 ? 's' : ''} missing H1 tags — add a clear heading to each`, type: 'warning' })
                    const noMeta = data.pages.filter(p => !p.meta_description).length
                    if (noMeta > 0) wins.push({ text: `${noMeta} page${noMeta > 1 ? 's' : ''} missing meta descriptions`, type: 'warning' })
                    const thin = data.pages.filter(p => p.word_count < 300 && p.word_count > 0).length
                    if (thin > 0) wins.push({ text: `${thin} page${thin > 1 ? 's' : ''} under 300 words — expand to 600+ words`, type: 'warning' })
                    if (articleCount < 15) wins.push({ text: `Only ${articleCount} articles — publish at least 25 before applying`, type: 'critical' })
                    if (wins.length === 0) wins.push({ text: 'Basic structure looks good! Unlock the AI report for deep content & policy analysis.', type: 'info' })
                    return wins.slice(0, 6).map((w, i) => <IssueRow key={i} text={w.text} type={w.type} />)
                  })()
                )}
              </div>
            </Card>

            {/* Domain Age Alert */}
            {data.site_structure?.domain_age_years !== undefined && data.site_structure.domain_age_years < 0.5 && (
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">New Domain Detected ({data.site_structure.domain_age_years} years)</p>
                    <p className="text-xs text-muted-foreground">AdSense often prefers sites at least 6 months old. Focus on building content while your domain matures.</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Article count */}
            {(() => {
              const target = 25
              const pct = Math.min(100, Math.round((articleCount / target) * 100))
              const st = articleCount >= 30 ? 'good' : articleCount >= 25 ? 'ok' : articleCount >= 15 ? 'warn' : 'low'
              const col = {
                good: { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/50' },
                ok:   { bar: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/50' },
                warn: { bar: 'bg-amber-500',   text: 'text-amber-600 dark:text-amber-400',     badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',         border: 'border-amber-200 dark:border-amber-800/50' },
                low:  { bar: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',         badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',                 border: 'border-red-200 dark:border-red-800/50' },
              }[st]
              const lbl = articleCount >= 30 ? 'Great — threshold met' : articleCount >= 25 ? 'Good — minimum reached' : articleCount >= 15 ? 'Getting there' : 'Too few articles'
              return (
                <Card className={`p-5 rounded-2xl border ${col.border}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><BookOpen className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-sm text-foreground">Article Count</p>
                        <p className="text-xs text-muted-foreground">AdSense recommends 25–30 minimum</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-black tabular-nums ${col.text}`}>{articleCount}</span>
                      <span className="text-xs text-muted-foreground"> / {target}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden mb-3">
                    <div className={`h-full rounded-full transition-all duration-700 ${col.bar}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${col.badge}`}>{lbl}</span>
                    {articleCount < target && (
                      <span className="text-[11px] text-muted-foreground">Publish <span className="font-black text-foreground">{target - articleCount} more</span> to hit target</span>
                    )}
                  </div>
                </Card>
              )
            })()}

            {/* Category cards — always shown, richer when unlocked */}
            <div className="grid md:grid-cols-3 gap-4">              {/* Content Quality */}
              <Card className="p-5 border-border/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><FileText className="h-4 w-4" /></div>
                    <p className="font-semibold text-sm">Content Quality</p>
                  </div>
                  <span className={`text-xl font-black tabular-nums ${sc(qualityScore)}`}>{qualityScore}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${bc(qualityScore)}`} style={{ width: `${qualityScore}%` }} />
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {isAiUnlocked && ai ? <>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bc(ai.content.originality_score)}`} />Originality: {ai.content.originality_score}/100</li>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bc(ai.content.readability_score)}`} />Readability: {ai.content.readability_score}/100</li>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ai.content.spam_score > 50 ? 'bg-red-500' : 'bg-emerald-500'}`} />Spam score: {ai.content.spam_score}/100</li>
                  </> : <>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />Avg {avgWords} words/page</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />{articleCount} articles detected</li>
                  </>}
                </ul>
              </Card>

              {/* Policy */}
              <Card className="p-5 border-border/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck className="h-4 w-4" /></div>
                    <p className="font-semibold text-sm">Policy Guard</p>
                  </div>
                  <span className={`text-xl font-black tabular-nums ${sc(policyScore)}`}>{policyScore}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${bc(policyScore)}`} style={{ width: `${policyScore}%` }} />
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {isAiUnlocked && ai ? <>
                    <li className="flex items-center gap-2">{ai.policy.adult_content ? <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}{ai.policy.adult_content ? 'Adult content detected' : 'No adult content'}</li>
                    <li className="flex items-center gap-2">{ai.policy.copyright_risk ? <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" /> : <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" />}{ai.policy.copyright_risk ? 'Copyright risk found' : 'Low copyright risk'}</li>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${ai.policy.violations.length > 0 ? 'bg-red-500' : 'bg-emerald-500'}`} />{ai.policy.violations.length} violation{ai.policy.violations.length !== 1 ? 's' : ''} found</li>
                  </> : <>
                    <li className="flex items-center gap-2">{missingPages.length === 0 ? <CheckCircle2 className="h-3 w-3 text-emerald-500 flex-shrink-0" /> : <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />}{missingPages.length === 0 ? 'All required pages present' : `${missingPages.length} page(s) missing`}</li>
                  </>}
                </ul>
              </Card>

              {/* SEO */}
              <Card className="p-5 border-border/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Search className="h-4 w-4" /></div>
                    <p className="font-semibold text-sm">SEO & Authority</p>
                  </div>
                  <span className={`text-xl font-black tabular-nums ${sc(seoScore)}`}>{seoScore}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${bc(seoScore)}`} style={{ width: `${seoScore}%` }} />
                </div>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {isAiUnlocked && ai ? <>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bc(ai.seo_authority.topical_authority_score)}`} />Topical authority: {ai.seo_authority.topical_authority_score}/100</li>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bc(ai.seo_authority.semantic_coverage_score)}`} />Semantic coverage: {ai.seo_authority.semantic_coverage_score}/100</li>
                    <li className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bc(ai.technical_health.structural_integrity)}`} />Technical health: {ai.technical_health.structural_integrity}/100</li>
                  </> : <>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />{data.pages.filter(p => p.meta_description).length}/{data.total_pages} pages have meta</li>
                    <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 flex-shrink-0" />{data.pages.filter(p => p.headings.h1.length > 0).length}/{data.total_pages} pages have H1</li>
                  </>}
                </ul>
              </Card>
            </div>

            {/* E-E-A-T + Monetization (AI only) */}
            {isAiUnlocked && ai && (
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-5 border-border/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Brain className="h-4 w-4 text-violet-500" />
                    <p className="font-semibold text-sm text-foreground">E-E-A-T Score</p>
                    <span className={`ml-auto text-lg font-black tabular-nums ${sc(ai.eeat.overall_eeat_score)}`}>{ai.eeat.overall_eeat_score}/100</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${bc(ai.eeat.overall_eeat_score)}`} style={{ width: `${ai.eeat.overall_eeat_score}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ai.eeat.summary}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { label: 'Experience', val: ai.eeat.experience_score },
                      { label: 'Expertise',  val: ai.eeat.expertise_score },
                      { label: 'Authority',  val: ai.eeat.authoritativeness_score },
                      { label: 'Trust',      val: ai.eeat.trustworthiness_score },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-1.5">
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                        <span className={`text-xs font-black tabular-nums ${sc(val)}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 border-border/60 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <p className="font-semibold text-sm text-foreground">Monetization Potential</p>
                    <span className={`ml-auto text-lg font-black ${
                      ai.monetization.revenue_potential === 'High' ? 'text-emerald-600 dark:text-emerald-400'
                      : ai.monetization.revenue_potential === 'Medium' ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                    }`}>{ai.monetization.revenue_potential}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${
                      ai.monetization.revenue_potential === 'High' ? 'bg-emerald-500'
                      : ai.monetization.revenue_potential === 'Medium' ? 'bg-amber-500'
                      : 'bg-red-500'
                    }`} style={{ width: ai.monetization.revenue_potential === 'High' ? '85%' : ai.monetization.revenue_potential === 'Medium' ? '55%' : '25%' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Revenue Potential</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{ai.monetization.revenue_potential}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. CPC</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{ai.monetization.estimated_cpc}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Est. CPM</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{ai.monetization.estimated_cpm}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg px-3 py-2">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Niche</p>
                      <p className="text-xs font-bold text-foreground mt-0.5">{ai.monetization.niche}</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* ISSUES TAB                                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'issues' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isAiUnlocked && ai ? (
              <>
                {/* Header with copy button */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-foreground">{ai.fix_suggestions.length} fixes identified</p>
                  {ai.fix_suggestions.length > 0 && (
                    <Button variant="outline" size="sm" className="gap-2 text-xs h-8 rounded-xl" onClick={() => copyChecklist(ai.fix_suggestions)}>
                      {copied ? <><CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy Checklist</>}
                    </Button>
                  )}
                </div>

                {/* Top issues from AI */}
                {ai.top_issues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" /> Critical Issues
                    </p>
                    {ai.top_issues.map((issue, i) => <IssueRow key={i} text={issue} type="critical" />)}
                  </div>
                )}

                {/* Fix suggestions grouped by impact */}
                {ai.fix_suggestions.length === 0 ? (
                  <Card className="p-6 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-foreground text-sm mb-1">No Critical Fixes Found</p>
                        <p className="text-xs text-muted-foreground">Your site looks clean. Focus on content volume and consistency to strengthen your application.</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  ['high', 'medium', 'low'].map(level => {
                    const fixes = ai.fix_suggestions.filter(f => f.impact === level)
                    if (!fixes.length) return null
                    return (
                      <div key={level} className="space-y-3">
                        <p className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                          level === 'high' ? 'text-red-600 dark:text-red-400' : level === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                        }`}>
                          {level === 'high' ? <AlertCircle className="h-3.5 w-3.5" /> : level === 'medium' ? <AlertTriangle className="h-3.5 w-3.5" /> : <Lightbulb className="h-3.5 w-3.5" />}
                          {level === 'high' ? 'High Impact Fixes' : level === 'medium' ? 'Medium Impact Fixes' : 'Low Impact Improvements'}
                        </p>
                        <div className="grid md:grid-cols-2 gap-3">
                          {fixes.map((fix, i) => (
                            <Card key={i} className="p-4 border-border/60 rounded-2xl flex items-start gap-3 hover:border-primary/40 transition-colors group">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors flex-shrink-0">
                                {catIcon(fix.category)}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <p className="font-bold text-sm text-foreground">{fix.title}</p>
                                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest flex-shrink-0 ${imp(fix.impact)}`}>{fix.impact}</span>
                                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{fix.category}</span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">{fix.description}</p>
                                {fix.technical_detail && (
                                  <p className="text-[10px] text-muted-foreground/50 font-mono mt-1.5 bg-muted/40 px-2 py-1 rounded-md leading-relaxed">{fix.technical_detail}</p>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}

                {/* Policy violations */}
                {ai.policy.violations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5" /> Policy Violations
                    </p>
                    {ai.policy.violations.map((v, i) => <IssueRow key={i} text={v} type="critical" />)}
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center space-y-4 max-w-sm mx-auto">
                <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mx-auto">
                  {isPro ? <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Lock className="h-7 w-7 text-muted-foreground/50" />}
                </div>
                <p className="font-black text-foreground text-lg">{isPro ? 'Generating AI Report...' : 'Detailed Fixes Locked'}</p>
                <p className="text-sm text-muted-foreground">{isPro ? 'Your prioritized fix list will appear here shortly.' : 'Unlock the AI report to see specific, prioritized fixes for your site.'}</p>
                {!isPro && <Button onClick={handleUnlock} disabled={isUnlocking} className="gap-2 px-8"><Lock className="h-4 w-4" /> Unlock — ₹19</Button>}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PLAN TAB                                                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'plan' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {isAiUnlocked && ai ? (
              <>
                <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-black text-foreground">AI Action Plan</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your personalised roadmap to AdSense approval.</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex-shrink-0">
                    <Zap className="h-4 w-4" /> {ai.application_timeline}
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Workflow steps */}
                  <div className="lg:col-span-2 space-y-3">
                    {ai.approval_workflow.length === 0 ? (
                      <Card className="p-6 border-border/60 rounded-2xl text-center">
                        <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="font-semibold text-foreground text-sm mb-1">Plan Unavailable</p>
                        <p className="text-xs text-muted-foreground">Re-run your scan to generate a fresh action plan with the latest AI analysis.</p>
                      </Card>
                    ) : ai.approval_workflow.map((step, i) => (
                      <Card key={i} className="p-5 border-border/60 rounded-2xl relative overflow-hidden group hover:border-primary/30 transition-colors">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors rounded-l-2xl" />
                        <div className="flex items-start gap-4 pl-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm flex-shrink-0">{i + 1}</div>
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-full">{step.timeframe}</span>
                              <p className="font-bold text-sm text-foreground">{step.task}</p>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">{step.details}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <Card className="p-5 border-border/60 rounded-2xl bg-muted/20">
                      <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500" /> Strategic Tips
                      </p>
                      <ul className="space-y-3">
                        {ai.strategic_roadmap.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{tip}
                          </li>
                        ))}
                      </ul>
                    </Card>

                    <Card className="p-5 border-border/60 rounded-2xl">
                      <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-violet-500" /> Missing Topics
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ai.seo_authority.missing_topics.map((t, i) => (
                          <span key={i} className="text-[11px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full font-medium">{t}</span>
                        ))}
                      </div>
                    </Card>

                    <Card className="p-5 border-border/60 rounded-2xl">
                      <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                        <Link2 className="h-4 w-4 text-blue-500" /> Internal Linking
                      </p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ai.seo_authority.internal_linking_advice}</p>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-black text-foreground">Free Action Checklist</h2>
                  <p className="text-sm text-muted-foreground mt-1">Complete these steps before applying to AdSense.</p>
                </div>

                {/* Free checklist based on crawl data */}
                <div className="space-y-3">
                  {[
                    { done: !!data.site_structure?.has_privacy,    label: 'Add a Privacy Policy page', detail: 'Required by AdSense. Use a free generator if needed.' },
                    { done: !!data.site_structure?.has_about,      label: 'Add an About Us page', detail: 'Explains who you are and builds reviewer trust.' },
                    { done: !!data.site_structure?.has_contact,    label: 'Add a Contact page', detail: 'AdSense requires a way for users to reach you.' },
                    { done: !!data.site_structure?.has_terms,      label: 'Add Terms of Service', detail: 'Shows your site is professionally managed.' },
                    { done: !!data.site_structure?.has_disclaimer, label: 'Add a Disclaimer page', detail: 'Important for finance, health, and affiliate sites.' },
                    { done: articleCount >= 25,                    label: `Publish 25+ articles (you have ${articleCount})`, detail: 'Google wants to see a content-rich site before approving.' },
                    { done: data.pages.filter(p => p.headings.h1.length === 0).length === 0, label: 'Add H1 tags to all pages', detail: `${data.pages.filter(p => p.headings.h1.length === 0).length} pages currently missing H1.` },
                    { done: data.pages.filter(p => !p.meta_description).length === 0,        label: 'Add meta descriptions to all pages', detail: `${data.pages.filter(p => !p.meta_description).length} pages currently missing meta descriptions.` },
                    { done: avgWords >= 600,                       label: 'Ensure avg 600+ words per article', detail: `Your current average is ${avgWords} words.` },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${item.done ? 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20' : 'border-border/60 bg-muted/20'}`}>
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${item.done ? 'bg-emerald-500' : 'border-2 border-muted-foreground/30'}`}>
                        {item.done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Card className="p-5 border-primary/20 bg-primary/5 rounded-2xl">
                  <p className="font-bold text-sm text-foreground mb-1 flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Want a personalised day-by-day plan?</p>
                  <p className="text-xs text-muted-foreground mb-3">Unlock the AI report to get a custom 30-day roadmap, strategic tips, and missing topic suggestions.</p>
                  <Button onClick={handleUnlock} disabled={isUnlocking} className="gap-2 h-10 rounded-xl font-bold text-sm">
                    {isUnlocking ? <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Zap className="h-4 w-4" />}
                    Unlock Full Plan — ₹19
                  </Button>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* PAGES TAB                                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'pages' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <p className="font-semibold text-foreground">
                Pages Crawled <span className="text-muted-foreground font-normal text-sm">({data.total_pages})</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {data.pages.filter(p => p.headings.h1.length > 0 && p.meta_description && p.word_count >= 500).length} / {data.total_pages} pages fully optimised
                </span>
                {data.total_pages > 8 && (
                  <Link href={`/dashboard/articles?scanId=${data.scan_id || ''}`}>
                    <Button variant="ghost" size="sm" className="text-xs text-primary font-bold gap-1.5">
                      Deep Article Analysis <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Page health summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Missing H1', count: data.pages.filter(p => p.headings.h1.length === 0).length, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40' },
                { label: 'No Meta Desc', count: data.pages.filter(p => !p.meta_description).length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40' },
                { label: 'Thin Content', count: data.pages.filter(p => p.word_count > 0 && p.word_count < 300).length, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/40' },
              ].map(s => (
                <div key={s.label} className={`p-3 rounded-xl border text-center ${s.bg}`}>
                  <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.count}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {data.pages.slice(0, 20).map((page, i) => {
                const hasH1 = page.headings.h1.length > 0
                const hasMeta = !!page.meta_description
                const wordStatus = page.word_count >= 600 ? 'good' : page.word_count >= 300 ? 'warn' : 'low'
                const score = (hasH1 ? 33 : 0) + (hasMeta ? 33 : 0) + (wordStatus === 'good' ? 34 : wordStatus === 'warn' ? 17 : 0)
                return (
                  <Card key={i} className={`p-4 border-border/60 rounded-xl hover:border-primary/30 transition-colors ${score < 50 ? 'border-l-2 border-l-red-400' : score < 80 ? 'border-l-2 border-l-amber-400' : 'border-l-2 border-l-emerald-400'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black ${score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                        {score}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-foreground truncate">{page.title || 'No Title'}</p>
                        <p className="text-[10px] text-muted-foreground truncate font-mono mt-0.5">{page.url}</p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            wordStatus === 'good' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : wordStatus === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>{page.word_count}w</span>
                          {!hasH1 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">No H1</span>}
                          {!hasMeta && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">No Meta</span>}
                          {hasH1 && hasMeta && wordStatus === 'good' && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Optimised</span>}
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            {data.total_pages > 20 && (
              <p className="text-center text-xs text-muted-foreground">Showing 20 of {data.total_pages} pages</p>
            )}

            <Link href={`/dashboard/articles?scanId=${data.scan_id || ''}`} className="block">
              <Card className="p-4 border-dashed border-border/60 rounded-xl text-center hover:bg-muted/30 transition-colors">
                <p className="text-sm text-muted-foreground">
                  AI analyzed the latest 50 articles in depth. <span className="font-bold text-primary">View Full Article Report →</span>
                </p>
              </Card>
            </Link>
          </div>
        )}

        {/* ── Footer CTA ── */}
        <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 rounded-3xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 -translate-x-1/2 blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <p className="text-lg font-black text-foreground">"One final scan away from revenue."</p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Complete your Action Plan, then run a final scan to confirm your readiness score is 80+ before applying to AdSense.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/dashboard">
                <Button className="rounded-xl px-8 h-11 font-bold shadow-lg shadow-primary/20">Run New Scan</Button>
              </Link>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}
