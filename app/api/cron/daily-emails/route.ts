import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { sendDailyEmail } from '@/services/email'
import type { UserPlan } from '@/lib/firebase-types'
import { getAuthenticatedProfile } from '@/lib/auth-server'

export const maxDuration = 120

export async function GET(request: NextRequest) {
  // Allow cron or authenticated user (for testing)
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

    let emailsSent = 0

    for (const planDoc of activePlans.docs) {
      const data = planDoc.data() as UserPlan
      
      // Calculate how many days have passed since the start date
      const startDate = new Date(data.startDate)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - startDate.getTime())
      const daysSinceStart = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      const newDay = daysSinceStart + 1

      // If a new day has arrived and it's within the plan duration
      if (newDay > data.currentDay && newDay <= data.totalDays) {
        // Roadmap is 0-indexed in JS array, but day field is 1-indexed
        const todayTask = data.roadmap.find(d => d.day === newDay)

        if (todayTask) {
          // Fetch user profile to get email
          const userSnap = await adminDb.collection('users').doc(data.userId).get()
          const userData = userSnap.data()
          
          if (userData && userData.email) {
            await sendDailyEmail(data.userId, data.planId, newDay, todayTask, userData.email)
            emailsSent++
          }

          await planDoc.ref.update({
            currentDay: newDay,
            updatedAt: new Date().toISOString()
          })
        }
      } else if (newDay > data.totalDays) {
        // Plan has completed
        await planDoc.ref.update({
          status: 'completed',
          updatedAt: new Date().toISOString()
        })
        await adminDb.collection('users').doc(data.userId).update({
          planStatus: 'completed'
        })
      }
    }

    return NextResponse.json({ success: true, emailsSent })
  } catch (err) {
    console.error('[cron-daily-emails] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
