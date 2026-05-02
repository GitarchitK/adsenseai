import { NextRequest, NextResponse } from 'next/server'
import { isAdminInitialized, adminAuth } from '@/lib/firebase-admin'

// GET /api/debug — diagnose Firebase Admin + OpenAI setup
export async function GET(request: NextRequest) {
  // Allow in production temporarily for debugging — remove after
  const initialized = isAdminInitialized()

  const openaiKey = process.env.OPENAI_API_KEY ?? ''

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
    // OpenAI key diagnostics
    openaiKeySet: !!openaiKey,
    openaiKeyPrefix: openaiKey ? openaiKey.slice(0, 10) + '...' : 'NOT SET',
    openaiKeySuffix: openaiKey ? '...' + openaiKey.slice(-4) : 'NOT SET',
    openaiKeyLength: openaiKey.length,
    openaiKeyHasSpaces: openaiKey.includes(' '),
    openaiKeyHasNewlines: openaiKey.includes('\n'),
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
  }

  return NextResponse.json(info, { status: 200 })
}
