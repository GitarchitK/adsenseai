'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Zap, AlertCircle, Globe, ArrowRight,
  Clock, TrendingUp, BarChart3, Sparkles, CheckCircle2,
  FileText, Search, ShieldCheck, Activity, ChevronRight,
  Target, Layers, Scan, Wrench, PenLine, Tag, Code2,
  ScrollText, Image, FileSearch,
} from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'
import { useRazorpay } from '@/hooks/use-razorpay'
import DashboardLoading from './loading'
import { ALL_TOOLS, TOOL_CATEGORIES, type ToolCategory } from '@/lib/tool-catalog'

interface ScanRow {
  id: string
  websiteUrl: string
  domain: string
  finalScore: number | null
  statusLabel: string | null
  isAiUnlocked: boolean
  createdAt: string
}

function ScoreBadge({ score }: { score: number | any }) {
  const s = typeof score === 'object' && score !== null && 'score' in score ? score.score : score
  const color = s >= 70 ? 'text-emerald-400' : s >= 45 ? 'text-amber-400' : 'text-red-400'
  const ring = s >= 70 ? 'ring-emerald-500/30' : s >= 45 ? 'ring-amber-500/30' : 'ring-red-500/30'
  const bg = s >= 70 ? 'bg-emerald-500/10' : s >= 45 ? 'bg-amber-500/10' : 'bg-red-500/10'
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 text-sm font-black flex-shrink-0 ${bg} ${ring} ${color}`}>
      {s}
    </div>
  )
}

function StatusPill({ label }: { label: string | any }) {
  const l = typeof label === 'object' && label !== null && 'label' in label ? label.label : label
  const cls = l === 'High Chance'
    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
    : l === 'Moderate'
    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
    : 'bg-red-500/15 text-red-400 border border-red-500/20'
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cls}`}>{l}</span>
}

function CrawlVisualizer({ url, scanStatus }: { url: string; scanStatus: string }) {
  const [logs, setLogs] = useState<string[]>([])
  const [progress, setProgress] = useState(0)

  const domain = url ? (() => { try { return new URL(url).hostname } catch { return url } })() : 'website'

  useEffect(() => {
    const steps = [
      { msg: `Connecting to ${domain}...`, pct: 8 },
      { msg: 'Parsing robots.txt and sitemap.xml...', pct: 18 },
      { msg: 'Discovering internal links and article URLs...', pct: 28 },
      { msg: 'Crawling homepage and mandatory pages...', pct: 42 },
      { msg: 'Scanning article content and word counts...', pct: 58 },
      { msg: 'Checking HTTPS, schema markup, and meta tags...', pct: 70 },
      { msg: 'Analyzing AdSense policy compliance...', pct: 82 },
      { msg: 'Running AI report generation...', pct: 93 },
    ]
    let i = 0
    const tick = () => {
      if (i >= steps.length) return
      const step = steps[i]
      setLogs(prev => [`› ${step.msg}`, ...prev].slice(0, 8))
      setProgress(step.pct)
      i++
      setTimeout(tick, 2800 + Math.random() * 1200)
    }
    tick()
  }, [domain])

  useEffect(() => {
    if (scanStatus.includes('AI')) setProgress(p => Math.max(p, 88))
    if (scanStatus.includes('Done')) setProgress(100)
    if (scanStatus.includes('batch')) setProgress(p => Math.max(p, 55))
  }, [scanStatus])

  return (
    <div className="space-y-5 mt-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-semibold text-primary">
            <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {scanStatus || 'Initializing…'}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="rounded-xl bg-[#0d0d0d] border border-white/[0.06] p-4 font-mono text-[11px] leading-5">
        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/[0.06]">
          <span className="h-2 w-2 rounded-full bg-red-500/60" />
          <span className="h-2 w-2 rounded-full bg-amber-500/60" />
          <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
          <span className="ml-2 text-white/20 text-[10px]">adsensechecker.in — crawl engine v2</span>
        </div>
        <div className="flex flex-col-reverse gap-1 min-h-[96px]">
          {logs.map((log, i) => (
            <div key={i} className={`flex items-start gap-2 ${i === 0 ? 'text-emerald-400' : 'text-white/30'}`}>
              <span className="text-white/20 shrink-0 select-none">$</span>
              <span className="break-all">{log}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-white/20 flex items-center gap-1">
              <span className="inline-block w-2 h-3.5 bg-white/20 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Category icon map
const CAT_ICONS: Record<ToolCategory, any> = {
  adsense: Target,
  content: PenLine,
  seo: TrendingUp,
  technical: Code2,
  legal: ScrollText,
  media: Image,
}

const CAT_COLORS: Record<ToolCategory, { color: string; bg: string; ring: string }> = {
  adsense:   { color: 'text-violet-400',  bg: 'bg-violet-500/10',  ring: 'ring-violet-500/15'  },
  content:   { color: 'text-blue-400',    bg: 'bg-blue-500/10',    ring: 'ring-blue-500/15'    },
  seo:       { color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/15' },
  technical: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   ring: 'ring-amber-500/15'   },
  legal:     { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  ring: 'ring-indigo-500/15'  },
  media:     { color: 'text-pink-400',    bg: 'bg-pink-500/10',    ring: 'ring-pink-500/15'    },
}

const CATEGORY_ORDER_TYPED: ToolCategory[] = ['adsense', 'content', 'seo', 'technical', 'legal', 'media']

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile, usage, token, isLoading, isPro, canScan, getToken } = useProfile()
  const { openCheckout } = useRazorpay()
  const [url, setUrl] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanStatus, setScanStatus] = useState('')
  const [urlError, setUrlError] = useState('')
  const [recentScans, setRecentScans] = useState<ScanRow[]>([])
  const [scansLoading, setScansLoading] = useState(true)
  const [upgraded, setUpgraded] = useState(false)

  useEffect(() => {
    if (searchParams.get('upgraded') === '1') setUpgraded(true)
    const scanUrl = searchParams.get('scan')
    if (scanUrl && !isScanning) setUrl(decodeURIComponent(scanUrl))
  }, [searchParams, isScanning, profile, router])

  useEffect(() => {
    const scanUrl = searchParams.get('scan')
    if (scanUrl && canScan && token && !isScanning && url === decodeURIComponent(scanUrl)) {
      const timer = setTimeout(() => handleScan({ preventDefault: () => {} } as React.FormEvent), 500)
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
    if (!url) { setUrlError('Please enter a URL'); return }

    setIsScanning(true)
    setScanStatus('Connecting to website…')

    try {
      const t = await getToken()

      setScanStatus('Crawling homepage and key pages…')
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setUrlError(data.error ?? 'Scan failed. Please try again.')
        setIsScanning(false)
        setScanStatus('')
        return
      }

      let remaining: string[] = data.remaining_urls ?? []
      let batchNum = 1
      while (remaining.length > 0) {
        setScanStatus(`Crawling articles… (batch ${batchNum})`)
        try {
          const batchRes = await fetch('/api/crawl/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ scan_id: data.scan_id, urls: remaining }),
          })
          const batchData = await batchRes.json()
          if (!batchRes.ok) break
          remaining = batchData.has_more ? remaining.slice(8) : []
          batchNum++
        } catch {
          break
        }
      }

      if (data.scan_id) {
        setScanStatus('Generating AI analysis…')
        try {
          const freshT = await getToken()
          await fetch('/api/analyze/master', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${freshT}` },
            body: JSON.stringify({ scanId: data.scan_id }),
          })
        } catch { /* AI report is bonus */ }
      }

      setScanStatus('Done! Loading your report…')
      sessionStorage.setItem('lastCrawlData', JSON.stringify(data))
      router.push('/dashboard/results')
    } catch {
      setUrlError('Network error. Please try again.')
      setIsScanning(false)
      setScanStatus('')
    }
  }

  if (isLoading) return <DashboardLoading />

  const firstName = profile?.fullName?.split(' ')[0]
  const monthUsed = usage?.scans_this_month ?? 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl space-y-8">

        {/* ── Welcome banner ── */}
        {upgraded && (
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <p className="font-semibold text-emerald-300 text-sm">Everything unlocked! All 40+ tools are now free. 🎉</p>
          </div>
        )}

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              {firstName ? `Hi, ${firstName} 👋` : 'Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              40+ free tools for bloggers, website owners &amp; agencies
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex-shrink-0">
            <Zap className="h-3.5 w-3.5" />
            All Free
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Activity,   label: 'Total Scans',  value: usage?.total_scans ?? 0,   color: 'text-violet-400', bg: 'bg-violet-500/10', ring: 'ring-violet-500/20' },
            { icon: Zap,        label: 'This Month',   value: monthUsed,                  color: 'text-blue-400',   bg: 'bg-blue-500/10',   ring: 'ring-blue-500/20'   },
            { icon: Wrench,     label: 'Tools',        value: '40+',                      color: 'text-amber-400',  bg: 'bg-amber-500/10',  ring: 'ring-amber-500/20'  },
            { icon: Sparkles,   label: 'AI Reports',   value: 'Included',                 color: 'text-emerald-400',bg: 'bg-emerald-500/10',ring: 'ring-emerald-500/20'},
          ].map(({ icon: Icon, label, value, color, bg, ring }) => (
            <Card key={label} className={`p-4 border-0 rounded-2xl ring-1 ${ring} ${bg}`}>
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
                  <p className={`text-sm font-bold truncate ${color}`}>{value}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* ── Scan hero card ── */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.07] bg-gradient-to-br from-[#0f0f1a] via-[#0a0a16] to-[#0d0d1f] shadow-2xl shadow-violet-950/30">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="h-[2px] bg-gradient-to-r from-violet-500 via-indigo-400 to-blue-500 opacity-80" />

          <div className="relative p-7 sm:p-8">
            {!isScanning ? (
              <>
                <div className="flex items-start gap-4 mb-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 flex-shrink-0">
                    <Scan className="h-5 w-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Website AdSense Analyzer</h2>
                    <p className="text-sm text-white/40 mt-0.5">Paste any URL — get a full AI-powered readiness report, free</p>
                  </div>
                </div>

                {urlError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4 text-sm text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-400" />
                    <span className="flex-1">{urlError}</span>
                  </div>
                )}

                <form onSubmit={handleScan} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none" />
                      <Input
                        type="text"
                        placeholder="https://yourwebsite.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isScanning}
                        className="pl-11 h-12 text-sm bg-white/5 border-white/10 text-white placeholder:text-white/25 focus:border-violet-500/50 focus:bg-white/[0.07] rounded-xl transition-all"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isScanning || !url}
                      className="h-12 px-8 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/40 transition-all active:scale-95 flex-shrink-0"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Analyze Site
                    </Button>
                  </div>
                  <p className="text-[11px] text-white/25 text-center">
                    Free · No credit card · Full AI report included · Results in ~30s
                  </p>
                </form>

                <div className="mt-7 pt-6 border-t border-white/[0.06]">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-4">Every free report includes</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { icon: BarChart3,    text: 'Readiness Score' },
                      { icon: CheckCircle2, text: 'Policy Compliance' },
                      { icon: AlertCircle,  text: 'Critical Issues' },
                      { icon: Sparkles,     text: 'Full AI Report' },
                      { icon: Target,       text: '3-Phase Fix Plan' },
                      { icon: FileText,     text: 'Pre-App Checklist' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-white/60">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                      <Search className="h-4 w-4 text-violet-400 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white">
                        Analyzing {(() => { try { return new URL(url).hostname } catch { return url } })()}
                      </h2>
                      <p className="text-[11px] text-white/30">Running multi-phase analysis — please wait</p>
                    </div>
                  </div>
                  <div className="h-7 w-7 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin flex-shrink-0" />
                </div>
                <CrawlVisualizer url={url} scanStatus={scanStatus} />
              </div>
            )}
          </div>
        </div>

        {/* ── Tools directory ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-foreground">All Tools</h2>
              <p className="text-xs text-muted-foreground mt-0.5">40+ free tools — no account limits</p>
            </div>
            <Link href="/dashboard/tools">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground h-7 px-2">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORY_ORDER_TYPED.map(cat => {
              const catDef = TOOL_CATEGORIES[cat]
              const catColors = CAT_COLORS[cat]
              const Icon = CAT_ICONS[cat]
              const count = ALL_TOOLS.filter(t => t.category === cat).length
              return (
                <Link key={cat} href={`/dashboard/tools?cat=${cat}`}>
                  <Card className={`p-4 border-0 rounded-2xl ring-1 ${catColors.ring} ${catColors.bg} hover:ring-2 transition-all group cursor-pointer h-full`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${catColors.color} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-semibold ${catColors.color}`}>{catDef.emoji} {catDef.label}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{count} tools</p>
                      </div>
                      <ChevronRight className={`h-3.5 w-3.5 ${catColors.color} opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0`} />
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* ── Popular individual tools ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">Popular Tools</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { href: '/dashboard/articles',       icon: FileSearch, label: 'Article Analyzer', desc: 'AdSense risk per article',    color: 'text-blue-400',   bg: 'bg-blue-500/10',    ring: 'ring-blue-500/15'   },
              { href: '/dashboard/article-studio', icon: PenLine,    label: 'Article Studio',   desc: 'AI blog post writer',          color: 'text-violet-400', bg: 'bg-violet-500/10',  ring: 'ring-violet-500/15' },
              { href: '/dashboard/tools/meta-generator', icon: Tag,  label: 'Meta Generator',  desc: 'SEO title & description',      color: 'text-emerald-400',bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/15'},
              { href: '/dashboard/tools/schema-generator', icon: Code2, label: 'Schema Markup', desc: 'JSON-LD structured data',    color: 'text-amber-400',  bg: 'bg-amber-500/10',   ring: 'ring-amber-500/15'  },
            ].map(({ href, icon: Icon, label, desc, color, bg, ring }) => (
              <Link key={href} href={href}>
                <Card className={`p-4 border-0 rounded-2xl ring-1 ${ring} ${bg} hover:ring-2 transition-all group cursor-pointer h-full`}>
                  <div className="flex items-start gap-3">
                    <Icon className={`h-4 w-4 ${color} flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform`} />
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${color}`}>{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent scans ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Scans</h2>
            <Link href="/dashboard/scans">
              <Button variant="ghost" size="sm" className="gap-1 text-xs text-muted-foreground hover:text-foreground h-7 px-2">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {scansLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-xl bg-muted/40 animate-pulse" />)}
            </div>
          ) : recentScans.length === 0 ? (
            <Card className="p-10 text-center border-dashed border-border/40 rounded-2xl bg-transparent">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mx-auto mb-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground text-sm mb-1">No scans yet</p>
              <p className="text-xs text-muted-foreground">Paste a URL above to run your first free analysis</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
                  <Card className="p-4 border-border/40 rounded-xl hover:border-primary/30 hover:bg-muted/30 transition-all group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 flex-shrink-0">
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-foreground truncate">{scan.domain || scan.websiteUrl}</p>
                          {scan.isAiUnlocked && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 flex-shrink-0">AI</span>
                          )}
                          {scan.statusLabel && <StatusPill label={scan.statusLabel} />}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(scan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      {scan.finalScore !== null && <ScoreBadge score={scan.finalScore} />}
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
