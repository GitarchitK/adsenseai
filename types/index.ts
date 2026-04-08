// User and Auth Types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Scan and Report Types
export interface Scan {
  id: string;
  user_id: string;
  website_url: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  report_id?: string;
}

export interface ScanReport {
  id: string;
  scan_id: string;
  user_id: string;
  overall_score: number;
  content_quality: number;
  user_experience: number;
  technical_seo: number;
  mobile_friendly: number;
  page_speed: number;
  security: number;
  ads_readiness: number;
  recommendations: string[];
  issues: string[];
  warnings: string[];
  raw_data?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ScanRequest {
  website_url: string;
}

// Session/Auth Context Types
export interface AuthSession {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Crawler Types
export interface CrawledPage {
  url: string;
  title: string;
  meta_description?: string;
  content: string;
  word_count: number;
  lastmod?: string;
  headings: {
    h1: string[];
    h2: string[];
  };
  links: {
    internal: string[];
    external: string[];
  };
  status_code?: number;
  error?: string;
}

export interface SiteStructure {
  has_privacy: boolean;
  has_about: boolean;
  has_contact: boolean;
  has_terms: boolean;
  has_disclaimer: boolean;
  domain_age_years?: number;
}

export interface CrawlResponse {
  success: boolean;
  pages: CrawledPage[];
  site_structure: SiteStructure;
  total_pages: number;
  domain: string;
  crawl_time_ms: number;
  error?: string;
}

// ── Per-article analysis types ────────────────────────────────────────────────

export type ContentRisk = 'critical' | 'warning' | 'good'

export interface ArticleAnalysis {
  url: string
  title: string
  word_count: number
  selection_rank?: number
  lastmod?: string

  // Thin content
  is_thin: boolean
  thin_reason?: string

  // Quality scores (0-100)
  readability_score: number
  originality_score: number
  depth_score: number          // how comprehensive/in-depth the content is
  spam_score: number

  // Plagiarism signals
  plagiarism_risk: 'high' | 'medium' | 'low'
  plagiarism_signals: string[] // specific patterns detected

  // AdSense risk
  adsense_risk: ContentRisk
  risk_reasons: string[]       // why this page could cause rejection

  // Strengths
  strengths: string[]

  // Specific fix
  recommended_fix: string
}

export interface MonthPlanStep {
  week: string
  goal: string
  actions: string[]
}

export interface ArticleReportSummary {
  total_articles: number
  critical_count: number       // pages that will cause rejection
  warning_count: number        // pages that need improvement
  good_count: number           // pages that are fine
  avg_word_count: number
  avg_quality_score: number
  thin_pages: number
  high_plagiarism_risk: number
  overall_content_verdict: 'pass' | 'fail' | 'needs_work'
  verdict_reason: string
  selection_note: string
  latest_first: boolean
  month_plan: MonthPlanStep[]
  articles: ArticleAnalysis[]
}
