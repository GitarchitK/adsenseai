/**
 * Module 2 — Policy Compliance Checker (Advanced)
 * Deep detection of AdSense policy violations with specific evidence.
 */

import { callOpenAI } from './openai'
import type { CrawledPage, SiteStructure } from '@/types'

export interface PolicyComplianceResult {
  adult_content: boolean
  copyright_risk: boolean
  dangerous_content: boolean
  policy_risk_score: number      // 0-100 (higher = riskier)
  violations: string[]           // specific violations with evidence
  policy_summary: string
  // New advanced fields
  scraped_content_risk: boolean  // content appears to be scraped/copied
  ai_generated_risk: boolean     // content appears to be low-quality AI-generated
  clickbait_risk: boolean        // misleading or sensational headlines
  missing_disclosures: string[]  // required disclosures not found (affiliate, sponsored, etc.)
  compliant_signals: string[]    // positive compliance signals found
}

const SYSTEM_PROMPT = `You are a Google AdSense policy compliance specialist with deep knowledge of Google's Publisher Policies and AdSense Program Policies.

Review the provided website content and structure carefully. Return a JSON object with EXACTLY these fields:

- adult_content (boolean): true if ANY page contains explicit, suggestive, or adult-oriented material.
- copyright_risk (boolean): true if content appears to be copied, scraped, or poses copyright concerns. Look for: content that reads like Wikipedia, news articles without original commentary, product descriptions that match manufacturer text.
- dangerous_content (boolean): true if content promotes violence, illegal activity, hate speech, dangerous products, or harmful misinformation.
- policy_risk_score (0-100): Overall AdSense policy risk. 0 = fully compliant, 100 = certain rejection. Be precise.
- violations (array of strings): Each violation written as: "[VIOLATION TYPE]: [what was found] on [URL or page]. [Why this causes rejection]." Empty array if none.
- policy_summary (string): 2-3 sentences. Start with the verdict. Reference specific pages or patterns found.
- scraped_content_risk (boolean): true if content appears to be scraped from other sources (news aggregation without commentary, product listings, etc.)
- ai_generated_risk (boolean): true if content appears to be low-quality AI-generated text (repetitive phrases, unnatural transitions, generic filler content with no real insights).
- clickbait_risk (boolean): true if titles are misleading, sensational, or don't match the content.
- missing_disclosures (array of strings): Required disclosures that are missing. Examples: "Affiliate disclosure missing — site appears to promote products without disclosing affiliate relationships", "Sponsored content not labeled".
- compliant_signals (array of strings): Positive compliance signals found. Examples: "Privacy Policy present", "No adult content detected", "Original content with clear authorship".

Be precise. Only flag genuine concerns with specific evidence. False positives hurt publishers unfairly.`

function buildPolicyContext(pages: CrawledPage[], structure: SiteStructure): string {
  const lines: string[] = [
    `=== POLICY COMPLIANCE AUDIT ===`,
    ``,
    `=== SITE STRUCTURE ===`,
    `Privacy Policy: ${structure.has_privacy ? '✓ Found' : '✗ MISSING'}`,
    `About page: ${structure.has_about ? '✓ Found' : '✗ MISSING'}`,
    `Contact page: ${structure.has_contact ? '✓ Found' : '✗ MISSING'}`,
    `Terms of Service: ${structure.has_terms ? '✓ Found' : '✗ MISSING'}`,
    `Disclaimer: ${structure.has_disclaimer ? '✓ Found' : '✗ MISSING'}`,
    ``,
    `=== CONTENT ANALYSIS (${pages.length} pages) ===`,
    ``,
  ]

  // Analyze all pages for policy issues
  pages.slice(0, 30).forEach((page, i) => {
    lines.push(`--- Page ${i + 1} ---`)
    lines.push(`URL: ${page.url}`)
    lines.push(`Title: ${page.title || 'No title'}`)
    if (page.meta_description) lines.push(`Meta: ${page.meta_description}`)
    lines.push(`H1: ${page.headings.h1.join(', ') || 'none'}`)
    lines.push(`External links: ${page.links.external.length}`)
    // Full content for policy analysis
    lines.push(`Content: ${page.content.slice(0, 800)}`)
    lines.push(``)
  })

  return lines.join('\n')
}

const FALLBACK: PolicyComplianceResult = {
  adult_content: false,
  copyright_risk: false,
  dangerous_content: false,
  policy_risk_score: 30,
  violations: [],
  policy_summary: 'Policy analysis unavailable — API error.',
  scraped_content_risk: false,
  ai_generated_risk: false,
  clickbait_risk: false,
  missing_disclosures: [],
  compliant_signals: [],
}

export async function checkPolicyCompliance(
  pages: CrawledPage[],
  structure: SiteStructure
): Promise<PolicyComplianceResult> {
  const context = buildPolicyContext(pages, structure)
  return callOpenAI<PolicyComplianceResult>(SYSTEM_PROMPT, context, FALLBACK)
}
