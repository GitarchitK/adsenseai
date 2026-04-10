/**
 * Module 2 — Policy Compliance Checker
 * Detects AdSense policy violations: adult content, copyright risk, dangerous content.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface PolicyComplianceResult {
  adult_content: boolean         // explicit or suggestive content
  copyright_risk: boolean        // potential copyright violations
  dangerous_content: boolean     // harmful, violent, or illegal content
  policy_risk_score: number      // 0-100 (higher = riskier)
  violations: string[]           // list of specific concerns found
  policy_summary: string         // short explanation
}

const SYSTEM_PROMPT = `You are a Google AdSense policy compliance specialist writing for non-technical website owners.

Review the provided website content and structure, then return a JSON object with EXACTLY these fields:
- adult_content (boolean): true if the site contains explicit, suggestive, or adult-oriented material.
- copyright_risk (boolean): true if content appears to be copied, scraped, or poses copyright concerns.
- dangerous_content (boolean): true if content promotes violence, illegal activity, hate speech, or dangerous products.
- policy_risk_score (0-100): Overall AdSense policy risk. 0 = fully compliant, 100 = certain rejection.
- violations (array of strings): Each violation written in plain English — what was found and why it's a problem. Empty array if none.
- policy_summary (string): 2-3 sentences in plain English. Start with the verdict ("Your site looks policy-compliant" or "We found X issues"), then explain what it means for their AdSense application.

Rules: Be precise. Only flag genuine concerns. Write as if explaining to a blogger, not a lawyer.`

function buildPolicyContext(pages: CrawledPage[], structure: SiteStructure): string {
  const lines: string[] = [
    `Site structure:`,
    `  Has Privacy Policy: ${structure.has_privacy}`,
    `  Has About page: ${structure.has_about}`,
    `  Has Contact page: ${structure.has_contact}`,
    `  Has Terms of Service: ${structure.has_terms}`,
    '',
    `Pages analyzed: ${pages.length}`,
    '',
  ]

  pages.slice(0, 15).forEach((page, i) => {
    lines.push(`--- Page ${i + 1}: ${page.title || 'Untitled'} ---`)
    lines.push(`URL: ${page.url}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    lines.push(`Content snippet: ${page.content.slice(0, 600)}`)
    lines.push('')
  })

  return lines.join('\n')
}

const FALLBACK: PolicyComplianceResult = {
  adult_content: false,
  copyright_risk: false,
  dangerous_content: false,
  policy_risk_score: 50,
  violations: [],
  policy_summary: 'Policy analysis unavailable — API error.',
}

export async function checkPolicyCompliance(
  pages: CrawledPage[],
  structure: SiteStructure
): Promise<PolicyComplianceResult> {
  const context = buildPolicyContext(pages, structure)
  return callOpenAI<PolicyComplianceResult>(SYSTEM_PROMPT, context, FALLBACK)
}
