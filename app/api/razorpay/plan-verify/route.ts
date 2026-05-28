import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { getAuthenticatedProfile, updateUserProfile } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { generateRoadmap } from '@/services/ai-roadmap'
import { sendDailyEmail } from '@/services/email'
import type { ScanRecord, UserPlan } from '@/lib/firebase-types'
import type { AIReport } from '@/services/ai-report'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: Record<string, string>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const { orderId, paymentId, signature, scanId } = body

  if (!orderId || !paymentId || !signature || !scanId) {
    return NextResponse.json({ error: 'Missing payment details or scanId.' }, { status: 400 })
  }

  // 1. Verify Razorpay signature
  const isValid = verifyPaymentSignature({ orderId, paymentId, signature })
  if (!isValid) {
    await adminDb.collection('payment_events').add({
      type: 'verification_failed',
      userId: profile.uid,
      orderId, paymentId,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
  }

  // Fetch scan data
  const scanSnap = await adminDb.collection('scans').doc(scanId).get()
  if (!scanSnap.exists) {
    return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })
  }
  const scanData = scanSnap.data() as ScanRecord
  const aiReport = scanData.aiReport as unknown as AIReport
  
  if (!aiReport?.coaching_estimate) {
    return NextResponse.json({ error: 'No coaching estimate found for this scan.' }, { status: 400 })
  }

  const days = aiReport.coaching_estimate.days
  const pricePaid = days * 500

  // 2. Call generateRoadmap()
  const roadmap = await generateRoadmap(scanId, days, aiReport)

  // 3. Create plans/{planId} document
  const planRef = adminDb.collection('plans').doc()
  const now = new Date().toISOString()
  
  const userPlan: UserPlan = {
    planId: planRef.id,
    userId: profile.uid,
    scanId,
    url: scanData.websiteUrl,
    totalDays: days,
    startDate: now,
    currentDay: 1,
    status: 'active',
    pricePaid,
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    roadmap,
    completedDays: [],
    lastCrawlDay: 1,
    crawlHistory: [{
      day: 1,
      scanId,
    }]
  }

  await planRef.set(userPlan)

  // 4. Update users/{uid}.activePlanId
  await updateUserProfile(profile.uid, {
    activePlanId: planRef.id,
    planStatus: 'active'
  })

  // Log payment
  await adminDb.collection('payments').add({
    userId: profile.uid,
    email: profile.email,
    orderId, paymentId,
    amount: pricePaid,
    currency: 'INR',
    type: 'coaching_plan',
    status: 'captured',
    createdAt: now,
  })

  // 5. Send welcome email (Day 1)
  const day1Task = roadmap.find(d => d.day === 1)
  if (day1Task) {
    await sendDailyEmail(profile.uid, planRef.id, 1, day1Task, profile.email)
  }

  // 6. Return { planId }
  return NextResponse.json({ success: true, planId: planRef.id })
}
