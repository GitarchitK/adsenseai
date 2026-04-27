/**
 * Module 3 — Trust & UX Analyzer (Advanced)
 * Deep evaluation of trust signals, E-E-A-T indicators, and user experience.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface TrustUXResult {
  trust_score: number
  ux_score: number
  design_feedback: string
  trust_signals: string[]
  ux_issues: string[]
  // New advanced fields
  author_presence: boolean       // articles have author attribution
  contact_accessibility: boolean // contact info is easy to find
  navigation_quality: string     // 'poor' | 'fair' | 'good' | 'excellent'
  internal_link_density: string  // 'too low' | 'good' | 'too high'
  site_purpose_clarity: string   // is it clear what the site is about?
  credibility_signals: string[]  // specific credibility indicators found
  trust_improvements: string[]   // specific, actionable trust improvements
}

const SYSTEM_PROMPT = `You are a UX and web trust expert evaluating websites for Google AdSense approval. You understand what Google's reviewers look for when assessing site quality and trustworthiness.

Analyze the provided website data and return a JSON object with EXACTLY these fields:

- trust_score (0-100): How trustworthy and professional the site appears to Google's reviewers. Consider: required pages, author attribution, contact accessibility, content accuracy signals, site age indicators.
- ux_score (0-100): User experience quality. Consider: navigation clarity, content structure, heading hierarchy, internal linking, page depth, mobile-friendliness signals.
- design_feedback (string): 2-3 sentences in plain English. What impression does this site give? What's the single most important UX improvement?
- trust_signals (array of strings): Positive trust indicators found. Write as "Your site has [X], which signals [Y] to Google's reviewers."
- ux_issues (array of strings): UX problems. Write as: "[Problem] — [Why it matters for AdSense] — [How to fix it in one sentence]."
- author_presence (boolean): true if articles have clear author attribution (author name, bio, or byline).
- contact_accessibility (boolean): true if contact information is easy to find (in header, footer, or dedicated page).
- navigation_quality ('poor' | 'fair' | 'good' | 'excellent'): Quality of site navigation based on structure.
- internal_link_density ('too low' | 'good' | 'too high'): Assessment of internal linking.
- site_purpose_clarity (string): 1 sentence — is it immediately clear what this site is about and who it's for?
- credibility_signals (array of strings): Specific credibility indicators like "About page with team information", "Privacy Policy present", "Regular publishing schedule evident from dates".
- trust_improvements (array of 3-5 strings): Specific, actionable improvements to increase trust score. Reference actual missing elements.

Write like a knowledgeable friend reviewing the site. Be specific, not generic.`

function buildTrustContext(pages: CrawledPage[], structure: SiteStructure, domain: string): string {
  const avgWords = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0
  const pagesWithMeta = pages.filter(p => p.meta_description).length
  const pagesWithH1 = pages.filter(p => p.headings.h1.length > 0).length
  const totalInternalLinks = pages.reduce((s, p) => s + p.links.internal.length, 0)
  const avgInternalLinks = pages.length ? (totalInternalLinks / pages.length).toFixed(1) : '0'
  const pagesWithDates = pages.filter(p => p.lastmod).length

  const lines: string[] = [
    `=== TRUST & UX AUDIT ===`,
    `Domain: ${domain}`,
    ``,
    `=== SITE STRUCTURE ===`,
    `Privacy Policy: ${structure.has_privacy ? '✓' : '✗ MISSING'}`,
    `About page: ${structure.has_about ? '✓' : '✗ MISSING'}`,
    `Contact page: ${structure.has_contact ? '✓' : '✗ MISSING'}`,
    `Terms of Service: ${structure.has_terms ? '✓' : '✗ MISSING'}`,
    `Disclaimer: ${structure.has_disclaimer ? '✓' : '✗ MISSING'}`,
    ``,
    `=== CONTENT METRICS ===`,
    `Total pages: ${pages.length}`,
    `Average word count: ${avgWords} words`,
    `Pages with meta description: ${pagesWithMeta}/${pages.length}`,
    `Pages with H1 heading: ${pagesWithH1}/${pages.length}`,
    `Average internal links per page: ${avgInternalLinks}`,
    `Pages with publication dates: ${pagesWithDates}`,
    ``,
    `=== PAGE TITLES & STRUCTURE ===`,
  ]

  pages.slice(0, 20).forEach(page => {
    lines.push(`  ${page.title || 'No title'} | ${page.word_count}w | ${page.url}`)
  })

  lines.push(``)
  lines.push(`=== HOMEPAGE CONTENT ===`)
  const homepage = pages.find(p => {
    try { return new URL(p.url).pathname === '/' } catch { return false }
  }) || pages[0]
  if (homepage) {
    lines.push(`Title: ${homepage.title}`)
    lines.push(`Content: ${homepage.content.slice(0, 1000)}`)
  }

  lines.push(``)
  lines.push(`=== SAMPLE ARTICLE CONTENT ===`)
  const articles = [...pages].sort((a, b) => b.word_count - a.word_count).slice(0, 3)
  articles.forEach(page => {
    lines.push(`--- ${page.title || 'Untitled'} (${page.word_count}w) ---`)
    lines.push(page.content.slice(0, 500))
    lines.push(``)
  })

  return lines.join('\n')
}

const FALLBACK: TrustUXResult = {
  trust_score: 50,
  ux_score: 50,
  design_feedback: 'Trust and UX analysis unavailable — API error.',
  trust_signals: [],
  ux_issues: [],
  author_presence: false,
  contact_accessibility: false,
  navigation_quality: 'fair',
  internal_link_density: 'too low',
  site_purpose_clarity: 'Site purpose unclear.',
  credibility_signals: [],
  trust_improvements: [],
}

export async function analyzeTrustAndUX(
  pages: CrawledPage[],
  structure: SiteStructure,
  domain: string
): Promise<TrustUXResult> {
  const context = buildTrustContext(pages, structure, domain)
  return callOpenAI<TrustUXResult>(SYSTEM_PROMPT, context, FALLBACK)
}
