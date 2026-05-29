import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler } from '@/services/crawler'
import { normalizeUrl, getDomain } from '@/lib/crawler-utils'
import { computeScores } from '@/lib/scores'
import { generateAIReport } from '@/services/ai-report'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthenticatedProfile, incrementScanCount, saveScan } from '@/lib/auth-server'
import { canRunScan } from '@/lib/plans'
import { generateMasterReport } from '@/services/ai-master-report'
import { buildDeepCrawlResult } from '@/services/crawler'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit ──────────────────────────────────────────────────────────
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0]?.trim() : 'anonymous'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ success: false, error: 'Too many requests.' }, { status: 429 })
    }

    // ── Auth ────────────────────────────────────────────────────────────────
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Authentication required.' }, { status: 401 })
    }

    // ── Scan limit ──────────────────────────────────────────────────────────
    const monthKey = new Date().toISOString().slice(0, 7)
    const scansThisMonth = profile.scansMonthKey === monthKey ? profile.scansThisMonth : 0
    const userPlan = profile.plan || 'free'
    const isPro = userPlan === 'pro'

    if (!canRunScan(userPlan, scansThisMonth)) {
      return NextResponse.json({
        success: false,
        error: userPlan === 'pro'
          ? 'Monthly scan limit (200) reached. Resets on the 1st.'
          : 'Free scan limit (5) reached. Upgrade to Pro for 200 scans/month.',
        upgrade_required: true,
      }, { status: 403 })
    }

    // ── Parse URL ───────────────────────────────────────────────────────────
    let body: { url?: string }
    try { body = await request.json() }
    catch { return NextResponse.json({ success: false, error: 'Invalid request body.' }, { status: 400 }) }

    const { url } = body
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ success: false, error: 'Missing "url" parameter.' }, { status: 400 })
    }

    let normalizedUrl: string
    try { normalizedUrl = normalizeUrl(url) }
    catch { return NextResponse.json({ success: false, error: 'Invalid URL.' }, { status: 400 }) }

    // ── Crawl ───────────────────────────────────────────────────────────────
    const maxPages = isPro ? 150 : 60
    const crawler = new WebsiteCrawler(normalizedUrl, { maxPages, timeout: 60000, fullSitemap: true })
    const crawlResult = await crawler.crawl()

    if (!crawlResult.success) {
      return NextResponse.json({ success: false, error: crawlResult.error ?? 'Crawl failed.' }, { status: 400 })
    }

    // ── Score & Deep Crawl ──────────────────────────────────────────────────
    const scores = computeScores(crawlResult)
    const deepCrawlData = buildDeepCrawlResult(crawlResult)

    // ── AI report ───────────────────────────────────────────────────────────
    let aiReport = null
    let previewReport = null

    if (process.env.OPENAI_API_KEY) {
      try {
        aiReport = await generateMasterReport(deepCrawlData)
        
        // Build preview for client
        previewReport = {
          overallScore: aiReport.overallScore,
          readinessLevel: aiReport.readinessLevel,
          estimatedApprovalChance: aiReport.estimatedApprovalChance,
          nicheAnalysis: {
            mainNiche: aiReport.nicheAnalysis.mainNiche,
            subNiche: aiReport.nicheAnalysis.subNiche,
            nicheComment: aiReport.nicheAnalysis.nicheComment
          },
          whenToApply: { recommendation: aiReport.whenToApply.recommendation, reason: aiReport.whenToApply.reason },
          topIssues: [] as any[]
        }
        
        // Gather top 3 issues (titles only)
        const allIssues = [
          ...(aiReport.contentAnalysis?.problems || []),
          ...(aiReport.policyCompliance?.violations || []),
          ...(aiReport.technicalHealth?.issues || []),
          ...(aiReport.trustSignals?.issues || [])
        ].sort((a, b) => {
          const w = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
          return w[b.severity as keyof typeof w] - w[a.severity as keyof typeof w]
        })
        
        previewReport.topIssues = allIssues.slice(0, 3).map(i => ({
          issue: i.issue,
          severity: i.severity,
          detail: i.detail
        }))
        
      } catch (err) {
        console.error('Master AI Report generation failed:', err)
      }
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    await incrementScanCount(profile.uid)

    const scanId = await saveScan(profile.uid, {
      userId:       profile.uid,
      websiteUrl:   normalizedUrl,
      domain:       getDomain(normalizedUrl),
      status:       'completed',
      finalScore:   aiReport?.overallScore ?? scores.final_score,
      statusLabel:  aiReport?.readinessLevel ?? scores.status_label,
      scores:       scores as unknown as Record<string, unknown>,
      crawlData:    deepCrawlData as unknown as Record<string, unknown>,
      aiReport:     aiReport as unknown as Record<string, unknown> | null,  // full report saved always
      isAiUnlocked: isPro,
    })

    if (!scanId) {
      return NextResponse.json({ success: false, error: 'Failed to save scan.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      domain: getDomain(normalizedUrl),
      scores,
      ai_report: isPro ? aiReport : previewReport,
      scan_id: scanId,
      plan: userPlan,
      isAiUnlocked: isPro,
      crawl_data: deepCrawlData,
    })
  } catch (err) {
    const msg = (err as Error).message ?? String(err)
    const stack = (err as Error).stack ?? ''
    console.error('[/api/crawl] unhandled error:', msg, stack)
    return NextResponse.json({
      success: false,
      error: 'Internal server error.',
      // Include details in dev so you can see the real cause in the browser
      ...(process.env.NODE_ENV === 'development' && { debug: msg, stack }),
    }, { status: 500 })
  }
}
