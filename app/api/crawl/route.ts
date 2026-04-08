import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler } from '@/services/crawler'
import { normalizeUrl, getDomain } from '@/lib/crawler-utils'
import { computeScores } from '@/lib/scores'
import { generateAIReport } from '@/services/ai-report'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthenticatedProfile, incrementScanCount, saveScan } from '@/lib/auth-server'
import { canRunScan } from '@/lib/plans'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    // ── Rate limit ──────────────────────────────────────────────────────────
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
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
    const crawler = new WebsiteCrawler(normalizedUrl, { maxPages: 50, timeout: 60000 })
    const crawlResult = await crawler.crawl()

    if (!crawlResult.success) {
      return NextResponse.json({ success: false, error: crawlResult.error ?? 'Crawl failed.' }, { status: 400 })
    }

    // ── Score ───────────────────────────────────────────────────────────────
    const scores = computeScores(crawlResult)

    // ── AI report (Pro only) ────────────────────────────────────────────────
    const isPro = userPlan === 'pro'
    let aiReport = null

    if (isPro && process.env.OPENAI_API_KEY) {
      try { aiReport = await generateAIReport(crawlResult) }
      catch (err) { console.error('[crawl] AI report failed (non-fatal):', err) }
    }

    // ── Persist ─────────────────────────────────────────────────────────────
    await incrementScanCount(profile.uid)

    const scanId = await saveScan(profile.uid, {
      userId:       profile.uid,
      websiteUrl:   normalizedUrl,
      domain:       getDomain(normalizedUrl),
      status:       'completed',
      finalScore:   aiReport?.final_score  ?? scores.final_score,
      statusLabel:  aiReport?.status_label ?? scores.status_label,
      scores:       scores as unknown as Record<string, unknown>,
      crawlData:    crawlResult as unknown as Record<string, unknown>,
      aiReport:     aiReport as unknown as Record<string, unknown> | null,
      isAiUnlocked: isPro,
    })

    return NextResponse.json({
      ...crawlResult,
      scores,
      ai_report:   aiReport,
      scan_id:     scanId,
      plan:        userPlan,
      is_detailed: isPro,
      crawl_data:  isPro ? null : crawlResult,
    })
  } catch (err) {
    console.error('[/api/crawl] unhandled error:', err)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
