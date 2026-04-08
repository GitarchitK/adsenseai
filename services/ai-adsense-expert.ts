/**
 * Advanced AI AdSense Approval Expert
 *
 * Accepts structured website data and generates a realistic, actionable,
 * data-driven AdSense approval report. Output is strict JSON matching
 * the AdSenseExpertReport interface — aligned with the UI score display.
 */

import { callOpenAI } from './openai'

// ── Input ─────────────────────────────────────────────────────────────────────

export interface AdSenseExpertInput {
  domain: {
    domain_name: string
    domain_age_days: number
    tld: string
    domain_trust_score: number
  }
  posting: {
    posts_per_week: number
    consistency_score: number
    last_post_days_ago: number
  }
  pages: {
    has_privacy_policy: boolean
    has_about: boolean
    has_contact: boolean
    has_disclaimer: boolean
    has_terms: boolean
    page_quality_score: number
  }
  seo: {
    indexed_pages: number
    has_sitemap: boolean
    has_robots_txt: boolean
  }
  content_summary: {
    total_articles_analyzed: number
    avg_quality_score: number
    avg_readability_score: number
    avg_ai_probability: number
    avg_plagiarism_score: number
    low_quality_articles: number
    high_ai_articles: number
  }
  article_samples: Array<{
    title: string
    quality_score: number
    ai_probability: number
    readability_score: number
    adsense_ready: boolean
  }>
}

// ── Output ────────────────────────────────────────────────────────────────────

export interface AdSenseExpertReport {
  adsense_readiness_score: number
  approval_probability: number
  classification: 'High Chance' | 'Moderate Chance' | 'Low Chance'
  estimated_time_to_approval: string
  overall_status: {
    label: 'Low' | 'Moderate' | 'High'
    message: string
  }
  summary: string
  scores: {
    content_quality: number
    policy_compliance: number
    seo_performance: number
    user_experience: number
    trust_signals: number
  }
  key_issues: string[]
  strengths: string[]
  content_analysis: {
    ai_content_risk: string
    plagiarism_risk: string
    readability_status: string
    content_depth: string
  }
  action_plan: Array<{
    week: string
    tasks: string[]
  }>
  recommendations: {
    content: string[]
    seo: string[]
    policy: string[]
    trust: string[]
  }
  final_verdict: {
    status: string
    message: string
  }
}

// ── Deterministic pre-scoring (no AI needed) ──────────────────────────────────

function preScore(input: AdSenseExpertInput): {
  policy_compliance: number
  seo_performance: number
  trust_signals: number
  flags: string[]
} {
  const flags: string[] = []

  // Policy compliance (base 100, deduct for missing pages)
  let policy = 100
  if (!input.pages.has_privacy_policy) { policy -= 40; flags.push('MISSING_PRIVACY') }
  if (!input.pages.has_contact)        { policy -= 25; flags.push('MISSING_CONTACT') }
  if (!input.pages.has_about)          { policy -= 20; flags.push('MISSING_ABOUT') }
  if (!input.pages.has_terms)          { policy -= 10; flags.push('MISSING_TERMS') }
  if (!input.pages.has_disclaimer)     { policy -= 5 }
  policy = Math.max(0, policy)

  // SEO performance
  let seo = 0
  const ip = input.seo.indexed_pages
  if (ip >= 51)      seo = 90
  else if (ip >= 21) seo = 70
  else if (ip >= 6)  seo = 50
  else               seo = 20
  if (input.seo.has_sitemap)    seo = Math.min(100, seo + 10)
  if (input.seo.has_robots_txt) seo = Math.min(100, seo + 5)
  if (ip < 10) flags.push('LOW_INDEXED_PAGES')

  // Trust signals
  const age = input.domain.domain_age_days
  let ageTrust = age >= 180 ? 90 : age >= 60 ? 70 : age >= 30 ? 50 : 30
  if (age < 60) flags.push('DOMAIN_TOO_NEW')
  const trust = Math.round(
    ageTrust * 0.4 +
    input.domain.domain_trust_score * 0.4 +
    input.posting.consistency_score * 0.2
  )

  // Content / posting flags
  if (input.posting.posts_per_week < 2) flags.push('LOW_POST_FREQUENCY')
  if (input.content_summary.avg_ai_probability > 60) flags.push('HIGH_AI_RISK')
  const lowQualityRatio = input.content_summary.low_quality_articles /
    Math.max(input.content_summary.total_articles_analyzed, 1)
  if (lowQualityRatio > 0.3) flags.push('HIGH_LOW_QUALITY_RATIO')
  if (input.content_summary.avg_plagiarism_score > 40) flags.push('PLAGIARISM_CONCERN')

  return { policy_compliance: policy, seo_performance: seo, trust_signals: trust, flags }
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an advanced AI AdSense Approval Expert. Your role is to deeply analyze a website using structured data and generate a realistic, actionable, data-driven AdSense approval report.

You have expertise in:
- Google AdSense policies and approval criteria
- SEO and website indexing requirements
- Content quality evaluation and originality detection
- AI-generated content detection patterns
- Plagiarism risk assessment
- Website trust signals and domain authority
- Blogging consistency and growth patterns

⚠️ IMPORTANT RULES:
- NEVER guarantee AdSense approval
- Be strict, realistic, and practical
- Avoid generic advice — every recommendation must reference the actual data provided
- Output MUST be valid JSON only matching the exact schema below

🎯 SPECIAL LOGIC (apply strictly):
- avg_ai_probability > 60 → ai_content_risk = "HIGH RISK — AI-generated content detected above threshold"
- low_quality_articles > 30% of total → key_issues must include this as a major blocker
- missing privacy/contact/about → critical issue, policy_compliance score must reflect deductions
- domain_age < 60 days → trust warning in key_issues
- posts_per_week < 2 → consistency issue in key_issues
- indexed_pages < 10 → SEO issue in key_issues
- avg_plagiarism_score > 40 → plagiarism_risk = "Medium-High — originality concerns detected"

📊 SCORING FORMULA:
adsense_readiness_score = (content_quality × 0.35) + (policy_compliance × 0.30) + (seo_performance × 0.15) + (user_experience × 0.10) + (trust_signals × 0.10)
Round to nearest integer. This MUST be mathematically consistent with the scores object.

approval_probability: Realistic chance of approval TODAY (0–100). Always lower than readiness_score if issues exist.

classification:
- "High Chance" if adsense_readiness_score >= 80
- "Moderate Chance" if >= 50
- "Low Chance" if < 50

estimated_time_to_approval:
- readiness < 40 → "2–3 months of intensive work required"
- readiness 40–59 → "4–8 weeks with focused improvements"
- readiness 60–74 → "2–4 weeks after addressing key issues"
- readiness 75–84 → "1–2 weeks — minor fixes needed"
- readiness 85+ → "Ready to apply now"

overall_status.label: "Low" | "Moderate" | "High" (matches classification tier)
overall_status.message: Match this tone exactly:
- Low: "Significant issues detected. AdSense will likely reject your site in its current state."
- Moderate: "Your site shows potential but needs key improvements before applying to AdSense."
- High: "Your site meets most AdSense requirements. Minor improvements will increase approval chances."

action_plan: 
- readiness < 50 → 4–6 week plan
- readiness 50–74 → 3–4 week plan
- readiness 75+ → 1–2 week plan
Each week must have 3–5 specific, data-driven tasks referencing actual numbers from the input.

final_verdict.status:
- "Critical Issues" if policy_compliance < 60 or multiple blocking flags
- "Needs Improvement" if readiness 50–69
- "Nearly Ready" if readiness 70–84
- "Ready to Apply" if readiness 85+

final_verdict.message: One concise action sentence like "Fix Recommended" or "Apply after addressing 3 critical issues."

Return ONLY the JSON object. No markdown, no explanation.`

// ── Fallback ──────────────────────────────────────────────────────────────────

function buildFallback(pre: ReturnType<typeof preScore>): AdSenseExpertReport {
  return {
    adsense_readiness_score: 45,
    approval_probability: 30,
    classification: 'Low Chance',
    estimated_time_to_approval: '4–8 weeks with focused improvements',
    overall_status: {
      label: 'Low',
      message: 'Significant issues detected. AdSense will likely reject your site in its current state.',
    },
    summary: 'Analysis could not be completed fully. Review flagged issues manually.',
    scores: {
      content_quality: 50,
      policy_compliance: pre.policy_compliance,
      seo_performance: pre.seo_performance,
      user_experience: 50,
      trust_signals: pre.trust_signals,
    },
    key_issues: pre.flags.map(f => ({
      MISSING_PRIVACY: 'Missing Privacy Policy — critical AdSense requirement',
      MISSING_CONTACT: 'Missing Contact page — required by AdSense policies',
      MISSING_ABOUT: 'Missing About page — important for trust and E-E-A-T',
      MISSING_TERMS: 'Missing Terms of Service page',
      LOW_INDEXED_PAGES: 'Too few indexed pages — improve crawlability and content volume',
      DOMAIN_TOO_NEW: 'Domain is less than 60 days old — AdSense prefers established sites',
      LOW_POST_FREQUENCY: 'Posting less than 2 articles/week — inconsistent publishing hurts approval',
      HIGH_AI_RISK: 'High AI-generated content probability — Google may flag as low-value',
      HIGH_LOW_QUALITY_RATIO: 'Over 30% of articles are low quality — major content issue',
      PLAGIARISM_CONCERN: 'Plagiarism score above threshold — originality concerns detected',
    }[f] ?? f)),
    strengths: [],
    content_analysis: {
      ai_content_risk: pre.flags.includes('HIGH_AI_RISK') ? 'HIGH RISK — AI-generated content detected above threshold' : 'Low — content appears original',
      plagiarism_risk: pre.flags.includes('PLAGIARISM_CONCERN') ? 'Medium-High — originality concerns detected' : 'Low',
      readability_status: 'Unknown — manual review required',
      content_depth: 'Unknown — manual review required',
    },
    action_plan: [
      { week: 'Week 1', tasks: ['Fix all missing required pages (Privacy Policy, Contact, About)', 'Review and remove or rewrite low-quality articles'] },
      { week: 'Week 2', tasks: ['Improve content depth on thin articles', 'Submit sitemap to Google Search Console'] },
      { week: 'Week 3', tasks: ['Publish 3+ high-quality original articles (800+ words)', 'Re-run analysis to verify improvements'] },
    ],
    recommendations: {
      content: ['Rewrite articles with AI probability > 60% to add original insights'],
      seo: ['Submit sitemap', 'Ensure all pages have meta descriptions and H1 tags'],
      policy: ['Add Privacy Policy, Contact, and About pages immediately'],
      trust: ['Increase posting frequency to at least 2–3 articles per week'],
    },
    final_verdict: {
      status: 'Critical Issues',
      message: 'Fix all critical issues before applying to AdSense.',
    },
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function generateAdSenseExpertReport(
  input: AdSenseExpertInput
): Promise<AdSenseExpertReport> {
  const pre = preScore(input)

  const lowQualityPct = Math.round(
    (input.content_summary.low_quality_articles /
      Math.max(input.content_summary.total_articles_analyzed, 1)) * 100
  )

  const userContent = `
DOMAIN:
  Name: ${input.domain.domain_name}
  Age: ${input.domain.domain_age_days} days (${(input.domain.domain_age_days / 30).toFixed(1)} months)
  TLD: ${input.domain.tld}
  Trust Score: ${input.domain.domain_trust_score}/100

POSTING ACTIVITY:
  Posts/week: ${input.posting.posts_per_week}
  Consistency: ${input.posting.consistency_score}/100
  Last post: ${input.posting.last_post_days_ago} days ago

REQUIRED PAGES:
  Privacy Policy: ${input.pages.has_privacy_policy ? '✓ Present' : '✗ MISSING'}
  About: ${input.pages.has_about ? '✓ Present' : '✗ MISSING'}
  Contact: ${input.pages.has_contact ? '✓ Present' : '✗ MISSING'}
  Disclaimer: ${input.pages.has_disclaimer ? '✓ Present' : '✗ MISSING'}
  Terms: ${input.pages.has_terms ? '✓ Present' : '✗ MISSING'}
  Page Quality Score: ${input.pages.page_quality_score}/100

SEO & INDEXING:
  Indexed Pages: ${input.seo.indexed_pages}
  Sitemap: ${input.seo.has_sitemap ? '✓' : '✗'}
  Robots.txt: ${input.seo.has_robots_txt ? '✓' : '✗'}

CONTENT SUMMARY (${input.content_summary.total_articles_analyzed} articles):
  Avg Quality: ${input.content_summary.avg_quality_score}/100
  Avg Readability: ${input.content_summary.avg_readability_score}/100
  Avg AI Probability: ${input.content_summary.avg_ai_probability}%${input.content_summary.avg_ai_probability > 60 ? ' ⚠️ HIGH RISK' : ''}
  Avg Plagiarism: ${input.content_summary.avg_plagiarism_score}%${input.content_summary.avg_plagiarism_score > 40 ? ' ⚠️ CONCERN' : ''}
  Low Quality Articles: ${input.content_summary.low_quality_articles} (${lowQualityPct}%)${lowQualityPct > 30 ? ' ⚠️ MAJOR ISSUE' : ''}
  High AI Articles: ${input.content_summary.high_ai_articles}

ARTICLE SAMPLES:
${input.article_samples.slice(0, 10).map((a, i) =>
  `  ${i + 1}. "${a.title}"
     Quality: ${a.quality_score}/100 | AI: ${a.ai_probability}% | Readability: ${a.readability_score}/100 | Ready: ${a.adsense_ready ? 'YES' : 'NO'}`
).join('\n')}

PRE-COMPUTED SCORES (use these as anchors):
  policy_compliance: ${pre.policy_compliance}
  seo_performance: ${pre.seo_performance}
  trust_signals: ${pre.trust_signals}

ACTIVE FLAGS: ${pre.flags.length > 0 ? pre.flags.join(', ') : 'none'}
`.trim()

  return callOpenAI<AdSenseExpertReport>(SYSTEM_PROMPT, userContent, buildFallback(pre))
}
