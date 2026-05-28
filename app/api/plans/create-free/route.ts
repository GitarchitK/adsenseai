import { NextRequest, NextResponse } from 'next/server'
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

  const { scanId } = body

  if (!scanId) {
    return NextResponse.json({ error: 'Missing scanId.' }, { status: 400 })
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

  // Generate roadmap
  const roadmap = await generateRoadmap(scanId, days, aiReport)

  // Create plans/{planId} document
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
    pricePaid: 0,
    razorpayOrderId: 'FREE_PLAN',
    razorpayPaymentId: 'FREE_PLAN',
    roadmap,
    completedDays: [],
    lastCrawlDay: 1,
    crawlHistory: [{
      day: 1,
      scanId,
    }]
  }

  await planRef.set(userPlan)

  // Update users/{uid}.activePlanId
  await updateUserProfile(profile.uid, {
    activePlanId: planRef.id,
    planStatus: 'active'
  })

  // Send welcome email (Day 1)
  const day1Task = roadmap.find(d => d.day === 1)
  if (day1Task) {
    try {
      await sendDailyEmail(profile.uid, planRef.id, 1, day1Task, profile.email)
    } catch (err) {
      console.error('Failed to send Day 1 email', err)
    }
  }

  // Return { planId }
  return NextResponse.json({ success: true, planId: planRef.id })
}
