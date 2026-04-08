import type { CrawlResponse } from '@/types'

export interface ScoreBreakdown {
  // Final weighted score using the specified formula
  final_score: number
  status: 'high' | 'moderate' | 'low'
  status_label: 'High Chance' | 'Moderate' | 'Low'

  // Category scores (0–100)
  quality_score: number    // content quality  — weight 0.35
  policy_score: number     // policy compliance — weight 0.30
  seo_score: number        // SEO & indexing    — weight 0.15
  ux_score: number         // UX & trust        — weight 0.10
  trust_score: number      // trust signals     — weight 0.10

  // Diagnostics
  recommendations: string[]
  issues: string[]
  warnings: string[]
  missing_pages: string[]
}

/**
 * final_score = (quality * 0.35) + (policy * 0.30) + (seo * 0.15) + (ux * 0.10) + (trust * 0.10)
 */
export function computeScores(crawl: CrawlResponse): ScoreBreakdown {
  const pages = crawl.pages
  const total = pages.length || 1
  const { has_privacy, has_about, has_contact, has_terms, has_disclaimer } = crawl.site_structure

  // ── quality_score (content quality) ──────────────────────────────────────
  const avgWords = pages.reduce((s, p) => s + p.word_count, 0) / total
  const metaRatio = pages.filter((p) => p.meta_description).length / total
  const h1Ratio = pages.filter((p) => p.headings.h1.length > 0).length / total
  const quality_score = Math.round(
    clamp(avgWords / 5, 0, 40) + metaRatio * 30 + h1Ratio * 30
  )

  // ── policy_score ──────────────────────────────────────────────────────────
  // Deduct for missing required legal pages; base is 100
  const legalPages = [has_privacy, has_terms, has_disclaimer].filter(Boolean).length
  const policy_score = Math.round(clamp(40 + legalPages * 20, 0, 100))

  // ── seo_score ─────────────────────────────────────────────────────────────
  const structureBonus = [has_about, has_contact].filter(Boolean).length * 10
  const seo_score = Math.round(
    clamp(h1Ratio * 40 + metaRatio * 40 + structureBonus, 0, 100)
  )

  // ── ux_score ──────────────────────────────────────────────────────────────
  const avgInternalLinks = pages.reduce((s, p) => s + p.links.internal.length, 0) / total
  const ux_score = Math.round(
    clamp(
      (has_contact ? 20 : 0) +
      (has_about ? 20 : 0) +
      clamp(avgInternalLinks * 3, 0, 40) +
      (avgWords > 200 ? 20 : 0),
      0, 100
    )
  )

  // ── trust_score ───────────────────────────────────────────────────────────
  const trustPoints =
    (has_privacy ? 25 : 0) +
    (has_about ? 20 : 0) +
    (has_contact ? 20 : 0) +
    (has_terms ? 20 : 0) +
    (has_disclaimer ? 15 : 0)
  const trust_score = Math.round(clamp(trustPoints, 0, 100))

  // ── final weighted score ──────────────────────────────────────────────────
  const final_score = Math.round(
    quality_score * 0.35 +
    policy_score  * 0.30 +
    seo_score     * 0.15 +
    ux_score      * 0.10 +
    trust_score   * 0.10
  )

  const status =
    final_score >= 80 ? 'high' :
    final_score >= 60 ? 'moderate' : 'low'

  const status_label =
    final_score >= 80 ? 'High Chance' :
    final_score >= 60 ? 'Moderate' : 'Low'

  // ── diagnostics ───────────────────────────────────────────────────────────
  const issues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  const missing_pages: string[] = []

  if (!has_privacy) {
    issues.push('Missing Privacy Policy — required for AdSense approval')
    missing_pages.push('Privacy Policy')
  }
  if (!has_terms) {
    warnings.push('Missing Terms of Service page')
    missing_pages.push('Terms of Service')
  }
  if (!has_disclaimer) {
    warnings.push('Missing Disclaimer page — highly recommended for policy safety')
    missing_pages.push('Disclaimer')
  }
  if (!has_about) {
    recommendations.push('Add an About page to build authority and trust')
    missing_pages.push('About Page')
  }
  if (!has_contact) {
    recommendations.push('Add a Contact page — required by AdSense policies')
    missing_pages.push('Contact Page')
  }
  if (avgWords < 300)
    issues.push('Average page content too short — aim for 300+ words per page')
  if (metaRatio < 0.8)
    recommendations.push('Add meta descriptions to all pages for better SEO')
  if (h1Ratio < 1)
    warnings.push('Some pages are missing an H1 heading')
  if (avgInternalLinks < 3)
    recommendations.push('Increase internal linking to improve site navigation and SEO')

  return {
    final_score,
    status,
    status_label,
    quality_score,
    policy_score,
    seo_score,
    ux_score,
    trust_score,
    recommendations,
    issues,
    warnings,
    missing_pages,
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
