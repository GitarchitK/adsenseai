/**
 * Article-Level Content Analyzer
 *
 * Analyzes each crawled page individually for:
 * - Thin content detection
 * - Plagiarism risk signals
 * - Content depth & quality
 * - AdSense rejection risk per page
 *
 * Runs pages in batches to stay within OpenAI rate limits.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'
import type { ArticleAnalysis, ArticleReportSummary } from '@/types'

const MAX_ARTICLES = 50

// ── Thin content detection (deterministic, no API needed) ─────────────────────

const THIN_THRESHOLDS = {
  critical: 150,   // below this = definitely thin
  warning:  300,   // below this = potentially thin
  good:     500,   // above this = acceptable
}

function detectThinContent(page: CrawledPage): { is_thin: boolean; thin_reason?: string } {
  if (page.word_count < THIN_THRESHOLDS.critical) {
    return { is_thin: true, thin_reason: `Only ${page.word_count} words — AdSense requires substantial content (500+ words recommended)` }
  }
  if (page.word_count < THIN_THRESHOLDS.warning) {
    return { is_thin: true, thin_reason: `${page.word_count} words is borderline thin — aim for 500+ words with original insights` }
  }
  // Check for content that's mostly navigation/boilerplate
  const contentRatio = page.content.length / Math.max(page.word_count, 1)
  if (contentRatio < 3 && page.word_count < 400) {
    return { is_thin: true, thin_reason: 'Content appears to be mostly navigation or boilerplate text' }
  }
  return { is_thin: false }
}

// ── Plagiarism signal detection (heuristic, no external API) ─────────────────

function detectPlagiarismSignals(page: CrawledPage): {
  risk: ArticleAnalysis['plagiarism_risk']
  signals: string[]
} {
  const signals: string[] = []
  const content = page.content.toLowerCase()

  // Generic/templated phrases common in scraped content
  const genericPhrases = [
    'click here to read more',
    'source:',
    'originally published',
    'republished with permission',
    'via ',
    'h/t ',
    'hat tip',
    'cross-posted from',
    'this article first appeared',
    'read the full article',
    'continue reading at',
  ]
  const foundGeneric = genericPhrases.filter(p => content.includes(p))
  if (foundGeneric.length > 0) {
    signals.push(`Possible syndicated/scraped content indicators: "${foundGeneric.slice(0, 2).join('", "')}"`)
  }

  // Very short sentences repeated (templated content)
  const sentences = page.content.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const uniqueSentences = new Set(sentences.map(s => s.trim().toLowerCase()))
  const repetitionRatio = sentences.length > 0 ? uniqueSentences.size / sentences.length : 1
  if (repetitionRatio < 0.7 && sentences.length > 5) {
    signals.push(`High sentence repetition detected (${Math.round((1 - repetitionRatio) * 100)}% repeated) — possible templated content`)
  }

  // Excessive external links (content farm pattern)
  const externalLinkRatio = page.links.external.length / Math.max(page.word_count / 100, 1)
  if (externalLinkRatio > 3) {
    signals.push(`Unusually high external link density (${page.links.external.length} external links) — possible link farm pattern`)
  }

  // No original headings (just copied structure)
  if (page.headings.h2.length === 0 && page.word_count > 300) {
    signals.push('No H2 subheadings found — original articles typically have structured sections')
  }

  // Determine risk level
  let risk: ArticleAnalysis['plagiarism_risk'] = 'low'
  if (signals.length >= 3) risk = 'high'
  else if (signals.length >= 1) risk = 'medium'

  return { risk, signals }
}

// ── Per-page AI analysis ──────────────────────────────────────────────────────

const PAGE_ANALYSIS_PROMPT = `You are a Google AdSense content quality specialist. Analyze this single web page and return a JSON object with EXACTLY these fields:

- readability_score (0-100): Flesch-Kincaid style readability. 80+ = easy, 60-79 = moderate, below 60 = difficult.
- originality_score (0-100): How original and unique this content appears. Penalize generic, templated, or scraped content heavily.
- depth_score (0-100): How comprehensive and in-depth the content is. Does it fully cover the topic? Does it add value?
- spam_score (0-100): Keyword stuffing, clickbait, excessive repetition. Higher = more spammy.
- adsense_risk: "critical" (will cause rejection), "warning" (needs improvement), or "good" (acceptable).
- risk_reasons: array of specific reasons this page could cause AdSense rejection. Empty array if good.
- strengths: array of 1-3 things this page does well. Empty array if nothing notable.
- recommended_fix: one specific, actionable sentence on the most important improvement needed. "None needed" if good.

Be strict. AdSense reviewers are strict. A page with 200 words of generic content should score 20-30 on originality.`

interface PageAIResult {
  readability_score: number
  originality_score: number
  depth_score: number
  spam_score: number
  adsense_risk: 'critical' | 'warning' | 'good'
  risk_reasons: string[]
  strengths: string[]
  recommended_fix: string
}

const PAGE_FALLBACK: PageAIResult = {
  readability_score: 50,
  originality_score: 50,
  depth_score: 50,
  spam_score: 30,
  adsense_risk: 'warning',
  risk_reasons: ['Analysis unavailable'],
  strengths: [],
  recommended_fix: 'Review content manually.',
}

function isLikelyArticlePage(page: CrawledPage): boolean {
  try {
    const pathname = new URL(page.url).pathname.toLowerCase()
    const excludedPatterns = [
      '/category/', '/tag/', '/author/', '/page/', '/search', '/wp-admin',
      '/login', '/signup', '/account', '/dashboard', '/privacy', '/about',
      '/contact', '/terms', '/policy', '/feed', '/sitemap',
    ]
    if (pathname === '/' || excludedPatterns.some((pattern) => pathname.includes(pattern))) {
      return false
    }

    const articleSignals = [
      /\d{4}\/\d{2}\/\d{2}/,
      /\d{4}\/\d{2}\//,
      /\/blog\//,
      /\/news\//,
      /\/article\//,
      /\/post\//,
      /\/stories\//,
    ]
    if (articleSignals.some((pattern) => pattern.test(pathname))) return true

    const segments = pathname.split('/').filter(Boolean)
    const lastSegment = segments[segments.length - 1] ?? ''
    return page.word_count >= 250 && segments.length >= 2 && lastSegment.includes('-')
  } catch {
    return page.word_count >= 300
  }
}

function compareByLatest(left: CrawledPage, right: CrawledPage): number {
  const leftTime = left.lastmod ? Date.parse(left.lastmod) : Number.NaN
  const rightTime = right.lastmod ? Date.parse(right.lastmod) : Number.NaN

  if (!Number.isNaN(leftTime) && !Number.isNaN(rightTime) && leftTime !== rightTime) {
    return rightTime - leftTime
  }
  if (!Number.isNaN(leftTime)) return -1
  if (!Number.isNaN(rightTime)) return 1
  return 0
}

export function selectPagesForArticleAnalysis(pages: CrawledPage[], limit = MAX_ARTICLES): CrawledPage[] {
  const articleCandidates = pages.filter(isLikelyArticlePage)
  const fallbackCandidates = pages.filter((page) => page.word_count >= 250)
  const selected = (articleCandidates.length > 0 ? articleCandidates : fallbackCandidates)
    .slice()
    .sort(compareByLatest)

  return selected.slice(0, limit)
}

async function analyzePageWithAI(page: CrawledPage): Promise<PageAIResult> {
  const input = [
    `URL: ${page.url}`,
    `Title: ${page.title || 'Untitled'}`,
    `Word count: ${page.word_count}`,
    `Last modified: ${page.lastmod ?? 'Unknown'}`,
    `Meta description: ${page.meta_description || 'None'}`,
    `H1: ${page.headings.h1.join(', ') || 'None'}`,
    `H2s: ${page.headings.h2.slice(0, 5).join(', ') || 'None'}`,
    `Content (first 3000 chars): ${page.content.slice(0, 3000)}`,
  ].join('\n')

  return callOpenAI<PageAIResult>(PAGE_ANALYSIS_PROMPT, input, PAGE_FALLBACK)
}

// ── Batch processor ───────────────────────────────────────────────────────────

/**
 * Analyzes the latest 50 likely article pages in batches.
 */
export async function analyzeAllArticles(pages: CrawledPage[]): Promise<ArticleAnalysis[]> {
  const selectedPages = selectPagesForArticleAnalysis(pages)
  const results: ArticleAnalysis[] = []
  const BATCH_SIZE = 4

  for (let i = 0; i < selectedPages.length; i += BATCH_SIZE) {
    const batch = selectedPages.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.all(
      batch.map(async (page): Promise<ArticleAnalysis> => {
        const thin = detectThinContent(page)
        const plagiarism = detectPlagiarismSignals(page)
        const ai = await analyzePageWithAI(page)

        return {
          url: page.url,
          title: page.title || 'Untitled',
          word_count: page.word_count,
          is_thin: thin.is_thin,
          thin_reason: thin.thin_reason,
          readability_score: ai.readability_score,
          originality_score: ai.originality_score,
          depth_score: ai.depth_score,
          spam_score: ai.spam_score,
          plagiarism_risk: plagiarism.risk,
          plagiarism_signals: plagiarism.signals,
          adsense_risk: ai.adsense_risk,
          risk_reasons: [
            ...(thin.is_thin && thin.thin_reason ? [thin.thin_reason] : []),
            ...ai.risk_reasons,
            ...plagiarism.signals,
          ],
          strengths: ai.strengths,
          recommended_fix: ai.recommended_fix,
        }
      })
    )

    results.push(...batchResults)

    // Small delay between batches to respect rate limits
    if (i + BATCH_SIZE < selectedPages.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  return results
}

// ── Summary generator ─────────────────────────────────────────────────────────

export function buildArticleReportSummary(articles: ArticleAnalysis[]): ArticleReportSummary {
  const total = articles.length
  const critical = articles.filter(a => a.adsense_risk === 'critical').length
  const warning  = articles.filter(a => a.adsense_risk === 'warning').length
  const good     = articles.filter(a => a.adsense_risk === 'good').length
  const thin     = articles.filter(a => a.is_thin).length
  const highPlag = articles.filter(a => a.plagiarism_risk === 'high').length

  const avgWords   = total ? Math.round(articles.reduce((s, a) => s + a.word_count, 0) / total) : 0
  const avgQuality = total ? Math.round(
    articles.reduce((s, a) => s + (a.readability_score + a.originality_score + a.depth_score) / 3, 0) / total
  ) : 0

  let overall_content_verdict: ArticleReportSummary['overall_content_verdict']
  let verdict_reason: string

  if (critical > 0) {
    overall_content_verdict = 'fail'
    verdict_reason = `${critical} page${critical > 1 ? 's' : ''} will likely cause AdSense rejection. Fix critical issues first.`
  } else if (warning > total * 0.4 || thin > total * 0.3) {
    overall_content_verdict = 'needs_work'
    verdict_reason = `${warning} pages need improvement and ${thin} are thin. Strengthen content before applying.`
  } else {
    overall_content_verdict = 'pass'
    verdict_reason = `Content quality is acceptable. ${good} of ${total} pages meet AdSense standards.`
  }

  const month_plan: MonthPlanStep[] = []
  if (overall_content_verdict === 'fail' || overall_content_verdict === 'needs_work') {
    month_plan.push({
      week: 'Week 1: Critical Fixes',
      goal: 'Remove or fix all critical risk articles',
      actions: [
        `Rewrite or delete the ${critical} articles flagged as critical risk`,
        `Address thin content on ${thin} pages (minimum 500+ words)`,
        'Fix any identified plagiarism or scraped content signals',
      ],
    })
    month_plan.push({
      week: 'Week 2: Content Depth',
      goal: 'Improve depth and quality scores',
      actions: [
        'Add original insights, images, and data to warning-level pages',
        'Ensure all analyzed articles have a clear H1 and several H2s',
        'Improve readability on pages with scores below 60',
      ],
    })
    month_plan.push({
      week: 'Week 3: Consistency & Volume',
      goal: 'Build a history of high-quality posts',
      actions: [
        'Publish 3-5 new high-quality articles (800+ words each)',
        'Ensure new posts follow the "Good" patterns identified in the report',
        'Check for internal linking between related articles',
      ],
    })
    month_plan.push({
      week: 'Week 4: Final Audit',
      goal: 'Re-analyze and apply',
      actions: [
        'Run a fresh "Article Analysis" to verify all criticals are gone',
        'Confirm "Good" count is at least 80% of analyzed articles',
        'Submit to AdSense once the overall verdict is "Pass"',
      ],
    })
  } else {
    month_plan.push({
      week: 'Week 1',
      goal: 'Maintain quality and apply',
      actions: [
        'Submit your application to AdSense immediately',
        'Continue publishing 2-3 high-quality articles per week',
        'Monitor for any new thin content or policy issues',
      ],
    })
  }

  return {
    total_articles: total,
    critical_count: critical,
    warning_count: warning,
    good_count: good,
    avg_word_count: avgWords,
    avg_quality_score: avgQuality,
    thin_pages: thin,
    high_plagiarism_risk: highPlag,
    overall_content_verdict,
    verdict_reason,
    articles,
    month_plan,
    latest_first: true,
    selection_note: 'Latest 50 articles prioritized',
  }
}
