export type Plan = 'free' | 'pro'

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
  aiReport: AiReportV2 | null
  // Article Analysis Report
  articleReport?: import('@/types').ArticleReportSummary | null
  // SEO Hook for the platform's SEO
  seoHook?: Record<string, unknown> | null
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
  hasAdsTxt: boolean;
  adsTxtValid: boolean;
  policyViolationKeywords: string[];
}

export interface AiReportV2 {
  // ── Identity ───────────────────────────────────────────────
  detectedNiche: string;
  nicheRiskLevel: "low" | "medium" | "high";
  nicheRiskReason: string;

  // ── Scores ────────────────────────────────────────────────
  readinessScore: number; // 0-100
  approvalChance: "Very High" | "High" | "Moderate" | "Low" | "Very Low";
  approvalChancePercent: number; // e.g. 72

  // ── Strengths & Risks (teaser — shown free) ───────────────
  strengths: Array<{ title: string; detail: string }>;
  risks: Array<{ title: string; detail: string }>;

  // ── Top 3 Issues (teaser titles shown free, fix steps locked) ─
  top3Issues: Array<{
    rank: number;
    title: string; // shown free
    basicDetail: string; // shown free (1 sentence)
    impactScore: number; // 1-10
    effortScore: number; // 1-10 (lower = easier)
    priorityLabel: "Critical" | "High" | "Medium";
    howToFix: string[]; // LOCKED behind ₹19 — step-by-step
    estimatedTimeToFix: string; // e.g. "2 hours"
    seoImpact: string; // LOCKED — how fixing this also helps SEO ranking
  }>;

  // ── Full Issue List (LOCKED) ───────────────────────────────
  allIssues: Array<{
    category:
      | "Content"
      | "Technical"
      | "Policy"
      | "CoreWebVitals"
      | "Schema"
      | "EEAT"
      | "UX";
    title: string;
    detail: string;
    impactScore: number;
    effortScore: number;
    priorityLabel: "Critical" | "High" | "Medium" | "Low";
    howToFix: string[];
    estimatedTimeToFix: string;
    seoImpact: string;
  }>;

  // ── Technical Health (LOCKED) ─────────────────────────────
  technicalHealth: {
    coreWebVitals: {
      lcp: { status: "pass" | "needs-work" | "fail"; detail: string };
      cls: { status: "pass" | "needs-work" | "fail"; detail: string };
      fid: { status: "pass" | "needs-work" | "fail"; detail: string };
      overallVerdict: string;
      howToImprove: string[];
    };
    schemaMarkup: {
      present: string[];
      missing: string[];
      recommendation: string;
      codeSnippet: string; // actual JSON-LD snippet for their niche
    };
    httpsAndSecurity: { status: "pass" | "fail"; detail: string };
    mobileFriendliness: { status: "pass" | "fail"; detail: string };
    sitemapAndRobots: { status: "pass" | "fail"; detail: string };
    pageSpeed: {
      mobile: string;
      desktop: string;
      topRecommendation: string;
    };
  };

  // ── Content Analysis (LOCKED) ─────────────────────────────
  contentAnalysis: {
    averageWordCount: number;
    minimumRequired: number; // what AdSense actually needs for this niche
    thinContentPages: number;
    eeatSignals: {
      authorByline: boolean;
      publishDates: boolean;
      socialProof: boolean;
      verdict: string;
      howToImprove: string;
    };
    nicheConsistency: "consistent" | "mixed" | "scattered";
    nicheConsistencyDetail: string;
    headingStructureScore: number; // 0-100
    headingFeedback: string;
  };

  // ── Competitor Gap (LOCKED) ────────────────────────────────
  competitorGap: {
    topCompetitorDomain: string;
    thingsTheyDoThatYouDont: string[];
    yourAdvantages: string[];
    quickWinsToCloseGap: string[];
  };

  // ── Policy Compliance (LOCKED) ────────────────────────────
  policyCompliance: {
    mandatoryPagesStatus: {
      privacy: { present: boolean; fix?: string };
      about: { present: boolean; fix?: string };
      terms: { present: boolean; fix?: string };
      contact: { present: boolean; fix?: string };
    };
    restrictedContentFlags: string[];
    existingAdNetworkConflicts: string[];
    overallPolicyVerdict: "Clean" | "Minor Issues" | "Major Issues";
  };

  // ── SEO Health (LOCKED — also feeds YOUR site's ranking) ──
  seoHealth: {
    metaTagsScore: number; // 0-100
    internalLinkingScore: number;
    keywordFocusVerdict: string;
    missingQuickWins: string[]; // things Google loves that they're missing
    estimatedTimeToRank: string; // after fixing everything
  };

  // ── Master Action Plan — 3 Phases (LOCKED) ────────────────
  masterActionPlan: {
    phase1: {
      title: string;
      estimatedTime: string;
      tasks: Array<{
        task: string;
        why: string;
        exactSteps: string[];
        toolsNeeded: string[];
      }>;
    };
    phase2: {
      title: string;
      estimatedTime: string;
      tasks: Array<{
        task: string;
        why: string;
        exactSteps: string[];
        toolsNeeded: string[];
      }>;
    };
    phase3: {
      title: string;
      estimatedTime: string;
      tasks: Array<{
        task: string;
        why: string;
        exactSteps: string[];
        toolsNeeded: string[];
      }>;
    };
  };

  // ── Pre-Application Checklist (LOCKED) ────────────────────
  preApplicationChecklist: Array<{
    item: string;
    status: "done" | "not-done" | "unknown";
    isBlocker: boolean; // if not done, will cause rejection?
  }>;

  // ── SEO Blog Hook (used internally for YOUR SEO content) ──
  seoInsights: {
    primaryKeywordOpportunity: string; // e.g. "adsense approval for cooking blogs"
    longTailKeywords: string[];
    featuredSnippetOpportunity: string; // a question this site could rank for
    schemaTypeRecommended: string;
  };
}
