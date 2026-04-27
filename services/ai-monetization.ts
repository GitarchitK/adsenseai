/**
 * Module 4 — Monetization Potential Analyzer (Advanced)
 * Deep analysis of revenue potential, niche CPC/CPM, and monetization strategy.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface MonetizationResult {
  niche: string
  estimated_cpc: string
  estimated_cpm: string
  revenue_potential: 'High' | 'Medium' | 'Low'
  top_keywords: string[]
  monetization_tips: string[]
  summary: string
  // New advanced fields
  niche_cpc_tier: 'premium' | 'high' | 'medium' | 'low'  // tier classification
  audience_geography: string      // likely primary audience location
  content_monetization_fit: string // how well the content fits AdSense monetization
  high_value_pages: string[]      // URLs of pages with highest monetization potential
  revenue_blockers: string[]      // specific things reducing revenue potential
  monthly_revenue_estimate: string // rough monthly estimate after approval
  ad_placement_advice: string     // where to place ads for maximum revenue
}

const SYSTEM_PROMPT = `You are an AdSense monetization expert with deep knowledge of CPC rates across different niches, especially for Indian publishers.

Analyze the provided website content and return a JSON object with EXACTLY these fields:

- niche (string): The primary topic or industry. Be specific (e.g., "Personal Finance - Mutual Funds" not just "Finance").
- estimated_cpc (string): Estimated Cost Per Click range in INR based on the specific niche and content. Be realistic.
- estimated_cpm (string): Estimated Cost Per Mille range in INR.
- revenue_potential ('High' | 'Medium' | 'Low'): Overall revenue potential after AdSense approval.
- top_keywords (array of 5-8 strings): High-value keywords this site should target for better AdSense CPC. Be specific to the niche.
- monetization_tips (array of 3-5 strings): Specific tips to increase AdSense earnings for this exact niche. Reference actual content found.
- summary (string): 2-3 sentences on the monetization outlook. Reference the specific niche and content.
- niche_cpc_tier ('premium' | 'high' | 'medium' | 'low'): CPC tier classification. Premium = Finance/Insurance/Legal (₹50+), High = Tech/Health/Education (₹20-50), Medium = Lifestyle/Food/Travel (₹8-20), Low = Entertainment/General (₹3-8).
- audience_geography (string): Likely primary audience location based on content language, topics, and references.
- content_monetization_fit (string): 1-2 sentences on how well the current content fits AdSense monetization. What type of ads will appear?
- high_value_pages (array of up to 3 URLs): Pages with the highest monetization potential based on topic and content.
- revenue_blockers (array of strings): Specific things reducing revenue potential. Examples: "Content is too broad — advertisers pay more for niche-specific content", "No high-CPC keywords targeted".
- monthly_revenue_estimate (string): Rough monthly revenue estimate after approval, assuming 1,000 daily visitors. Format: "₹X,XXX - ₹X,XXX/month at 1K daily visitors".
- ad_placement_advice (string): 2-3 sentences on where to place ads for maximum revenue based on the content type.

Base estimates on Indian market rates unless content clearly targets global audience.`

function buildMonetizationContext(pages: CrawledPage[]): string {
  const lines: string[] = [
    `=== MONETIZATION ANALYSIS ===`,
    `Total pages: ${pages.length}`,
    ``,
    `=== ALL PAGE TITLES (for niche identification) ===`,
  ]

  pages.forEach(p => {
    lines.push(`${p.title || 'No title'} | ${p.url}`)
  })

  lines.push(``)
  lines.push(`=== DETAILED CONTENT ANALYSIS ===`)

  const sorted = [...pages].sort((a, b) => b.word_count - a.word_count)
  sorted.slice(0, 15).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'No title'}`)
    lines.push(`H1: ${page.headings.h1.join(', ') || 'none'}`)
    lines.push(`H2s: ${page.headings.h2.slice(0, 4).join(' | ') || 'none'}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    lines.push(`Content: ${page.content.slice(0, 700)}`)
    lines.push(``)
  })

  return lines.join('\n')
}

const FALLBACK: MonetizationResult = {
  niche: 'General',
  estimated_cpc: '₹5 - ₹15',
  estimated_cpm: '₹40 - ₹100',
  revenue_potential: 'Medium',
  top_keywords: [],
  monetization_tips: [],
  summary: 'Monetization analysis unavailable — API error.',
  niche_cpc_tier: 'medium',
  audience_geography: 'India',
  content_monetization_fit: 'Unable to determine monetization fit.',
  high_value_pages: [],
  revenue_blockers: [],
  monthly_revenue_estimate: '₹2,000 - ₹5,000/month at 1K daily visitors',
  ad_placement_advice: 'Place ads within article content for best performance.',
}

export async function analyzeMonetization(pages: CrawledPage[]): Promise<MonetizationResult> {
  const context = buildMonetizationContext(pages)
  return callOpenAI<MonetizationResult>(SYSTEM_PROMPT, context, FALLBACK)
}
