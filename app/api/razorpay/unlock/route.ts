import { NextRequest, NextResponse } from 'next/server'
import { createReportUnlockOrder, verifyReportUnlockPayment } from '@/lib/razorpay'
import { getAuthenticatedProfile, getScanById, unlockScanAiReport } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { generateAIReport } from '@/services/ai-report'
import { PRICES } from '@/lib/plans'
import type { CrawlResponse } from '@/types'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  const body = await request.json()
  const { scanId, action, orderId, paymentId, signature, crawlData } = body

  // ── Create ₹19 order (requires scan in DB) ───────────────────────────────
  if (action === 'create_order') {
    if (!scanId) return NextResponse.json({ error: 'Missing scanId.' }, { status: 400 })

    const scan = await getScanById(scanId, profile.uid)
    if (!scan) return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })
    if (scan.isAiUnlocked) return NextResponse.json({ error: 'Already unlocked.' }, { status: 400 })

    try {
      const order = await createReportUnlockOrder(profile.uid, scanId)
      return NextResponse.json({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
        scanId,
      })
    } catch (err) {
      console.error('[Razorpay] Unlock order error:', err)
      return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 })
    }
  }

  // ── Create ₹19 order (direct — no DB lookup needed) ──────────────────────
  if (action === 'create_order_direct') {
    try {
      const order = await createReportUnlockOrder(profile.uid, scanId ?? `direct_${Date.now()}`)
      return NextResponse.json({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
        scanId:   scanId ?? null,
      })
    } catch (err) {
      console.error('[Razorpay] Direct unlock order error:', err)
      return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 })
    }
  }

  // ── Verify ₹19 payment + generate AI report ───────────────────────────────
  if (action === 'verify') {
    if (!orderId || !paymentId || !signature || !scanId) {
      return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 })
    }

    // Scan must exist and belong to this user (do not accept arbitrary client crawlData for unlock).
    const scan = await getScanById(scanId, profile.uid)
    if (!scan) return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })

    // Idempotency: if already unlocked, return stored report.
    if (scan.isAiUnlocked) {
      return NextResponse.json({ success: true, ai_report: scan.aiReport ?? null })
    }

    // Idempotency: if this paymentId was already processed, avoid double-writing.
    const existing = await adminDb.collection('payments')
      .where('paymentId', '==', paymentId)
      .where('plan', '==', 'report_unlock')
      .limit(1)
      .get()
    if (!existing.empty) {
      const latest = await getScanById(scanId, profile.uid)
      return NextResponse.json({ success: true, ai_report: latest?.aiReport ?? null })
    }

    const verification = await verifyReportUnlockPayment({
      userId: profile.uid,
      scanId,
      orderId,
      paymentId,
      signature,
    })

    if (!verification.ok) {
      await adminDb.collection('payment_events').add({
        type: 'unlock_verification_failed', userId: profile.uid,
        orderId, paymentId, scanId, reason: verification.reason, createdAt: new Date().toISOString(),
      })
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
    }

    const now = new Date().toISOString()

    // Save payment record — never lose this
    const paymentRef = await adminDb.collection('payments').add({
      userId:       profile.uid,
      email:        profile.email,
      orderId,
      paymentId,
      scanId,
      plan:         'report_unlock',
      amount:       PRICES.report_unlock,
      amountRupees: PRICES.report_unlock / 100,
      currency:     'INR',
      status:       'captured',
      createdAt:    now,
      updatedAt:    now,
    })

    console.log(`[Payment] Saved unlock payment ${paymentRef.id} for scan ${scanId}`)

    // Try to get crawl data from DB first, fallback to client-provided data
    const effectiveCrawlData = scan.crawlData || crawlData

    // Generate AI report — sanitize crawlData to a clean CrawlResponse
    let aiReport = null
    if (effectiveCrawlData && process.env.OPENAI_API_KEY) {
      try {
        // Strip any non-CrawlResponse fields that may have been stored in sessionStorage
        const cleanCrawl: CrawlResponse = {
          success:      true,
          pages:        effectiveCrawlData.pages        ?? [],
          site_structure: effectiveCrawlData.site_structure ?? { has_privacy: false, has_about: false, has_contact: false, has_terms: false },
          total_pages:  effectiveCrawlData.total_pages  ?? effectiveCrawlData.pages?.length ?? 0,
          domain:       effectiveCrawlData.domain       ?? '',
          crawl_time_ms: effectiveCrawlData.crawl_time_ms ?? 0,
        }
        if (cleanCrawl.pages.length === 0) {
          console.warn('[Unlock] effectiveCrawlData has no pages — cannot generate AI report')
        } else {
          aiReport = await generateAIReport(cleanCrawl)
        }
      } catch (err) { console.error('[Unlock] AI report failed:', err) }
    } else {
      console.warn('[Unlock] Missing crawlData or OPENAI_API_KEY — skipping AI report')
    }

    await unlockScanAiReport(scanId, profile.uid, aiReport as unknown as Record<string, unknown> ?? {})

    // Log unlock event
    await adminDb.collection('payment_events').add({
      type: 'report_unlocked', userId: profile.uid,
      paymentId: paymentRef.id, scanId, createdAt: now,
    })

    return NextResponse.json({ success: true, ai_report: aiReport })
  }

  // ── Pro auto-unlock or Re-generate unlocked (no payment needed) ──────────
  if (action === 'pro_unlock') {
    if (!scanId) return NextResponse.json({ error: 'Missing scanId.' }, { status: 400 })

    // Try to get crawl data from DB first, fallback to client-provided data
    const scan = await getScanById(scanId, profile.uid)
    
    // Check if user is Pro OR if this specific scan was already paid for
    if (profile.plan !== 'pro' && !scan?.isAiUnlocked) {
      return NextResponse.json({ error: 'Pro plan or one-time payment required.' }, { status: 403 })
    }

    const effectiveCrawlData = scan?.crawlData || crawlData

    let aiReport = null
    if (effectiveCrawlData && process.env.OPENAI_API_KEY) {
      try {
        const cleanCrawl: CrawlResponse = {
          success:      true,
          pages:        effectiveCrawlData.pages        ?? [],
          site_structure: effectiveCrawlData.site_structure ?? { has_privacy: false, has_about: false, has_contact: false, has_terms: false },
          total_pages:  effectiveCrawlData.total_pages  ?? effectiveCrawlData.pages?.length ?? 0,
          domain:       effectiveCrawlData.domain       ?? '',
          crawl_time_ms: effectiveCrawlData.crawl_time_ms ?? 0,
        }
        if (cleanCrawl.pages.length > 0) {
          aiReport = await generateAIReport(cleanCrawl)
        }
      } catch (err) { console.error('[Unlock] AI report failed:', err) }
    }

    await unlockScanAiReport(scanId, profile.uid, aiReport as unknown as Record<string, unknown> ?? {})
    return NextResponse.json({ success: true, ai_report: aiReport })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}