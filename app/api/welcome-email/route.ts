import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { sendEmail, welcomeEmailTemplate } from '@/lib/email'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    // Only send welcome email once — check if already sent
    const userRef = adminDb.collection('users').doc(profile.uid)
    const userDoc = await userRef.get()
    const userData = userDoc.data()

    if (userData?.welcomeEmailSent) {
      return NextResponse.json({ success: true, skipped: true })
    }

    const email = profile.email
    const name = profile.fullName || email?.split('@')[0] || 'there'

    if (!email) {
      return NextResponse.json({ error: 'No email address found.' }, { status: 400 })
    }

    const result = await sendEmail({
      to: email,
      subject: 'Welcome to AdSense Checker AI 🚀 — Start Your Free Scan',
      html: welcomeEmailTemplate(name),
    })

    if (result.success) {
      // Mark as sent so we don't send again
      await userRef.set({ welcomeEmailSent: true }, { merge: true })
    }

    return NextResponse.json({ success: result.success, error: result.error })
  } catch (err) {
    console.error('[/api/welcome-email] error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
