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

    // ── Score ───────────────────────────────────────────────────────────────
    const scores = computeScores(crawlResult)

    // ── AI report — always run, but only return full data to Pro/unlocked users ──
    // Free users get a preview (overview scores only), full report is saved server-side
    // and returned after ₹19 payment via the unlock endpoint.
    let aiReport = null
    let aiReportPreview = null  // scores + summary only, no fix list or action plan

    if (process.env.OPENAI_API_KEY) {
      try {
        const fullReport = await generateAIReport(crawlResult)
        if (isPro) {
          aiReport = fullReport
        } else {
          // Preview: give overview data so the UI shows real AI scores
          // but withhold fix_suggestions, approval_workflow, strategic_roadmap
          aiReportPreview = {
            final_score:    fullReport.final_score,
            status:         fullReport.status,
            status_label:   fullReport.status_label,
            quality_score:  fullReport.quality_score,
            policy_score:   fullReport.policy_score,
            seo_score:      fullReport.seo_score,
            ux_score:       fullReport.ux_score,
            trust_score:    fullReport.trust_score,
            adsense_ready:  fullReport.adsense_ready,
            top_issues:     fullReport.top_issues,
            application_timeline: fullReport.application_timeline,
            application_timeline_reason: fullReport.application_timeline_reason,
            // Partial module data for overview cards
            content: {
              overall_quality_score: fullReport.content.overall_quality_score,
              originality_score:     fullReport.content.originality_score,
              readability_score:     fullReport.content.readability_score,
              spam_score:            fullReport.content.spam_score,
              summary:               fullReport.content.summary,
            },
            policy: {
              adult_content:     fullReport.policy.adult_content,
              copyright_risk:    fullReport.policy.copyright_risk,
              dangerous_content: fullReport.policy.dangerous_content,
              policy_risk_score: fullReport.policy.policy_risk_score,
              violations:        fullReport.policy.violations,
              policy_summary:    fullReport.policy.policy_summary,
            },
            trust: {
              trust_score:    fullReport.trust.trust_score,
              ux_score:       fullReport.trust.ux_score,
              ux_issues:      fullReport.trust.ux_issues,
              trust_signals:  fullReport.trust.trust_signals,
              design_feedback: fullReport.trust.design_feedback,
            },
            // Locked fields — empty until paid
            fix_suggestions:   [],
            strategic_roadmap: [],
            approval_workflow: [],
            // Keep full report server-side for unlock
            _full_report_saved: true,
          }
          // Save full report for later unlock
          aiReport = fullReport
        }
      } catch (err) {
        console.error('[crawl] AI report failed (non-fatal):', err)
      }
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
      aiReport:     aiReport as unknown as Record<string, unknown> | null,  // full report saved always
      isAiUnlocked: isPro,
    })

    if (!scanId) {
      return NextResponse.json({ success: false, error: 'Failed to save scan.' }, { status: 500 })
    }

    return NextResponse.json({
      ...crawlResult,
      scores,
      // Free users get preview (real AI scores, no fix list), Pro gets full report
      ai_report:   isPro ? aiReport : aiReportPreview,
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
