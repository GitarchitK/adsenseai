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

export interface DeepCrawlResult {
  url: string;
  pageCount: number;
  postCount: number;
  domainAge: string;

  // Structure
  firstPostDate: string | null;
  latestPostDate: string | null;
  postsPerMonth: number;
  longestGapDays: number;
  samplePostTitles: string[];

  // Niche
  mainNiche: string;
  subNiche: string;
  nicheConsistencyScore: number;
  offTopicPosts: string[];

  // Content
  avgWordCount: number;
  thinContentCount: number;
  thinContentPercent: number;
  avgReadabilityScore: number;
  postsWithNoImages: number;
  postsWithMissingAlt: number;
  keywordStuffingDetected: boolean;

  // Pages
  hasPrivacyPolicy: boolean;
  privacyPolicyUrl: string | null;
  hasAboutPage: boolean;
  aboutPageUrl: string | null;
  hasContactPage: boolean;
  contactPageUrl: string | null;
  hasTerms: boolean;
  hasDisclaimer: boolean;

  // Technical
  allHttps: boolean;
  httpPages: number;
  hasSitemap: boolean;
  hasRobots: boolean;
  metaDescriptionCoverage: number;
  h1Coverage: number;
  avgInternalLinks: number;
  schemaTypes: string[];
  brokenLinkCount: number;
  footerHasPrivacyLink: boolean;
  footerHasContactLink: boolean;

  // AdSense specific
  hasExistingAdsenseCode: boolean;
  policyViolationKeywords: string[];
}

export interface MasterReport {
  overallScore: number;
  readinessLevel: 'not_ready' | 'almost_ready' | 'ready';

  whenToApply: {
    recommendation: 'apply_now' | 'wait_X_weeks' | 'major_work_needed';
    weeksToWait: number | null;
    reason: string;
  };

  nicheAnalysis: {
    mainNiche: string;
    subNiche: string;
    nicheViability: 'excellent' | 'good' | 'risky' | 'blocked';
    nicheComment: string;
    consistencyIssues: string | null;
  };

  contentAnalysis: {
    score: number;
    verdict: string;
    strengths: string[];
    problems: ReportIssue[];
  };

  policyCompliance: {
    score: number;
    verdict: string;
    violations: ReportIssue[];
    missingPages: MissingPage[];
  };

  technicalHealth: {
    score: number;
    verdict: string;
    issues: ReportIssue[];
  };

  trustSignals: {
    score: number;
    verdict: string;
    issues: ReportIssue[];
  };

  actionPlan: {
    phase1_critical: { label: string; tasks: ActionTask[] };
    phase2_important: { label: string; tasks: ActionTask[] };
    phase3_optional: { label: string; tasks: ActionTask[] };
  };

  applicationReadinessChecklist: ChecklistItem[];

  estimatedApprovalChance: {
    percentage: number;
    mainRisk: string;
    mainStrength: string;
  };
}

export interface ReportIssue {
  issue: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  detail: string;
  howToFix: string;
  timeToFix: string;
}

export interface ActionTask {
  task: string;
  detail: string;
  estimatedTime: string;
  impact: 'high' | 'medium';
}

export interface ChecklistItem {
  item: string;
  status: 'done' | 'not_done' | 'partial';
  priority: 'critical' | 'high' | 'medium';
}

export interface MissingPage {
  page: 'Privacy Policy' | 'About' | 'Contact' | 'Terms' | 'Disclaimer';
  importance: 'critical' | 'high' | 'medium';
  howToCreate: string;
}
