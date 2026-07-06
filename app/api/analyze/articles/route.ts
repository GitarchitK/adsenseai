import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler } from '@/services/crawler'
import { normalizeUrl } from '@/lib/crawler-utils'
import { analyzeAllArticles, buildArticleReportSummary } from '@/services/ai-articles'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { checkRateLimit } from '@/lib/rate-limit'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })
    }

    // Auth
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Pro only
    if (!hasFeature(profile.plan, 'ai_report')) {
      return NextResponse.json({
        error: 'Article analysis requires Pro plan.',
        upgrade_required: true,
      }, { status: 403 })
    }

    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'Missing url.' }, { status: 400 })

    let normalizedUrl: string
    try { normalizedUrl = normalizeUrl(url) }
    catch { return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 }) }

    // Crawl a wider pool so the analyzer can select the latest 50 article pages
    const crawler = new WebsiteCrawler(normalizedUrl, { maxPages: 80, timeout: 60000 })
    const crawl = await crawler.crawl()

    if (!crawl.success || crawl.pages.length === 0) {
      return NextResponse.json({ error: crawl.error ?? 'Failed to crawl site.' }, { status: 400 })
    }

    // Analyze the latest likely article pages
    const articles = await analyzeAllArticles(crawl.pages)
    const summary  = buildArticleReportSummary(articles)

    return NextResponse.json({
      success: true,
      domain: crawl.domain,
      crawl_time_ms: crawl.crawl_time_ms,
      report: summary,
    })
  } catch (err) {
    console.error('[/api/analyze/articles] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
