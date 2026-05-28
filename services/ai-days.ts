/**
 * AI Day Count Estimator
 * Calls GPT-4o to estimate how many coaching days a site needs before AdSense approval.
 * Falls back to a deterministic formula on any failure or timeout.
 */

import { callOpenAIAdvanced } from './openai'
import type { AIReport } from './ai-report'

export interface DayEstimate {
  days: number                              // 14–90 inclusive
  confidence: 'fast' | 'moderate' | 'needs_work'
  summary: string                           // ≤ 30 words
}

const VALID_CONFIDENCE = new Set<string>(['fast', 'moderate', 'needs_work'])
const TIMEOUT_MS = 30_000

// ── Deterministic fallback ────────────────────────────────────────────────────

export function deterministicFallback(finalScore: number): DayEstimate {
  if (finalScore >= 80) {
    return {
      days: 14,
      confidence: 'fast',
      summary: 'Your site scores well across all categories and needs only minor polish before applying.',
    }
  }
  if (finalScore >= 65) {
    return {
      days: 21,
      confidence: 'moderate',
      summary: 'A few content and policy improvements are needed before your site is ready for AdSense.',
    }
  }
  if (finalScore >= 50) {
    return {
      days: 30,
      confidence: 'moderate',
      summary: 'Several areas need work including content quality and trust signals before applying.',
    }
  }
  return {
    days: 45,
    confidence: 'needs_work',
    summary: 'Significant improvements are required across content, policy, and SEO before AdSense approval.',
  }
}

// ── Validation ────────────────────────────────────────────────────────────────

function isValidEstimate(raw: unknown): raw is DayEstimate {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as Record<string, unknown>
  if (typeof r.days !== 'number' || r.days < 14 || r.days > 90) return false
  if (typeof r.confidence !== 'string' || !VALID_CONFIDENCE.has(r.confidence)) return false
  if (typeof r.summary !== 'string') return false
  return true
}

function clampSummary(summary: string): string {
  const words = summary.trim().split(/\s+/)
  return words.length <= 30 ? summary : words.slice(0, 30).join(' ') + '.'
}

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AdSense approval specialist. Given a website audit summary, estimate how many days of focused coaching the site needs before it can be approved by Google AdSense.

Return a JSON object with exactly these fields:
- days: integer between 14 and 90 (inclusive)
- confidence: exactly one of "fast", "moderate", or "needs_work"
- summary: a plain-English sentence of no more than 30 words explaining why you chose that day count

Confidence guide:
- "fast": site is mostly ready, minor fixes needed (score ≥ 75)
- "moderate": several improvements needed but nothing critical (score 50–74)
- "needs_work": significant issues across multiple categories (score < 50)

Be realistic. A site with policy violations or missing required pages always needs at least 21 days.`

// ── Main function ─────────────────────────────────────────────────────────────

export async function estimateApprovalDays(
  aiReport: AIReport,
  finalScore: number
): Promise<DayEstimate> {
  const fallback = deterministicFallback(finalScore)

  // Build compact summary for GPT-4o
  const summary = JSON.stringify({
    final_score: finalScore,
    quality_score: aiReport.quality_score,
    policy_score: aiReport.policy_score,
    seo_score: aiReport.seo_score,
    ux_score: aiReport.ux_score,
    trust_score: aiReport.trust_score,
    eeat_score: aiReport.eeat?.overall_eeat_score ?? null,
    technical_score: aiReport.technical_health?.structural_integrity ?? null,
    top_issues: aiReport.top_issues ?? [],
    adsense_ready: aiReport.adsense_ready,
    status: aiReport.status,
  })

  try {
    const timeoutPromise = new Promise<DayEstimate>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    )

    const aiPromise = callOpenAIAdvanced<unknown>(SYSTEM_PROMPT, summary, null)

    const raw = await Promise.race([aiPromise, timeoutPromise])

    if (!isValidEstimate(raw)) {
      console.error('[ai-days] Invalid response from GPT-4o:', raw)
      return fallback
    }

    return {
      days: Math.round(Math.min(90, Math.max(14, raw.days))),
      confidence: raw.confidence,
      summary: clampSummary(raw.summary),
    }
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'timeout') {
      console.error('[ai-days] GPT-4o call timed out after 30s — using deterministic fallback')
    } else {
      console.error('[ai-days] GPT-4o call failed:', msg)
    }
    return fallback
  }
}
