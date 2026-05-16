/**
 * Module 1 — Content Quality Analyzer (Advanced)
 * Deep analysis of content quality, originality, depth, and AdSense readiness.
 * Uses real extracted metrics to ground AI analysis in actual data.
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
  // New: per-article quality signals
  duplicate_title_count: number  // pages with duplicate or missing titles
  avg_h2_per_page: number        // average H2 headings per page (structure signal)
  pages_with_schema: number      // pages using structured data
  estimated_reading_level: string // 'elementary' | 'middle school' | 'high school' | 'college'
}

// ── Real metric helpers ───────────────────────────────────────────────────────

function computeFleschKincaid(text: string): number {
  if (!text || text.length < 50) return 50
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  if (sentences.length === 0 || words.length === 0) return 50
  const avgSentenceLength = words.length / sentences.length
  const totalSyllables = words.reduce((sum, word) => {
    return sum + Math.max(1, (word.toLowerCase().match(/[aeiouy]+/g) ?? []).length)
  }, 0)
  const avgSyllablesPerWord = totalSyllables / words.length
  const fre = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  return Math.round(Math.min(100, Math.max(0, fre)))
}

function getReadingLevel(fkScore: number): string {
  if (fkScore >= 80) return 'elementary'
  if (fkScore >= 60) return 'middle school'
  if (fkScore >= 40) return 'high school'
  return 'college'
}

function computeKeywordDensity(text: string): number {
  const stopWords = new Set(['the','a','an','and','or','but','in','on','at','to','for','of','with','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','this','that','it','its','i','you','he','she','we','they','my','your','his','her','our','their'])
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
  if (words.length < 20) return 0
  const freq: Record<string, number> = {}
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1
  return Math.max(...Object.values(freq)) / words.length
}

// ── Context builder ───────────────────────────────────────────────────────────

function buildContentSummary(pages: CrawledPage[]): string {
  const lines: string[] = [`=== CONTENT QUALITY AUDIT ===`, `Total pages: ${pages.length}`, ``]

  const thinPages = pages.filter(p => p.word_count < 300 && p.word_count > 0)
  const avgWords = pages.length ? Math.round(pages.reduce((s, p) => s + p.word_count, 0) / pages.length) : 0
  const noH1 = pages.filter(p => p.headings.h1.length === 0).length
  const noMeta = pages.filter(p => !p.meta_description).length
  const avgH2 = pages.length ? (pages.reduce((s, p) => s + p.headings.h2.length, 0) / pages.length).toFixed(1) : '0'
  const withSchema = pages.filter(p => p.has_schema_markup).length
  const duplicateTitles = pages.length - new Set(pages.map(p => p.title?.toLowerCase().trim())).size

  // Compute real readability across top content pages
  const sorted = [...pages].sort((a, b) => b.word_count - a.word_count)
  const topPages = sorted.slice(0, 10)
  const avgReadability = topPages.length
    ? Math.round(topPages.reduce((s, p) => s + computeFleschKincaid(p.content), 0) / topPages.length)
    : 50

  // Keyword density check
  const stuffedPages = pages.filter(p => p.word_count > 100 && computeKeywordDensity(p.content) > 0.04)

  lines.push(`=== REAL MEASURED METRICS (use these to calibrate your scores) ===`)
  lines.push(`Average word count: ${avgWords} words/page`)
  lines.push(`Thin pages (<300 words): ${thinPages.length}/${pages.length}`)
  lines.push(`Pages missing H1: ${noH1}/${pages.length}`)
  lines.push(`Pages missing meta description: ${noMeta}/${pages.length}`)
  lines.push(`Average H2 headings per page: ${avgH2}`)
  lines.push(`Pages with schema markup: ${withSchema}/${pages.length}`)
  lines.push(`Duplicate/missing titles: ${duplicateTitles}`)
  lines.push(`Measured readability (Flesch-Kincaid): ${avgReadability}/100 (${getReadingLevel(avgReadability)} level)`)
  lines.push(`Pages with keyword stuffing risk (>4% density): ${stuffedPages.length}`)
  lines.push(``)

  lines.push(`=== TOP ARTICLES BY LENGTH ===`)
  sorted.slice(0, 8).forEach(p => {
    const fk = computeFleschKincaid(p.content)
    const kd = (computeKeywordDensity(p.content) * 100).toFixed(1)
    lines.push(`${p.word_count}w | FK:${fk} | KD:${kd}% | ${p.title || 'No title'} | ${p.url}`)
  })
  lines.push(``)

  lines.push(`=== THIN PAGES (need expansion) ===`)
  thinPages.slice(0, 8).forEach(p => {
    lines.push(`${p.word_count}w | ${p.title || 'No title'} | ${p.url}`)
  })
  lines.push(``)

  lines.push(`=== DETAILED PAGE ANALYSIS (top 30 by word count) ===`)
  sorted.slice(0, 30).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'MISSING'}`)
    lines.push(`Words: ${page.word_count} | H1: ${page.headings.h1.length > 0 ? page.headings.h1[0] : 'MISSING'} | H2s: ${page.headings.h2.length}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    lines.push(`Schema: ${page.has_schema_markup ? 'yes' : 'no'} | Internal links: ${page.links.internal.length}`)
    // Proportional content snippet — longer articles get more context
    const snippetLen = page.word_count > 1000 ? 1200 : page.word_count > 500 ? 700 : 350
    lines.push(`Content preview: ${page.content.slice(0, snippetLen)}`)
    lines.push(``)
  })

  if (sorted.length > 30) {
    lines.push(`=== REMAINING PAGES (${sorted.length - 30} more) ===`)
    sorted.slice(30).forEach(p => {
      lines.push(`${p.word_count}w | ${p.title || 'No title'} | ${p.url}`)
    })
  }

  return lines.join('\n')
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a senior content quality analyst specializing in Google AdSense approval. You have deep knowledge of what Google's Helpful Content System and content quality reviewers look for.

You have been given REAL measured metrics from the website (word counts, Flesch-Kincaid readability scores, keyword density percentages, heading counts). Use these numbers to calibrate your scores — do NOT ignore them.

SCORING RULES:
- readability_score: Start from the measured Flesch-Kincaid score provided. Adjust ±10 based on content patterns you observe (sentence variety, vocabulary, paragraph length). Do NOT invent a score that contradicts the measured data.
- originality_score: Penalize heavily for: generic listicles with no unique insights, content that reads like paraphrased Wikipedia, articles with no personal perspective, thin content under 400 words. Reward: personal experience, specific examples, original research, unique angles.
- spam_score: Use the measured keyword density (KD%) as your primary signal. KD > 4% = high spam risk. Also check: clickbait titles, excessive repetition, unnatural transitions, filler phrases.
- depth_score: Does the content fully answer the reader's question? Does it go beyond surface-level? Does it include examples, data, step-by-step guidance, or unique insights?
- overall_quality_score: Holistic AdSense readiness. Weight originality and depth most heavily. A site with 50+ articles averaging 800 words but all generic should score 45-55. A site with 20 articles averaging 1500 words with original insights should score 70-80.

Return a JSON object with EXACTLY these fields:
- readability_score (0-100): Based on measured FK score + content patterns
- originality_score (0-100): How original and unique the content is
- spam_score (0-100): Higher = more spammy. Use measured KD% as anchor.
- depth_score (0-100): How comprehensive and in-depth
- overall_quality_score (0-100): Holistic AdSense content quality
- thin_content_count (number): Count of pages under 300 words (use the measured number provided)
- avg_content_depth ('shallow' | 'moderate' | 'deep'): Overall depth
- content_gaps (array of 3-5 strings): Specific topics missing that would strengthen authority. Be niche-specific.
- best_articles (array of up to 3 URLs): Strongest articles
- weakest_articles (array of up to 3 URLs): Weakest articles needing improvement
- summary (string): 3-4 sentences. Start with the verdict. Reference specific measured numbers (e.g. "Your average word count of 420 words is below the 600-word threshold..."). Name specific articles or patterns.
- duplicate_title_count (number): Pages with duplicate or missing titles (use measured number)
- avg_h2_per_page (number): Average H2 headings per page (use measured number)
- pages_with_schema (number): Pages using structured data (use measured number)
- estimated_reading_level ('elementary' | 'middle school' | 'high school' | 'college'): Based on measured FK score

CRITICAL: Your scores must be consistent with the measured data. If the measured readability is 72/100, your readability_score should be 65-79. If 8 pages are measured as thin, thin_content_count must be 8. Do not contradict the measurements.`

// ── Fallback ──────────────────────────────────────────────────────────────────

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
  duplicate_title_count: 0,
  avg_h2_per_page: 0,
  pages_with_schema: 0,
  estimated_reading_level: 'high school',
}

export async function analyzeContentQuality(pages: CrawledPage[]): Promise<ContentQualityResult> {
  const content = buildContentSummary(pages)
  return callOpenAI<ContentQualityResult>(SYSTEM_PROMPT, content, FALLBACK)
}
