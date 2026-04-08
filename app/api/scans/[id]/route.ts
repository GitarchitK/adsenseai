import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, getScanById } from '@/lib/auth-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

    const scan = await getScanById(id, profile.uid)
    if (!scan) return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })

    return NextResponse.json({ scan })
  } catch (err) {
    console.error('[/api/scans/[id]] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
