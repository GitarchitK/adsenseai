import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { WebsiteCrawler } from '@/services/crawler'
import { analyzeAllArticles, buildArticleReportSummary } from '@/services/ai-articles'
import { hasFeature } from '@/lib/plans'

export const maxDuration = 60

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (!hasFeature(profile.plan, 'ai_report')) {
      return NextResponse.json({ error: 'Pro plan required for article analysis.' }, { status: 403 })
    }

    const { id } = params
    if (!id) return NextResponse.json({ error: 'Missing scan id' }, { status: 400 })

    const scanRef = adminDb.collection('users').doc(profile.uid).collection('scans').doc(id)
    const scanSnap = await scanRef.get()
    
    if (!scanSnap.exists) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    const scan = scanSnap.data() as any
    if (scan.articleReport) {
      return NextResponse.json({ success: true, report: scan.articleReport })
    }

    // Crawl for articles, but fast (max 60 pages)
    const crawler = new WebsiteCrawler(scan.websiteUrl, { maxPages: 60, timeout: 20000 })
    const crawl = await crawler.crawl()

    if (!crawl.success || crawl.pages.length === 0) {
      return NextResponse.json({ error: crawl.error ?? 'Failed to crawl site for articles.' }, { status: 400 })
    }

    const articles = await analyzeAllArticles(crawl.pages)
    const report = buildArticleReportSummary(articles)

    await scanRef.update({ articleReport: report, updatedAt: new Date().toISOString() })

    return NextResponse.json({ success: true, report })
  } catch (err) {
    console.error('[/api/scans/[id]/articles] error:', err)
    return NextResponse.json({ error: 'Failed to analyze articles' }, { status: 500 })
  }
}
