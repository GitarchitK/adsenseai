'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Target, Activity, CheckSquare } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { MasterReport, ReportIssue, ActionTask, ChecklistItem } from '@/lib/firebase-types'

export default function FullReportPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useProfile()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

  const ai: MasterReport = data.aiReport

  const getSeverityIcon = (sev: string) => {
    if (sev === 'critical') return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (sev === 'high') return <AlertTriangle className="h-5 w-5 text-orange-500" />
    if (sev === 'medium') return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle2 className="h-5 w-5 text-blue-500" />
  }

  const IssueCard = ({ issue }: { issue: ReportIssue }) => (
    <div className="p-5 rounded-2xl border border-border/50 bg-card mb-4">
      <div className="flex gap-3 items-start">
        <div className="mt-0.5">{getSeverityIcon(issue.severity)}</div>
        <div className="flex-1">
          <h4 className="font-bold text-foreground mb-1">{issue.issue}</h4>
          <p className="text-sm text-muted-foreground mb-3">{issue.detail}</p>
          <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-sm">
            <span className="font-bold block mb-1">How to fix:</span>
            {issue.howToFix}
            <div className="mt-2 text-xs font-medium text-muted-foreground flex items-center gap-1">
              ⏱ {issue.timeToFix}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ActionTaskCard = ({ task }: { task: ActionTask }) => (
    <div className="p-4 rounded-xl border border-border/50 bg-background mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-[15px]">{task.task}</h4>
        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${task.impact === 'high' ? 'bg-red-500/10 text-red-600' : 'bg-blue-500/10 text-blue-600'}`}>
          {task.impact} Impact
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">{task.detail}</p>
      <div className="text-xs font-medium text-muted-foreground">⏱ {task.estimatedTime}</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">
              <ArrowLeft className="h-4 w-4 inline mr-1" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black text-foreground">{data.domain}</h1>
            <p className="text-muted-foreground mt-1">Full AdSense Readiness Report</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3 mb-1">
              <div className="text-right">
                <div className="text-xs font-bold uppercase text-muted-foreground">Approval Chance</div>
                <div className="text-xl font-black text-primary">{ai.estimatedApprovalChance.percentage}%</div>
              </div>
              <div className="h-10 w-24 bg-muted rounded-full overflow-hidden flex items-center p-1">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${ai.estimatedApprovalChance.percentage}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Score: {ai.overallScore}/100</div>
          </div>
        </div>

        {/* Action Plan (Top Level) */}
        <Card className="p-6 md:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Target className="h-6 w-6 text-primary" /> Master Action Plan</h2>
          <p className="text-muted-foreground mb-8">Follow this plan step-by-step to get approved.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-red-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs">1</span>
                {ai.actionPlan.phase1_critical.label}
              </h3>
              {ai.actionPlan.phase1_critical.tasks.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
            <div>
              <h3 className="font-bold text-orange-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs">2</span>
                {ai.actionPlan.phase2_important.label}
              </h3>
              {ai.actionPlan.phase2_important.tasks.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
            <div>
              <h3 className="font-bold text-blue-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs">3</span>
                {ai.actionPlan.phase3_optional.label}
              </h3>
              {ai.actionPlan.phase3_optional.tasks.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
          </div>
        </Card>

        {/* Detailed Sections Tabs */}
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto rounded-2xl bg-muted/50 p-2 gap-2">
            <TabsTrigger value="content" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <FileText className="h-4 w-4 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="policy" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <ShieldCheck className="h-4 w-4 mr-2" /> Policy
            </TabsTrigger>
            <TabsTrigger value="tech" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <Activity className="h-4 w-4 mr-2" /> Technical
            </TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-md">
              <CheckSquare className="h-4 w-4 mr-2" /> Checklist
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="content">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Content Analysis — {ai.contentAnalysis.score}/100</h3>
                  <p className="text-muted-foreground">{ai.contentAnalysis.verdict}</p>
                </div>
                
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Strengths</h4>
                <ul className="space-y-2 mb-8">
                  {ai.contentAnalysis.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {s}</li>
                  ))}
                </ul>

                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Problems to Fix</h4>
                {ai.contentAnalysis.problems.map((p, i) => <IssueCard key={i} issue={p} />)}
                {ai.contentAnalysis.problems.length === 0 && <p className="text-sm text-muted-foreground">No content problems found!</p>}
              </Card>
            </TabsContent>

            <TabsContent value="policy">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Policy Compliance — {ai.policyCompliance.score}/100</h3>
                  <p className="text-muted-foreground">{ai.policyCompliance.verdict}</p>
                </div>

                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Policy Violations</h4>
                {ai.policyCompliance.violations.map((v, i) => <IssueCard key={i} issue={v} />)}
                {ai.policyCompliance.violations.length === 0 && <p className="text-sm text-muted-foreground mb-8">No policy violations detected!</p>}

                {ai.policyCompliance.missingPages.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Missing Mandatory Pages</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {ai.policyCompliance.missingPages.map((m, i) => (
                        <div key={i} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                          <h5 className="font-bold text-red-600 mb-1">{m.page}</h5>
                          <p className="text-xs text-muted-foreground">{m.howToCreate}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="tech">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Technical Health — {ai.technicalHealth.score}/100</h3>
                  <p className="text-muted-foreground">{ai.technicalHealth.verdict}</p>
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Technical Issues</h4>
                {ai.technicalHealth.issues.map((iss, i) => <IssueCard key={i} issue={iss} />)}
                {ai.technicalHealth.issues.length === 0 && <p className="text-sm text-muted-foreground">No technical issues found!</p>}
              </Card>
            </TabsContent>

            <TabsContent value="checklist">
              <Card className="p-6 md:p-8 rounded-3xl">
                <h3 className="text-xl font-black mb-6">Final Pre-Application Checklist</h3>
                <div className="space-y-3">
                  {ai.applicationReadinessChecklist.map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background">
                      {c.status === 'done' && <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />}
                      {c.status === 'partial' && <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />}
                      {c.status === 'not_done' && <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                      <span className={`text-sm font-medium ${c.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {c.item}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>

      </div>
    </div>
  )
}
