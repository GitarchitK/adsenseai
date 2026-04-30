'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles, FileText, PenLine, Search, Crown, Copy, CheckCircle2,
  Lock, AlertCircle, AlertTriangle, Lightbulb, ShieldCheck, BookOpen,
  ArrowRight, BarChart3, Zap, RefreshCw,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { UpgradeModal } from '@/components/upgrade-modal'
import type { SingleArticleReport, ArticleFix } from '@/services/ai-single-article'

// ── Helpers ───────────────────────────────────────────────────────────────────

const sc = (s: number) =>
  s >= 80 ? 'text-emerald-600 dark:text-emerald-400'
  : s >= 60 ? 'text-amber-600 dark:text-amber-400'
  : 'text-red-600 dark:text-red-400'

const bc = (s: number) =>
  s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-red-500'

const riskColor = (r: string) =>
  r === 'critical' || r === 'high' ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/40'
  : r === 'warning' || r === 'medium' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40'
  : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'

const fixPriorityColor = (p: ArticleFix['priority']) =>
  p === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  : p === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
  : p === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  : 'bg-muted text-muted-foreground'

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-black tabular-nums ${sc(score)}`}>{score}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${bc(score)}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  )
}

// ── Locked tool preview ───────────────────────────────────────────────────────

function LockedTool({ icon, title, description, onUnlock }: {
  icon: React.ReactNode; title: string; description: string; onUnlock: () => void
}) {
  return (
    <Card className="p-6 relative overflow-hidden cursor-pointer group border-border/60 hover:border-violet-300 dark:hover:border-violet-700 transition-colors" onClick={onUnlock}>
      <div className="blur-sm pointer-events-none select-none space-y-3" aria-hidden>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">{icon}</div>
          <div><h3 className="font-semibold text-foreground">{title}</h3><p className="text-xs text-muted-foreground">{description}</p></div>
        </div>
        <div className="h-10 rounded-lg bg-muted w-full" />
        <div className="h-10 rounded-lg bg-muted w-3/4" />
        <div className="h-9 rounded-lg bg-primary/20 w-32" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px] group-hover:bg-background/60 transition-colors">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/50">
          <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">Pro feature</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800/50">
          <Crown className="h-3.5 w-3.5" /> Unlock with Pro
        </div>
      </div>
    </Card>
  )
}

function ToolCard({ icon, title, description, badge, children }: {
  icon: React.ReactNode; title: string; description: string; badge?: string; children: React.ReactNode
}) {
  return (
    <Card className="p-6 border-border/60">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {badge && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 uppercase tracking-widest">{badge}</span>}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

// ── Article Analyzer Report UI ────────────────────────────────────────────────

function ArticleReport({ report }: { report: SingleArticleReport }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fixes' | 'rewrites'>('overview')
  const [copied, setCopied] = useState(false)

  const copyFixes = () => {
    const text = report.fixes.map((f, i) =>
      `${i + 1}. [${f.priority.toUpperCase()}] ${f.title}\n   Problem: ${f.problem}\n   Fix: ${f.solution}${f.example ? `\n   Example: ${f.example}` : ''}`
    ).join('\n\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'fixes', label: `Fixes (${report.fixes.length})`, icon: Zap },
    { id: 'rewrites', label: 'Rewrites', icon: PenLine },
  ] as const

  return (
    <div className="space-y-4 mt-4">
      {/* Header verdict */}
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${riskColor(report.adsense_risk)}`}>
        {report.adsense_risk === 'critical' ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          : report.adsense_risk === 'warning' ? <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          : <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />}
        <div>
          <p className="font-bold text-sm">{report.apply_recommendation}</p>
          <p className="text-xs mt-0.5 opacity-80">{report.adsense_verdict}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${
              activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <tab.icon className="h-3.5 w-3.5" />{tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 border-border/60 rounded-xl space-y-3">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quality Scores</p>
              <ScoreBar label="Overall" score={report.overall_score} />
              <ScoreBar label="Readability" score={report.readability_score} />
              <ScoreBar label="Originality" score={report.originality_score} />
              <ScoreBar label="Depth" score={report.depth_score} />
              <ScoreBar label="Spam (lower=better)" score={100 - report.spam_score} />
            </Card>
            <div className="space-y-3">
              {/* Plagiarism */}
              <Card className={`p-4 rounded-xl border ${riskColor(report.plagiarism_risk)}`}>
                <p className="text-xs font-black uppercase tracking-widest mb-1">Plagiarism Risk</p>
                <p className="text-lg font-black capitalize">{report.plagiarism_risk}</p>
                <p className="text-xs mt-1 opacity-80 leading-relaxed">{report.plagiarism_verdict}</p>
              </Card>
              {/* Thin content */}
              <Card className={`p-4 rounded-xl border ${report.is_thin ? riskColor('critical') : riskColor('good')}`}>
                <p className="text-xs font-black uppercase tracking-widest mb-1">Thin Content</p>
                <p className="text-lg font-black">{report.is_thin ? 'Detected' : 'Not Thin'}</p>
                <p className="text-xs mt-1 opacity-80 leading-relaxed">{report.thin_verdict}</p>
              </Card>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
              <p className="text-xl font-black text-foreground tabular-nums">{report.word_count}</p>
              <p className="text-[11px] text-muted-foreground">words</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
              <p className="text-xl font-black text-foreground tabular-nums">{report.keyword_issues.length}</p>
              <p className="text-[11px] text-muted-foreground">keyword issues</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-center">
              <p className="text-xl font-black text-foreground tabular-nums">{report.plagiarism_signals.length}</p>
              <p className="text-[11px] text-muted-foreground">plagiarism signals</p>
            </div>
          </div>

          {/* Summary */}
          <Card className="p-4 border-border/60 rounded-xl">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">AI Summary</p>
            <p className="text-sm text-foreground leading-relaxed">{report.summary}</p>
          </Card>

          {/* Strengths */}
          {report.strengths.length > 0 && (
            <Card className="p-4 border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> What's Working
              </p>
              <ul className="space-y-1.5">
                {report.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />{s}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Rejection reasons */}
          {report.rejection_reasons.length > 0 && (
            <Card className="p-4 border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-red-600 dark:text-red-400 mb-2 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> AdSense Rejection Risks
              </p>
              <ul className="space-y-1.5">
                {report.rejection_reasons.map((r, i) => (
                  <li key={i} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />{r}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Keyword issues */}
          {report.keyword_issues.length > 0 && (
            <Card className="p-4 border-border/60 rounded-xl">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <Search className="h-3.5 w-3.5" /> Keyword Stuffing Detected
              </p>
              <div className="space-y-2">
                {report.keyword_issues.map((k, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                    <div className="flex-shrink-0 text-center min-w-[48px]">
                      <p className="text-lg font-black text-amber-700 dark:text-amber-300 tabular-nums">{k.density}</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">{k.count}x</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">"{k.keyword}"</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{k.fix}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* FIXES */}
      {activeTab === 'fixes' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-foreground">{report.fixes.length} actionable fixes</p>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 rounded-xl" onClick={copyFixes}>
              {copied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy All</>}
            </Button>
          </div>
          {['critical', 'high', 'medium', 'low'].map(level => {
            const fixes = report.fixes.filter(f => f.priority === level)
            if (!fixes.length) return null
            return (
              <div key={level} className="space-y-2">
                <p className={`text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${
                  level === 'critical' ? 'text-red-600 dark:text-red-400'
                  : level === 'high' ? 'text-orange-600 dark:text-orange-400'
                  : level === 'medium' ? 'text-amber-600 dark:text-amber-400'
                  : 'text-muted-foreground'
                }`}>
                  {level === 'critical' || level === 'high' ? <AlertCircle className="h-3.5 w-3.5" /> : <Lightbulb className="h-3.5 w-3.5" />}
                  {level} priority
                </p>
                {fixes.map((fix, i) => (
                  <Card key={i} className="p-4 border-border/60 rounded-xl space-y-2">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex-shrink-0 ${fixPriorityColor(fix.priority)}`}>{fix.priority}</span>
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{fix.category.replace('_', ' ')}</span>
                      <p className="font-bold text-sm text-foreground w-full">{fix.title}</p>
                    </div>
                    <div className="space-y-1.5 pl-1">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed"><span className="font-semibold text-foreground">Problem:</span> {fix.problem}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed"><span className="font-semibold text-foreground">Fix:</span> {fix.solution}</p>
                      </div>
                      {fix.example && (
                        <div className="mt-2 p-3 rounded-lg bg-muted/50 border border-border/40">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Example</p>
                          <p className="text-xs text-foreground font-mono leading-relaxed">{fix.example}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* REWRITES */}
      {activeTab === 'rewrites' && (
        <div className="space-y-4">
          {report.rewrite_examples.length === 0 ? (
            <Card className="p-6 border-border/60 rounded-xl text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-semibold text-foreground text-sm">No rewrites needed</p>
              <p className="text-xs text-muted-foreground mt-1">The AI didn't find sections that need rewriting.</p>
            </Card>
          ) : (
            report.rewrite_examples.map((ex, i) => (
              <Card key={i} className="p-4 border-border/60 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <p className="font-bold text-sm text-foreground">{ex.section}</p>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40">
                    <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-1">Original (problematic)</p>
                    <p className="text-xs text-foreground font-mono leading-relaxed">{ex.original}</p>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 italic">{ex.issue}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Suggested rewrite</p>
                    <p className="text-xs text-foreground leading-relaxed">{ex.rewritten}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── New Tool Sub-components ───────────────────────────────────────────────────

function MetaGeneratorTool({ getAuthHeader }: { getAuthHeader: () => Promise<{ Authorization: string }> }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Array<{ text: string; chars: number; angle: string }>>([])
  const [copied, setCopied] = useState<number | null>(null)

  const generate = async () => {
    if (!title && !content) return
    setLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/meta-generator', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })
    const data = await res.json()
    setResults(data.descriptions ?? [])
    setLoading(false)
  }

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Article title" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
      <textarea className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y" placeholder="Paste content snippet (optional)" value={content} onChange={e => setContent(e.target.value)} />
      <Button onClick={generate} disabled={loading || (!title && !content)} className="gap-2 rounded-xl">
        {loading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Meta Descriptions</>}
      </Button>
      {results.length > 0 && (
        <div className="space-y-2 mt-2">
          {results.map((r, i) => (
            <div key={i} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">{r.angle}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${r.chars > 160 ? 'text-red-500' : r.chars < 140 ? 'text-amber-500' : 'text-emerald-500'}`}>{r.chars} chars</span>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => copy(r.text, i)}>
                    {copied === i ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TitleGeneratorTool({ getAuthHeader }: { getAuthHeader: () => Promise<{ Authorization: string }> }) {
  const [topic, setTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Array<{ text: string; chars: number; formula: string; seo_score: number; why: string }>>([])
  const [copied, setCopied] = useState<number | null>(null)

  const generate = async () => {
    if (!topic) return
    setLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/title-generator', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, keyword }),
    })
    const data = await res.json()
    setResults(data.titles ?? [])
    setLoading(false)
  }

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-3">
      <Input placeholder="Article topic (e.g. how to get adsense approved)" value={topic} onChange={e => setTopic(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
      <Input placeholder="Target keyword (optional)" value={keyword} onChange={e => setKeyword(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
      <Button onClick={generate} disabled={loading || !topic} className="gap-2 rounded-xl">
        {loading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Titles</>}
      </Button>
      {results.length > 0 && (
        <div className="space-y-2 mt-2">
          {results.map((r, i) => (
            <div key={i} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">{r.formula}</span>
                  <span className={`text-[10px] font-mono ${r.chars > 60 ? 'text-amber-500' : 'text-emerald-500'}`}>{r.chars} chars</span>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">SEO: {r.seo_score}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => copy(r.text, i)}>
                  {copied === i ? <><CheckCircle2 className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </Button>
              </div>
              <p className="text-sm font-bold text-foreground">{r.text}</p>
              <p className="text-xs text-muted-foreground">{r.why}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function KeywordDensityTool({ getAuthHeader }: { getAuthHeader: () => Promise<{ Authorization: string }> }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ total_words: number; keywords: Array<{ word: string; count: number; density: number; status: string }>; overall_status: string; recommendation: string } | null>(null)

  const analyze = async () => {
    if (!content) return
    setLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/keyword-density', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const statusColor = (s: string) => s === 'stuffed' ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' : s === 'high' ? 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30' : s === 'good' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30' : 'text-muted-foreground bg-muted'

  return (
    <div className="space-y-3">
      <textarea className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[140px] resize-y" placeholder="Paste your article content here..." value={content} onChange={e => setContent(e.target.value)} />
      <Button onClick={analyze} disabled={loading || !content} className="gap-2 rounded-xl">
        {loading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Analyzing...</> : <><BarChart3 className="h-4 w-4" /> Analyze Keyword Density</>}
      </Button>
      {result && (
        <div className="space-y-3 mt-2">
          <div className={`p-3 rounded-xl border text-sm font-semibold ${result.overall_status === 'warning' ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' : 'border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300'}`}>
            {result.recommendation}
          </div>
          <p className="text-xs text-muted-foreground">{result.total_words} total words analyzed</p>
          <div className="space-y-1.5">
            {result.keywords.slice(0, 15).map((k, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-mono text-foreground w-24 truncate">{k.word}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${k.status === 'stuffed' ? 'bg-red-500' : k.status === 'high' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, k.density * 20)}%` }} />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{k.density}%</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${statusColor(k.status)}`}>{k.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ContentPolicyTool({ getAuthHeader }: { getAuthHeader: () => Promise<{ Authorization: string }> }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ verdict: string; policy_score: number; issues: Array<{ type: string; severity: string; description: string; fix: string }>; strengths: string[]; word_count: number; word_count_verdict: string; summary: string } | null>(null)

  const check = async () => {
    if (!content) return
    setLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/content-policy-check', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, title }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  const verdictColor = (v: string) => v === 'pass' ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300' : v === 'warning' ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300' : 'border-red-300 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300'

  return (
    <div className="space-y-3">
      <Input placeholder="Article title (optional)" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
      <textarea className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[140px] resize-y" placeholder="Paste your article content here..." value={content} onChange={e => setContent(e.target.value)} />
      <Button onClick={check} disabled={loading || !content} className="gap-2 rounded-xl">
        {loading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Checking...</> : <><ShieldCheck className="h-4 w-4" /> Check AdSense Policy</>}
      </Button>
      {result && (
        <div className="space-y-3 mt-2">
          <div className={`p-4 rounded-xl border-2 ${verdictColor(result.verdict)}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-black text-sm capitalize">{result.verdict === 'pass' ? '✓ Policy Compliant' : result.verdict === 'warning' ? '⚠ Needs Review' : '✗ Policy Issues Found'}</p>
              <span className="text-lg font-black tabular-nums">{result.policy_score}/100</span>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{result.summary}</p>
            <p className="text-[10px] mt-1 opacity-70">{result.word_count} words · {result.word_count_verdict === 'thin' ? 'Thin content' : result.word_count_verdict === 'borderline' ? 'Borderline length' : 'Good length'}</p>
          </div>
          {result.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Issues Found</p>
              {result.issues.map((issue, i) => (
                <div key={i} className={`p-3 rounded-xl border ${issue.severity === 'critical' ? 'border-red-200 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/20' : 'border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20'}`}>
                  <p className="text-xs font-bold text-foreground mb-0.5">{issue.description}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Fix:</span> {issue.fix}</p>
                </div>
              ))}
            </div>
          )}
          {result.strengths.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Strengths</p>
              {result.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />{s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIToolsPage() {
  const { isPro, isLoading, getToken } = useProfile()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFeature, setModalFeature] = useState('')

  // Article Analyzer
  const [articleUrl, setArticleUrl] = useState('')
  const [articleReport, setArticleReport] = useState<SingleArticleReport | null>(null)
  const [articleLoading, setArticleLoading] = useState(false)
  const [articleError, setArticleError] = useState('')

  // Privacy Policy
  const [ppDomain, setPpDomain] = useState('')
  const [ppBusiness, setPpBusiness] = useState('')
  const [ppResult, setPpResult] = useState('')
  const [ppLoading, setPpLoading] = useState(false)
  const [ppCopied, setPpCopied] = useState(false)

  // Content Rewrite
  const [rwContent, setRwContent] = useState('')
  const [rwResult, setRwResult] = useState('')
  const [rwImprovements, setRwImprovements] = useState<string[]>([])
  const [rwLoading, setRwLoading] = useState(false)

  // SEO Suggestions
  const [seoDomain, setSeoDomain] = useState('')
  const [seoResult, setSeoResult] = useState<Array<{ title: string; description: string; priority: string }>>([])
  const [seoLoading, setSeoLoading] = useState(false)
  const openUpgrade = (feature: string) => { setModalFeature(feature); setModalOpen(true) }

  const getAuthHeader = async () => {
    const t = await getToken()
    return { Authorization: `Bearer ${t}` }
  }

  const analyzeArticle = async () => {
    if (!articleUrl) return
    setArticleLoading(true)
    setArticleError('')
    setArticleReport(null)
    try {
      const headers = await getAuthHeader()
      const res = await fetch('/api/analyze/single-article', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: articleUrl }),
      })
      const data = await res.json()
      if (!res.ok) { setArticleError(data.error ?? 'Analysis failed.'); return }
      setArticleReport(data.report)
    } catch {
      setArticleError('Network error. Please try again.')
    } finally {
      setArticleLoading(false)
    }
  }

  const generatePrivacyPolicy = async () => {
    if (!ppDomain) return
    setPpLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/privacy-policy', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: ppDomain, business_name: ppBusiness }),
    })
    const data = await res.json()
    setPpResult(data.policy ?? data.error ?? 'Failed to generate.')
    setPpLoading(false)
  }

  const rewriteContent = async () => {
    if (!rwContent) return
    setRwLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/rewrite', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: rwContent }),
    })
    const data = await res.json()
    setRwResult(data.rewritten ?? '')
    setRwImprovements(data.improvements ?? [])
    setRwLoading(false)
  }

  const getSeoSuggestions = async () => {
    if (!seoDomain) return
    setSeoLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/seo-suggestions', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: seoDomain, pages: [] }),
    })
    const data = await res.json()
    setSeoResult(data.suggestions ?? [])
    setSeoLoading(false)
  }

  if (isLoading) return null

  return (
    <>
      <UpgradeModal open={modalOpen} onClose={() => setModalOpen(false)} feature={modalFeature} />

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">AI Tools</h1>
              <p className="text-sm text-muted-foreground">
                {isPro ? 'Pro-exclusive tools to improve your AdSense readiness' : 'Upgrade to Pro to unlock all AI tools'}
              </p>
            </div>
          </div>

          {!isPro && (
            <div
              className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/20 px-5 py-4 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-950/30 transition-colors"
              onClick={() => openUpgrade('AI Tools')}
            >
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-violet-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Unlock all AI tools with Pro</p>
                  <p className="text-xs text-muted-foreground">₹199/month · 200 scans · Cancel anytime</p>
                </div>
              </div>
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-sm shadow-violet-500/25 flex-shrink-0"
                onClick={e => { e.stopPropagation(); openUpgrade('AI Tools') }}>
                <Crown className="h-3.5 w-3.5" /> Upgrade
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">

          {/* ── Article Deep Analyzer (featured) ── */}
          {isPro ? (
            <ToolCard icon={<ShieldCheck className="h-4 w-4" />} title="Article Deep Analyzer" description="Paste any article URL — AI reads the full content and gives specific fixes" badge="New">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://yourblog.com/your-article"
                    value={articleUrl}
                    onChange={e => setArticleUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && analyzeArticle()}
                    className="rounded-xl bg-muted/30 border-border/80 flex-1"
                  />
                  <Button onClick={analyzeArticle} disabled={articleLoading || !articleUrl} className="gap-2 rounded-xl flex-shrink-0">
                    {articleLoading
                      ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...</>
                      : <><Sparkles className="h-4 w-4" /> Analyze</>}
                  </Button>
                </div>

                {articleLoading && (
                  <div className="py-8 text-center space-y-3">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground">Reading full article content...</p>
                    <p className="text-xs text-muted-foreground">This takes 15–30 seconds</p>
                  </div>
                )}

                {articleError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{articleError}
                  </div>
                )}

                {articleReport && <ArticleReport report={articleReport} />}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<ShieldCheck className="h-4 w-4" />} title="Article Deep Analyzer" description="AI reads your full article and gives specific plagiarism, thin content & fix analysis" onUnlock={() => openUpgrade('Article Deep Analyzer')} />
          )}

          {/* ── Privacy Policy Generator ── */}
          {isPro ? (
            <ToolCard icon={<FileText className="h-4 w-4" />} title="Privacy Policy Generator" description="Generate an AdSense-compliant Privacy Policy for your site">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="yourdomain.com" value={ppDomain} onChange={e => setPpDomain(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                  <Input placeholder="Business name (optional)" value={ppBusiness} onChange={e => setPpBusiness(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                </div>
                <Button onClick={generatePrivacyPolicy} disabled={ppLoading || !ppDomain} className="gap-2 rounded-xl">
                  {ppLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Policy</>}
                </Button>
                {ppResult && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Generated Policy</p>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(ppResult); setPpCopied(true); setTimeout(() => setPpCopied(false), 2000) }} className="gap-1.5 text-xs">
                        {ppCopied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-muted p-4 text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">{ppResult}</div>
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<FileText className="h-4 w-4" />} title="Privacy Policy Generator" description="Generate an AdSense-compliant Privacy Policy" onUnlock={() => openUpgrade('Privacy Policy Generator')} />
          )}

          {/* ── Content Rewriter ── */}
          {isPro ? (
            <ToolCard icon={<PenLine className="h-4 w-4" />} title="Content Rewriter" description="Improve low-quality content to meet AdSense standards">
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                  placeholder="Paste your content here to rewrite it for better quality..."
                  value={rwContent}
                  onChange={e => setRwContent(e.target.value)}
                />
                <Button onClick={rewriteContent} disabled={rwLoading || !rwContent} className="gap-2 rounded-xl">
                  {rwLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Rewriting...</> : <><PenLine className="h-4 w-4" /> Rewrite Content</>}
                </Button>
                {rwResult && (
                  <div className="space-y-3 mt-2">
                    {rwImprovements.length > 0 && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Improvements made:</p>
                        <ul className="space-y-1">
                          {rwImprovements.map((imp, i) => (
                            <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="rounded-xl bg-muted p-4 text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">{rwResult}</div>
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<PenLine className="h-4 w-4" />} title="Content Rewriter" description="Improve low-quality content to meet AdSense standards" onUnlock={() => openUpgrade('Content Rewriter')} />
          )}

          {/* ── SEO Suggestions ── */}
          {isPro ? (
            <ToolCard icon={<Search className="h-4 w-4" />} title="SEO Optimization" description="Get targeted SEO suggestions for your domain">
              <div className="space-y-3">
                <Input placeholder="yourdomain.com" value={seoDomain} onChange={e => setSeoDomain(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                <Button onClick={getSeoSuggestions} disabled={seoLoading || !seoDomain} className="gap-2 rounded-xl">
                  {seoLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Analyzing...</> : <><Search className="h-4 w-4" /> Get Suggestions</>}
                </Button>
                {seoResult.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {seoResult.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : s.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
                          {s.priority}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<Search className="h-4 w-4" />} title="SEO Optimization" description="Get targeted SEO suggestions for your domain" onUnlock={() => openUpgrade('SEO Optimization')} />
          )}

          {/* ── Meta Description Generator ── */}
          {isPro ? (
            <ToolCard icon={<FileText className="h-4 w-4" />} title="Meta Description Generator" description="Generate 3 SEO-optimized meta descriptions from a title or content" badge="New">
              <MetaGeneratorTool getAuthHeader={getAuthHeader} />
            </ToolCard>
          ) : (
            <LockedTool icon={<FileText className="h-4 w-4" />} title="Meta Description Generator" description="Generate 3 SEO-optimized meta descriptions instantly" onUnlock={() => openUpgrade('Meta Description Generator')} />
          )}

          {/* ── Article Title Generator ── */}
          {isPro ? (
            <ToolCard icon={<Sparkles className="h-4 w-4" />} title="Article Title Generator" description="Generate 5 SEO-optimized article titles for any topic" badge="New">
              <TitleGeneratorTool getAuthHeader={getAuthHeader} />
            </ToolCard>
          ) : (
            <LockedTool icon={<Sparkles className="h-4 w-4" />} title="Article Title Generator" description="Generate click-worthy, SEO-optimized titles for your articles" onUnlock={() => openUpgrade('Title Generator')} />
          )}

          {/* ── Keyword Density Analyzer ── */}
          {isPro ? (
            <ToolCard icon={<BarChart3 className="h-4 w-4" />} title="Keyword Density Analyzer" description="Paste your article and instantly detect keyword stuffing" badge="New">
              <KeywordDensityTool getAuthHeader={getAuthHeader} />
            </ToolCard>
          ) : (
            <LockedTool icon={<BarChart3 className="h-4 w-4" />} title="Keyword Density Analyzer" description="Detect keyword stuffing before AdSense rejects your site" onUnlock={() => openUpgrade('Keyword Density Analyzer')} />
          )}

          {/* ── AdSense Content Policy Checker ── */}
          {isPro ? (
            <ToolCard icon={<ShieldCheck className="h-4 w-4" />} title="AdSense Content Policy Checker" description="Paste any article and get an instant AdSense policy compliance check" badge="New">
              <ContentPolicyTool getAuthHeader={getAuthHeader} />
            </ToolCard>
          ) : (
            <LockedTool icon={<ShieldCheck className="h-4 w-4" />} title="AdSense Content Policy Checker" description="Check any article for AdSense policy violations before publishing" onUnlock={() => openUpgrade('Content Policy Checker')} />
          )}

        </div>
      </div>
    </>
  )
}
