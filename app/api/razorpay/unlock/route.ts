import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { getRazorpay, CURRENCY, verifyPaymentSignature } from '@/lib/razorpay'
import { adminDb } from '@/lib/firebase-admin'
import { generateMasterReport } from '@/services/ai-master-report'
import { sendFullReportEmail } from '@/services/email'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: any
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const { action, scanId, url } = body
  if (!scanId) return NextResponse.json({ error: 'Missing scanId' }, { status: 400 })

  if (action === 'create_order') {
    const amount = 1900 // ₹19.00 = 1900 paise
    try {
      const order = await getRazorpay().orders.create({
        amount,
        currency: CURRENCY,
        receipt: `unlock_${profile.uid.slice(0, 8)}_${Date.now()}`,
        notes: { userId: profile.uid, type: 'report_unlock', scanId, url: url || '' },
      })
      return NextResponse.json({
        orderId:  order.id,
        amount:   order.amount,
        currency: order.currency,
        keyId:    process.env.RAZORPAY_KEY_ID,
      })
    } catch (err) {
      console.error('[unlock] Razorpay order creation failed:', err)
      return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 })
    }
  }

  if (action === 'verify') {
    const { orderId, paymentId, signature } = body
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json({ error: 'Missing required payment fields.' }, { status: 400 })
    }

    const isValid = verifyPaymentSignature(orderId, paymentId, signature)
    if (!isValid) return NextResponse.json({ error: 'Invalid payment signature.' }, { status: 400 })

    try {
      const scanRef = adminDb.collection('scans').doc(scanId)
      const scanDoc = await scanRef.get()
      
      if (!scanDoc.exists) return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })
      const scanData = scanDoc.data()
      if (scanData?.userId !== profile.uid) return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })

      // Step 4: On successful payment: 1. Run generateMasterReport() with the saved crawl data
      let finalAiReport = scanData.aiReport
      if (scanData.crawlData) {
        console.log('[unlock] Generating fresh master report upon payment...');
        finalAiReport = await generateMasterReport(scanData.crawlData)
      }

      await scanRef.update({
        aiReport: finalAiReport,
        isAiUnlocked: true,
        unlockedAt: new Date().toISOString()
      })

      // Send email
      if (profile.email && finalAiReport) {
        await sendFullReportEmail(
          profile.email,
          profile.fullName || 'Creator',
          finalAiReport,
          url || scanData.domain,
          scanId
        )
      }

      return NextResponse.json({ success: true, aiReport: finalAiReport })
    } catch (err) {
      console.error('[unlock] Failed to process unlocked report:', err)
      return NextResponse.json({ error: 'Payment verified but failed to unlock report.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
