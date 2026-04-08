import type { Plan } from './firebase-types'

// ── Pricing (in paise — 100 paise = ₹1) ──────────────────────────────────────
export const PRICES = {
  report_unlock: 1900,   // ₹19 — one-time per scan AI report unlock
  pro_monthly:   19900,  // ₹199 — monthly Pro subscription
} as const

// ── Plan definitions ──────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: 'Free',
    scans_per_month: 5,        // 5 scans/month, basic report only
    article_crawl_limit: 0,    // no article analyzer
    ai_report: false,          // must pay ₹19/scan to unlock
    fix_suggestions: false,
    content_rewrite: false,
    privacy_generator: false,
    article_analyzer: false,
  },
  pro: {
    name: 'Pro',
    scans_per_month: 200,      // 200 scans/month
    article_crawl_limit: 50,   // crawl up to 50 articles
    ai_report: true,           // AI report included on every scan
    fix_suggestions: true,
    content_rewrite: true,
    privacy_generator: true,
    article_analyzer: true,
  },
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
