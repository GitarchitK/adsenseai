import { NextRequest, NextResponse } from 'next/server'
import { normalizeUrl, getDomain, stripHtmlTags, cleanTextContent, countWords, extractLinks, extractHeadings, extractTitle, extractMetaDescription } from '@/lib/crawler-utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { buildDeepCrawlResult } from '@/services/crawler'
import { computeScores } from '@/lib/scores'
import type { CrawledPage, SiteStructure } from '@/types'

// Phase 2+ of multi-request crawl.
// Takes scan_id + a list of URLs to crawl, crawls them,
// merges with existing crawlData in Firestore, updates the scan.
// Called multiple times by the client with different URL batches.

const BATCH_SIZE = 8  // pages per request — keeps us well under 10s

async function fetchPage(url: string, timeoutMs = 5000): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), timeoutMs)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 AdSenseCheckerAI/2.0',
        'Accept': 'text/html,application/xhtml+xml,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    clearTimeout(t)
    if (!res.ok) return null
    const ct = res.headers.get('content-type') ?? ''
    if (!ct.includes('text/') && !ct.includes('application/xhtml')) return null
    return await res.text()
  } catch {
    return null
  }
}

async function crawlPageLight(url: string): Promise<CrawledPage | null> {
  const html = await fetchPage(url)
  if (!html) return null

  const plain = stripHtmlTags(html)
  const content = cleanTextContent(plain)
  const imgMatches = html.match(/<img[^>]*>/gi) ?? []
  const imagesTotal = imgMatches.length
  const imagesMissingAlt = imgMatches.filter(t => {
    const m = t.match(/alt\s*=\s*["']([^"']*)["']/i)
    return !m || m[1].trim() === ''
  }).length

  const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i)
  const footerHtml = footerMatch?.[1]?.toLowerCase() ?? ''

  const policyKeywords = ['gambling', 'casino', 'porn', 'xxx', 'escort', 'weapon', 'firearm', 'drugs', 'pharma', 'steroids', 'buy followers', 'hack', 'crack', 'warez']
  const policyViolations = policyKeywords.filter(k => new RegExp(`\\b${k}\\b`, 'i').test(plain))

  const page: CrawledPage = {
    url,
    title: extractTitle(html, url),
    content,
    word_count: countWords(content),
    headings: extractHeadings(html),
    links: extractLinks(html, url),
    images_total: imagesTotal,
    images_missing_alt: imagesMissingAlt,
    has_schema_markup: html.includes('application/ld+json') || html.includes('itemtype="https://schema.org'),
    is_https: url.startsWith('https://'),
    has_adsense_code: html.includes('ca-pub-') || html.includes('pagead2.googlesyndication.com'),
    policy_violation_keywords: policyViolations,
    footer_privacy_link: footerHtml.includes('privacy'),
    footer_contact_link: footerHtml.includes('contact'),
  }

  const meta = extractMetaDescription(html)
  if (typeof meta === 'string' && meta.trim()) page.meta_description = meta

  return page
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0]?.trim() : 'anonymous'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

    const body = await request.json()
    const { scan_id, urls } = body as { scan_id: string; urls: string[] }

    if (!scan_id || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'scan_id and urls[] required.' }, { status: 400 })
    }

    const profile = await getAuthenticatedProfile(
      request.headers.get('authorization'),
      request.headers.get('x-guest-id')
    )

    // Verify scan ownership
    const scanRef = adminDb.collection('scans').doc(scan_id)
    const scanDoc = await scanRef.get()
    if (!scanDoc.exists) {
      return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })
    }

    const scanData = scanDoc.data()
    const isLegacyGuestScan = scanData?.userId === 'guest'

    if (!isLegacyGuestScan) {
      if (!profile || scanData?.userId !== profile.uid) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
      }
    }

    // Crawl this batch
    const batch = urls.slice(0, BATCH_SIZE)
    const results = await Promise.allSettled(batch.map(u => crawlPageLight(u)))
    const newPages: CrawledPage[] = results
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter((p): p is CrawledPage => p !== null)

    if (newPages.length === 0) {
      return NextResponse.json({ success: true, pages_crawled: 0, remaining: urls.slice(BATCH_SIZE).length })
    }

    // Merge into existing scan data
    const existingData = scanDoc.data()
    const existingCrawlData = (existingData?.crawlData ?? {}) as Record<string, unknown>

    // We store pages as raw array in crawlData._rawPages for merging
    const existingRawPages: CrawledPage[] = (existingCrawlData._rawPages as CrawledPage[] | undefined) ?? []
    const mergedPages = [...existingRawPages, ...newPages]

    // Rebuild site_structure from all crawled pages
    const siteStructure: SiteStructure = {
      has_privacy: mergedPages.some(p => p.url.toLowerCase().includes('privacy')),
      has_about: mergedPages.some(p => p.url.toLowerCase().includes('about')),
      has_contact: mergedPages.some(p => p.url.toLowerCase().includes('contact')),
      has_terms: mergedPages.some(p => p.url.toLowerCase().includes('terms')),
      has_disclaimer: mergedPages.some(p => p.url.toLowerCase().includes('disclaimer')),
      is_https: mergedPages.every(p => p.is_https),
      has_ads_txt: existingCrawlData.hasAdsTxt as boolean ?? false,
      ads_txt_valid: existingCrawlData.adsTxtValid as boolean ?? false,
      has_adsense_code: mergedPages.some(p => p.has_adsense_code),
      schema_pages: mergedPages.filter(p => p.has_schema_markup).length,
      images_missing_alt: mergedPages.reduce((s, p) => s + (p.images_missing_alt ?? 0), 0),
      has_sitemap: true,
    }

    const fakeCrawlResponse = {
      success: true,
      pages: mergedPages,
      site_structure: siteStructure,
      total_pages: mergedPages.length,
      domain: getDomain(existingData?.websiteUrl ?? ''),
      crawl_time_ms: 0,
    }

    const updatedDeepCrawl = buildDeepCrawlResult(fakeCrawlResponse)
    const updatedScores = computeScores(fakeCrawlResponse)

    const crawlDataToSave = {
      ...updatedDeepCrawl,
      samplePostTitles: (updatedDeepCrawl.samplePostTitles ?? []).slice(0, 10),
      _rawPages: mergedPages.slice(0, 60), // keep raw pages for future merges
    } as unknown as Record<string, unknown>

    await scanRef.update({
      crawlData: crawlDataToSave,
      scores: updatedScores,
      finalScore: updatedScores.final_score,
      statusLabel: updatedScores.status_label,
      updatedAt: new Date().toISOString(),
    })

    const remainingUrls = urls.slice(BATCH_SIZE)
    return NextResponse.json({
      success: true,
      pages_crawled: newPages.length,
      total_pages: mergedPages.length,
      remaining: remainingUrls.length,
      has_more: remainingUrls.length > 0,
      scores: updatedScores,
    })
  } catch (err) {
    console.error('[/api/crawl/batch] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
