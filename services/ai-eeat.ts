/**
 * Module 5 — E-E-A-T Analyzer (Expertise, Experience, Authoritativeness, Trustworthiness)
 * Evaluates the core signals Google uses to judge content quality.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface EEATResult {
  expertise_score: number       // 0-100
  experience_score: number      // 0-100
  authoritativeness_score: number // 0-100
  trustworthiness_score: number // 0-100
  overall_eeat_score: number    // 0-100
  signals_found: string[]       // positive indicators like "Expert author bio", "Citations"
  improvements: string[]        // how to boost E-E-A-T
  summary: string               // overall E-E-A-T status
}

const SYSTEM_PROMPT = `You are a Google Search Quality Rater expert in E-E-A-T (Expertise, Experience, Authoritativeness, Trustworthiness).

Evaluate the website's content and return a JSON object with EXACTLY these fields:
- expertise_score (0-100): Clear knowledge and skill in the subject matter.
- experience_score (0-100): Evidence of first-hand or life experience in the topic.
- authoritativeness_score (0-100): Recognition as a go-to source for the topic.
- trustworthiness_score (0-100): Accuracy, honesty, and safety of the website.
- overall_eeat_score (0-100): Holistic E-E-A-T rating for AdSense approval.
- signals_found (array of strings): 4-6 positive E-E-A-T signals detected on the site.
- improvements (array of strings): 3-5 ways to specifically boost E-E-A-T signals.
- summary (string): 1-2 sentence summary of the site's E-E-A-T standing.

Focus on how Google's AdSense review team would perceive the site's authority.`

function buildEEATContext(pages: CrawledPage[], structure: SiteStructure): string {
  const lines: string[] = [
    `Site structure:`,
    `  Has Privacy Policy: ${structure.has_privacy}`,
    `  Has About page: ${structure.has_about}`,
    `  Has Contact page: ${structure.has_contact}`,
    `  Has Terms of Service: ${structure.has_terms}`,
    '',
    `Total pages analyzed: ${pages.length}`,
    '',
  ]

  pages.slice(0, 15).forEach((page, i) => {
    lines.push(`--- Page ${i + 1}: ${page.title || 'Untitled'} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Content snippet: ${page.content.slice(0, 700)}`)
    lines.push('')
  })

  return lines.join('\n')
}

const FALLBACK: EEATResult = {
  expertise_score: 50,
  experience_score: 50,
  authoritativeness_score: 50,
  trustworthiness_score: 50,
  overall_eeat_score: 50,
  signals_found: [],
  improvements: [],
  summary: 'E-E-A-T analysis unavailable — API error.',
}

export async function analyzeEEAT(
  pages: CrawledPage[],
  structure: SiteStructure
): Promise<EEATResult> {
  const context = buildEEATContext(pages, structure)
  return callOpenAI<EEATResult>(SYSTEM_PROMPT, context, FALLBACK)
}
