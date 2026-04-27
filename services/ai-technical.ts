/**
 * Module 7 — Technical Health & Structure Auditor (Advanced)
 * Comprehensive technical analysis with specific page-level findings.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface TechnicalHealthResult {
  mobile_readiness_score: number
  page_speed_likelihood: number
  structural_integrity: number
  technical_issues: string[]
  performance_tips: string[]
  summary: string
  // New advanced fields
  pages_missing_h1: number
  pages_missing_meta: number
  pages_with_duplicate_h1: number
  avg_internal_links: number
  broken_structure_pages: string[]  // URLs with structural issues
  heading_hierarchy_score: number   // 0-100 (proper H1>H2>H3 usage)
  meta_quality_score: number        // 0-100 (uniqueness and quality of meta descriptions)
  crawlability_score: number        // 0-100 (how easily Google can crawl the site)
  technical_wins: string[]          // things the site is doing right technically
}

const SYSTEM_PROMPT = `You are a Technical SEO expert specializing in Google AdSense approval requirements. You understand what technical signals Google's crawlers and reviewers evaluate.

Analyze the provided technical data and return a JSON object with EXACTLY these fields:

- mobile_readiness_score (0-100): Estimated mobile performance based on content structure, heading usage, and page complexity.
- page_speed_likelihood (0-100): Estimated performance based on content complexity, external links, and structural signals.
- structural_integrity (0-100): Quality of heading hierarchy (H1→H2→H3), metadata completeness, and overall page structure.
- technical_issues (array of strings): Specific technical problems found. Write as: "[Issue] — [X pages affected] — [How to fix]." Be specific with numbers.
- performance_tips (array of strings): Specific performance improvements. Reference actual patterns found.
- summary (string): 2-3 sentences on the technical health. Reference specific numbers (e.g., "12 of 45 pages are missing H1 tags").
- pages_missing_h1 (number): Count of pages without H1 tags.
- pages_missing_meta (number): Count of pages without meta descriptions.
- pages_with_duplicate_h1 (number): Count of pages with multiple H1 tags.
- avg_internal_links (number): Average internal links per page.
- broken_structure_pages (array of up to 5 URLs): Pages with the worst structural issues.
- heading_hierarchy_score (0-100): How well the site uses proper heading hierarchy (H1 for main title, H2 for sections, H3 for subsections).
- meta_quality_score (0-100): Quality and uniqueness of meta descriptions across the site.
- crawlability_score (0-100): How easily Google can crawl and understand the site structure.
- technical_wins (array of strings): Technical things the site is doing correctly. Be specific.

Be precise with numbers. Reference actual page counts and URLs where possible.`

function buildTechnicalContext(pages: CrawledPage[]): string {
  const avgWordCount = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0
  const pagesWithH1 = pages.filter(p => p.headings.h1.length > 0)
  const pagesWithoutH1 = pages.filter(p => p.headings.h1.length === 0)
  const pagesWithMultipleH1 = pages.filter(p => p.headings.h1.length > 1)
  const pagesWithMeta = pages.filter(p => p.meta_description)
  const pagesWithoutMeta = pages.filter(p => !p.meta_description)
  const totalInternalLinks = pages.reduce((s, p) => s + p.links.internal.length, 0)
  const avgInternalLinks = pages.length ? (totalInternalLinks / pages.length).toFixed(1) : '0'
  const thinPages = pages.filter(p => p.word_count < 300 && p.word_count > 0)

  const lines: string[] = [
    `=== TECHNICAL HEALTH AUDIT ===`,
    `Total pages analyzed: ${pages.length}`,
    ``,
    `=== CRITICAL METRICS ===`,
    `Pages WITH H1: ${pagesWithH1.length}/${pages.length}`,
    `Pages MISSING H1: ${pagesWithoutH1.length}/${pages.length}`,
    `Pages with MULTIPLE H1: ${pagesWithMultipleH1.length}`,
    `Pages WITH meta description: ${pagesWithMeta.length}/${pages.length}`,
    `Pages MISSING meta description: ${pagesWithoutMeta.length}/${pages.length}`,
    `Average word count: ${avgWordCount}`,
    `Thin pages (<300 words): ${thinPages.length}`,
    `Average internal links per page: ${avgInternalLinks}`,
    ``,
    `=== PAGES MISSING H1 (first 10) ===`,
    ...pagesWithoutH1.slice(0, 10).map(p => `  ${p.url} (${p.word_count}w)`),
    ``,
    `=== PAGES MISSING META (first 10) ===`,
    ...pagesWithoutMeta.slice(0, 10).map(p => `  ${p.url}`),
    ``,
    `=== PAGES WITH MULTIPLE H1 ===`,
    ...pagesWithMultipleH1.slice(0, 5).map(p => `  ${p.url} (${p.headings.h1.length} H1s: ${p.headings.h1.join(', ')})`),
    ``,
    `=== FULL PAGE TECHNICAL DATA ===`,
  ]

  pages.slice(0, 30).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'MISSING'}`)
    lines.push(`Meta: ${page.meta_description ? page.meta_description.slice(0, 100) : 'MISSING'}`)
    lines.push(`H1 (${page.headings.h1.length}): ${page.headings.h1.join(', ') || 'MISSING'}`)
    lines.push(`H2 (${page.headings.h2.length}): ${page.headings.h2.slice(0, 4).join(', ') || 'none'}`)
    lines.push(`Words: ${page.word_count} | Internal links: ${page.links.internal.length} | External links: ${page.links.external.length}`)
    lines.push(``)
  })

  return lines.join('\n')
}

const FALLBACK: TechnicalHealthResult = {
  mobile_readiness_score: 60,
  page_speed_likelihood: 60,
  structural_integrity: 60,
  technical_issues: [],
  performance_tips: [],
  summary: 'Technical analysis unavailable — API error.',
  pages_missing_h1: 0,
  pages_missing_meta: 0,
  pages_with_duplicate_h1: 0,
  avg_internal_links: 0,
  broken_structure_pages: [],
  heading_hierarchy_score: 60,
  meta_quality_score: 60,
  crawlability_score: 60,
  technical_wins: [],
}

export async function analyzeTechnicalHealth(pages: CrawledPage[]): Promise<TechnicalHealthResult> {
  const context = buildTechnicalContext(pages)
  return callOpenAI<TechnicalHealthResult>(SYSTEM_PROMPT, context, FALLBACK)
}
