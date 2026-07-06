import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler, buildDeepCrawlResult } from '@/services/crawler'
import { normalizeUrl, getDomain } from '@/lib/crawler-utils'
import { computeScores } from '@/lib/scores'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthenticatedProfile, incrementScanCount, saveScan } from '@/lib/auth-server'
import { canRunScan } from '@/lib/plans'

// Phase 1 of a multi-request crawl.
// Vercel Hobby = 10s per function. This crawls only the first batch of pages,
// saves the scan, and returns remaining URLs for the client to continue via /api/crawl/batch.

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

    // ── Phase 1 Crawl: homepage + mandatory pages only (very fast) ───────────
    // Max 8 pages so we finish well within 10s
    const PHASE1_PAGES = 8
    const crawler = new WebsiteCrawler(normalizedUrl, { maxPages: PHASE1_PAGES, timeout: 6000, fullSitemap: true })
    const crawlResult = await crawler.crawl()

    if (!crawlResult.success) {
      return NextResponse.json({ success: false, error: crawlResult.error ?? 'Crawl failed.' }, { status: 400 })
    }

    // ── Score & Deep Crawl ──────────────────────────────────────────────────
    const scores = computeScores(crawlResult)
    const deepCrawlData = buildDeepCrawlResult(crawlResult)

    // ── Persist Phase 1 ─────────────────────────────────────────────────────
    await incrementScanCount(profile.uid)

    const crawlDataToSave = {
      ...deepCrawlData,
      samplePostTitles: (deepCrawlData.samplePostTitles ?? []).slice(0, 10),
    } as unknown as Record<string, unknown>

    const scanId = await saveScan(profile.uid, {
      userId:       profile.uid,
      websiteUrl:   normalizedUrl,
      domain:       getDomain(normalizedUrl),
      status:       'completed',
      finalScore:   scores.final_score,
      statusLabel:  scores.status_label,
      scores:       scores as unknown as Record<string, unknown>,
      crawlData:    crawlDataToSave,
      aiReport:     null,
      seoHook:      null,
      isAiUnlocked: isPro,
    })

    // Figure out remaining URLs for subsequent batch requests
    const crawledSet = new Set(crawlResult.pages.map(p => p.url))
    const remainingUrls = (crawlResult.sitemap_urls ?? [])
      .filter(u => !crawledSet.has(u))
      .slice(0, isPro ? 60 : 20)  // cap total additional pages

    return NextResponse.json({
      success: true,
      domain: getDomain(normalizedUrl),
      scores,
      scan_id: scanId,
      plan: userPlan,
      isAiUnlocked: isPro,
      crawl_data: deepCrawlData,
      // Client uses these to fire batch requests
      remaining_urls: remainingUrls,
      phase: 1,
      total_pages_so_far: crawlResult.pages.length,
    })
  } catch (err) {
    const msg = (err as Error).message ?? String(err)
    console.error('[/api/crawl] unhandled error:', msg)
    return NextResponse.json({ success: false, error: 'Internal server error.' }, { status: 500 })
  }
}
