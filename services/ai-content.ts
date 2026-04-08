/**
 * Module 1 — Content Quality Analyzer
 * Scores readability, originality, spam likelihood, and overall quality.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface ContentQualityResult {
  readability_score: number      // 0-100
  originality_score: number      // 0-100
  spam_score: number             // 0-100 (higher = more spammy)
  overall_quality_score: number  // 0-100
  summary: string                // short explanation
}

const SYSTEM_PROMPT = `You are an expert content quality analyst specializing in Google AdSense policy compliance.

Analyze the provided website content and return a JSON object with EXACTLY these fields:
- readability_score (0-100): How easy the content is to read and understand. Consider sentence structure, vocabulary, and clarity.
- originality_score (0-100): How original and unique the content appears. Low scores for thin, templated, or scraped content.
- spam_score (0-100): Likelihood of spammy patterns (keyword stuffing, excessive ads, clickbait). Higher = more spammy.
- overall_quality_score (0-100): Holistic content quality for AdSense approval purposes.
- summary (string): 1-2 sentence explanation of the main content quality findings.

Be strict but fair. AdSense requires high-quality, original content.`

/**
 * Builds a compact content summary from crawled pages for the prompt.
 * Keeps token usage reasonable by capping content per page.
 */
function buildContentSummary(pages: CrawledPage[]): string {
  const lines: string[] = [`Total pages: ${pages.length}`, '']

  pages.slice(0, 12).forEach((page, i) => {
    lines.push(`--- Page ${i + 1}: ${page.title || 'Untitled'} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Word count: ${page.word_count}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    if (page.headings.h1.length) lines.push(`H1: ${page.headings.h1.join(', ')}`)
    if (page.headings.h2.length) lines.push(`H2s: ${page.headings.h2.slice(0, 3).join(', ')}`)
    // Include a snippet of actual content
    lines.push(`Content snippet: ${page.content.slice(0, 600)}`)
    lines.push('')
  })

  return lines.join('\n')
}

const FALLBACK: ContentQualityResult = {
  readability_score: 50,
  originality_score: 50,
  spam_score: 50,
  overall_quality_score: 50,
  summary: 'Content analysis unavailable — API error.',
}

export async function analyzeContentQuality(
  pages: CrawledPage[]
): Promise<ContentQualityResult> {
  const content = buildContentSummary(pages)
  return callOpenAI<ContentQualityResult>(SYSTEM_PROMPT, content, FALLBACK)
}
