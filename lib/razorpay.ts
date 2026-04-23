import Razorpay from 'razorpay'
import crypto from 'crypto'
import { PRICES } from './plans'

let razorpayInstance: Razorpay | null = null

export function getRazorpay() {
  if (razorpayInstance) return razorpayInstance
  
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  
  if (!key_id || !key_secret) {
    console.warn('[Razorpay] Missing key_id or key_secret in environment variables.')
  }
  
  razorpayInstance = new Razorpay({
    key_id:     key_id ?? 'missing',
    key_secret: key_secret ?? 'missing',
  })
  return razorpayInstance
}

export const CURRENCY = 'INR'

/** ₹19 one-time order to unlock a single scan's AI report */
export async function createReportUnlockOrder(userId: string, scanId: string) {
  return getRazorpay().orders.create({
    amount:   PRICES.report_unlock,
    currency: CURRENCY,
    receipt:  `rpt_${scanId.slice(0, 10)}_${Date.now()}`,
    notes:    { userId, scanId, type: 'report_unlock' },
  })
}

/** ₹199/month Pro subscription order */
export async function createProOrder(userId: string) {
  return getRazorpay().orders.create({
    amount:   PRICES.pro_monthly,
    currency: CURRENCY,
    receipt:  `pro_${userId.slice(0, 10)}_${Date.now()}`,
    notes:    { userId, type: 'pro_subscription' },
  })
}

export function verifyPaymentSignature(params: {
  orderId: string; paymentId: string; signature: string
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    console.error('[Razorpay] Cannot verify signature: RAZORPAY_KEY_SECRET is missing.')
    return false
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest('hex')
  return expected === params.signature
}

export async function fetchOrder(orderId: string) {
  return getRazorpay().orders.fetch(orderId)
}

export async function fetchPayment(paymentId: string) {
  return getRazorpay().payments.fetch(paymentId)
}

export async function verifyReportUnlockPayment(params: {
  userId: string
  scanId: string
  orderId: string
  paymentId: string
  signature: string
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!verifyPaymentSignature({ orderId: params.orderId, paymentId: params.paymentId, signature: params.signature })) {
    return { ok: false, reason: 'signature_mismatch' }
  }

  // Extra server-side validation (amount/currency/notes/status) to prevent tampering.
  try {
    const [order, payment] = await Promise.all([
      fetchOrder(params.orderId),
      fetchPayment(params.paymentId),
    ])

    const orderNotes = (order as any)?.notes ?? {}
    const orderType = orderNotes?.type
    const orderUserId = orderNotes?.userId
    const orderScanId = orderNotes?.scanId

    if (orderType !== 'report_unlock') return { ok: false, reason: 'order_type_mismatch' }
    if (orderUserId !== params.userId) return { ok: false, reason: 'order_user_mismatch' }
    if (orderScanId !== params.scanId) return { ok: false, reason: 'order_scan_mismatch' }

    if ((order as any)?.currency !== CURRENCY) return { ok: false, reason: 'order_currency_mismatch' }
    if (Number((order as any)?.amount) !== PRICES.report_unlock) return { ok: false, reason: 'order_amount_mismatch' }

    if ((payment as any)?.order_id !== params.orderId) return { ok: false, reason: 'payment_order_mismatch' }
    if ((payment as any)?.currency !== CURRENCY) return { ok: false, reason: 'payment_currency_mismatch' }
    if (Number((payment as any)?.amount) !== PRICES.report_unlock) return { ok: false, reason: 'payment_amount_mismatch' }
    if ((payment as any)?.status !== 'captured') return { ok: false, reason: 'payment_not_captured' }

    return { ok: true }
  } catch (err) {
    console.error('[Razorpay] verifyReportUnlockPayment fetch failed:', err)
    return { ok: false, reason: 'razorpay_fetch_failed' }
  }
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[Razorpay] Cannot verify webhook: RAZORPAY_WEBHOOK_SECRET is missing.')
    return false
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
  return expected === signature
}
