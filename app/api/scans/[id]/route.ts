import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, getScanById } from '@/lib/auth-server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const profile = await getAuthenticatedProfile(
      request.headers.get('authorization'),
      request.headers.get('x-guest-id')
    )
    
    const { adminDb } = await import('@/lib/firebase-admin')
    const scanDoc = await adminDb.collection('scans').doc(id).get()
    if (!scanDoc.exists) return NextResponse.json({ error: 'Scan not found.' }, { status: 404 })
    
    const scan = scanDoc.data()
    const isLegacyGuestScan = scan?.userId === 'guest'
    
    if (!isLegacyGuestScan) {
      if (!profile || scan?.userId !== profile.uid) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 })
      }
    }

    return NextResponse.json({ scan })
  } catch (err) {
    console.error('[/api/scans/[id]] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
