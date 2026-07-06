import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { generateAiMasterReport, generateSeoBlogHook } from '@/services/ai-master-report'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    
    const { scanId } = await request.json()
    if (!scanId) return NextResponse.json({ error: 'scanId required' }, { status: 400 })

    const scanRef = adminDb.collection('scans').doc(scanId)
    const scanDoc = await scanRef.get()
    if (!scanDoc.exists) return NextResponse.json({ error: 'Scan not found' }, { status: 404 })

    const scanData = scanDoc.data()
    if (scanData?.userId !== profile.uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    if (!scanData?.crawlData) {
      return NextResponse.json({ error: 'No crawl data available for this scan.' }, { status: 400 })
    }

    const aiReport = await generateAiMasterReport(scanData.crawlData)
    
    const seoHook = await generateSeoBlogHook(scanData.crawlData, aiReport)
    
    // Save full report to scans/{scanId}
    await scanRef.update({ aiReport, seoHook, updatedAt: new Date().toISOString() })
    
    return NextResponse.json({ success: true, aiReport, seoHook })
  } catch (error) {
    console.error('[analyze/master] Failed to run master analysis:', error)
    return NextResponse.json({ error: 'Failed to run master analysis' }, { status: 500 })
  }
}
