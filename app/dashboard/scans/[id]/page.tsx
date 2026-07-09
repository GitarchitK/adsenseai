'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck,
  FileText, Target, Activity, CheckSquare, Search,
  TrendingUp, Clock, AlertCircle, Info, ClipboardList, ShieldAlert
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { AiReportV2 } from '@/lib/firebase-types'

export default function FullReportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const { token } = useProfile()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [checkedTasks, setCheckedTasks] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (!token || !id) return
    fetch(`/api/scans/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ scan }) => {
        if (!scan) { setLoading(false); return }
        
        // If they landed here but haven't unlocked, send them to the preview UI
        if (!scan.isAiUnlocked) {
          const payload = {
            success: true,
            domain: scan.domain,
            scores: scan.scores,
            ai_report: scan.aiReport,
            scan_id: scan.id,
            isAiUnlocked: false,
            crawl_data: scan.crawlData,
          }
          sessionStorage.setItem('lastCrawlData', JSON.stringify(payload))
          window.location.href = '/dashboard/results'
          return
        }

        setData(scan)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token, id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading full report...</p>
      </div>
    </div>
  )

  if (!data || !data.aiReport) {
    return <div className="p-8 text-center text-red-500">Report not found or not unlocked.</div>
  }

  const ai: AiReportV2 = data.aiReport

  // Compatibility handling if old report keys are present (very basic fallback)
  const overallChance = ai.overall_approval_chance || (ai as any).approvalChance || "Low"
  const summary = ai.summary || (ai as any).nicheRiskReason || ""
  const strengths = ai.strengths && Array.isArray(ai.strengths) 
    ? ai.strengths.map((s: any) => typeof s === 'string' ? s : s.title + ': ' + s.detail)
    : []
  
  const criticalIssues = ai.critical_issues || (ai as any).top3Issues?.map((i: any) => ({
    issue: i.title,
    why_it_matters: i.basicDetail,
    severity: i.priorityLabel || "Medium",
    fix: i.howToFix?.join(' ') || ""
  })) || []

  const contentAnalysis = ai.content_analysis || {
    articles_reviewed: data.crawlData?.postCount || 0,
    avg_word_count: data.crawlData?.avgWordCount || 0,
    quality_assessment: "Content quality needs manual audit.",
    thin_or_weak_pages: []
  }

  const actionPlan = ai.action_plan || [
    "Fix all critical issues listed in the checklist.",
    "Improve sitemap and robots.txt validation.",
    "Add missing mandatory pages."
  ]

  const timeline = ai.estimated_timeline || "2-4 weeks"
  const disclaimer = ai.disclaimer || "This analysis is based solely on crawled data and does not guarantee final Google AdSense approval."

  const getChanceColors = (chance: string) => {
    if (chance === 'High') return {
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      fill: 'bg-emerald-500'
    }
    if (chance === 'Medium') return {
      text: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
      fill: 'bg-amber-500'
    }
    return {
      text: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      fill: 'bg-red-500'
    }
  }

  const getSeverityColors = (sev: string) => {
    if (sev === 'High') return 'bg-red-500/10 text-red-400 border border-red-500/20'
    if (sev === 'Medium') return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
    return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
  }

  const colors = getChanceColors(overallChance)

  const toggleTask = (index: number) => {
    setCheckedTasks(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
               {data.domain}
               <span className="px-2 py-0.5 bg-violet-500/15 text-violet-400 text-[10px] rounded-full border border-violet-500/25 uppercase font-bold tracking-widest">
                 Consultant Audit
               </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Generated on {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-card border border-border/40 p-4 rounded-2xl">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Approval Chance</div>
              <div className={`text-lg font-black ${colors.text}`}>{overallChance}</div>
            </div>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${colors.bg}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${colors.fill} animate-pulse`} />
            </div>
          </div>
        </div>

        {/* Confidence Note */}
        {ai.confidence_note && (
          <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 border border-border/40 p-4 text-xs text-muted-foreground leading-relaxed">
            <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
            <p>{ai.confidence_note}</p>
          </div>
        )}

        {/* Verdict Summary */}
        <Card className="p-6 md:p-8 rounded-2xl border-border/40 bg-gradient-to-br from-card/30 to-card">
          <h2 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" /> Consultant Verdict
          </h2>
          <p className="text-sm text-foreground leading-relaxed">{summary}</p>
        </Card>

        {/* Strengths & Critical Issues Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Strengths */}
          <Card className="p-6 rounded-2xl border-border/40 h-full bg-card/50">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Key Strengths
            </h3>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((str, i) => (
                  <li key={i} className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">No prominent strengths crawled.</p>
            )}
          </Card>

          {/* Timeline & Disclaimer */}
          <Card className="p-6 rounded-2xl border-border/40 h-full bg-card/50 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-400" /> Estimated Timeline
              </h3>
              <p className="text-lg font-black text-violet-400">{timeline}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Suggested duration to fully complete all corrective action items.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/40">
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                <strong>Disclaimer:</strong> {disclaimer}
              </p>
            </div>
          </Card>
        </div>

        {/* Critical Issues */}
        <Card className="p-6 md:p-8 rounded-2xl border-border/40 bg-card/50">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-red-400" /> Critical Compliance Gaps
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Issues that must be fixed to pass the AdSense reviewer's audit.</p>
          </div>

          {criticalIssues.length > 0 ? (
            <div className="space-y-4">
              {criticalIssues.map((issue, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-background/50 space-y-3">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground">{issue.issue}</h4>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${getSeverityColors(issue.severity)}`}>
                      {issue.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Why it matters:</strong> {issue.why_it_matters}
                  </p>
                  <div className="bg-muted/30 p-3 rounded-lg border border-border/20 text-xs">
                    <strong className="block text-primary mb-1">Recommended Fix:</strong>
                    <p className="text-muted-foreground leading-relaxed">{issue.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-xs">
              🎉 No critical compliance issues detected in the crawled data!
            </div>
          )}
        </Card>

        {/* Content Quality & Analysis */}
        <Card className="p-6 md:p-8 rounded-2xl border-border/40 bg-card/50">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-blue-400" /> Content Quality Audit
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Detailed overview of content volume and quality metrics.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Sampled Articles</p>
              <p className="text-2xl font-black mt-1 text-foreground">{contentAnalysis.articles_reviewed}</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/20 border border-border/40">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Word Count</p>
              <p className="text-2xl font-black mt-1 text-foreground">
                {contentAnalysis.avg_word_count} <span className="text-xs font-normal text-muted-foreground">words</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-xs text-muted-foreground leading-relaxed bg-muted/10 p-4 rounded-xl border border-border/20">
              <strong className="block text-foreground mb-1">Quality Assessment:</strong>
              {contentAnalysis.quality_assessment}
            </div>

            {contentAnalysis.thin_or_weak_pages && contentAnalysis.thin_or_weak_pages.length > 0 && (
              <div className="space-y-2">
                <strong className="block text-xs font-bold text-foreground">Flagged Thin / Weak Pages:</strong>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-2">
                  {contentAnalysis.thin_or_weak_pages.map((url, idx) => (
                    <div key={idx} className="text-[11px] text-red-400 break-all bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                      ⚠️ {url}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Action Plan Checklist */}
        <Card className="p-6 md:p-8 rounded-2xl border-border/40 bg-card/50">
          <div className="mb-6">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-4.5 w-4.5 text-emerald-400" /> Priority Action Plan
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Check off tasks as you complete them to prepare your site for AdSense.</p>
          </div>

          <div className="space-y-2.5">
            {actionPlan.map((task, idx) => {
              const isChecked = !!checkedTasks[idx]
              return (
                <div 
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none
                    ${isChecked 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-muted-foreground' 
                      : 'bg-background/40 border-border/40 text-foreground hover:border-primary/30'}`}
                >
                  <button 
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors mt-0.5
                      ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border/80'}`}
                  >
                    {isChecked && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                  <div className="text-xs leading-relaxed">
                    <span className={isChecked ? 'line-through opacity-60' : ''}>{task}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

      </div>
    </div>
  )
}
