/**
 * Module 7 — Technical Health & Structure Auditor
 * Analyzes technical signals like page speed hints, mobile readiness, and code quality.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface TechnicalHealthResult {
  mobile_readiness_score: number // 0-100
  page_speed_likelihood: number // 0-100 (estimated from content depth/scripts)
  structural_integrity: number  // 0-100 (heading hierarchy, meta usage)
  technical_issues: string[]     // list of code/structure problems
  performance_tips: string[]     // ways to speed up the site
  summary: string                // overall technical status
}

const SYSTEM_PROMPT = `You are a Technical SEO and Web Performance Auditor.

Analyze the provided website data and return a JSON object with EXACTLY these fields:
- mobile_readiness_score (0-100): How well the site likely performs on mobile based on structure.
- page_speed_likelihood (0-100): Estimated performance based on content complexity.
- structural_integrity (0-100): Quality of heading hierarchy (H1->H2->H3) and metadata.
- technical_issues (array of strings): 3-5 specific technical or structural problems found.
- performance_tips (array of strings): 3-5 ways to improve technical health.
- summary (string): 1-2 sentence summary of the technical audit.

Focus on elements that impact Google's Core Web Vitals and Page Experience signals.`

function buildTechnicalContext(pages: CrawledPage[]): string {
  const avgWordCount = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0
  
  const lines: string[] = [
    `Average word count: ${avgWordCount}`,
    `Total pages: ${pages.length}`,
    '',
  ]

  pages.slice(0, 15).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} Technical Data ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`H1 count: ${page.headings.h1.length}`)
    lines.push(`H2 count: ${page.headings.h2.length}`)
    lines.push(`Meta Description: ${page.meta_description ? 'Present' : 'MISSING'}`)
    lines.push(`Internal Links: ${page.links.internal.length}`)
    lines.push(`External Links: ${page.links.external.length}`)
    lines.push('')
  })

  return lines.join('\n')
}

const FALLBACK: TechnicalHealthResult = {
  mobile_readiness_score: 50,
  page_speed_likelihood: 50,
  structural_integrity: 50,
  technical_issues: [],
  performance_tips: [],
  summary: 'Technical health analysis unavailable — API error.',
}

export async function analyzeTechnicalHealth(
  pages: CrawledPage[]
): Promise<TechnicalHealthResult> {
  const context = buildTechnicalContext(pages)
  return callOpenAI<TechnicalHealthResult>(SYSTEM_PROMPT, context, FALLBACK)
}
