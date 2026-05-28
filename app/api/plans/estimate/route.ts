import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { estimateApprovalDays } from '@/services/ai-days'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ScanRecord } from '@/lib/firebase-types'
import type { AIReport } from '@/services/ai-report'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    let body: { scanId?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    if (!body.scanId) {
      return NextResponse.json({ error: 'scanId is required' }, { status: 400 })
    }

    const scanSnap = await adminDb.collection('scans').doc(body.scanId).get()
    if (!scanSnap.exists) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 })
    }

    const scanData = scanSnap.data() as ScanRecord
    if (!scanData.aiReport) {
      // If no aiReport is generated, we can't estimate accurately, but we can fall back to the basic score
      // For now, let's just require it.
      return NextResponse.json({ error: 'AI Report is required for estimation' }, { status: 400 })
    }

    const aiReport = scanData.aiReport as unknown as AIReport
    const finalScore = scanData.finalScore ?? 0

    // If we already estimated this scan, just return it
    if (aiReport.coaching_estimate) {
      return NextResponse.json({
        ...aiReport.coaching_estimate,
        price: aiReport.coaching_estimate.days * 500
      })
    }

    const estimate = await estimateApprovalDays(aiReport, finalScore)
    
    // Save estimate to scan
    await adminDb.collection('scans').doc(body.scanId).update({
      'aiReport.coaching_estimate': estimate
    })

    return NextResponse.json({
      ...estimate,
      price: estimate.days * 500
    })

  } catch (err) {
    console.error('[plans-estimate] Error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
