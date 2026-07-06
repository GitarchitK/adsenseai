import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getAuthenticatedProfile, saveScan } from '@/lib/auth-server'
import { WebsiteCrawler } from '@/services/crawler'
import { generateAIReport } from '@/services/ai-report'
import { computeScores } from '@/lib/scores'
import { adaptRoadmap } from '@/services/ai-roadmap-adapt'
import { getDomain } from '@/lib/crawler-utils'
import type { UserPlan } from '@/lib/firebase-types'


export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  // Allow cron or authenticated user
  const authHeader = request.headers.get('authorization')
  let isCron = false
  let userId: string | null = null

  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    isCron = true
  } else {
    const profile = await getAuthenticatedProfile(authHeader)
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    userId = profile.uid
  }

  try {
    const { planId } = await params
    const planRef = adminDb.collection('plans').doc(planId)
    const planSnap = await planRef.get()
    
    if (!planSnap.exists) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })
    }

    const plan = planSnap.data() as UserPlan

    // If user triggered, verify ownership
    if (!isCron && plan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    if (plan.status !== 'active') {
      return NextResponse.json({ error: 'Plan is not active.' }, { status: 400 })
    }

    console.log(`[recrawl] Starting re-crawl for plan ${planId}, URL: ${plan.url}`)

    // 1. Re-crawl the site
    const crawler = new WebsiteCrawler(plan.url, { maxPages: 150, timeout: 60000, fullSitemap: true })
    const crawlResult = await crawler.crawl()
    if (!crawlResult.success) {
      return NextResponse.json({ error: crawlResult.error ?? 'Crawl failed.' }, { status: 400 })
    }

    // 2. Score and run AI analysis
    const scores = computeScores(crawlResult)
    const aiReport = await generateAIReport(crawlResult)

    // 3. Save new scan to get a scanId
    const scanId = await saveScan(plan.userId, {
      userId: plan.userId,
      websiteUrl: plan.url,
      domain: getDomain(plan.url),
      status: 'completed',
      finalScore: aiReport.final_score,
      statusLabel: aiReport.status_label,
      scores: scores as unknown as Record<string, unknown>,
      crawlData: crawlResult as unknown as Record<string, unknown>,
      aiReport: aiReport as any,
      isAiUnlocked: true, // Plans always unlock AI report
    })

    if (!scanId) {
      return NextResponse.json({ error: 'Failed to save new scan.' }, { status: 500 })
    }

    // 4. Adapt remaining days
    const adaptResult = await adaptRoadmap(plan, aiReport, scanId, scores.final_score)

    // 5. Update plan document
    const updatedHistory = [...plan.crawlHistory, { day: plan.currentDay, scanId }]

    await planRef.update({
      roadmap: adaptResult.roadmap,
      totalDays: adaptResult.newTotalDays,
      lastCrawlDay: plan.currentDay, // Record that we re-crawled on this day
      crawlHistory: updatedHistory,
      updatedAt: new Date().toISOString()
    })

    console.log(`[recrawl] Successfully adapted roadmap for plan ${planId}`)

    return NextResponse.json({ success: true, newTotalDays: adaptResult.newTotalDays, scanId })
  } catch (err) {
    console.error('[plans-recrawl] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
