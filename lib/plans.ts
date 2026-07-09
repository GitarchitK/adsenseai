import type { Plan } from './firebase-types'

// ── Pricing (in paise — 100 paise = ₹1) ──────────────────────────────────────
// All core tools are now FREE. Revenue comes from platform AdSense + future API tier.
export const PRICES = {
  report_unlock:   0,      // FREE — AI report included for all users
  thumbnail:       0,      // FREE — thumbnails included for all users
  coaching_day:  500,      // ₹5/day — coaching plans still paid
} as const

// ── Plan definitions ──────────────────────────────────────────────────────────
export const PLANS = {
  free: {
    name: 'Free',
    scans_per_month: 999999,
    article_crawl_limit: 150,
    ai_report: true,           // FREE — was locked
    fix_suggestions: true,     // FREE
    content_rewrite: true,     // FREE
    privacy_generator: true,   // FREE
    article_analyzer: true,    // FREE — was Pro only
    thumbnail_credits: 999999, // FREE
  },
  pro: {
    name: 'Pro',
    scans_per_month: 999999,
    article_crawl_limit: 999999,
    ai_report: true,
    fix_suggestions: true,
    content_rewrite: true,
    privacy_generator: true,
    article_analyzer: true,
    thumbnail_credits: 999999,
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
  // All features are free — always return true
  return true
}

export function getScanLimit(plan: Plan | undefined): number {
  return PLANS[plan ?? 'free'].scans_per_month
}
