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
  application_timeline_reason: string  // plain-English explanation of why
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
  technical_detail?: string   // for developers
  impact: 'high' | 'medium' | 'low'
}

// New fields on AIReport for plain-English explanations
export interface ScoreExplanation {
  score: number
  label: string          // e.g. "Good", "Needs Work", "Critical"
  plain_english: string  // e.g. "Your articles are easy to read and well-structured"
  technical: string      // e.g. "Flesch-Kincaid grade 8, avg sentence length 18 words"
  what_to_do: string     // e.g. "Keep writing like this — no changes needed"
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

const STRATEGIC_SYSTEM_PROMPT = `You are a Google AdSense approval specialist writing for TWO audiences at once:
1. A blogger or website owner with no technical background
2. A developer who wants the technical details

Rules for every piece of text you write:
- Write in plain English first. Avoid jargon. If you must use a technical term, explain it in brackets.
- Be specific — reference actual data from the site (scores, page counts, URLs).
- Be direct — tell them exactly what to do, not just what's wrong.
- Tone: friendly, honest, like a knowledgeable friend explaining over coffee.

Given a full website audit summary, return a JSON object with:
- suggestions (array): Each item {
    category: "Content"|"Policy"|"SEO"|"UX"|"Trust",
    title: string (plain English, max 8 words),
    description: string (2-3 sentences: what's wrong + exactly how to fix it, no jargon),
    technical_detail: string (1 sentence with the specific metric/score for developers),
    impact: "high"|"medium"|"low"
  }
- application_timeline (string): One clear sentence. E.g. "Your site needs about 3 weeks of fixes before applying."
- application_timeline_reason (string): 2-3 sentences explaining WHY in plain English.
- strategic_roadmap (array of strings): 4-5 tips. Each tip must be one actionable sentence a non-tech person can follow.
- approval_workflow (array of objects): 7-10 steps. Each { timeframe, task, details } where details is 2-3 plain-English sentences with specific actions.

Be specific. Reference actual URLs, scores, and page counts from the data provided.`

interface StrategicAdvice {
  suggestions: FixSuggestion[]
  application_timeline: string
  application_timeline_reason: string
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
    suggestions.push({ category: 'Policy', title: 'Remove Policy-Violating Content', description: 'Adult or dangerous content was found on your site. Google will automatically reject your AdSense application if this content is present. Remove or replace it before applying.', technical_detail: `adult_content=${policy.adult_content}, dangerous_content=${policy.dangerous_content}`, impact: 'high' })
  if (policy.copyright_risk)
    suggestions.push({ category: 'Policy', title: 'Fix Copied Content', description: 'Some content appears to be copied from other websites. Google requires original content — rewrite these articles in your own words with your own insights.', technical_detail: `copyright_risk=true, policy_risk_score=${policy.policy_risk_score}`, impact: 'high' })
  if (policy.violations.length > 0)
    suggestions.push({ category: 'Policy', title: 'Fix Policy Violations', description: `${policy.violations.length} issue(s) were found that violate Google's rules: ${policy.violations.slice(0, 2).join(', ')}. Fix these before applying — they are automatic rejection triggers.`, technical_detail: `violations=[${policy.violations.join(', ')}]`, impact: 'high' })
  if (content.originality_score < 60)
    suggestions.push({ category: 'Content', title: 'Make Your Content More Original', description: `Your content scored ${content.originality_score}/100 for originality. This means your articles feel generic or similar to what's already on the internet. Add your personal experience, unique examples, and original research to each article.`, technical_detail: `originality_score=${content.originality_score}/100`, impact: 'high' })
  if (content.readability_score < 60)
    suggestions.push({ category: 'Content', title: 'Make Your Writing Easier to Read', description: `Readability score is ${content.readability_score}/100. Your articles may be using long sentences or complex words. Break paragraphs into 2-3 sentences, use simple words, and add subheadings every 200-300 words.`, technical_detail: `readability_score=${content.readability_score}/100 (target: 70+)`, impact: 'medium' })
  if (content.spam_score > 50)
    suggestions.push({ category: 'Content', title: 'Stop Repeating Keywords', description: `Spam score is ${content.spam_score}/100. You're using the same keywords too many times in your articles. Write naturally — Google's AI can tell when you're stuffing keywords, and it hurts your approval chances.`, technical_detail: `spam_score=${content.spam_score}/100 (target: below 30)`, impact: 'high' })
  if (seo.topical_authority_score < 60)
    suggestions.push({ category: 'SEO', title: 'Write More Articles on Your Topic', description: `Your site's topical authority score is ${seo.topical_authority_score}/100. This means Google doesn't yet see your site as an expert on your topic. Publish 10-15 more in-depth articles covering different aspects of your niche.`, technical_detail: `topical_authority_score=${seo.topical_authority_score}/100, semantic_coverage=${seo.semantic_coverage_score}/100`, impact: 'medium' })
  if (tech.structural_integrity < 60)
    suggestions.push({ category: 'SEO', title: 'Fix Basic Page Structure Issues', description: `Technical health is ${tech.structural_integrity}/100. Some pages are missing important elements like page titles (H1 tags) and meta descriptions. These are like labels that tell Google what each page is about — every page needs them.`, technical_detail: `structural_integrity=${tech.structural_integrity}/100, technical_issues=[${tech.technical_issues.slice(0,2).join(', ')}]`, impact: 'medium' })
  if (trust.trust_score < 60)
    suggestions.push({ category: 'Trust', title: 'Add Missing Trust Pages', description: `Trust score is ${trust.trust_score}/100. Google wants to see that your site is run by a real person or business. Make sure you have an About page (who you are), Contact page (how to reach you), and Privacy Policy (required by AdSense).`, technical_detail: `trust_score=${trust.trust_score}/100, ux_score=${trust.ux_score}/100`, impact: 'high' })
  trust.ux_issues.forEach(issue =>
    suggestions.push({ category: 'UX', title: 'Fix User Experience Issue', description: `${issue} — This affects how easy your site is to use, which Google considers during review.`, impact: 'medium' })
  )

  // Always have at least 3 suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      { category: 'Content', title: 'Make Articles Longer and Deeper', description: 'Aim for 800+ words per article. Each article should fully answer the question a reader came to your site with — include examples, steps, and your personal take.', technical_detail: 'target: 800+ words, depth_score > 70', impact: 'medium' },
      { category: 'SEO', title: 'Add Meta Descriptions to Every Page', description: 'A meta description is a 1-2 sentence summary that appears in Google search results. Every page needs one. Keep it under 160 characters and make it describe exactly what the page is about.', technical_detail: 'meta_description missing on some pages, target: 150-160 chars', impact: 'medium' },
      { category: 'Trust', title: 'Publish New Articles Regularly', description: 'Post 2-3 new articles every week. Google wants to see that your site is active and growing — a site that hasn\'t been updated in months looks abandoned.', technical_detail: 'publishing_frequency: target 2-3/week', impact: 'low' }
    )
  }

  const timeline = finalScore >= 80 ? 'Your site is ready — apply to AdSense now.'
    : finalScore >= 65 ? 'Apply in 1–2 weeks after fixing the high-priority issues above.'
    : finalScore >= 50 ? 'Apply in 3–4 weeks after improving your content quality and fixing policy issues.'
    : 'Wait 6–8 weeks. Your site needs significant work before Google will approve it.'

  const timelineReason = finalScore >= 80
    ? 'Your scores are strong across all categories. A quick review of the fix list and you\'re ready to submit.'
    : finalScore >= 65
    ? 'A few important issues need fixing first. Once resolved, your site should meet AdSense\'s minimum requirements.'
    : finalScore >= 50
    ? 'Your content quality and/or policy compliance needs improvement. Rushing the application now will likely result in rejection.'
    : 'Multiple critical issues were found. Applying now would almost certainly result in rejection. Use this time to build a stronger foundation.'

  const workflow: WorkflowStep[] = finalScore >= 75 ? [
    { timeframe: 'Day 1–2', task: 'Fix High-Priority Issues', details: 'Go through the Fix List tab and address every "high" priority item. These are the things most likely to get your application rejected.' },
    { timeframe: 'Day 3–5', task: 'Polish Your Best Articles', details: 'Pick your top 5 articles and improve them. Add more detail, fix any grammar issues, and make sure each one has a clear title (H1) and a meta description.' },
    { timeframe: 'Day 6–7', task: 'Check Required Pages & Apply', details: 'Confirm you have Privacy Policy, About, and Contact pages. Then go to adsense.google.com and submit your application.' },
  ] : [
    { timeframe: 'Week 1', task: 'Fix Critical Issues First', details: 'Address all policy violations and missing required pages (Privacy Policy, About, Contact). These are non-negotiable — AdSense will reject without them.' },
    { timeframe: 'Week 2', task: 'Improve Your Weakest Articles', details: `Rewrite your ${Math.min(5, Math.round((100 - content.originality_score) / 10))} lowest-quality articles. Each should be 600+ words, written in your own voice, with a clear structure (intro, sections with headings, conclusion).` },
    { timeframe: 'Week 3', task: 'Publish New Content', details: 'Publish 3–5 new high-quality articles. Each should be at least 700 words and cover a specific topic your audience cares about. Aim for 25+ total articles on your site.' },
    { timeframe: 'Week 4', task: 'Fix Technical Issues', details: 'Add meta descriptions to every page (a 1-2 sentence summary of what the page is about). Make sure every page has a main heading (H1 tag). Link related articles to each other.' },
    { timeframe: 'Week 5–6', task: 'Re-scan & Apply', details: 'Run a fresh scan on AdSenseAI to check your new score. If it\'s 70+, submit your AdSense application at adsense.google.com.' },
  ]

  return {
    suggestions,
    application_timeline: timeline,
    application_timeline_reason: timelineReason,
    strategic_roadmap: [
      'Stick to one topic — a site about "cooking" is stronger than a site about "cooking, travel, and fitness" because Google sees it as more of an expert.',
      'Post 2-3 new articles every week — Google wants to see an active site, not one that was built and abandoned.',
      'Add your name and a short bio to your articles — Google values content from real, identifiable people.',
      'Make sure your site loads fast on mobile — over 60% of readers are on phones, and slow sites get penalized.',
      'Link your articles to each other — when you mention a topic you\'ve written about before, link to that article.',
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
    application_timeline_reason: advice.application_timeline_reason ?? '',
    strategic_roadmap: advice.strategic_roadmap,
    approval_workflow: advice.approval_workflow,
    generated_at: new Date().toISOString(),
  }
}
