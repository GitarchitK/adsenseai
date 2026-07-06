'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, FileText, Target, Activity, CheckSquare, Search, TrendingUp, Users, SearchCode } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { AiReportV2 } from '@/lib/firebase-types'
import { ArticleCard } from '@/components/article-card'

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

  // Handle legacy v1 scans
  if (data.aiReport && !data.aiReport.masterActionPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <div className="bg-muted/30 p-8 rounded-3xl max-w-lg border border-border/50 shadow-sm">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-3">Legacy Report Format</h2>
          <p className="text-muted-foreground mb-6">This report was generated with an older version of our AI engine (v1) and cannot be displayed in the new v2 interface. Please run a new scan to get the upgraded Pro Report.</p>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  const ai: AiReportV2 = data.aiReport

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Critical') return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (priority === 'High') return <AlertTriangle className="h-5 w-5 text-orange-500" />
    if (priority === 'Medium') return <AlertTriangle className="h-5 w-5 text-amber-500" />
    return <CheckCircle2 className="h-5 w-5 text-blue-500" />
  }

  const IssueCard = ({ issue }: { issue: any }) => (
    <div className="p-5 rounded-2xl border border-border/50 bg-card mb-4 shadow-sm">
      <div className="flex gap-3 items-start">
        <div className="mt-0.5">{getPriorityIcon(issue.priorityLabel)}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
             <h4 className="font-bold text-foreground">{issue.title}</h4>
             <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-muted">{issue.category}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{issue.detail}</p>
          <div className="bg-muted/40 p-4 rounded-xl border border-border/50 text-sm">
            <span className="font-bold block mb-2 text-primary">How to fix:</span>
            <ul className="list-decimal pl-4 space-y-1 text-muted-foreground mb-3">
               {issue.howToFix?.map((step: string, i: number) => (
                  <li key={i}>{step}</li>
               ))}
            </ul>
            <div className="flex gap-4 mt-2 pt-2 border-t border-border/50 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1">⏱ {issue.estimatedTimeToFix}</span>
              <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="w-3 h-3"/> {issue.seoImpact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const ActionTaskCard = ({ task }: { task: any }) => (
    <div className="p-4 rounded-xl border border-border/50 bg-background mb-3 shadow-sm">
      <h4 className="font-bold text-[15px] mb-2">{task.task}</h4>
      <p className="text-sm text-muted-foreground mb-3 italic">{task.why}</p>
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-xs font-bold uppercase mb-2">Steps:</p>
        <ul className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
          {task.exactSteps?.map((s: string, i: number) => <li key={i}>{s}</li>)}
        </ul>
        {task.toolsNeeded?.length > 0 && (
          <p className="text-xs mt-3 pt-2 border-t border-border/50"><span className="font-bold">Tools:</span> {task.toolsNeeded.join(', ')}</p>
        )}
      </div>
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
            <h1 className="text-3xl font-black text-foreground flex items-center gap-2">
               {data.domain}
               <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20 uppercase tracking-widest">Pro Report</span>
            </h1>
            <p className="text-muted-foreground mt-1">Niche: {ai.detectedNiche} ({ai.nicheRiskLevel} risk)</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3 mb-1">
              <div className="text-right">
                <div className="text-xs font-bold uppercase text-muted-foreground">Approval Chance</div>
                <div className="text-xl font-black text-primary">{ai.approvalChancePercent}%</div>
              </div>
              <div className="h-10 w-24 bg-muted rounded-full overflow-hidden flex items-center p-1 border border-border/50">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${ai.approvalChancePercent}%` }}
                />
              </div>
            </div>
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Readiness: {typeof ai.readinessScore === 'object' && ai.readinessScore !== null && 'score' in ai.readinessScore ? (ai.readinessScore as any).score : ai.readinessScore}/100
            </div>
          </div>
        </div>

        {/* Master Action Plan (Top Level) */}
        <Card className="p-6 md:p-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-background shadow-lg">
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Target className="h-6 w-6 text-primary" /> Master Action Plan</h2>
          <p className="text-muted-foreground mb-8">Follow this plan step-by-step to get approved.</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-red-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs">1</span>
                Phase 1: Blockers
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{ai.masterActionPlan?.phase1?.estimatedTime}</p>
              {ai.masterActionPlan?.phase1?.tasks?.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
            <div>
              <h3 className="font-bold text-orange-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs">2</span>
                Phase 2: Trust
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{ai.masterActionPlan?.phase2?.estimatedTime}</p>
              {ai.masterActionPlan?.phase2?.tasks?.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
            <div>
              <h3 className="font-bold text-blue-600 flex items-center gap-2 mb-4">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs">3</span>
                Phase 3: Polish
              </h3>
              <p className="text-xs text-muted-foreground mb-4">{ai.masterActionPlan?.phase3?.estimatedTime}</p>
              {ai.masterActionPlan?.phase3?.tasks?.map((t, i) => <ActionTaskCard key={i} task={t} />)}
            </div>
          </div>
        </Card>

        {/* Detailed Sections Tabs */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 h-auto rounded-2xl bg-muted/50 p-2 gap-2">
            <TabsTrigger value="issues" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <AlertTriangle className="h-4 w-4 mr-2" /> Issues
            </TabsTrigger>
            <TabsTrigger value="content" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" /> Content
            </TabsTrigger>
            <TabsTrigger value="tech" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Activity className="h-4 w-4 mr-2" /> Technical
            </TabsTrigger>
            <TabsTrigger value="policy" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <ShieldCheck className="h-4 w-4 mr-2" /> Policy
            </TabsTrigger>
            <TabsTrigger value="seo" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Search className="h-4 w-4 mr-2" /> SEO Gap
            </TabsTrigger>
            <TabsTrigger value="checklist" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CheckSquare className="h-4 w-4 mr-2" /> Checklist
            </TabsTrigger>
            <TabsTrigger value="articles" className="rounded-xl py-3 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <SearchCode className="h-4 w-4 mr-2" /> Articles
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">

            {/* ARTICLES */}
            <TabsContent value="articles">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Deep Article Analysis</h3>
                  <p className="text-muted-foreground">Detailed breakdown of every article on your site for AdSense risks.</p>
                </div>
                {data.articleReport ? (
                  <div className="space-y-4">
                    {data.articleReport.articles.map((article: any, i: number) => (
                      <ArticleCard key={i} article={article} />
                    ))}
                    {data.articleReport.articles.length === 0 && (
                      <p className="text-sm text-muted-foreground">No articles were found during the scan.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Article analysis is not available for this scan. Run a new scan to see article analysis.</p>
                )}
              </Card>
            </TabsContent>
            
            {/* ALL ISSUES */}
            <TabsContent value="issues">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Comprehensive Issue List</h3>
                  <p className="text-muted-foreground">Every issue standing between you and approval.</p>
                </div>
                {ai.allIssues?.map((iss, i) => <IssueCard key={i} issue={iss} />)}
                {(!ai.allIssues || ai.allIssues.length === 0) && <p className="text-sm text-muted-foreground">No major issues found!</p>}
              </Card>
            </TabsContent>

            {/* CONTENT */}
            <TabsContent value="content">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Content & EEAT Analysis</h3>
                  <p className="text-muted-foreground">Evaluating your content against Google's Helpful Content System.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Average Word Count</p>
                      <p className="text-2xl font-black">{ai.contentAnalysis?.averageWordCount} <span className="text-sm font-normal text-muted-foreground">words</span></p>
                      <p className="text-xs mt-2 text-amber-600">AdSense requires minimum {ai.contentAnalysis?.minimumRequired} words for your niche.</p>
                   </div>
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                      <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Niche Consistency</p>
                      <p className="text-2xl font-black capitalize">{ai.contentAnalysis?.nicheConsistency}</p>
                      <p className="text-xs mt-2 text-muted-foreground">{ai.contentAnalysis?.nicheConsistencyDetail}</p>
                   </div>
                </div>
                <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">EEAT Signals (Experience, Expertise, Authoritativeness, Trust)</h4>
                <div className="space-y-3 mb-6 p-5 rounded-2xl bg-card border border-border/50">
                   <div className="flex items-center gap-3">
                      {ai.contentAnalysis?.eeatSignals?.authorByline ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <AlertTriangle className="w-5 h-5 text-red-500"/>}
                      <span className="text-sm font-medium">Author Byline</span>
                   </div>
                   <div className="flex items-center gap-3">
                      {ai.contentAnalysis?.eeatSignals?.publishDates ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <AlertTriangle className="w-5 h-5 text-red-500"/>}
                      <span className="text-sm font-medium">Publish Dates</span>
                   </div>
                   <div className="flex items-center gap-3">
                      {ai.contentAnalysis?.eeatSignals?.socialProof ? <CheckCircle2 className="w-5 h-5 text-emerald-500"/> : <AlertTriangle className="w-5 h-5 text-red-500"/>}
                      <span className="text-sm font-medium">Social Proof</span>
                   </div>
                   <p className="text-sm mt-4 text-muted-foreground border-t border-border/50 pt-4"><span className="font-bold text-foreground">Verdict: </span>{ai.contentAnalysis?.eeatSignals?.verdict}</p>
                   <p className="text-sm mt-2 text-muted-foreground"><span className="font-bold text-foreground">How to fix: </span>{ai.contentAnalysis?.eeatSignals?.howToImprove}</p>
                </div>
              </Card>
            </TabsContent>

            {/* TECHNICAL */}
            <TabsContent value="tech">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">Technical Health</h3>
                  <p className="text-muted-foreground">Technical signals directly impacting indexability and user experience.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                   <div className="p-5 border border-border/50 rounded-2xl bg-card">
                      <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Core Web Vitals</h4>
                      <ul className="space-y-3">
                        <li className="flex justify-between items-center text-sm"><span className="font-medium">LCP (Loading)</span> <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${ai.technicalHealth?.coreWebVitals?.lcp?.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{ai.technicalHealth?.coreWebVitals?.lcp?.status}</span></li>
                        <li className="flex justify-between items-center text-sm"><span className="font-medium">CLS (Visual Stability)</span> <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${ai.technicalHealth?.coreWebVitals?.cls?.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{ai.technicalHealth?.coreWebVitals?.cls?.status}</span></li>
                        <li className="flex justify-between items-center text-sm"><span className="font-medium">FID/INP (Interactivity)</span> <span className={`uppercase text-[10px] font-bold px-2 py-1 rounded ${ai.technicalHealth?.coreWebVitals?.fid?.status === 'pass' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{ai.technicalHealth?.coreWebVitals?.fid?.status}</span></li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-4 italic">{ai.technicalHealth?.coreWebVitals?.overallVerdict}</p>
                   </div>
                   <div className="p-5 border border-border/50 rounded-2xl bg-card">
                      <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Infrastructure</h4>
                      <ul className="space-y-4">
                        <li className="flex items-center gap-3 text-sm">{ai.technicalHealth?.httpsAndSecurity?.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />} {ai.technicalHealth?.httpsAndSecurity?.detail}</li>
                        <li className="flex items-center gap-3 text-sm">{ai.technicalHealth?.mobileFriendliness?.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />} {ai.technicalHealth?.mobileFriendliness?.detail}</li>
                        <li className="flex items-center gap-3 text-sm">{ai.technicalHealth?.sitemapAndRobots?.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-red-500" />} {ai.technicalHealth?.sitemapAndRobots?.detail}</li>
                      </ul>
                   </div>
                </div>

                <div className="p-5 border border-border/50 rounded-2xl bg-slate-900 text-slate-50">
                   <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-2">Schema Markup Generator (Copy-Paste)</h4>
                   <p className="text-sm mb-4 text-slate-300">{ai.technicalHealth?.schemaMarkup?.recommendation}</p>
                   <pre className="p-4 bg-black rounded-xl text-[11px] overflow-x-auto text-green-400">
                      <code>{ai.technicalHealth?.schemaMarkup?.codeSnippet}</code>
                   </pre>
                </div>
              </Card>
            </TabsContent>

            {/* POLICY */}
            <TabsContent value="policy">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                   <h3 className="text-xl font-black mb-2">Policy Compliance</h3>
                   <p className="text-muted-foreground">Strict checks against Google Publisher Policies.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                     <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Mandatory Pages</h4>
                     <ul className="space-y-3 text-sm">
                       <li className="flex items-center gap-2">{ai.policyCompliance?.mandatoryPagesStatus?.privacy?.present ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <AlertTriangle className="w-4 h-4 text-red-500"/>} Privacy Policy</li>
                       <li className="flex items-center gap-2">{ai.policyCompliance?.mandatoryPagesStatus?.about?.present ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <AlertTriangle className="w-4 h-4 text-red-500"/>} About Us</li>
                       <li className="flex items-center gap-2">{ai.policyCompliance?.mandatoryPagesStatus?.contact?.present ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <AlertTriangle className="w-4 h-4 text-red-500"/>} Contact</li>
                       <li className="flex items-center gap-2">{ai.policyCompliance?.mandatoryPagesStatus?.terms?.present ? <CheckCircle2 className="w-4 h-4 text-emerald-500"/> : <AlertTriangle className="w-4 h-4 text-amber-500"/>} Terms of Service</li>
                     </ul>
                   </div>
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                     <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-4">Risk Flags</h4>
                     {ai.policyCompliance?.restrictedContentFlags && ai.policyCompliance.restrictedContentFlags.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-sm text-red-600 font-medium">
                           {ai.policyCompliance.restrictedContentFlags.map((flag, i) => <li key={i}>{flag}</li>)}
                        </ul>
                     ) : (
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> No restricted content detected.</p>
                     )}
                     
                     <h4 className="font-bold uppercase tracking-widest text-xs text-muted-foreground mb-2 mt-6">Ad Network Conflicts</h4>
                     {ai.policyCompliance?.existingAdNetworkConflicts && ai.policyCompliance.existingAdNetworkConflicts.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-sm text-amber-600 font-medium">
                           {ai.policyCompliance.existingAdNetworkConflicts.map((net, i) => <li key={i}>{net}</li>)}
                        </ul>
                     ) : (
                        <p className="text-sm text-emerald-600 font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> No conflicting ad networks found.</p>
                     )}
                   </div>
                </div>
              </Card>
            </TabsContent>

            {/* SEO & COMPETITOR GAP */}
            <TabsContent value="seo">
              <Card className="p-6 md:p-8 rounded-3xl">
                <div className="mb-8">
                  <h3 className="text-xl font-black mb-2">SEO & Competitor Gap</h3>
                  <p className="text-muted-foreground">What approved competitors are doing that you aren't.</p>
                </div>

                <div className="p-5 border border-border/50 bg-primary/5 rounded-2xl mb-8">
                   <h4 className="font-bold flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-primary"/> Top Competitor Gap</h4>
                   <p className="text-sm text-muted-foreground mb-4">Compared to <span className="font-bold text-foreground">{ai.competitorGap?.topCompetitorDomain || 'Top Competitor'}</span></p>
                   
                   <div className="grid md:grid-cols-2 gap-6">
                      <div>
                         <p className="text-xs font-bold uppercase text-red-500 mb-2">What they have that you don't</p>
                         <ul className="space-y-1 text-sm">
                            {ai.competitorGap?.thingsTheyDoThatYouDont?.map((t, i) => <li key={i} className="flex gap-2"><span>-</span> {t}</li>)}
                         </ul>
                      </div>
                      <div>
                         <p className="text-xs font-bold uppercase text-primary mb-2">Quick Wins to close the gap</p>
                         <ul className="space-y-1 text-sm">
                            {ai.competitorGap?.quickWinsToCloseGap?.map((w, i) => <li key={i} className="flex gap-2 text-primary/90 font-medium"><span>→</span> {w}</li>)}
                         </ul>
                      </div>
                   </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                     <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Meta Tags Score</p>
                     <p className="text-2xl font-black">{ai.seoHealth?.metaTagsScore ?? 0}/100</p>
                   </div>
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                     <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Internal Linking Score</p>
                     <p className="text-2xl font-black">{ai.seoHealth?.internalLinkingScore ?? 0}/100</p>
                   </div>
                   <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
                     <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Est. Time to Rank</p>
                     <p className="text-lg font-bold">{ai.seoHealth?.estimatedTimeToRank || 'N/A'}</p>
                   </div>
                </div>
              </Card>
            </TabsContent>

            {/* CHECKLIST */}
            <TabsContent value="checklist">
              <Card className="p-6 md:p-8 rounded-3xl">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><CheckSquare className="w-6 h-6 text-primary"/> Final Pre-Application Checklist</h3>
                <div className="space-y-3">
                  {ai.preApplicationChecklist?.map((c, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-background">
                      {c.status === 'done' && <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />}
                      {c.status === 'unknown' && <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0" />}
                      {c.status === 'not-done' && <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                      <div className="flex-1">
                         <span className={`text-sm font-medium ${c.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                           {c.item}
                         </span>
                         {c.isBlocker && c.status !== 'done' && (
                            <p className="text-xs text-red-500 mt-1 font-bold uppercase">Immediate Blocker</p>
                         )}
                      </div>
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
