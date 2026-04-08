import { NextRequest, NextResponse } from 'next/server'
import { createReportUnlockOrder, verifyPaymentSignature } from '@/lib/razorpay'
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

    if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
      await adminDb.collection('payment_events').add({
        type: 'unlock_verification_failed', userId: profile.uid,
        orderId, paymentId, scanId, createdAt: new Date().toISOString(),
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

    // Generate AI report
    let aiReport = null
    if (crawlData && process.env.OPENAI_API_KEY) {
      try { aiReport = await generateAIReport(crawlData as CrawlResponse) }
      catch (err) { console.error('[Unlock] AI report failed:', err) }
    }

    await unlockScanAiReport(scanId, profile.uid, aiReport as unknown as Record<string, unknown> ?? {})

    // Log unlock event
    await adminDb.collection('payment_events').add({
      type: 'report_unlocked', userId: profile.uid,
      paymentId: paymentRef.id, scanId, createdAt: now,
    })

    return NextResponse.json({ success: true, ai_report: aiReport })
  }

  // ── Pro auto-unlock (no payment needed) ──────────────────────────────────
  if (action === 'pro_unlock') {
    if (!scanId) return NextResponse.json({ error: 'Missing scanId.' }, { status: 400 })
    if (profile.plan !== 'pro') return NextResponse.json({ error: 'Pro plan required.' }, { status: 403 })

    let aiReport = null
    if (crawlData && process.env.OPENAI_API_KEY) {
      try { aiReport = await generateAIReport(crawlData as CrawlResponse) }
      catch (err) { console.error('[Unlock] Pro AI report failed:', err) }
    }

    await unlockScanAiReport(scanId, profile.uid, aiReport as unknown as Record<string, unknown> ?? {})
    return NextResponse.json({ success: true, ai_report: aiReport })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}