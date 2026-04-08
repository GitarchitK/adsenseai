/**
 * TEST ENDPOINT — bypasses auth to verify crawler + AI pipeline
 * DELETE THIS FILE before deploying to production
 */
import { NextRequest, NextResponse } from 'next/server'
import { WebsiteCrawler } from '@/services/crawler'
import { normalizeUrl } from '@/lib/crawler-utils'
import { computeScores } from '@/lib/scores'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    const normalizedUrl = normalizeUrl(url)
    console.log(`[test-crawl] Crawling: ${normalizedUrl}`)

    const crawler = new WebsiteCrawler(normalizedUrl, { maxPages: 10, timeout: 30000 })
    const result = await crawler.crawl()

    if (!result.success) {
      return NextResponse.json({ error: result.error, success: false }, { status: 400 })
    }

    const scores = computeScores(result)

    return NextResponse.json({
      success: true,
      domain: result.domain,
      total_pages: result.total_pages,
      crawl_time_ms: result.crawl_time_ms,
      pages_summary: result.pages.map(p => ({
        url: p.url,
        title: p.title,
        word_count: p.word_count,
        has_meta: !!p.meta_description,
        h1_count: p.headings.h1.length,
        content_preview: p.content.slice(0, 200),
      })),
      site_structure: result.site_structure,
      scores,
    })
  } catch (err) {
    console.error('[test-crawl] error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
