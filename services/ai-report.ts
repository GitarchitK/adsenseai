/**
 * AI Report Assembler
 * Runs all three AI modules in parallel and combines them into one structured report.
 * Uses the canonical scoring formula:
 *   final_score = (quality*0.35) + (policy*0.30) + (seo*0.15) + (ux*0.10) + (trust*0.10)
 */

import { analyzeContentQuality, type ContentQualityResult } from './ai-content'
import { checkPolicyCompliance, type PolicyComplianceResult } from './ai-policy'
import { analyzeTrustAndUX, type TrustUXResult } from './ai-trust'
import { analyzeMonetization, type MonetizationResult } from './ai-monetization'
import { analyzeEEAT, type EEATResult } from './ai-eeat'
import { analyzeSEOAuthority, type SEOAuthorityResult } from './ai-seo-authority'
import { analyzeTechnicalHealth, type TechnicalHealthResult } from './ai-technical'
import { callOpenAI } from './openai'
import type { CrawlResponse } from '@/types'

export type ScoreStatus = 'high' | 'moderate' | 'low'

export interface AIReport {
  // Category scores aligned with the formula
  quality_score: number    // from content module  — weight 0.35
  policy_score: number     // from policy module   — weight 0.30
  seo_score: number        // derived from crawl   — weight 0.15
  ux_score: number         // from trust module    — weight 0.10
  trust_score: number      // from trust module    — weight 0.10

  // Final weighted score
  final_score: number
  status: ScoreStatus
  status_label: 'High Chance' | 'Moderate' | 'Low'

  // Pass/fail
  adsense_ready: boolean

  // Detailed module outputs
  content: ContentQualityResult
  policy: PolicyComplianceResult
  trust: TrustUXResult
  monetization: MonetizationResult
  eeat: EEATResult
  seo_authority: SEOAuthorityResult
  technical_health: TechnicalHealthResult

  // Prioritised issues
  top_issues: string[]

  // AI-generated fix suggestions
  fix_suggestions: FixSuggestion[]

  // New deep analysis fields
  application_timeline: string    // e.g. "Apply in 15 days" or "Apply Now"
  strategic_roadmap: string[]     // advanced growth/approval tips
  approval_workflow: WorkflowStep[] // day-by-day or week-by-week plan

  generated_at: string
}

export interface WorkflowStep {
  timeframe: string // e.g. "Day 1-2" or "Week 1"
  task: string      // e.g. "Fix Policy Violations"
  details: string   // e.g. "Remove the 3 pages identified as thin content..."
}

export interface FixSuggestion {
  category: 'Content' | 'Policy' | 'SEO' | 'UX' | 'Trust'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
}

// ── Scoring formula ───────────────────────────────────────────────────────────

function computeFinalScore(
  quality: number,
  policy: number,
  seo: number,
  ux: number,
  trust: number
): number {
  return Math.round(
    Math.min(100, Math.max(0,
      quality * 0.35 +
      policy  * 0.30 +
      seo     * 0.15 +
      ux      * 0.10 +
      trust   * 0.10
    ))
  )
}

function getStatus(score: number): { status: ScoreStatus; status_label: AIReport['status_label'] } {
  if (score >= 80) return { status: 'high',     status_label: 'High Chance' }
  if (score >= 60) return { status: 'moderate', status_label: 'Moderate'    }
  return               { status: 'low',      status_label: 'Low'         }
}

// ── SEO score derived from crawl data ────────────────────────────────────────

function deriveSeoScore(crawl: CrawlResponse): number {
  const pages = crawl.pages
  const total = pages.length || 1
  const metaRatio = pages.filter((p) => p.meta_description).length / total
  const h1Ratio   = pages.filter((p) => p.headings.h1.length > 0).length / total
  const structureBonus =
    (crawl.site_structure.has_about   ? 10 : 0) +
    (crawl.site_structure.has_contact ? 10 : 0)
  return Math.round(Math.min(100, h1Ratio * 40 + metaRatio * 40 + structureBonus))
}

// ── Top issues ────────────────────────────────────────────────────────────────

function buildTopIssues(
  content: ContentQualityResult,
  policy: PolicyComplianceResult,
  trust: TrustUXResult
): string[] {
  const items: Array<{ text: string; priority: number }> = []

  if (policy.adult_content)
    items.push({ text: 'Adult content detected — will cause AdSense rejection', priority: 100 })
  if (policy.dangerous_content)
    items.push({ text: 'Dangerous or harmful content detected', priority: 100 })
  if (policy.copyright_risk)
    items.push({ text: 'Copyright risk — review content originality', priority: 90 })
  policy.violations.forEach((v) => items.push({ text: v, priority: 85 }))
  if (content.spam_score > 60)
    items.push({ text: `High spam score (${content.spam_score}/100) — reduce keyword stuffing`, priority: 80 })
  if (content.originality_score < 50)
    items.push({ text: `Low originality (${content.originality_score}/100) — add unique content`, priority: 75 })
  if (content.readability_score < 50)
    items.push({ text: `Poor readability (${content.readability_score}/100) — simplify writing`, priority: 60 })
  trust.ux_issues.forEach((issue) => items.push({ text: issue, priority: 55 }))

  return items
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map((i) => i.text)
}

// ── AI Strategic Advice (Fixes, Timeline, Roadmap) ────────────────────────────

const STRATEGIC_SYSTEM_PROMPT = `You are a Google AdSense approval specialist and Senior SEO.
Given a full website audit summary, provide four things:
1. Actionable fix suggestions (array of objects).
2. Application Timeline: A specific recommendation on when the user should apply (e.g., "Apply immediately", "Apply in 14 days after fixes", "Wait 2 months").
3. Strategic Roadmap: 4-5 high-level strategic tips for long-term AdSense success and growth.
4. Approval Workflow: A step-by-step plan (7-10 steps) for the next 30 days to get approved.

Return a JSON object with:
- suggestions (array): Each item { category: "Content"|"Policy"|"SEO"|"UX"|"Trust", title, description, impact: "high"|"medium"|"low" }
- application_timeline (string): Precise timeframe for application.
- strategic_roadmap (array of strings): High-level growth/strategy tips.
- approval_workflow (array of objects): Each item { timeframe: "Day 1-3"|"Week 1" etc, task, details }.

Be specific and practical. Base the timeline and workflow on the severity of the issues found.
IMPORTANT: The user wants a 1-month plan. If the site is already good, the plan should focus on polishing and scaling. If the site is poor, it should be a recovery roadmap.

Data provided:
- Domain age: if provided, use it to judge site maturity.
- Content: quality, originality, spam, readability.
- Policy: adult, copyright, violations.
- Trust: required pages (About, Privacy, Contact, Terms, Disclaimer), UX.
- SEO: authority, semantic coverage, technical health.
- Monetization: revenue potential, niche, cpc.`

interface StrategicAdvice {
  suggestions: FixSuggestion[]
  application_timeline: string
  strategic_roadmap: string[]
  approval_workflow: WorkflowStep[]
}

async function generateStrategicAdvice(
  content: ContentQualityResult,
  policy: PolicyComplianceResult,
  trust: TrustUXResult,
  monetization: MonetizationResult,
  eeat: EEATResult,
  seo: SEOAuthorityResult,
  tech: TechnicalHealthResult,
  crawl: CrawlResponse,
  finalScore: number
): Promise<StrategicAdvice> {
  const structure = crawl.site_structure;
  const sitemapUrls = crawl.pages.map(p => p.url).slice(0, 20).join('\n');
  const summary = `
AdSense Score: ${finalScore}/100
Domain: ${crawl.domain}
Domain Age: ${structure.domain_age_years ?? 'unknown'} years
Pages Crawled: ${crawl.total_pages}
Sitemap Total: ${crawl.sitemap_total ?? crawl.total_pages} URLs discovered
Required Pages: Privacy=${structure.has_privacy}, About=${structure.has_about}, Contact=${structure.has_contact}, Terms=${structure.has_terms}, Disclaimer=${structure.has_disclaimer}

Full Sitemap URLs (up to 100):
${(crawl.sitemap_urls ?? crawl.pages.map(p => p.url)).slice(0, 100).join('\n')}

Content: quality=${content.overall_quality_score}, originality=${content.originality_score}, readability=${content.readability_score}, spam=${content.spam_score}
Policy: risk=${policy.policy_risk_score}, adult=${policy.adult_content}, copyright=${policy.copyright_risk}, violations=${policy.violations.length}
Trust & EEAT: trust=${trust.trust_score}, ux=${trust.ux_score}, eeat=${eeat.overall_eeat_score}
SEO & Tech: authority=${seo.topical_authority_score}, semantic=${seo.semantic_coverage_score}, technical=${tech.structural_integrity}
Monetization: potential=${monetization.revenue_potential}, niche=${monetization.niche}, cpc=${monetization.estimated_cpc}

Details:
- Policy Summary: ${policy.policy_summary}
- Content Summary: ${content.summary}
- UX Issues: ${trust.ux_issues.join(', ') || 'none'}
- Technical Issues: ${tech.technical_issues.join(', ') || 'none'}
- Missing Topics: ${seo.missing_topics.join(', ') || 'none'}
- Violations: ${policy.violations.join(', ') || 'none'}

Top 30 pages by word count:
${[...crawl.pages].sort((a,b) => b.word_count - a.word_count).slice(0, 30).map(p => `  ${p.word_count}w | ${p.title || 'No title'} | ${p.url}`).join('\n')}
`.trim()

  // Build a deterministic fallback based on actual scores so it's never empty
  const fallback = buildFallbackAdvice(content, policy, trust, seo, tech, finalScore)

  return await callOpenAI<StrategicAdvice>(
    STRATEGIC_SYSTEM_PROMPT,
    summary,
    fallback
  )
}

function buildFallbackAdvice(
  content: ContentQualityResult,
  policy: PolicyComplianceResult,
  trust: TrustUXResult,
  seo: SEOAuthorityResult,
  tech: TechnicalHealthResult,
  finalScore: number
): StrategicAdvice {
  const suggestions: FixSuggestion[] = []

  if (policy.adult_content || policy.dangerous_content)
    suggestions.push({ category: 'Policy', title: 'Remove Policy-Violating Content', description: 'Adult or dangerous content was detected. Remove it immediately — AdSense will reject your site.', impact: 'high' })
  if (policy.copyright_risk)
    suggestions.push({ category: 'Policy', title: 'Fix Copyright Issues', description: 'Potential copyright violations detected. Replace copied content with original writing.', impact: 'high' })
  if (policy.violations.length > 0)
    suggestions.push({ category: 'Policy', title: 'Resolve Policy Violations', description: `${policy.violations.length} policy violation(s) found: ${policy.violations.slice(0, 2).join(', ')}. Fix these before applying.`, impact: 'high' })
  if (content.originality_score < 60)
    suggestions.push({ category: 'Content', title: 'Improve Content Originality', description: `Originality score is ${content.originality_score}/100. Rewrite generic articles with unique insights, personal experience, and original research.`, impact: 'high' })
  if (content.readability_score < 60)
    suggestions.push({ category: 'Content', title: 'Improve Readability', description: `Readability score is ${content.readability_score}/100. Use shorter sentences, clear headings, and simpler language.`, impact: 'medium' })
  if (content.spam_score > 50)
    suggestions.push({ category: 'Content', title: 'Reduce Keyword Stuffing', description: `Spam score is ${content.spam_score}/100. Remove excessive keyword repetition and write naturally.`, impact: 'high' })
  if (seo.topical_authority_score < 60)
    suggestions.push({ category: 'SEO', title: 'Build Topical Authority', description: `Topical authority is ${seo.topical_authority_score}/100. Publish more in-depth articles covering your niche thoroughly.`, impact: 'medium' })
  if (tech.structural_integrity < 60)
    suggestions.push({ category: 'SEO', title: 'Fix Technical SEO Issues', description: `Technical health is ${tech.structural_integrity}/100. Add missing H1 tags, meta descriptions, and fix broken links.`, impact: 'medium' })
  if (trust.trust_score < 60)
    suggestions.push({ category: 'Trust', title: 'Strengthen Trust Signals', description: `Trust score is ${trust.trust_score}/100. Add an About page, author bios, and ensure Privacy Policy and Contact pages are present.`, impact: 'high' })
  trust.ux_issues.forEach(issue =>
    suggestions.push({ category: 'UX', title: 'Fix UX Issue', description: issue, impact: 'medium' })
  )

  // Always have at least 3 suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      { category: 'Content', title: 'Increase Article Depth', description: 'Aim for 800+ words per article with original insights, examples, and structured headings.', impact: 'medium' },
      { category: 'SEO', title: 'Add Meta Descriptions', description: 'Ensure every page has a unique, descriptive meta description (150–160 characters).', impact: 'medium' },
      { category: 'Trust', title: 'Publish Consistently', description: 'Post 2–3 high-quality articles per week to demonstrate an active, maintained site.', impact: 'low' }
    )
  }

  const timeline = finalScore >= 80 ? 'Apply to AdSense now — your site meets the requirements.'
    : finalScore >= 65 ? 'Apply in 1–2 weeks after fixing the high-impact issues listed above.'
    : finalScore >= 50 ? 'Apply in 3–4 weeks after addressing content quality and policy issues.'
    : 'Wait 6–8 weeks. Focus on building content volume and fixing critical issues first.'

  const workflow: WorkflowStep[] = finalScore >= 75 ? [
    { timeframe: 'Day 1–2', task: 'Fix High-Impact Issues', details: 'Address any policy violations and high-impact fixes from the Fix List tab.' },
    { timeframe: 'Day 3–5', task: 'Polish Content', details: 'Review your top 5 articles — improve readability, add images, and strengthen conclusions.' },
    { timeframe: 'Day 6–7', task: 'Final Check & Apply', details: 'Verify all required pages exist (Privacy, About, Contact), then submit your AdSense application.' },
  ] : [
    { timeframe: 'Week 1', task: 'Fix Critical Issues', details: 'Resolve all policy violations, remove thin content, and ensure Privacy Policy, About, and Contact pages exist.' },
    { timeframe: 'Week 2', task: 'Improve Content Quality', details: `Rewrite your ${Math.min(5, Math.round((100 - content.originality_score) / 10))} lowest-quality articles. Target 800+ words with original insights.` },
    { timeframe: 'Week 3', task: 'Build Content Volume', details: 'Publish 3–5 new high-quality articles. Aim for 25+ total articles before applying.' },
    { timeframe: 'Week 4', task: 'SEO & Trust Signals', details: 'Add meta descriptions to all pages, fix missing H1 tags, and improve internal linking between related articles.' },
    { timeframe: 'Week 5–6', task: 'Re-scan & Apply', details: 'Run a fresh scan to verify your score is 70+, then submit your AdSense application.' },
  ]

  return {
    suggestions,
    application_timeline: timeline,
    strategic_roadmap: [
      'Focus on one niche — topical authority matters more than broad coverage.',
      'Publish consistently: 2–3 articles per week signals an active site to Google.',
      'Add author bios and cite sources to boost E-E-A-T signals.',
      'Ensure fast page load times — Core Web Vitals affect AdSense approval.',
      'Build internal links between related articles to improve crawlability and authority.',
    ],
    approval_workflow: workflow,
  }
}

// ── Main assembler ────────────────────────────────────────────────────────────

export async function generateAIReport(crawl: CrawlResponse): Promise<AIReport> {
  const [content, policy, trust, monetization, eeat, seo_authority, technical_health] = await Promise.all([
    analyzeContentQuality(crawl.pages),
    checkPolicyCompliance(crawl.pages, crawl.site_structure),
    analyzeTrustAndUX(crawl.pages, crawl.site_structure, crawl.domain),
    analyzeMonetization(crawl.pages),
    analyzeEEAT(crawl.pages, crawl.site_structure),
    analyzeSEOAuthority(crawl.pages),
    analyzeTechnicalHealth(crawl.pages),
  ])

  const quality_score = content.overall_quality_score
  const policy_score  = Math.round(100 - policy.policy_risk_score)
  const seo_score     = deriveSeoScore(crawl)
  const ux_score      = trust.ux_score
  const trust_score   = trust.trust_score

  const final_score = computeFinalScore(quality_score, policy_score, seo_score, ux_score, trust_score)
  const { status, status_label } = getStatus(final_score)

  const adsense_ready =
    !policy.adult_content &&
    !policy.dangerous_content &&
    final_score >= 65

  const [top_issues, advice] = await Promise.all([
    Promise.resolve(buildTopIssues(content, policy, trust)),
    generateStrategicAdvice(content, policy, trust, monetization, eeat, seo_authority, technical_health, crawl, final_score),
  ])

  return {
    quality_score,
    policy_score,
    seo_score,
    ux_score,
    trust_score,
    final_score,
    status,
    status_label,
    adsense_ready,
    content,
    policy,
    trust,
    monetization,
    eeat,
    seo_authority,
    technical_health,
    top_issues,
    fix_suggestions: advice.suggestions,
    application_timeline: advice.application_timeline,
    strategic_roadmap: advice.strategic_roadmap,
    approval_workflow: advice.approval_workflow,
    generated_at: new Date().toISOString(),
  }
}
