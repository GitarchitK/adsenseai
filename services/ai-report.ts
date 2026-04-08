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
4. Approval Workflow: A step-by-step plan (7-10 steps) for the next 7 days (if minor issues) or 30 days (if major issues) to get approved.

Return a JSON object with:
- suggestions (array): Each item { category: "Content"|"Policy"|"SEO"|"UX"|"Trust", title, description, impact: "high"|"medium"|"low" }
- application_timeline (string): Precise timeframe for application.
- strategic_roadmap (array of strings): High-level growth/strategy tips.
- approval_workflow (array of objects): Each item { timeframe: "Day 1-2"|"Week 1" etc, task, details }.

Be specific and practical. Base the timeline and workflow on the severity of the issues found.`

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
  finalScore: number
): Promise<StrategicAdvice> {
  const summary = `
AdSense Score: ${finalScore}/100
Content: quality=${content.overall_quality_score}, originality=${content.originality_score}, readability=${content.readability_score}
Policy: risk=${policy.policy_risk_score}, violations=${policy.violations.length}
Trust & EEAT: trust=${trust.trust_score}, eeat=${eeat.overall_eeat_score}
SEO & Tech: authority=${seo.topical_authority_score}, technical=${tech.structural_integrity}
Monetization: potential=${monetization.revenue_potential}, niche=${monetization.niche}

Details:
- Policy Summary: ${policy.policy_summary}
- Content Summary: ${content.summary}
- Technical Issues: ${tech.technical_issues.join(', ') || 'none'}
- Missing Topics: ${seo.missing_topics.join(', ') || 'none'}
`.trim()

  return await callOpenAI<StrategicAdvice>(
    STRATEGIC_SYSTEM_PROMPT,
    summary,
    { suggestions: [], application_timeline: 'Consult report for details', strategic_roadmap: [], approval_workflow: [] }
  )
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
    generateStrategicAdvice(content, policy, trust, monetization, eeat, seo_authority, technical_health, final_score),
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
