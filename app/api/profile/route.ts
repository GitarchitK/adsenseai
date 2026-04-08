import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, updateUserProfile } from '@/lib/auth-server'
import { PLANS } from '@/lib/plans'

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    const monthKey = new Date().toISOString().slice(0, 7)
    const scansThisMonth = profile.scansMonthKey === monthKey ? profile.scansThisMonth : 0
    const userPlan = profile.plan || 'free'
    const limit = PLANS[userPlan as keyof typeof PLANS]?.scans_per_month ?? PLANS.free.scans_per_month

    return NextResponse.json({
      profile: { ...profile, plan: userPlan },
      usage: {
        scans_this_month: scansThisMonth,
        scans_limit: limit,
        total_scans: profile.totalScans,
      },
    })
  } catch (err) {
    console.error('[/api/profile] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    const { full_name } = await request.json()
    await updateUserProfile(profile.uid, { fullName: full_name })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/profile PATCH] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
