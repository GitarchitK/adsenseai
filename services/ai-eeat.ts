/**
 * Module 5 — E-E-A-T Analyzer (Advanced)
 * Deep evaluation of Experience, Expertise, Authoritativeness, and Trustworthiness.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface EEATResult {
  expertise_score: number
  experience_score: number
  authoritativeness_score: number
  trustworthiness_score: number
  overall_eeat_score: number
  signals_found: string[]
  improvements: string[]
  summary: string
  // New advanced fields
  author_expertise_level: 'none' | 'basic' | 'demonstrated' | 'strong'
  content_depth_rating: 'surface' | 'moderate' | 'deep' | 'expert'
  citation_quality: string        // how well the site cites sources
  ymyl_risk: boolean              // is this a Your Money Your Life site (higher scrutiny)
  ymyl_category: string           // if YMYL, which category
  eeat_quick_wins: string[]       // fastest ways to improve E-E-A-T
  eeat_score_breakdown: {
    expertise_reason: string
    experience_reason: string
    authority_reason: string
    trust_reason: string
  }
}

const SYSTEM_PROMPT = `You are a Google Search Quality Rater expert specializing in E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) evaluation for AdSense approval.

Analyze the website content and return a JSON object with EXACTLY these fields:

- expertise_score (0-100): Clear knowledge and skill in the subject matter. High scores require: technical accuracy, depth of coverage, correct use of industry terminology, evidence of real knowledge beyond surface-level information.
- experience_score (0-100): Evidence of first-hand or life experience. High scores require: personal anecdotes, case studies, "I tested this" type content, real examples from experience.
- authoritativeness_score (0-100): Recognition as a go-to source. High scores require: comprehensive coverage of the niche, consistent publishing, clear niche focus, content that answers questions definitively.
- trustworthiness_score (0-100): Accuracy, honesty, and safety. High scores require: accurate information, clear authorship, privacy policy, contact information, no misleading claims.
- overall_eeat_score (0-100): Holistic E-E-A-T rating for AdSense approval.
- signals_found (array of 4-6 strings): Positive E-E-A-T signals detected. Be specific — reference actual content found.
- improvements (array of 3-5 strings): Specific ways to boost E-E-A-T. Reference actual missing elements.
- summary (string): 2-3 sentences on the site's E-E-A-T standing. Reference specific content found.
- author_expertise_level ('none' | 'basic' | 'demonstrated' | 'strong'): Level of author expertise evident in the content.
- content_depth_rating ('surface' | 'moderate' | 'deep' | 'expert'): Overall depth of content.
- citation_quality (string): 1 sentence on how well the site cites sources and backs up claims.
- ymyl_risk (boolean): true if this is a Your Money Your Life site (finance, health, legal, safety topics). These face higher scrutiny from Google.
- ymyl_category (string): If YMYL, specify: "Finance", "Health", "Legal", "Safety", "News", or "N/A".
- eeat_quick_wins (array of 3-5 strings): Fastest ways to improve E-E-A-T score. Be specific and actionable.
- eeat_score_breakdown (object): One sentence explaining each score:
  - expertise_reason: Why you gave the expertise score
  - experience_reason: Why you gave the experience score
  - authority_reason: Why you gave the authority score
  - trust_reason: Why you gave the trust score

Be specific. Reference actual content from the pages provided.`

function buildEEATContext(pages: CrawledPage[], structure: SiteStructure): string {
  const lines: string[] = [
    `=== E-E-A-T ANALYSIS ===`,
    ``,
    `=== SITE STRUCTURE ===`,
    `Privacy Policy: ${structure.has_privacy ? '✓' : '✗ MISSING'}`,
    `About page: ${structure.has_about ? '✓' : '✗ MISSING'}`,
    `Contact page: ${structure.has_contact ? '✓' : '✗ MISSING'}`,
    `Terms of Service: ${structure.has_terms ? '✓' : '✗ MISSING'}`,
    `Disclaimer: ${structure.has_disclaimer ? '✓' : '✗ MISSING'}`,
    ``,
    `=== ALL CONTENT TITLES ===`,
  ]

  pages.forEach(p => {
    lines.push(`${p.title || 'No title'} | ${p.url}`)
  })

  lines.push(``)
  lines.push(`=== DETAILED CONTENT ANALYSIS ===`)

  const sorted = [...pages].sort((a, b) => b.word_count - a.word_count)
  sorted.slice(0, 20).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'No title'}`)
    lines.push(`H1: ${page.headings.h1.join(', ') || 'none'}`)
    lines.push(`H2s: ${page.headings.h2.slice(0, 5).join(' | ') || 'none'}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    lines.push(`External links (citations): ${page.links.external.length}`)
    // Full content for E-E-A-T analysis
    lines.push(`Content: ${page.content.slice(0, 800)}`)
    lines.push(``)
  })

  return lines.join('\n')
}

const FALLBACK: EEATResult = {
  expertise_score: 50,
  experience_score: 40,
  authoritativeness_score: 40,
  trustworthiness_score: 50,
  overall_eeat_score: 45,
  signals_found: [],
  improvements: [],
  summary: 'E-E-A-T analysis unavailable — API error.',
  author_expertise_level: 'basic',
  content_depth_rating: 'moderate',
  citation_quality: 'Unable to assess citation quality.',
  ymyl_risk: false,
  ymyl_category: 'N/A',
  eeat_quick_wins: [],
  eeat_score_breakdown: {
    expertise_reason: 'Analysis unavailable.',
    experience_reason: 'Analysis unavailable.',
    authority_reason: 'Analysis unavailable.',
    trust_reason: 'Analysis unavailable.',
  },
}

export async function analyzeEEAT(
  pages: CrawledPage[],
  structure: SiteStructure
): Promise<EEATResult> {
  const context = buildEEATContext(pages, structure)
  return callOpenAI<EEATResult>(SYSTEM_PROMPT, context, FALLBACK)
}
