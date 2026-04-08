export type Plan = 'free' | 'pro'

export interface UserProfile {
  uid: string
  email: string
  fullName: string | null
  plan: Plan
  razorpayCustomerId: string | null
  razorpaySubscriptionId: string | null
  // Monthly usage (resets on 1st of each month)
  scansThisMonth: number
  scansMonthKey: string    // 'YYYY-MM'
  totalScans: number
  createdAt: string
  updatedAt: string
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
  // AI report — null until unlocked (pay-per-report or pro)
  aiReport: Record<string, unknown> | null
  isAiUnlocked: boolean   // true if user paid ₹19 or is Pro
  createdAt: string
}
