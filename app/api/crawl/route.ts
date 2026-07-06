import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler } from '@/services/crawler'
import { normalizeUrl, getDomain } from '@/lib/crawler-utils'
import { computeScores } from '@/lib/scores'
import { generateAIReport } from '@/services/ai-report'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthenticatedProfile, incrementScanCount, saveScan } from '@/lib/auth-server'
import { canRunScan } from '@/lib/plans'
import { generateAiMasterReport, generateSeoBlogHook } from '@/services/ai-master-report'
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
    let seoHook = null
    let aiReport = null
    let previewReport = null

    // ── AI report — wrapped in 90s timeout so it can't kill the crawl ─────
    const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> =>
      Promise.race([
        promise.catch(e => { console.error(`[AI] ${label} error:`, e?.message ?? e); return null }),
        new Promise<null>(resolve => setTimeout(() => { console.warn(`[AI] ${label} timed out after ${ms}ms`); resolve(null) }, ms)),
      ])

    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('[crawl] Starting AI master report…')
        aiReport = await withTimeout(generateAiMasterReport(deepCrawlData), 85000, 'generateAiMasterReport')
        console.log('[crawl] AI master report done:', aiReport ? 'OK' : 'FAILED/TIMEOUT')

        if (aiReport) {
          seoHook = await withTimeout(generateSeoBlogHook(deepCrawlData, aiReport), 20000, 'generateSeoBlogHook')

          // Build preview for client
          previewReport = {
            readinessScore: aiReport.readinessScore,
            approvalChance: aiReport.approvalChance,
            approvalChancePercent: aiReport.approvalChancePercent,
            detectedNiche: aiReport.detectedNiche,
            strengths: aiReport.strengths,
            risks: aiReport.risks,
            top3Issues: aiReport.top3Issues.map(i => ({
              rank: i.rank,
              title: i.title,
              basicDetail: i.basicDetail,
              priorityLabel: i.priorityLabel
            }))
          }
        }
      } catch (err) {
        console.error('[crawl] AI report generation failed unexpectedly:', err)
        // Don't re-throw — scan still succeeds without AI report
      }
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    await incrementScanCount(profile.uid)

    // Trim crawlData to avoid Firestore 1 MB document limit
    const crawlDataToSave = {
      ...deepCrawlData,
      samplePostTitles: (deepCrawlData.samplePostTitles ?? []).slice(0, 10),
    } as unknown as Record<string, unknown>

    const crawlDataSize = JSON.stringify(crawlDataToSave).length
    console.log(`[crawl] crawlData size: ${Math.round(crawlDataSize / 1024)}KB`)

    const scanId = await saveScan(profile.uid, {
      userId:       profile.uid,
      websiteUrl:   normalizedUrl,
      domain:       getDomain(normalizedUrl),
      status:       'completed',
      finalScore:   aiReport?.readinessScore ?? scores.final_score,
      statusLabel:  aiReport?.approvalChance ?? scores.status_label,
      scores:       scores as unknown as Record<string, unknown>,
      crawlData:    crawlDataToSave,
      aiReport:     aiReport as any | null,
      seoHook:      seoHook as any | null,
      isAiUnlocked: isPro,
    })

    if (!scanId) {
      console.error('[crawl] saveScan returned null — Firestore save failed. crawlData size was:', Math.round(crawlDataSize / 1024), 'KB')
      // Still return partial success so the user sees their scan results
      return NextResponse.json({
        success: true,
        domain: getDomain(normalizedUrl),
        scores,
        ai_report: isPro ? aiReport : previewReport,
        seo_hook: seoHook,
        scan_id: null,
        plan: userPlan,
        isAiUnlocked: isPro,
        crawl_data: deepCrawlData,
        warning: 'Scan results could not be saved. Please try again.',
      })
    }

    return NextResponse.json({
      success: true,
      domain: getDomain(normalizedUrl),
      scores,
      ai_report: isPro ? aiReport : previewReport,
      seo_hook: seoHook,
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
