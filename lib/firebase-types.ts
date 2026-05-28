export type Plan = 'free'

export interface UserProfile {
  uid: string
  email: string
  fullName: string | null
  plan: Plan
  razorpayCustomerId: string | null
  razorpaySubscriptionId: string | null
  proExpiresAt: string | null          // ISO date — when Pro subscription expires
  scansThisMonth: number
  scansMonthKey: string
  totalScans: number
  thumbnailCreditsThisMonth: number
  thumbnailMonthKey: string
  createdAt: string
  updatedAt: string
  activePlanId?: string | null         // ID of the user's current coaching plan
  planStatus?: 'active' | 'completed' | 'paused' | null
}

export interface ScanRecord {
  id: string
  userId: string
  websiteUrl: string
  domain: string
  status: 'completed' | 'failed'
  finalScore: number | null
  statusLabel: string | null
  // Basic scores always present
  scores: Record<string, unknown> | null
  // Full crawl data — saved for later so user can unlock AI report without re-crawling
  crawlData: Record<string, unknown> | null
  // AI report — null until unlocked (pay-per-report or pro)
  aiReport: Record<string, unknown> | null
  isAiUnlocked: boolean   // true if user paid ₹19 or is Pro
  createdAt: string
}

// Stored at: plans/{planId}

/** A single day in a coaching roadmap. */
export interface RoadmapDay {
  day: number
  title: string
  category: string
  priority: 'high' | 'medium' | 'low'
  estimatedMinutes: number
  instructions: string[]               // length 4–8
  whyItMatters: string
  successCriteria: string
}

/** A user's purchased coaching plan. Stored at: plans/{planId} */
export interface UserPlan {
  planId: string
  userId: string
  scanId: string
  url: string
  totalDays: number
  startDate: string                    // ISO date string
  /** 1-indexed. Runtime invariant: 1 ≤ currentDay ≤ totalDays */
  currentDay: number
  status: 'active' | 'completed' | 'paused'
  pricePaid: number                    // in paise
  razorpayOrderId: string
  razorpayPaymentId: string
  roadmap: RoadmapDay[]
  completedDays: number[]
  lastCrawlDay: number
  crawlHistory: Array<{ day: number; scanId: string }>
}
