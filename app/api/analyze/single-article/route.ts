import { NextRequest, NextResponse } from 'next/server'
import { normalizeUrl } from '@/lib/crawler-utils'
import { analyzeSingleArticle } from '@/services/ai-single-article'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  stripHtmlTags, cleanTextContent, countWords,
  extractTitle, extractMetaDescription, extractHeadings, extractLinks,
} from '@/lib/crawler-utils'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    if (!hasFeature(profile.plan, 'ai_report')) {
      return NextResponse.json({ error: 'Single article analysis requires Pro plan.', upgrade_required: true }, { status: 403 })
    }

    const { url } = await request.json()
    if (!url) return NextResponse.json({ error: 'Missing url.' }, { status: 400 })

    let normalizedUrl: string
    try { normalizedUrl = normalizeUrl(url) }
    catch { return NextResponse.json({ error: 'Invalid URL.' }, { status: 400 }) }

    // Fetch the full article page
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    let html: string
    try {
      const res = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 AdSenseAI-ArticleAnalyzer/1.0' },
      })
      clearTimeout(timeout)
      if (!res.ok) return NextResponse.json({ error: `Could not fetch page (HTTP ${res.status}).` }, { status: 400 })
      html = await res.text()
    } catch {
      clearTimeout(timeout)
      return NextResponse.json({ error: 'Failed to fetch the article URL.' }, { status: 400 })
    }

    const plainText = stripHtmlTags(html)
    const content = cleanTextContent(plainText)
    const page = {
      url: normalizedUrl,
      title: extractTitle(html, normalizedUrl),
      meta_description: extractMetaDescription(html),
      content,
      word_count: countWords(content),
      headings: extractHeadings(html),
      links: extractLinks(html, normalizedUrl),
    }

    if (page.word_count < 50) {
      return NextResponse.json({ error: 'Page has too little content to analyze.' }, { status: 400 })
    }

    const report = await analyzeSingleArticle(page)
    return NextResponse.json({ success: true, report })
  } catch (err) {
    console.error('[/api/analyze/single-article] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
