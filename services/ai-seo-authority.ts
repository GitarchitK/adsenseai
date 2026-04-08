/**
 * Module 6 — Semantic SEO & Topical Authority Analyzer
 * Evaluates how well the site covers its niche and suggests content clusters.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface SEOAuthorityResult {
  topical_authority_score: number // 0-100
  semantic_coverage_score: number // 0-100
  identified_clusters: string[]   // primary content pillars found
  missing_topics: string[]        // what the site should write about next
  internal_linking_advice: string // how to improve link flow
  summary: string                 // overall authority status
}

const SYSTEM_PROMPT = `You are a Semantic SEO and Topical Authority expert.

Analyze the provided website pages and return a JSON object with EXACTLY these fields:
- topical_authority_score (0-100): How deeply the site covers its main subject.
- semantic_coverage_score (0-100): How well the site covers related sub-topics and LSI keywords.
- identified_clusters (array of strings): 3-4 main content pillars or categories detected.
- missing_topics (array of strings): 4-6 specific topics or keywords the site is missing but needs for authority.
- internal_linking_advice (string): 1-2 sentences on how to better connect these pages.
- summary (string): 1-2 sentence summary of the site's topical standing.

Be critical. If a site is "thin" on content, give a low authority score.`

function buildSEOContext(pages: CrawledPage[]): string {
  const lines: string[] = [`Total pages analyzed: ${pages.length}`, '']

  pages.slice(0, 20).forEach((page, i) => {
    lines.push(`--- Page ${i + 1}: ${page.title || 'Untitled'} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Headings: ${page.headings.h1.join(', ')} | ${page.headings.h2.slice(0, 3).join(', ')}`)
    lines.push('')
  })

  return lines.join('\n')
}

const FALLBACK: SEOAuthorityResult = {
  topical_authority_score: 40,
  semantic_coverage_score: 40,
  identified_clusters: [],
  missing_topics: [],
  internal_linking_advice: 'Internal linking analysis unavailable.',
  summary: 'SEO Authority analysis unavailable — API error.',
}

export async function analyzeSEOAuthority(
  pages: CrawledPage[]
): Promise<SEOAuthorityResult> {
  const context = buildSEOContext(pages)
  return callOpenAI<SEOAuthorityResult>(SYSTEM_PROMPT, context, FALLBACK)
}
