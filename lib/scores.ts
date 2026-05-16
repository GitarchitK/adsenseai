import type { CrawlResponse } from '@/types'

export interface ScoreBreakdown {
  // Final weighted score using the specified formula
  final_score: number
  status: 'high' | 'moderate' | 'low'
  status_label: 'High Chance' | 'Moderate' | 'Low'

  // Category scores (0–100)
  quality_score: number    // content quality  — weight 0.35
  policy_score: number     // policy compliance — weight 0.30
  seo_score: number        // SEO & indexing    — weight 0.15
  ux_score: number         // UX & trust        — weight 0.10
  trust_score: number      // trust signals     — weight 0.10

  // Advanced real-data metrics
  avg_word_count: number
  thin_page_count: number          // pages < 300 words
  readability_score: number        // Flesch-Kincaid approximation 0-100
  keyword_stuffing_risk: boolean   // any page with keyword density > 4%
  heading_structure_score: number  // 0-100 based on H1/H2 hierarchy
  content_freshness_score: number  // 0-100 based on publication dates
  internal_link_density: number    // avg internal links per page
  image_alt_coverage: number       // % of images with alt text
  schema_coverage: number          // % of pages with schema markup
  https_coverage: number           // % of pages on HTTPS
  confidence: number               // 0-100 how confident we are in these scores

  // Diagnostics
  recommendations: string[]
  issues: string[]
  warnings: string[]
  missing_pages: string[]
}

// ── Real content analysis helpers ────────────────────────────────────────────

/**
 * Approximate Flesch-Kincaid readability score (0-100, higher = easier to read).
 * Uses avg sentence length and avg syllable count approximation.
 */
function computeReadability(text: string): number {
  if (!text || text.length < 50) return 50
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5)
  const words = text.trim().split(/\s+/).filter(w => w.length > 0)
  if (sentences.length === 0 || words.length === 0) return 50

  const avgSentenceLength = words.length / sentences.length
  // Syllable approximation: count vowel groups
  const totalSyllables = words.reduce((sum, word) => {
    const syllables = (word.toLowerCase().match(/[aeiouy]+/g) ?? []).length
    return sum + Math.max(1, syllables)
  }, 0)
  const avgSyllablesPerWord = totalSyllables / words.length

  // Flesch Reading Ease formula
  const fre = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)
  return Math.round(clamp(fre, 0, 100))
}

/**
 * Detect keyword stuffing: returns true if any single word appears > 4% of total words
 * (excluding common stop words).
 */
function detectKeywordStuffing(pages: CrawlResponse['pages']): boolean {
  const stopWords = new Set([
    'the','a','an','and','or','but','in','on','at','to','for','of','with',
    'is','are','was','were','be','been','being','have','has','had','do','does',
    'did','will','would','could','should','may','might','shall','can','this',
    'that','these','those','it','its','i','you','he','she','we','they','my',
    'your','his','her','our','their','what','which','who','how','when','where',
    'why','all','each','every','both','few','more','most','other','some','such',
    'no','not','only','same','so','than','too','very','just','as','if','from',
  ])

  for (const page of pages) {
    if (page.word_count < 100) continue
    const words = page.content.toLowerCase().split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w))
    if (words.length < 50) continue
    const freq: Record<string, number> = {}
    for (const w of words) freq[w] = (freq[w] ?? 0) + 1
    const maxFreq = Math.max(...Object.values(freq))
    if (maxFreq / words.length > 0.04) return true
  }
  return false
}

/**
 * Score heading structure quality (0-100).
 * Checks: H1 presence, H2 usage, H1 uniqueness per page.
 */
function computeHeadingStructureScore(pages: CrawlResponse['pages']): number {
  if (pages.length === 0) return 0
  const total = pages.length
  const withH1 = pages.filter(p => p.headings.h1.length === 1).length  // exactly 1 H1 is ideal
  const withMultipleH1 = pages.filter(p => p.headings.h1.length > 1).length
  const withH2 = pages.filter(p => p.headings.h2.length > 0).length
  const withBothH1H2 = pages.filter(p => p.headings.h1.length > 0 && p.headings.h2.length > 0).length

  const h1Score = (withH1 / total) * 40
  const h2Score = (withH2 / total) * 30
  const hierarchyScore = (withBothH1H2 / total) * 20
  const penaltyMultiH1 = (withMultipleH1 / total) * 10  // penalty for multiple H1s

  return Math.round(clamp(h1Score + h2Score + hierarchyScore - penaltyMultiH1, 0, 100))
}

/**
 * Score content freshness (0-100) based on publication dates in sitemap.
 */
function computeContentFreshness(pages: CrawlResponse['pages']): number {
  const pagesWithDates = pages.filter(p => p.lastmod)
  if (pagesWithDates.length === 0) return 40  // unknown — neutral

  const now = Date.now()
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  const ninetyDays = 90 * 24 * 60 * 60 * 1000
  const oneYear = 365 * 24 * 60 * 60 * 1000

  const recentCount = pagesWithDates.filter(p => {
    const age = now - Date.parse(p.lastmod!)
    return age < thirtyDays
  }).length

  const moderateCount = pagesWithDates.filter(p => {
    const age = now - Date.parse(p.lastmod!)
    return age >= thirtyDays && age < ninetyDays
  }).length

  const staleCount = pagesWithDates.filter(p => {
    const age = now - Date.parse(p.lastmod!)
    return age > oneYear
  }).length

  const total = pagesWithDates.length
  const freshnessScore =
    (recentCount / total) * 100 +
    (moderateCount / total) * 60 -
    (staleCount / total) * 20

  return Math.round(clamp(freshnessScore, 0, 100))
}

/**
 * final_score = (quality * 0.35) + (policy * 0.30) + (seo * 0.15) + (ux * 0.10) + (trust * 0.10)
 */
export function computeScores(crawl: CrawlResponse): ScoreBreakdown {
  const pages = crawl.pages
  const total = pages.length || 1
  const { has_privacy, has_about, has_contact, has_terms, has_disclaimer } = crawl.site_structure

  // ── Real data metrics ─────────────────────────────────────────────────────
  const avgWords = Math.round(pages.reduce((s, p) => s + p.word_count, 0) / total)
  const thinPages = pages.filter(p => p.word_count > 0 && p.word_count < 300)
  const thinPageRatio = thinPages.length / total

  // Readability: average across top 10 content pages
  const contentPages = [...pages].sort((a, b) => b.word_count - a.word_count).slice(0, 10)
  const readabilityScore = contentPages.length > 0
    ? Math.round(contentPages.reduce((s, p) => s + computeReadability(p.content), 0) / contentPages.length)
    : 50

  const keywordStuffingRisk = detectKeywordStuffing(pages)
  const headingStructureScore = computeHeadingStructureScore(pages)
  const contentFreshnessScore = computeContentFreshness(pages)

  const avgInternalLinks = pages.reduce((s, p) => s + p.links.internal.length, 0) / total
  const metaRatio = pages.filter((p) => p.meta_description).length / total
  const h1Ratio = pages.filter((p) => p.headings.h1.length > 0).length / total

  // Image alt coverage
  const totalImages = pages.reduce((s, p) => s + (p.images_total ?? 0), 0)
  const missingAlt = pages.reduce((s, p) => s + (p.images_missing_alt ?? 0), 0)
  const imageAltCoverage = totalImages > 0 ? Math.round(((totalImages - missingAlt) / totalImages) * 100) : 100

  // Schema coverage
  const schemaCoverage = Math.round(pages.filter(p => p.has_schema_markup).length / total * 100)

  // HTTPS coverage
  const httpsCoverage = Math.round(pages.filter(p => p.is_https !== false).length / total * 100)

  // ── quality_score — real content analysis ────────────────────────────────
  // Word count component: 200w=20pts, 400w=30pts, 600w=40pts, 800w=50pts
  const wordCountScore = clamp(Math.round(avgWords / 16), 0, 50)
  // Readability component (0-25 pts)
  const readabilityComponent = Math.round(readabilityScore * 0.25)
  // Heading structure (0-15 pts)
  const headingComponent = Math.round(headingStructureScore * 0.15)
  // Thin content penalty
  const thinPenalty = Math.round(thinPageRatio * 30)
  // Keyword stuffing penalty
  const stuffingPenalty = keywordStuffingRisk ? 10 : 0

  const quality_score = Math.round(clamp(
    wordCountScore + readabilityComponent + headingComponent - thinPenalty - stuffingPenalty,
    0, 100
  ))

  // ── policy_score — legal pages + content signals ──────────────────────────
  const legalPages = [has_privacy, has_terms, has_disclaimer].filter(Boolean).length
  // Base 40 + up to 60 for legal pages, minus penalties for missing critical ones
  const privacyBonus = has_privacy ? 30 : 0   // privacy is most critical
  const termsBonus = has_terms ? 15 : 0
  const disclaimerBonus = has_disclaimer ? 10 : 0
  const httpsBonus = crawl.site_structure.is_https ? 5 : 0
  const policy_score = Math.round(clamp(40 + privacyBonus + termsBonus + disclaimerBonus + httpsBonus, 0, 100))

  // ── seo_score — real SEO signals ─────────────────────────────────────────
  const structureBonus = [has_about, has_contact].filter(Boolean).length * 8
  const metaScore = Math.round(metaRatio * 30)
  const h1Score = Math.round(h1Ratio * 25)
  const schemaBonus = Math.round(schemaCoverage * 0.10)
  const freshnessBonus = Math.round(contentFreshnessScore * 0.10)
  const seo_score = Math.round(clamp(metaScore + h1Score + structureBonus + schemaBonus + freshnessBonus, 0, 100))

  // ── ux_score — real UX signals ────────────────────────────────────────────
  const internalLinkScore = clamp(Math.round(avgInternalLinks * 4), 0, 35)
  const altTextBonus = Math.round(imageAltCoverage * 0.20)
  const ux_score = Math.round(
    clamp(
      (has_contact ? 15 : 0) +
      (has_about ? 15 : 0) +
      internalLinkScore +
      altTextBonus +
      (avgWords > 300 ? 15 : 0),
      0, 100
    )
  )

  // ── trust_score — real trust signals ─────────────────────────────────────
  const trustPoints =
    (has_privacy ? 25 : 0) +
    (has_about ? 20 : 0) +
    (has_contact ? 20 : 0) +
    (has_terms ? 20 : 0) +
    (has_disclaimer ? 15 : 0)
  const trust_score = Math.round(clamp(trustPoints, 0, 100))

  // ── final weighted score ──────────────────────────────────────────────────
  let final_score = Math.round(
    quality_score * 0.35 +
    policy_score  * 0.30 +
    seo_score     * 0.15 +
    ux_score      * 0.10 +
    trust_score   * 0.10
  )

  // Domain age penalty (if available)
  const domainAge = crawl.site_structure.domain_age_years
  if (domainAge !== undefined) {
    if (domainAge < 0.25)     final_score = Math.round(final_score * 0.75)
    else if (domainAge < 0.5) final_score = Math.round(final_score * 0.85)
    else if (domainAge < 1.0) final_score = Math.round(final_score * 0.92)
  }

  final_score = clamp(final_score, 0, 100)

  const status =
    final_score >= 80 ? 'high' :
    final_score >= 60 ? 'moderate' : 'low'

  const status_label =
    final_score >= 80 ? 'High Chance' :
    final_score >= 60 ? 'Moderate' : 'Low'

  // Confidence: higher when we have more pages and more data signals
  const confidence = Math.round(clamp(
    (Math.min(pages.length, 50) / 50) * 60 +   // up to 60 pts for page count
    (metaRatio > 0.5 ? 20 : metaRatio * 40) +   // up to 20 pts for meta coverage
    (h1Ratio > 0.5 ? 20 : h1Ratio * 40),         // up to 20 pts for H1 coverage
    30, 95
  ))

  // ── diagnostics ───────────────────────────────────────────────────────────
  const issues: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []
  const missing_pages: string[] = []

  if (!has_privacy) {
    issues.push('Missing Privacy Policy — required for AdSense approval')
    missing_pages.push('Privacy Policy')
  }
  if (!has_terms) {
    warnings.push('Missing Terms of Service page')
    missing_pages.push('Terms of Service')
  }
  if (!has_disclaimer) {
    warnings.push('Missing Disclaimer page — highly recommended for policy safety')
    missing_pages.push('Disclaimer')
  }
  if (!has_about) {
    recommendations.push('Add an About page to build authority and trust')
    missing_pages.push('About Page')
  }
  if (!has_contact) {
    recommendations.push('Add a Contact page — required by AdSense policies')
    missing_pages.push('Contact Page')
  }
  if (avgWords < 300)
    issues.push(`Average page content is only ${avgWords} words — aim for 600+ words per page`)
  if (thinPages.length > 0)
    issues.push(`${thinPages.length} pages have fewer than 300 words (thin content) — expand or remove them`)
  if (keywordStuffingRisk)
    warnings.push('Keyword stuffing detected — some pages repeat keywords too frequently (>4% density)')
  if (metaRatio < 0.8)
    recommendations.push(`${Math.round((1 - metaRatio) * total)} pages missing meta descriptions — add them for better SEO`)
  if (h1Ratio < 0.9)
    warnings.push(`${Math.round((1 - h1Ratio) * total)} pages missing H1 headings — every page needs one clear main heading`)
  if (avgInternalLinks < 3)
    recommendations.push('Increase internal linking — aim for 3-5 internal links per article')
  if (headingStructureScore < 50)
    warnings.push('Poor heading structure — use H1 for main title, H2 for sections, H3 for subsections')
  if (contentFreshnessScore < 40)
    recommendations.push('Content appears stale — publish new articles regularly to show an active site')
  if (imageAltCoverage < 80)
    warnings.push(`${100 - imageAltCoverage}% of images missing alt text — add descriptive alt text for accessibility and SEO`)
  if (schemaCoverage < 20)
    recommendations.push('Add schema markup (JSON-LD) to help Google understand your content structure')
  if (!crawl.site_structure.is_https)
    issues.push('Site is not using HTTPS — SSL certificate required for AdSense approval')

  return {
    final_score,
    status,
    status_label,
    quality_score,
    policy_score,
    seo_score,
    ux_score,
    trust_score,
    avg_word_count: avgWords,
    thin_page_count: thinPages.length,
    readability_score: readabilityScore,
    keyword_stuffing_risk: keywordStuffingRisk,
    heading_structure_score: headingStructureScore,
    content_freshness_score: contentFreshnessScore,
    internal_link_density: Math.round(avgInternalLinks * 10) / 10,
    image_alt_coverage: imageAltCoverage,
    schema_coverage: schemaCoverage,
    https_coverage: httpsCoverage,
    confidence,
    recommendations,
    issues,
    warnings,
    missing_pages,
  }
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max)
}
