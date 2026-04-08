import { NextRequest, NextResponse } from 'next/server'
import { verifyPaymentSignature } from '@/lib/razorpay'
import { getAuthenticatedProfile, updateUserProfile } from '@/lib/auth-server'
import { adminDb } from '@/lib/firebase-admin'
import { PRICES } from '@/lib/plans'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: Record<string, string>
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const { orderId, paymentId, signature, plan = 'pro' } = body

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment details.' }, { status: 400 })
  }

  // ── Verify Razorpay signature ─────────────────────────────────────────────
  const isValid = verifyPaymentSignature({ orderId, paymentId, signature })
  if (!isValid) {
    // Log failed verification attempt for audit
    await adminDb.collection('payment_events').add({
      type:      'verification_failed',
      userId:    profile.uid,
      email:     profile.email,
      orderId,
      paymentId,
      plan,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const amount = plan === 'pro' ? PRICES.pro_monthly : PRICES.report_unlock

  // ── Save payment record (never lose this) ─────────────────────────────────
  const paymentRef = await adminDb.collection('payments').add({
    userId:    profile.uid,
    email:     profile.email,
    fullName:  profile.fullName ?? null,
    orderId,
    paymentId,
    plan,
    amount,
    currency:  'INR',
    amountRupees: amount / 100,
    status:    'captured',
    createdAt: now,
    updatedAt: now,
  })

  console.log(`[Payment] Saved payment ${paymentRef.id} for user ${profile.uid} — ₹${amount / 100} (${plan})`)

  // ── Upgrade user plan ─────────────────────────────────────────────────────
  await updateUserProfile(profile.uid, {
    plan: 'pro',
    razorpayCustomerId:     paymentId,
    razorpaySubscriptionId: orderId,
  })

  // ── Log upgrade event ─────────────────────────────────────────────────────
  await adminDb.collection('payment_events').add({
    type:      'plan_upgraded',
    userId:    profile.uid,
    email:     profile.email,
    paymentId: paymentRef.id,
    plan:      'pro',
    createdAt: now,
  })

  console.log(`[Razorpay] ✓ Upgraded user ${profile.uid} to Pro. Payment: ${paymentId}`)
  return NextResponse.json({ success: true, paymentId: paymentRef.id })
}
