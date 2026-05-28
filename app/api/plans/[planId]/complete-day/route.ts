import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import type { UserPlan } from '@/lib/firebase-types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: { day?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (typeof body.day !== 'number') {
    return NextResponse.json({ error: 'day must be a number.' }, { status: 400 })
  }

  try {
    const { planId } = await params
    const planRef = adminDb.collection('plans').doc(planId)
    const planSnap = await planRef.get()
    
    if (!planSnap.exists) {
      return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })
    }

    const plan = planSnap.data() as UserPlan
    if (plan.userId !== profile.uid) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
    }

    if (body.day > plan.currentDay) {
      return NextResponse.json({ error: 'Cannot complete a future day.' }, { status: 400 })
    }

    await planRef.update({
      completedDays: FieldValue.arrayUnion(body.day),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, completedDay: body.day })
  } catch (err) {
    console.error('[plans-complete-day] Error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
