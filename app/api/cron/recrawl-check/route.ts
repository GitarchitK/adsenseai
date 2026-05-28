import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import type { UserPlan } from '@/lib/firebase-types'
import { getAuthenticatedProfile } from '@/lib/auth-server'

export const maxDuration = 120

export async function GET(request: NextRequest) {
  // Allow cron or authenticated admin (for testing)
  const authHeader = request.headers.get('authorization')
  let isCron = false

  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    isCron = true
  } else {
    const profile = await getAuthenticatedProfile(authHeader)
    if (!profile || profile.email !== process.env.ADMIN_EMAILS?.split(',')[0]) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }
  }

  try {
    const activePlans = await adminDb.collection('plans')
      .where('status', '==', 'active')
      .get()

    let triggeredCount = 0

    // Next.js URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // triggerRecrawl function logic
    const triggerRecrawl = async (planId: string) => {
      try {
        const response = await fetch(`${baseUrl}/api/plans/${planId}/recrawl`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            'Content-Type': 'application/json'
          }
        })
        if (!response.ok) {
          console.error(`Failed to trigger recrawl for plan ${planId}`, await response.text())
        }
      } catch (err) {
        console.error(`Error triggering recrawl for plan ${planId}:`, err)
      }
    }

    for (const planDoc of activePlans.docs) {
      const data = planDoc.data() as UserPlan
      
      if (
        data.currentDay % 5 === 0 &&
        data.lastCrawlDay !== data.currentDay
      ) {
        // We trigger it asynchronously to not block the cron request 
        // Vercel handles long running fetch promises if not awaited, but we shouldn't rely on it.
        // It's better to await them but doing it sequentially might hit the maxDuration limit.
        // For now, we await it sequentially to avoid silent failures.
        await triggerRecrawl(planDoc.id)
        triggeredCount++
      }
    }

    return NextResponse.json({ success: true, triggeredCount })
  } catch (err) {
    console.error('[cron-recrawl-check] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
