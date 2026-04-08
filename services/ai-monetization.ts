/**
 * Module 4 — Monetization Potential Analyzer
 * Estimates CPC/CPM and monetization potential based on site niche and content.
 */

import { callOpenAI } from './openai'
import type { CrawledPage } from '@/types'

export interface MonetizationResult {
  niche: string                  // identified niche (e.g. tech, finance, lifestyle)
  estimated_cpc: string          // range like "₹15 - ₹45"
  estimated_cpm: string          // range like "₹80 - ₹250"
  revenue_potential: 'High' | 'Medium' | 'Low'
  top_keywords: string[]         // valuable keywords for AdSense
  monetization_tips: string[]    // how to increase earnings
  summary: string                // short explanation
}

const SYSTEM_PROMPT = `You are an AdSense monetization and niche expert.

Analyze the provided website content and return a JSON object with EXACTLY these fields:
- niche (string): The primary topic or industry of the site.
- estimated_cpc (string): Estimated Cost Per Click range in INR (e.g., "₹10 - ₹30").
- estimated_cpm (string): Estimated Cost Per Mille (1,000 impressions) range in INR.
- revenue_potential (string): One of "High", "Medium", or "Low".
- top_keywords (array of strings): 5-8 high-value keywords the site should target for better AdSense revenue.
- monetization_tips (array of strings): 3-5 specific tips to increase AdSense earnings for this specific niche.
- summary (string): 1-2 sentence summary of the monetization outlook.

Base your estimates on typical Indian market rates for AdSense unless the content is clearly targeting a global/US audience.`

function buildMonetizationContext(pages: CrawledPage[]): string {
  const lines: string[] = [`Total pages analyzed: ${pages.length}`, '']

  pages.slice(0, 15).forEach((page, i) => {
    lines.push(`--- Page ${i + 1}: ${page.title || 'Untitled'} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Content snippet: ${page.content.slice(0, 600)}`)
    lines.push('')
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
}

export async function analyzeMonetization(
  pages: CrawledPage[]
): Promise<MonetizationResult> {
  const context = buildMonetizationContext(pages)
  return callOpenAI<MonetizationResult>(SYSTEM_PROMPT, context, FALLBACK)
}
