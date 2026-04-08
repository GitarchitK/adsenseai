'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Globe, Zap, AlertCircle, CheckCircle2, AlertTriangle,
  FileText, TrendingUp, Crown, ChevronDown, ChevronUp,
  BookOpen, Shield, BarChart3, ListChecks, Calendar,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useProfile } from '@/hooks/use-profile'
import Link from 'next/link'
import { UpgradeModal } from '@/components/upgrade-modal'
import type { ArticleReportSummary, ArticleAnalysis } from '@/types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function riskColor(risk: ArticleAnalysis['adsense_risk']) {
  return risk === 'critical' ? 'text-red-600 dark:text-red-400'
       : risk === 'warning'  ? 'text-amber-600 dark:text-amber-400'
       : 'text-emerald-600 dark:text-emerald-400'
}
function riskBg(risk: ArticleAnalysis['adsense_risk']) {
  return risk === 'critical' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
       : risk === 'warning'  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
       : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
}
function riskIcon(risk: ArticleAnalysis['adsense_risk']) {
  return risk === 'critical' ? <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
       : risk === 'warning'  ? <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
       : <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
}
function plagBadge(risk: ArticleAnalysis['plagiarism_risk']) {
  return risk === 'high'   ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
       : risk === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
       : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
}
function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-foreground w-6 text-right">{score}</span>
    </div>
  )
}

// ── Article card ──────────────────────────────────────────────────────────────

function ArticleCard({ article }: { article: ArticleAnalysis }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className={`border ${riskBg(article.adsense_risk)} overflow-hidden`}>
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3">
          {riskIcon(article.adsense_risk)}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-semibold text-sm text-foreground truncate max-w-[60%]">
                {article.title}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {article.is_thin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    THIN
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plagBadge(article.plagiarism_risk)}`}>
                  PLAG: {article.plagiarism_risk.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{article.word_count}w</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{article.url}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-4">
          {/* Score bars */}
          <div className="space-y-2">
            <ScoreBar score={article.readability_score} label="Readability" />
            <ScoreBar score={article.originality_score} label="Originality" />
            <ScoreBar score={article.depth_score}       label="Depth" />
            <ScoreBar score={Math.max(0, 100 - article.spam_score)} label="Not Spammy" />
          </div>

          {/* Risk reasons */}
          {article.risk_reasons.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                AdSense Risk Factors
              </p>
              <ul className="space-y-1.5">
                {article.risk_reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Plagiarism signals */}
          {article.plagiarism_signals.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                Plagiarism Signals
              </p>
              <ul className="space-y-1.5">
                {article.plagiarism_signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <Shield className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths */}
          {article.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Strengths
              </p>
              <ul className="space-y-1.5">
                {article.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fix */}
          {article.recommended_fix && article.recommended_fix !== 'None needed' && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended Fix</p>
              <p className="text-sm text-foreground">{article.recommended_fix}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ArticlesPage() {
  const { token, isPro, getToken } = useProfile()
  const [modalOpen, setModalOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [report, setReport] = useState<ArticleReportSummary | null>(null)
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'good'>('all')

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setReport(null)
    setLoading(true)

    try {
      const t = await getToken()
      const res = await fetch('/api/analyze/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed.')
      } else {
        setReport(data.report)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isPro) {
    return (
      <>
        <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} feature="Article Analyzer" />
        <div className="container mx-auto px-6 py-8 max-w-3xl">
          <Card
            className="p-12 text-center border-border/60 rounded-2xl cursor-pointer hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
            onClick={() => setModalOpen(true)}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 mx-auto mb-4">
              <Crown className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Pro Feature</h2>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Article-level content analysis with thin content detection and plagiarism signals requires the Pro plan.
            </p>
            <Button
              className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/25"
              onClick={() => setModalOpen(true)}
            >
              <Crown className="h-4 w-4" /> Upgrade to Pro — ₹199/mo
            </Button>
          </Card>
        </div>
      </>
    )
  }

  const filtered = report?.articles.filter(a =>
    filter === 'all' ? true : a.adsense_risk === filter
  ) ?? []
  const analyzedTitles = report?.articles.map((article, index) => ({
    id: `${article.url}-${index}`,
    title: article.title || 'Untitled',
    url: article.url,
  })) ?? []

  return (
    <div className="container mx-auto px-6 py-8 max-w-5xl space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Article Content Analyzer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Analyze every article on your site for thin content, plagiarism signals, and AdSense rejection risk
        </p>
      </div>

      {/* Input */}
      <Card className="overflow-hidden border-border/60 rounded-2xl">
        <div className="h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
        <div className="p-6">
          <form onSubmit={handleAnalyze} className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={e => setUrl(e.target.value)}
                disabled={loading}
                className="pl-10 h-12 bg-muted/30 border-border/80 rounded-xl"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="h-12 px-7 gap-2 rounded-xl shadow-sm shadow-primary/20">
              {loading
                ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Analyzing...</>
                : <><Zap className="h-4 w-4" /> Analyze Articles</>}
            </Button>
          </form>
          {error && (
            <div className="flex items-center gap-2 mt-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
          <div className="flex items-center justify-between gap-3 mt-3">
            <p className="text-xs text-muted-foreground">
              Crawls a wider set of pages, then analyzes the latest 50 likely articles for readability, plagiarism risk, AdSense compliance, and review readiness.
            </p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[10px] font-bold text-violet-600 dark:text-violet-400 whitespace-nowrap">
              <TrendingUp className="h-3 w-3" /> LATEST-FIRST
            </div>
          </div>
        </div>
      </Card>

      {/* Report */}
      {report && (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText,   label: 'Total Articles',    value: report.total_articles,       color: 'text-violet-500', bg: 'bg-violet-500/10' },
              { icon: AlertCircle, label: 'Critical Issues',  value: report.critical_count,        color: 'text-red-500',    bg: 'bg-red-500/10' },
              { icon: AlertTriangle, label: 'Thin Pages',     value: report.thin_pages,            color: 'text-amber-500',  bg: 'bg-amber-500/10' },
              { icon: BarChart3,  label: 'Avg Quality',       value: `${report.avg_quality_score}%`, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map(({ icon: Icon, label, value, color, bg }) => (
              <Card key={label} className="p-4 border-border/60 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${bg} flex-shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-bold text-foreground">{value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Verdict and 1-Month Plan Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className={`p-5 lg:col-span-2 rounded-2xl border-2 ${
              report.overall_content_verdict === 'fail'       ? 'border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20'
              : report.overall_content_verdict === 'needs_work' ? 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'
              : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
            }`}>
              <div className="flex items-start gap-3">
                {report.overall_content_verdict === 'fail'
                  ? <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  : report.overall_content_verdict === 'needs_work'
                  ? <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  : <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-bold text-foreground">
                    Content Verdict: {report.overall_content_verdict === 'fail' ? '❌ Will Likely Fail AdSense Review'
                      : report.overall_content_verdict === 'needs_work' ? '⚠️ Needs Improvement Before Applying'
                      : '✅ Content Meets AdSense Standards'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">{report.verdict_reason}</p>
                  <div className="flex gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                    <span className="text-red-600 dark:text-red-400 font-semibold">{report.critical_count} critical</span>
                    <span className="text-amber-600 dark:text-amber-400 font-semibold">{report.warning_count} warnings</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{report.good_count} good</span>
                    <span>avg {report.avg_word_count} words/page</span>
                    <span>{report.high_plagiarism_risk} high plagiarism risk</span>
                  </div>
                </div>
              </div>
            </Card>

            <Dialog>
              <DialogTrigger asChild>
                <Card className="p-5 rounded-2xl border-border/60 cursor-pointer hover:border-primary/40 transition-colors group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                      <ListChecks className="h-4 w-4" />
                    </div>
                    <p className="font-bold text-foreground">Analyzed Articles</p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    View titles of the {analyzedTitles.length} articles chosen for AI analysis.
                  </p>
                  <Button variant="outline" size="sm" className="w-full text-xs font-semibold h-8 border-border/60">
                    Show Analyzed Titles
                  </Button>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                  <DialogTitle>AI Analyzed Article Titles</DialogTitle>
                  <DialogDescription>
                    These {analyzedTitles.length} articles were selected based on freshness (latest-first) for deep analysis.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto space-y-2 py-4">
                  {analyzedTitles.map((article, index) => (
                    <div key={article.id} className="rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5">
                      <div className="flex items-start gap-3">
                        <span className="text-xs font-bold text-muted-foreground mt-0.5">{index + 1}.</span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{article.title}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{article.url}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* 1-Month Plan */}
          {report.month_plan && report.month_plan.length > 0 && (
            <Card className="p-6 border-violet-200 dark:border-violet-800/50 bg-violet-50/30 dark:bg-violet-950/10 rounded-2xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">1-Month Content Strategy</h2>
                  <p className="text-sm text-muted-foreground">Actionable roadmap to improve your content for AdSense</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.month_plan.map((step, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-600 text-white text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-bold text-foreground">{step.week}</h3>
                    </div>
                    <div className="pl-8 space-y-2">
                      <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">{step.goal}</p>
                      <ul className="space-y-1.5">
                        {step.actions.map((action, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'critical', 'warning', 'good'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {f === 'all' ? `All (${report.total_articles})`
                  : f === 'critical' ? `Critical (${report.critical_count})`
                  : f === 'warning'  ? `Warnings (${report.warning_count})`
                  : `Good (${report.good_count})`}
              </button>
            ))}
          </div>

          {/* Article list */}
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-border/60 rounded-2xl">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No articles in this category.</p>
              </Card>
            ) : (
              filtered.map((article, i) => (
                <ArticleCard key={i} article={article} />
              ))
            )}
          </div>

          {/* Legend */}
          <Card className="p-5 border-border/60 rounded-2xl bg-muted/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">How to read this report</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Critical</span> — This page will likely cause AdSense rejection. Fix before applying.</div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Warning</span> — Needs improvement. Won&apos;t necessarily cause rejection but weakens your application.</div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div><span className="font-semibold text-foreground">Good</span> — Meets AdSense content standards. Keep it up.</div>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
