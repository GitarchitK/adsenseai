import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature } from '@/lib/razorpay'
import { adminDb } from '@/lib/firebase-admin'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-razorpay-signature') ?? ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 })
  }

  const event = JSON.parse(rawBody)
  const entity = event?.payload?.subscription?.entity ?? event?.payload?.payment?.entity

  switch (event.event) {
    case 'subscription.activated':
    case 'payment.captured': {
      const userId = entity?.notes?.userId
      const type   = entity?.notes?.type // 'pro_subscription' or 'report_unlock'
      
      if (userId && type === 'pro_subscription') {
        await adminDb.collection('users').doc(userId).update({
          plan: 'pro',
          razorpaySubscriptionId: entity.id ?? null,
          updatedAt: new Date().toISOString(),
        })
        console.log(`[Webhook] Upgraded user ${userId} to Pro`)
      }
      break
    }

    case 'subscription.cancelled':
    case 'subscription.completed': {
      const userId = entity?.notes?.userId
      if (userId) {
        await adminDb.collection('users').doc(userId).update({
          plan: 'free',
          razorpaySubscriptionId: null,
          updatedAt: new Date().toISOString(),
        })
        console.log(`[Webhook] Downgraded user ${userId} to Free`)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
