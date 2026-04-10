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

const STRATEGIC_SYSTEM_PROMPT = `You are a Google AdSense approval specialist. You have been given a REAL website audit with actual data. Your job is to write a personalised action plan for THIS specific website — not a generic template.

CRITICAL RULES:
1. Every workflow step MUST reference the actual domain, actual scores, actual page counts, or actual URLs from the data provided.
2. NEVER write generic steps like "Fix critical issues" — always say WHAT to fix and WHERE. E.g. "Your site ${'{domain}'} has ${'{x}'} pages missing H1 tags — open each one and add a clear main heading."
3. If the site is missing specific pages (Privacy, About, Contact), name them explicitly in the steps.
4. If content scores are low, reference the actual score and give a concrete word count target.
5. If violations exist, quote them directly in the relevant step.
6. The workflow should feel like it was written by someone who just reviewed THIS site, not copy-pasted from a template.

Return a JSON object with:
- suggestions (array): Each item {
    category: "Content"|"Policy"|"SEO"|"UX"|"Trust",
    title: string (plain English, max 8 words, site-specific),
    description: string (2-3 sentences: what's wrong on THIS site + exactly how to fix it, reference actual scores/URLs),
    technical_detail: string (the specific metric: e.g. "originality_score=42/100, 8 pages under 300 words"),
    impact: "high"|"medium"|"low"
  }
- application_timeline (string): One sentence referencing the actual score. E.g. "With a score of 52/100, ${'{domain}'} needs about 4 weeks of work before applying."
- application_timeline_reason (string): 2-3 sentences explaining WHY based on the actual issues found.
- strategic_roadmap (array of strings): 4-5 tips specific to this site's niche and issues. Reference the niche, the actual missing topics, and the monetization potential.
- approval_workflow (array of objects): 7-10 steps. Each { timeframe, task, details } where:
  - timeframe: "Day 1-2", "Week 1", etc.
  - task: short title referencing the actual issue
  - details: 2-3 sentences with SPECIFIC actions for THIS site. Name actual pages, actual scores, actual counts.

Write like a consultant who just finished reviewing this specific site.`

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
  const pages = crawl.pages;
  const thinPages = pages.filter(p => p.word_count < 300 && p.word_count > 0);
  const noH1Pages = pages.filter(p => p.headings.h1.length === 0);
  const noMetaPages = pages.filter(p => !p.meta_description);
  const avgWords = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0;

  const summary = `
=== SITE AUDIT: ${crawl.domain} ===
AdSense Score: ${finalScore}/100 (${finalScore >= 80 ? 'High Chance' : finalScore >= 60 ? 'Moderate' : 'Low Chance'})
Domain Age: ${structure.domain_age_years ?? 'unknown'} years
Niche: ${monetization.niche}
Pages Crawled: ${crawl.total_pages} | Sitemap Total: ${crawl.sitemap_total ?? crawl.total_pages} URLs

=== REQUIRED PAGES (missing = instant rejection) ===
Privacy Policy: ${structure.has_privacy ? '✓ Found' : '✗ MISSING'}
About Page: ${structure.has_about ? '✓ Found' : '✗ MISSING'}
Contact Page: ${structure.has_contact ? '✓ Found' : '✗ MISSING'}
Terms of Service: ${structure.has_terms ? '✓ Found' : '✗ MISSING'}
Disclaimer: ${structure.has_disclaimer ? '✓ Found' : '✗ MISSING'}

=== CONTENT ANALYSIS ===
Quality Score: ${content.overall_quality_score}/100
Originality: ${content.originality_score}/100
Readability: ${content.readability_score}/100
Spam Score: ${content.spam_score}/100 (lower is better)
Average Word Count: ${avgWords} words/page
Thin Pages (<300 words): ${thinPages.length} pages
Pages Missing H1 Tag: ${noH1Pages.length} pages
Pages Missing Meta Description: ${noMetaPages.length} pages
Content Summary: ${content.summary}

=== POLICY ===
Policy Risk Score: ${policy.policy_risk_score}/100
Adult Content: ${policy.adult_content}
Copyright Risk: ${policy.copyright_risk}
Violations Found: ${policy.violations.length}
${policy.violations.length > 0 ? 'Violations: ' + policy.violations.join(' | ') : ''}
Policy Summary: ${policy.policy_summary}

=== TRUST & UX ===
Trust Score: ${trust.trust_score}/100
UX Score: ${trust.ux_score}/100
UX Issues: ${trust.ux_issues.join(' | ') || 'none'}
Design Feedback: ${trust.design_feedback}

=== SEO & TECHNICAL ===
Topical Authority: ${seo.topical_authority_score}/100
Semantic Coverage: ${seo.semantic_coverage_score}/100
Technical Health: ${tech.structural_integrity}/100
Missing Topics: ${seo.missing_topics.join(', ') || 'none'}
Technical Issues: ${tech.technical_issues.join(' | ') || 'none'}
Internal Linking Advice: ${seo.internal_linking_advice}

=== MONETIZATION ===
Revenue Potential: ${monetization.revenue_potential}
Estimated CPC: ${monetization.estimated_cpc}
Estimated CPM: ${monetization.estimated_cpm}

=== THIN PAGES (first 10) ===
${thinPages.slice(0, 10).map(p => `  ${p.word_count}w | ${p.url}`).join('\n') || '  none'}

=== PAGES MISSING H1 (first 10) ===
${noH1Pages.slice(0, 10).map(p => `  ${p.url}`).join('\n') || '  none'}

=== TOP PAGES BY WORD COUNT ===
${[...pages].sort((a,b) => b.word_count - a.word_count).slice(0, 20).map(p => `  ${p.word_count}w | ${p.title || 'No title'} | ${p.url}`).join('\n')}

=== FULL SITEMAP (up to 80 URLs) ===
${(crawl.sitemap_urls ?? pages.map(p => p.url)).slice(0, 80).join('\n')}
`.trim()

  // Build a deterministic fallback based on actual scores so it's never empty
  const fallback = buildFallbackAdvice(content, policy, trust, seo, tech, finalScore, crawl)

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
  finalScore: number,
  crawl: CrawlResponse
): StrategicAdvice {
  const domain = crawl.domain
  const thinCount = crawl.pages.filter(p => p.word_count < 300 && p.word_count > 0).length
  const noH1Count = crawl.pages.filter(p => p.headings.h1.length === 0).length
  const noMetaCount = crawl.pages.filter(p => !p.meta_description).length
  const avgWords = crawl.pages.length ? Math.round(crawl.pages.reduce((s, p) => s + p.word_count, 0) / crawl.pages.length) : 0
  const suggestions: FixSuggestion[] = []

  if (policy.adult_content || policy.dangerous_content)
    suggestions.push({ category: 'Policy', title: 'Remove Policy-Violating Content', description: `Adult or dangerous content was found on ${domain}. Google will automatically reject your AdSense application if this content is present. Remove or replace it before applying.`, technical_detail: `adult_content=${policy.adult_content}, dangerous_content=${policy.dangerous_content}`, impact: 'high' })
  if (policy.copyright_risk)
    suggestions.push({ category: 'Policy', title: 'Fix Copied Content', description: `Some content on ${domain} appears to be copied from other websites. Google requires original content — rewrite these articles in your own words with your own insights.`, technical_detail: `copyright_risk=true, policy_risk_score=${policy.policy_risk_score}`, impact: 'high' })
  if (policy.violations.length > 0)
    suggestions.push({ category: 'Policy', title: 'Fix Policy Violations', description: `${policy.violations.length} issue(s) were found on ${domain} that violate Google's rules: ${policy.violations.slice(0, 2).join(', ')}. Fix these before applying — they are automatic rejection triggers.`, technical_detail: `violations=[${policy.violations.join(', ')}]`, impact: 'high' })
  if (content.originality_score < 60)
    suggestions.push({ category: 'Content', title: 'Make Your Content More Original', description: `Your content scored ${content.originality_score}/100 for originality. This means your articles feel generic or similar to what's already on the internet. Add your personal experience, unique examples, and original research to each article.`, technical_detail: `originality_score=${content.originality_score}/100`, impact: 'high' })
  if (content.readability_score < 60)
    suggestions.push({ category: 'Content', title: 'Make Your Writing Easier to Read', description: `Readability score is ${content.readability_score}/100. Your articles may be using long sentences or complex words. Break paragraphs into 2-3 sentences, use simple words, and add subheadings every 200-300 words.`, technical_detail: `readability_score=${content.readability_score}/100 (target: 70+)`, impact: 'medium' })
  if (content.spam_score > 50)
    suggestions.push({ category: 'Content', title: 'Stop Repeating Keywords', description: `Spam score is ${content.spam_score}/100. You're using the same keywords too many times in your articles. Write naturally — Google's AI can tell when you're stuffing keywords, and it hurts your approval chances.`, technical_detail: `spam_score=${content.spam_score}/100 (target: below 30)`, impact: 'high' })
  if (thinCount > 0)
    suggestions.push({ category: 'Content', title: `Expand ${thinCount} Thin Pages`, description: `${thinCount} pages on ${domain} have fewer than 300 words — Google considers these "thin content" and may reject your site because of them. Expand each one to at least 600 words with useful, original information.`, technical_detail: `thin_pages=${thinCount} (under 300 words)`, impact: 'high' })
  if (noH1Count > 0)
    suggestions.push({ category: 'SEO', title: `Add H1 Headings to ${noH1Count} Pages`, description: `${noH1Count} pages on ${domain} are missing a main heading (H1 tag). Every page needs one clear title at the top — it tells Google what the page is about. Add a descriptive heading to each page.`, technical_detail: `pages_missing_h1=${noH1Count}`, impact: 'medium' })
  if (noMetaCount > 0)
    suggestions.push({ category: 'SEO', title: `Add Meta Descriptions to ${noMetaCount} Pages`, description: `${noMetaCount} pages are missing meta descriptions — the short summaries that appear in Google search results. Write a 1-2 sentence description for each page (under 160 characters) explaining what it's about.`, technical_detail: `pages_missing_meta=${noMetaCount}`, impact: 'medium' })
  if (seo.topical_authority_score < 60)
    suggestions.push({ category: 'SEO', title: 'Write More Articles on Your Topic', description: `Your site's topical authority score is ${seo.topical_authority_score}/100. This means Google doesn't yet see ${domain} as an expert on your topic. Publish 10-15 more in-depth articles covering different aspects of your niche.`, technical_detail: `topical_authority_score=${seo.topical_authority_score}/100, semantic_coverage=${seo.semantic_coverage_score}/100`, impact: 'medium' })
  if (trust.trust_score < 60)
    suggestions.push({ category: 'Trust', title: 'Add Missing Trust Pages', description: `Trust score is ${trust.trust_score}/100. Google wants to see that ${domain} is run by a real person or business. Make sure you have an About page (who you are), Contact page (how to reach you), and Privacy Policy (required by AdSense).`, technical_detail: `trust_score=${trust.trust_score}/100, ux_score=${trust.ux_score}/100`, impact: 'high' })
  trust.ux_issues.forEach(issue =>
    suggestions.push({ category: 'UX', title: 'Fix User Experience Issue', description: `${issue} — This affects how easy ${domain} is to use, which Google considers during review.`, impact: 'medium' })
  )

  // Always have at least 3 suggestions
  if (suggestions.length === 0) {
    suggestions.push(
      { category: 'Content', title: 'Make Articles Longer and Deeper', description: 'Aim for 800+ words per article. Each article should fully answer the question a reader came to your site with — include examples, steps, and your personal take.', technical_detail: 'target: 800+ words, depth_score > 70', impact: 'medium' },
      { category: 'SEO', title: 'Add Meta Descriptions to Every Page', description: 'A meta description is a 1-2 sentence summary that appears in Google search results. Every page needs one. Keep it under 160 characters and make it describe exactly what the page is about.', technical_detail: 'meta_description missing on some pages, target: 150-160 chars', impact: 'medium' },
      { category: 'Trust', title: 'Publish New Articles Regularly', description: 'Post 2-3 new articles every week. Google wants to see that your site is active and growing — a site that hasn\'t been updated in months looks abandoned.', technical_detail: 'publishing_frequency: target 2-3/week', impact: 'low' }
    )
  }

  const timeline = finalScore >= 80 ? `${domain} is ready — apply to AdSense now.`
    : finalScore >= 65 ? `${domain} needs 1–2 weeks of fixes before applying.`
    : finalScore >= 50 ? `${domain} needs 3–4 weeks of work before applying.`
    : `${domain} needs 6–8 weeks of significant work before applying.`

  const timelineReason = finalScore >= 80
    ? `Your scores are strong across all categories. A quick review of the fix list and you're ready to submit.`
    : finalScore >= 65
    ? `A few important issues need fixing first — particularly ${content.originality_score < 65 ? 'content originality' : trust.trust_score < 65 ? 'trust pages' : 'technical SEO'}. Once resolved, ${domain} should meet AdSense's minimum requirements.`
    : finalScore >= 50
    ? `${domain} scored ${finalScore}/100. The main issues are ${content.overall_quality_score < 60 ? `content quality (${content.overall_quality_score}/100)` : ''}${policy.policy_risk_score > 40 ? ` and policy compliance (risk: ${policy.policy_risk_score}/100)` : ''}. Rushing the application now will likely result in rejection.`
    : `${domain} scored ${finalScore}/100 with multiple critical issues. ${thinCount > 0 ? `${thinCount} thin pages, ` : ''}${noH1Count > 0 ? `${noH1Count} pages missing H1, ` : ''}${!crawl.site_structure.has_privacy ? 'missing Privacy Policy, ' : ''}and content quality at ${content.overall_quality_score}/100. Applying now would almost certainly result in rejection.`

  const workflow: WorkflowStep[] = finalScore >= 75 ? [
    { timeframe: 'Day 1–2', task: 'Fix High-Priority Issues', details: `Go through the Fix List tab and address every "high" priority item for ${domain}. These are the things most likely to get your application rejected.` },
    { timeframe: 'Day 3–5', task: 'Polish Your Best Articles', details: `Pick your top 5 articles on ${domain} and improve them. Add more detail, fix any grammar issues, and make sure each one has a clear title (H1) and a meta description.${noMetaCount > 0 ? ` You have ${noMetaCount} pages missing meta descriptions.` : ''}` },
    { timeframe: 'Day 6–7', task: 'Check Required Pages & Apply', details: `Confirm ${domain} has Privacy Policy${!crawl.site_structure.has_privacy ? ' (currently MISSING)' : ''}, About${!crawl.site_structure.has_about ? ' (currently MISSING)' : ''}, and Contact${!crawl.site_structure.has_contact ? ' (currently MISSING)' : ''} pages. Then go to adsense.google.com and submit your application.` },
  ] : [
    {
      timeframe: 'Week 1',
      task: `Fix Critical Issues on ${domain}`,
      details: `${!crawl.site_structure.has_privacy || !crawl.site_structure.has_about || !crawl.site_structure.has_contact ? `Create the missing required pages: ${[!crawl.site_structure.has_privacy && 'Privacy Policy', !crawl.site_structure.has_about && 'About', !crawl.site_structure.has_contact && 'Contact'].filter(Boolean).join(', ')}. ` : ''}${policy.violations.length > 0 ? `Fix the ${policy.violations.length} policy violation(s) found. ` : ''}These are non-negotiable — AdSense will reject without them.`
    },
    {
      timeframe: 'Week 2',
      task: 'Improve Your Weakest Content',
      details: `${thinCount > 0 ? `Expand the ${thinCount} thin pages (under 300 words) to at least 600 words each. ` : ''}Your average word count is ${avgWords} words — aim for 700+ per article. Each article should have a clear intro, 3-5 sections with headings, and a conclusion.`
    },
    {
      timeframe: 'Week 3',
      task: 'Fix Technical SEO Issues',
      details: `${noH1Count > 0 ? `Add H1 headings to the ${noH1Count} pages that are missing them. ` : ''}${noMetaCount > 0 ? `Write meta descriptions for the ${noMetaCount} pages that don't have them (keep under 160 characters). ` : ''}Link related articles to each other to help Google understand your site structure.`
    },
    {
      timeframe: 'Week 4',
      task: 'Publish New Content',
      details: `Publish 3–5 new high-quality articles on ${domain}. Each should be at least 700 words and cover a specific topic in your niche (${crawl.sitemap_total ?? crawl.total_pages} URLs found — aim for 25+ quality articles total). Focus on topics your audience is searching for.`
    },
    {
      timeframe: 'Week 5–6',
      task: 'Re-scan & Apply',
      details: `Run a fresh scan on AdSenseAI to check ${domain}'s new score. If it's 70+, submit your AdSense application at adsense.google.com. Your current score is ${finalScore}/100 — you need to reach at least 65-70 before applying.`
    },
  ]

  return {
    suggestions,
    application_timeline: timeline,
    application_timeline_reason: timelineReason,
    strategic_roadmap: [
      `Stick to one topic on ${domain} — a focused site about one subject is stronger than a site covering many topics because Google sees it as more of an expert.`,
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
