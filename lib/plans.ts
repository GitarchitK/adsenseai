import type { Plan } from './firebase-types'

// ── Pricing (in paise — 100 paise = ₹1) ──────────────────────────────────────
export const PRICES = {
  report_unlock:   1900,   // ₹19 — one-time per scan AI report unlock
  thumbnail:        500,   // ₹5 — per thumbnail generation (DALL-E 3 is expensive)
  coaching_day:     500,   // ₹5 — per day of coaching subscription
} as const

// ── Plan definitions ──────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: 'Free',
    scans_per_month: 999999,   // Unlimited scans
    article_crawl_limit: 0,    // no article analyzer
    ai_report: false,          // must pay ₹19/scan to unlock
    fix_suggestions: false,
    content_rewrite: false,
    privacy_generator: false,
    article_analyzer: false,
    thumbnail_credits: 0,      // no thumbnails on free
  }
} as const

// ── Coaching plan constraints ─────────────────────────────────────────────────
export const COACHING_PLAN = {
  min_days: 14,
  max_days: 90,
  price_per_day_paise: 500,
} as const

export type PlanFeatures = typeof PLANS[Plan]

export function canRunScan(plan: Plan | undefined, scansThisMonth: number): boolean {
  const p = plan ?? 'free'
  return scansThisMonth < PLANS[p].scans_per_month
}

export function hasFeature(plan: Plan | undefined, feature: keyof PlanFeatures): boolean {
  return !!PLANS[plan ?? 'free'][feature]
}

export function getScanLimit(plan: Plan | undefined): number {
  return PLANS[plan ?? 'free'].scans_per_month
}
