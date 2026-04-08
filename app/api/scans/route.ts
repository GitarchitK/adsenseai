import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, getUserScans } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit  = Math.min(Number(searchParams.get('limit')  ?? 20), 50)
    const offset = Number(searchParams.get('offset') ?? 0)

    const scans = await getUserScans(profile.uid, limit, offset)
    return NextResponse.json({ scans, plan: profile.plan || 'free' })
  } catch (err) {
    console.error('[/api/scans] error:', err)
    return NextResponse.json({ error: 'Internal server error.', scans: [] }, { status: 500 })
  }
}
