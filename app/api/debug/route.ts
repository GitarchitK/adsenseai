import { NextRequest, NextResponse } from 'next/server'
import { isAdminInitialized, adminAuth } from '@/lib/firebase-admin'

// GET /api/debug — diagnose Firebase Admin setup
// DELETE THIS FILE before deploying to production
export async function GET(request: NextRequest) {
  const initialized = isAdminInitialized()

  const info: Record<string, unknown> = {
    adminInitialized: initialized,
    projectId: process.env.FIREBASE_PROJECT_ID ?? 'NOT SET',
    clientEmailDomain: process.env.FIREBASE_CLIENT_EMAIL
      ? process.env.FIREBASE_CLIENT_EMAIL.split('@')[1]
      : 'NOT SET',
    privateKeyFirstChars: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.slice(0, 30) + '...'
      : 'NOT SET',
    privateKeyHasNewlines: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.includes('\n')
      : false,
  }

  // Try to verify a token if one is provided
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ') && initialized) {
    try {
      const decoded = await adminAuth.verifyIdToken(authHeader.slice(7))
      info.tokenVerification = 'SUCCESS'
      info.tokenUid = decoded.uid
      info.tokenEmail = decoded.email
    } catch (err) {
      info.tokenVerification = 'FAILED'
      info.tokenError = (err as Error).message
    }
  } else if (authHeader?.startsWith('Bearer ') && !initialized) {
    info.tokenVerification = 'SKIPPED — Admin not initialized'
  } else {
    info.tokenVerification = 'No token provided — add Authorization: Bearer <token> header to test'
  }

  return NextResponse.json(info, { status: 200 })
}
