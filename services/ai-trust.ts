/**
 * Module 3 — Trust & UX Analyzer
 * Evaluates website professionalism, trustworthiness, and user experience signals.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface TrustUXResult {
  trust_score: number       // 0-100
  ux_score: number          // 0-100
  design_feedback: string   // short actionable feedback
  trust_signals: string[]   // positive trust indicators found
  ux_issues: string[]       // UX problems detected
}

const SYSTEM_PROMPT = `You are a UX and web trust expert evaluating websites for Google AdSense approval. Write for non-technical website owners.

Analyze the provided website data and return a JSON object with EXACTLY these fields:
- trust_score (0-100): How trustworthy and professional the site appears to Google's reviewers.
- ux_score (0-100): How easy the site is to use and navigate.
- design_feedback (string): 2-3 sentences in plain English. Tell them what impression their site gives and the single most important thing to improve.
- trust_signals (array of strings): Positive things found — written as "Your site has X, which shows Y." Empty array if none.
- ux_issues (array of strings): Each issue written as: what the problem is + why it matters + how to fix it in one sentence. Empty array if none.

Write like a knowledgeable friend, not a technical report. Avoid jargon.`

function buildTrustContext(pages: CrawledPage[], structure: SiteStructure, domain: string): string {
  const avgWords = pages.length
    ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length)
    : 0

  const pagesWithMeta = pages.filter((p) => p.meta_description).length
  const pagesWithH1 = pages.filter((p) => p.headings.h1.length > 0).length
  const totalInternalLinks = pages.reduce((s, p) => s + p.links.internal.length, 0)

  const lines: string[] = [
    `Domain: ${domain}`,
    `Total pages crawled: ${pages.length}`,
    `Average word count per page: ${avgWords}`,
    `Pages with meta description: ${pagesWithMeta}/${pages.length}`,
    `Pages with H1 heading: ${pagesWithH1}/${pages.length}`,
    `Total internal links found: ${totalInternalLinks}`,
    '',
    `Site structure:`,
    `  Privacy Policy: ${structure.has_privacy}`,
    `  About page: ${structure.has_about}`,
    `  Contact page: ${structure.has_contact}`,
    `  Terms of Service: ${structure.has_terms}`,
    '',
    `Page titles and URLs:`,
  ]

  pages.slice(0, 15).forEach((page) => {
    lines.push(`  - ${page.title || 'Untitled'} (${page.url})`)
  })

  lines.push('')
  lines.push('Sample content from homepage:')
  if (pages[0]) lines.push(pages[0].content.slice(0, 600))

  return lines.join('\n')
}

const FALLBACK: TrustUXResult = {
  trust_score: 50,
  ux_score: 50,
  design_feedback: 'Trust and UX analysis unavailable — API error.',
  trust_signals: [],
  ux_issues: [],
}

export async function analyzeTrustAndUX(
  pages: CrawledPage[],
  structure: SiteStructure,
  domain: string
): Promise<TrustUXResult> {
  const context = buildTrustContext(pages, structure, domain)
  return callOpenAI<TrustUXResult>(SYSTEM_PROMPT, context, FALLBACK)
}
