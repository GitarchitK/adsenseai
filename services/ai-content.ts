/**
 * Module 1 — Content Quality Analyzer (Advanced)
 * Deep analysis of content quality, originality, depth, and AdSense readiness.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface ContentQualityResult {
  readability_score: number      // 0-100
  originality_score: number      // 0-100
  spam_score: number             // 0-100 (higher = more spammy)
  depth_score: number            // 0-100 (how comprehensive the content is)
  overall_quality_score: number  // 0-100
  thin_content_count: number     // number of pages under 300 words
  avg_content_depth: string      // 'shallow' | 'moderate' | 'deep'
  content_gaps: string[]         // specific topics missing from the content
  best_articles: string[]        // URLs of the strongest articles
  weakest_articles: string[]     // URLs of the weakest articles (need improvement)
  summary: string                // plain-English explanation
}

const SYSTEM_PROMPT = `You are a senior content quality analyst specializing in Google AdSense approval. You have deep knowledge of what Google's content quality systems look for.

Analyze the provided website content data and return a JSON object with EXACTLY these fields:
- readability_score (0-100): Flesch-Kincaid style readability. 80+ = easy to read, 60-79 = moderate, below 60 = difficult. Consider sentence length, vocabulary complexity, and paragraph structure.
- originality_score (0-100): How original and unique the content appears. Penalize heavily for: generic listicles with no unique insights, content that reads like it was copied or paraphrased from Wikipedia, articles with no personal perspective or examples, thin content under 400 words.
- spam_score (0-100): Keyword stuffing, clickbait titles, excessive repetition, unnatural writing patterns. Higher = more spammy. Penalize for: same keyword appearing 5+ times in 500 words, titles like "10 BEST AMAZING TIPS YOU MUST KNOW", excessive exclamation marks.
- depth_score (0-100): How comprehensive and in-depth the content is. Does it fully cover the topic? Does it go beyond surface-level information? Does it include examples, data, or unique insights?
- overall_quality_score (0-100): Holistic content quality for AdSense approval. This is the most important score.
- thin_content_count (number): Count of pages with fewer than 300 words.
- avg_content_depth ('shallow' | 'moderate' | 'deep'): Overall depth assessment.
- content_gaps (array of 3-5 strings): Specific topics or subtopics that are missing from the content but would strengthen the site's authority. Be specific to the niche.
- best_articles (array of up to 3 URLs): The strongest articles on the site that demonstrate quality.
- weakest_articles (array of up to 3 URLs): The weakest articles that most need improvement.
- summary (string): 2-3 sentences in plain English. Start with the verdict, then explain the main strengths and weaknesses. Reference specific articles or patterns you found.

Be strict and specific. Reference actual content from the pages provided. Don't give generic feedback.`

function buildContentSummary(pages: CrawledPage[]): string {
  const lines: string[] = [
    `=== CONTENT ANALYSIS DATA ===`,
    `Total pages crawled: ${pages.length}`,
    ``,
  ]

  // Compute stats
  const thinPages = pages.filter(p => p.word_count < 300 && p.word_count > 0)
  const avgWords = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0
  const noH1 = pages.filter(p => p.headings.h1.length === 0).length
  const noMeta = pages.filter(p => !p.meta_description).length

  lines.push(`=== SITE-WIDE STATS ===`)
  lines.push(`Average word count: ${avgWords} words/page`)
  lines.push(`Thin pages (<300 words): ${thinPages.length}`)
  lines.push(`Pages missing H1: ${noH1}`)
  lines.push(`Pages missing meta description: ${noMeta}`)
  lines.push(``)

  // Sort by word count — analyze longest articles first (most representative of quality)
  const sorted = [...pages].sort((a, b) => b.word_count - a.word_count)

  lines.push(`=== TOP ARTICLES BY LENGTH ===`)
  sorted.slice(0, 5).forEach(p => {
    lines.push(`${p.word_count}w | ${p.title || 'No title'} | ${p.url}`)
  })
  lines.push(``)

  lines.push(`=== THIN PAGES (need expansion) ===`)
  thinPages.slice(0, 5).forEach(p => {
    lines.push(`${p.word_count}w | ${p.url}`)
  })
  lines.push(``)

  lines.push(`=== DETAILED PAGE ANALYSIS ===`)
  // Analyze top 25 pages with full content
  sorted.slice(0, 25).forEach((page, i) => {
    lines.push(`--- Article ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'No title'}`)
    lines.push(`Word count: ${page.word_count}`)
    lines.push(`H1: ${page.headings.h1.join(', ') || 'MISSING'}`)
    lines.push(`H2s: ${page.headings.h2.slice(0, 5).join(' | ') || 'none'}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    // More content for longer articles
    const snippetLen = page.word_count > 800 ? 1000 : page.word_count > 400 ? 600 : 300
    lines.push(`Content: ${page.content.slice(0, snippetLen)}`)
    lines.push(``)
  })

  // Summary table for remaining pages
  if (sorted.length > 25) {
    lines.push(`=== REMAINING PAGES (summary) ===`)
    sorted.slice(25).forEach(p => {
      lines.push(`${p.word_count}w | ${p.title || 'No title'} | ${p.url}`)
    })
  }

  return lines.join('\n')
}

const FALLBACK: ContentQualityResult = {
  readability_score: 50,
  originality_score: 50,
  spam_score: 30,
  depth_score: 50,
  overall_quality_score: 50,
  thin_content_count: 0,
  avg_content_depth: 'moderate',
  content_gaps: [],
  best_articles: [],
  weakest_articles: [],
  summary: 'Content analysis unavailable — API error.',
}

export async function analyzeContentQuality(pages: CrawledPage[]): Promise<ContentQualityResult> {
  const content = buildContentSummary(pages)
  return callOpenAI<ContentQualityResult>(SYSTEM_PROMPT, content, FALLBACK)
}
