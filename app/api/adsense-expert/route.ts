import { NextRequest, NextResponse } from 'next/server'
import { generateAdSenseExpertReport, type AdSenseExpertInput } from '@/services/ai-adsense-expert'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * POST /api/adsense-expert
 *
 * Advanced AI AdSense Approval Expert.
 * Accepts structured website data, returns a full AdSenseExpertReport JSON.
 *
 * Auth: Bearer token required. Pro plan required.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth
    const profile = await getAuthenticatedProfile(req.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Pro gate
    if (!hasFeature(profile.plan, 'ai_report')) {
      return NextResponse.json(
        { error: 'AdSense Expert requires Pro plan.', upgrade_required: true },
        { status: 403 }
      )
    }

    const body = await req.json() as AdSenseExpertInput

    // Minimal validation
    if (!body?.domain?.domain_name) {
      return NextResponse.json({ error: 'Missing required field: domain.domain_name' }, { status: 400 })
    }
    if (typeof body?.content_summary?.total_articles_analyzed !== 'number') {
      return NextResponse.json({ error: 'Missing required field: content_summary.total_articles_analyzed' }, { status: 400 })
    }

    const report = await generateAdSenseExpertReport(body)

    return NextResponse.json({ success: true, report, generated_at: new Date().toISOString() })
  } catch (err) {
    console.error('[/api/adsense-expert]', err)
    return NextResponse.json(
      { error: 'Failed to generate report.', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
