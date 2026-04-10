/**
 * Single Article Deep Analyzer
 *
 * Reads the COMPLETE article content and provides:
 * - Plagiarism risk signals with specific evidence
 * - Thin content detection with word-level analysis
 * - Keyword stuffing detection
 * - Specific, actionable fixes with example rewrites
 * - AdSense risk assessment
 */

import { callOpenAI } from './openai'

export interface PlagiarismSignal {
  type: 'scraped_indicator' | 'repetition' | 'generic_phrases' | 'link_farm' | 'no_structure' | 'attribution'
  evidence: string   // the actual text/pattern found
  severity: 'high' | 'medium' | 'low'
  fix: string        // how to fix this specific signal
}

export interface KeywordIssue {
  keyword: string
  count: number
  density: string   // e.g. "4.2%"
  fix: string
}

export interface ContentSection {
  heading: string
  issue: 'thin' | 'off_topic' | 'repetitive' | 'good'
  word_count: number
  suggestion: string
}

export interface SingleArticleReport {
  url: string
  title: string
  word_count: number

  // Overall scores
  overall_score: number          // 0-100
  readability_score: number
  originality_score: number
  depth_score: number
  spam_score: number

  // Plagiarism
  plagiarism_risk: 'high' | 'medium' | 'low'
  plagiarism_signals: PlagiarismSignal[]
  plagiarism_verdict: string     // plain-English summary

  // Thin content
  is_thin: boolean
  thin_verdict: string
  thin_details: string[]         // specific reasons

  // Keyword stuffing
  keyword_issues: KeywordIssue[]
  keyword_verdict: string

  // AdSense risk
  adsense_risk: 'critical' | 'warning' | 'good'
  adsense_verdict: string
  rejection_reasons: string[]    // specific reasons AdSense would reject

  // What's good
  strengths: string[]

  // Actionable fixes — the most valuable part
  fixes: ArticleFix[]

  // Rewrite suggestions for the worst sections
  rewrite_examples: RewriteExample[]

  // Summary
  summary: string
  apply_recommendation: string   // "Fix this article before applying" or "This article is ready"
}

export interface ArticleFix {
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'plagiarism' | 'thin_content' | 'keyword_stuffing' | 'readability' | 'structure' | 'depth' | 'policy'
  title: string
  problem: string    // what exactly is wrong
  solution: string   // exactly how to fix it
  example?: string   // optional: "Change X to Y"
}

export interface RewriteExample {
  section: string    // which part of the article
  original: string   // the problematic text (first 200 chars)
  issue: string      // what's wrong with it
  rewritten: string  // AI-suggested rewrite
}

// ── Heuristic pre-analysis (no API needed) ────────────────────────────────────

function detectKeywordStuffing(content: string, title: string): KeywordIssue[] {
  const words = content.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  const totalWords = words.length
  if (totalWords < 50) return []

  const freq: Record<string, number> = {}
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, '')
    if (clean.length > 4) freq[clean] = (freq[clean] ?? 0) + 1
  }

  const stopWords = new Set(['about','after','again','against','before','being','between','could','during',
    'every','first','found','great','having','their','there','these','thing','think','those','through',
    'under','until','using','where','which','while','would','write','years','other','people','should',
    'still','since','place','right','large','often','never','might','small','along','below','above'])

  return Object.entries(freq)
    .filter(([word, count]) => {
      if (stopWords.has(word)) return false
      const density = count / totalWords
      return density > 0.025 && count >= 5 // >2.5% density
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => {
      const density = ((count / totalWords) * 100).toFixed(1)
      return {
        keyword: word,
        count,
        density: `${density}%`,
        fix: `"${word}" appears ${count} times (${density}% density). Reduce to 1-2% by using synonyms and natural language variations.`,
      }
    })
}

function detectPlagiarismSignals(content: string, links: { external: string[] }, wordCount: number): PlagiarismSignal[] {
  const signals: PlagiarismSignal[] = []
  const lower = content.toLowerCase()

  // Attribution/scraping indicators
  const scrapingPhrases = [
    { phrase: 'originally published', severity: 'high' as const },
    { phrase: 'republished with permission', severity: 'high' as const },
    { phrase: 'cross-posted from', severity: 'high' as const },
    { phrase: 'this article first appeared', severity: 'high' as const },
    { phrase: 'source:', severity: 'medium' as const },
    { phrase: 'via ', severity: 'low' as const },
    { phrase: 'hat tip', severity: 'low' as const },
    { phrase: 'h/t ', severity: 'low' as const },
    { phrase: 'read the full article at', severity: 'high' as const },
    { phrase: 'continue reading at', severity: 'high' as const },
  ]
  for (const { phrase, severity } of scrapingPhrases) {
    if (lower.includes(phrase)) {
      signals.push({
        type: 'scraped_indicator',
        evidence: `Found phrase: "${phrase}"`,
        severity,
        fix: `Remove the phrase "${phrase}" and ensure this is original content written by you, not copied from another source.`,
      })
    }
  }

  // Sentence repetition
  const sentences = content.split(/[.!?]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20)
  const seen = new Map<string, number>()
  for (const s of sentences) {
    seen.set(s, (seen.get(s) ?? 0) + 1)
  }
  const repeated = [...seen.entries()].filter(([, c]) => c > 1)
  if (repeated.length > 0) {
    signals.push({
      type: 'repetition',
      evidence: `${repeated.length} sentence(s) repeated: e.g. "${repeated[0][0].slice(0, 80)}..."`,
      severity: repeated.length > 3 ? 'high' : 'medium',
      fix: 'Remove or rephrase repeated sentences. Each sentence should appear only once and add unique value.',
    })
  }

  // Link farm pattern
  if (links.external.length > 0 && wordCount > 0) {
    const ratio = links.external.length / (wordCount / 100)
    if (ratio > 5) {
      signals.push({
        type: 'link_farm',
        evidence: `${links.external.length} external links for ${wordCount} words (${ratio.toFixed(1)} links per 100 words)`,
        severity: 'high',
        fix: 'Reduce external links to 2-3 per article. Only link to authoritative sources that genuinely add value.',
      })
    }
  }

  return signals
}

// ── Deep AI analysis ──────────────────────────────────────────────────────────

const DEEP_ANALYSIS_PROMPT = `You are a senior Google AdSense content reviewer and SEO specialist. You have been given the COMPLETE text of a web article. Perform a thorough, honest analysis.

Return a JSON object with EXACTLY these fields:

- overall_score (0-100): Overall quality for AdSense approval.
- readability_score (0-100): How easy to read. Consider sentence length, vocabulary, flow.
- originality_score (0-100): How original and unique. Penalize generic, templated, or likely-copied content.
- depth_score (0-100): How comprehensive. Does it fully cover the topic with real insights?
- spam_score (0-100): Keyword stuffing, clickbait, excessive repetition. Higher = worse.
- plagiarism_risk: "high", "medium", or "low". Base this on content patterns, not just signals.
- plagiarism_verdict (string): 2-3 sentences explaining your plagiarism assessment with specific evidence from the text.
- is_thin (boolean): Is this thin content by AdSense standards?
- thin_verdict (string): Explain why it is or isn't thin content.
- thin_details (array of strings): Specific reasons for thin content verdict. Empty if not thin.
- adsense_risk: "critical", "warning", or "good".
- adsense_verdict (string): 2-3 sentences on AdSense approval likelihood.
- rejection_reasons (array of strings): Specific reasons AdSense would reject this page. Empty if good.
- strengths (array of strings): 2-4 genuine strengths of this article.
- keyword_verdict (string): Assessment of keyword usage — natural or stuffed?
- fixes (array): Each fix object has: priority ("critical"|"high"|"medium"|"low"), category ("plagiarism"|"thin_content"|"keyword_stuffing"|"readability"|"structure"|"depth"|"policy"), title (short), problem (what exactly is wrong, be specific), solution (exactly how to fix it, be actionable), example (optional: show a before/after).
- rewrite_examples (array): 2-3 examples of the worst sections. Each has: section (which part), original (the problematic text, max 150 chars), issue (what's wrong), rewritten (your improved version).
- summary (string): 3-4 sentence overall assessment.
- apply_recommendation (string): One clear sentence — should they fix this article before applying to AdSense, or is it ready?

Be specific. Reference actual content from the article. Don't give generic advice — give advice that applies to THIS specific article.`

interface AIDeepResult {
  overall_score: number
  readability_score: number
  originality_score: number
  depth_score: number
  spam_score: number
  plagiarism_risk: 'high' | 'medium' | 'low'
  plagiarism_verdict: string
  is_thin: boolean
  thin_verdict: string
  thin_details: string[]
  adsense_risk: 'critical' | 'warning' | 'good'
  adsense_verdict: string
  rejection_reasons: string[]
  strengths: string[]
  keyword_verdict: string
  fixes: ArticleFix[]
  rewrite_examples: RewriteExample[]
  summary: string
  apply_recommendation: string
}

const AI_FALLBACK: AIDeepResult = {
  overall_score: 50,
  readability_score: 50,
  originality_score: 50,
  depth_score: 50,
  spam_score: 30,
  plagiarism_risk: 'medium',
  plagiarism_verdict: 'Analysis unavailable. Please try again.',
  is_thin: false,
  thin_verdict: 'Analysis unavailable.',
  thin_details: [],
  adsense_risk: 'warning',
  adsense_verdict: 'Analysis unavailable.',
  rejection_reasons: [],
  strengths: [],
  keyword_verdict: 'Analysis unavailable.',
  fixes: [{ priority: 'medium', category: 'depth', title: 'Review manually', problem: 'AI analysis failed.', solution: 'Please try again.' }],
  rewrite_examples: [],
  summary: 'Analysis failed. Please try again.',
  apply_recommendation: 'Please re-run the analysis.',
}

interface PageInput {
  url: string
  title: string
  meta_description?: string
  content: string
  word_count: number
  headings: { h1: string[]; h2: string[] }
  links: { internal: string[]; external: string[] }
}

export async function analyzeSingleArticle(page: PageInput): Promise<SingleArticleReport> {
  // Heuristic pre-analysis
  const keywordIssues = detectKeywordStuffing(page.content, page.title)
  const plagiarismSignals = detectPlagiarismSignals(page.content, page.links, page.word_count)

  // Build the full article input for AI — send the COMPLETE content
  const input = [
    `URL: ${page.url}`,
    `Title: ${page.title || 'Untitled'}`,
    `Meta description: ${page.meta_description || 'None'}`,
    `Word count: ${page.word_count}`,
    `H1: ${page.headings.h1.join(', ') || 'None'}`,
    `H2 headings: ${page.headings.h2.join(', ') || 'None'}`,
    `External links: ${page.links.external.length}`,
    `Internal links: ${page.links.internal.length}`,
    '',
    '=== FULL ARTICLE CONTENT ===',
    page.content,  // full content, no truncation
  ].join('\n')

  const ai = await callOpenAI<AIDeepResult>(DEEP_ANALYSIS_PROMPT, input, AI_FALLBACK)

  // Merge heuristic signals into AI result
  const mergedPlagiarismSignals: PlagiarismSignal[] = [
    ...plagiarismSignals,
    // Convert AI plagiarism verdict into a signal if high risk
    ...(ai.plagiarism_risk === 'high' ? [{
      type: 'generic_phrases' as const,
      evidence: 'AI detected high plagiarism risk based on content patterns',
      severity: 'high' as const,
      fix: 'Rewrite the article in your own voice with original research and insights.',
    }] : []),
  ]

  // Add keyword stuffing fixes from heuristics if AI didn't catch them
  const heuristicKeywordFixes: ArticleFix[] = keywordIssues.map(k => ({
    priority: 'high' as const,
    category: 'keyword_stuffing' as const,
    title: `Keyword stuffing: "${k.keyword}"`,
    problem: `"${k.keyword}" appears ${k.count} times (${k.density} density) — above the 2% threshold.`,
    solution: `Replace some instances of "${k.keyword}" with synonyms or related phrases. Aim for 1-1.5% density.`,
  }))

  const allFixes = [
    ...ai.fixes,
    ...heuristicKeywordFixes.filter(hf =>
      !ai.fixes.some(af => af.category === 'keyword_stuffing' && af.title.includes(hf.title.split('"')[1] ?? ''))
    ),
  ].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return order[a.priority] - order[b.priority]
  })

  return {
    url: page.url,
    title: page.title,
    word_count: page.word_count,
    overall_score: ai.overall_score,
    readability_score: ai.readability_score,
    originality_score: ai.originality_score,
    depth_score: ai.depth_score,
    spam_score: ai.spam_score,
    plagiarism_risk: ai.plagiarism_risk,
    plagiarism_signals: mergedPlagiarismSignals,
    plagiarism_verdict: ai.plagiarism_verdict,
    is_thin: ai.is_thin || page.word_count < 300,
    thin_verdict: ai.thin_verdict,
    thin_details: ai.thin_details,
    keyword_issues: keywordIssues,
    keyword_verdict: ai.keyword_verdict,
    adsense_risk: ai.adsense_risk,
    adsense_verdict: ai.adsense_verdict,
    rejection_reasons: ai.rejection_reasons,
    strengths: ai.strengths,
    fixes: allFixes,
    rewrite_examples: ai.rewrite_examples,
    summary: ai.summary,
    apply_recommendation: ai.apply_recommendation,
  }
}
