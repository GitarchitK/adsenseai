import { NextRequest, NextResponse } from 'next/server'
import { createProOrder } from '@/lib/razorpay'
import { getAuthenticatedProfile } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    if (profile.plan === 'pro') return NextResponse.json({ error: 'Already on Pro plan.' }, { status: 400 })

    const order = await createProOrder(profile.uid)
    return NextResponse.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('[Razorpay] Pro order error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
