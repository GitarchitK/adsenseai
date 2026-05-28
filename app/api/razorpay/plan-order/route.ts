import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { getRazorpay, CURRENCY } from '@/lib/razorpay'
import { COACHING_PLAN } from '@/lib/plans'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })

  let body: { days?: unknown }
  try { body = await request.json() }
  catch { return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 }) }

  const days = Number(body.days)

  if (!Number.isInteger(days) || days < COACHING_PLAN.min_days || days > COACHING_PLAN.max_days) {
    return NextResponse.json(
      { error: `Invalid plan duration. Days must be between ${COACHING_PLAN.min_days} and ${COACHING_PLAN.max_days}.` },
      { status: 400 }
    )
  }

  const amount = days * COACHING_PLAN.price_per_day_paise  // days × 500 paise

  try {
    const order = await getRazorpay().orders.create({
      amount,
      currency: CURRENCY,
      receipt: `plan_${profile.uid.slice(0, 8)}_${days}d_${Date.now()}`,
      notes: {
        userId: profile.uid,
        type: 'coaching_plan',
        days: String(days),
      },
    })

    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('[plan-order] Razorpay order creation failed:', err)
    return NextResponse.json({ error: 'Failed to create payment order.' }, { status: 500 })
  }
}
