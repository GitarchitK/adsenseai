/**
 * Module 6 — Semantic SEO & Topical Authority Analyzer (Advanced)
 * Deep analysis of topical coverage, content clusters, and SEO signals.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface SEOAuthorityResult {
  topical_authority_score: number
  semantic_coverage_score: number
  identified_clusters: string[]
  missing_topics: string[]
  internal_linking_advice: string
  summary: string
  // New advanced fields
  niche_focus: string            // how focused the site is on one niche
  content_cluster_gaps: string[] // specific content clusters that are incomplete
  keyword_opportunities: string[] // specific keywords to target for better AdSense revenue
  competitor_edge: string        // what makes this site unique vs competitors
  seo_quick_wins: string[]       // fast SEO improvements that will help AdSense approval
}

const SYSTEM_PROMPT = `You are a Semantic SEO and Topical Authority expert who specializes in helping publishers get Google AdSense approved.

Analyze the provided website pages and return a JSON object with EXACTLY these fields:

- topical_authority_score (0-100): How deeply the site covers its main subject. A site with 5 shallow articles scores 20. A site with 30 in-depth articles covering all aspects of a niche scores 80+.
- semantic_coverage_score (0-100): How well the site covers related sub-topics, LSI keywords, and semantic variations. Does it answer all the questions a reader might have about the niche?
- identified_clusters (array of 3-5 strings): Main content pillars or categories detected. Be specific to the actual content found.
- missing_topics (array of 4-6 strings): Specific topics or questions the site should cover to strengthen authority. Be specific — not "write more content" but "Write a guide on [specific topic] because your site covers [X] but not [Y]."
- internal_linking_advice (string): 2-3 sentences on how to better connect these pages. Reference actual page titles or topics found.
- summary (string): 2-3 sentences on the site's topical standing. Reference the actual niche and content found.
- niche_focus (string): 1 sentence — is the site focused on one niche or scattered across multiple topics?
- content_cluster_gaps (array of 3-4 strings): Specific content clusters that are started but incomplete. Example: "Finance cluster has 3 articles on investing but nothing on budgeting or debt management."
- keyword_opportunities (array of 4-6 strings): Specific keywords this site should target that would attract high-CPC AdSense ads. Be specific to the niche.
- competitor_edge (string): 1-2 sentences on what makes this site's content unique or what angle it should double down on.
- seo_quick_wins (array of 3-5 strings): Fast SEO improvements that will help AdSense approval. Be specific — reference actual pages or patterns found.

Be critical and specific. Reference actual content from the pages provided.`

function buildSEOContext(pages: CrawledPage[]): string {
  const lines: string[] = [
    `=== SEO AUTHORITY ANALYSIS ===`,
    `Total pages: ${pages.length}`,
    ``,
  ]

  // Full content analysis for SEO
  const sorted = [...pages].sort((a, b) => b.word_count - a.word_count)

  lines.push(`=== ALL PAGE TITLES & TOPICS ===`)
  pages.forEach(p => {
    lines.push(`${p.word_count}w | ${p.title || 'No title'} | ${p.url}`)
  })
  lines.push(``)

  lines.push(`=== DETAILED CONTENT ANALYSIS ===`)
  sorted.slice(0, 20).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'No title'}`)
    lines.push(`H1: ${page.headings.h1.join(', ') || 'none'}`)
    lines.push(`H2s: ${page.headings.h2.slice(0, 6).join(' | ') || 'none'}`)
    lines.push(`Word count: ${page.word_count}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    // Include actual content for semantic analysis
    lines.push(`Content: ${page.content.slice(0, 600)}`)
    lines.push(``)
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
  niche_focus: 'Unable to determine niche focus.',
  content_cluster_gaps: [],
  keyword_opportunities: [],
  competitor_edge: 'Unable to determine competitive edge.',
  seo_quick_wins: [],
}

export async function analyzeSEOAuthority(pages: CrawledPage[]): Promise<SEOAuthorityResult> {
  const context = buildSEOContext(pages)
  return callOpenAI<SEOAuthorityResult>(SYSTEM_PROMPT, context, FALLBACK)
}
