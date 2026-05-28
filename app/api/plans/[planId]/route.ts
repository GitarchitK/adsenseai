import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import type { UserPlan } from '@/lib/firebase-types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  try {
    const { planId } = await params
    const planSnap = await adminDb.collection('plans').doc(planId).get()
    if (!planSnap.exists) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })
    }

    const plan = planSnap.data() as UserPlan
    if (plan.userId !== profile.uid) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    // Apply Drip Logic: Strip instructions for days > currentDay
    const safeRoadmap = plan.roadmap.map(day => {
      if (day.day > plan.currentDay) {
        return {
          ...day,
          instructions: [] // Hide instructions for future days
        }
      }
      return day
    })

    return NextResponse.json({
      ...plan,
      roadmap: safeRoadmap
    })
  } catch (err) {
    console.error('[plans-get] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
