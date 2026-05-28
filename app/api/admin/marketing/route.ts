import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, adminGetUsers } from '@/lib/auth-server'
import { sendEmail } from '@/lib/email'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email)
}

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile || !isAdmin(profile.email)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  try {
    const { subject, html, audience } = await request.json()
    
    if (!subject || !html || !['all', 'free', 'pro'].includes(audience)) {
      return NextResponse.json({ error: 'Invalid payload. Subject, HTML body, and audience are required.' }, { status: 400 })
    }

    // Get up to 10,000 users to ensure we capture the whole audience
    const allUsers = await adminGetUsers(10000)
    
    // Filter users based on audience
    const targetUsers = allUsers.filter(u => {
      if (audience === 'all') return true
      if (audience === 'free') return u.plan !== 'pro' && !u.razorpaySubscriptionId
      if (audience === 'pro') return u.plan === 'pro' || !!u.razorpaySubscriptionId
      return false
    })

    // Extract valid emails
    const emails = targetUsers.map(u => u.email).filter(Boolean)

    if (emails.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No users matched the criteria.' })
    }

    let successCount = 0
    let failCount = 0

    // Send emails in chunks to respect limits (e.g. Resend free tier has 10/sec rate limits)
    // For large audiences, consider offloading to a background queue. Here we'll do basic batching.
    const chunkSize = 5
    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize)
      
      await Promise.all(chunk.map(async (email) => {
        const result = await sendEmail({
          to: email,
          subject,
          html
        })
        if (result.success) {
          successCount++
        } else {
          failCount++
        }
      }))
      
      // Delay slightly between chunks (e.g. 500ms) to stay well under the 10/sec limit
      if (i + chunkSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: successCount, 
      failed: failCount,
      message: `Successfully sent ${successCount} emails. Failed: ${failCount}` 
    })
    
  } catch (err) {
    console.error('[Admin Marketing] Error sending campaign:', err)
    return NextResponse.json({ error: 'Failed to process marketing campaign.' }, { status: 500 })
  }
}
