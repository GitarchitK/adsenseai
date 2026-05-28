/**
 * AI Roadmap Adapter
 * Regenerates the remaining (uncompleted) days of a coaching roadmap after a re-crawl.
 * Preserves all completed days unchanged, removes resolved issues, and adjusts
 * the remaining day count based on score changes.
 */

import type { UserPlan, RoadmapDay } from '@/lib/firebase-types'
import type { AIReport } from './ai-report'
import { generateRoadmap } from './ai-roadmap'

export interface AdaptResult {
  roadmap: RoadmapDay[]
  newTotalDays: number
  lastCrawlDay: number
}

// ── Score delta helpers ───────────────────────────────────────────────────────

/**
 * Extract the previous scan's final score from crawlHistory.
 * Falls back to the plan's original score if not available.
 */
function getPreviousScore(plan: UserPlan): number | null {
  // The plan doesn't store scores directly — we use the roadmap length as a proxy.
  // In practice the caller should pass the previous score; we default to null here
  // and handle it gracefully.
  return null
}

// ── Category resolution detection ────────────────────────────────────────────

/**
 * Determine which categories have been resolved based on the new scan.
 * A category is "resolved" if the new score for that category is significantly
 * higher than what the original roadmap tasks were targeting.
 */
function getResolvedCategories(newScan: AIReport): Set<string> {
  const resolved = new Set<string>()

  // Policy issues resolved
  if (!newScan.policy.adult_content && !newScan.policy.dangerous_content && newScan.policy.violations.length === 0) {
    resolved.add('Policy')
  }

  // Trust/UX resolved (score ≥ 80)
  if (newScan.trust_score >= 80) resolved.add('Trust')
  if (newScan.ux_score >= 80) resolved.add('UX')

  // SEO resolved
  if (newScan.seo_score >= 80) resolved.add('SEO')

  // Content resolved
  if (newScan.quality_score >= 80) resolved.add('Content')

  // Technical resolved
  if ((newScan.technical_health?.structural_integrity ?? 0) >= 80) resolved.add('Technical')

  return resolved
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function adaptRoadmap(
  plan: UserPlan,
  newScanResult: AIReport,
  newScanId: string,
  previousScore?: number
): Promise<AdaptResult> {
  const currentDay = plan.currentDay
  const completedDayNumbers = new Set(plan.completedDays)

  // 1. Separate completed days from remaining days
  // Completed days: day number ≤ currentDay AND in completedDays list
  const completedDays = plan.roadmap.filter(d => completedDayNumbers.has(d.day))
  const remainingDays = plan.roadmap.filter(d => !completedDayNumbers.has(d.day) && d.day > currentDay)

  // 2. Determine score delta
  const newScore = newScanResult.final_score
  const prevScore = previousScore ?? null
  const scoreDelta = prevScore !== null ? newScore - prevScore : 0

  // 3. Calculate new remaining day count
  let newRemainingCount = remainingDays.length

  // Score improved ≥ 10 pts → reduce remaining days by up to 20% (min 3 remaining)
  if (scoreDelta >= 10) {
    const reduction = Math.floor(newRemainingCount * 0.2)
    newRemainingCount = Math.max(3, newRemainingCount - reduction)
    console.log(`[ai-roadmap-adapt] Score improved by ${scoreDelta} pts — reducing remaining days by ${reduction} (${remainingDays.length} → ${newRemainingCount})`)
  }

  // Score decreased ≥ 5 pts → add up to 5 additional days
  if (scoreDelta <= -5) {
    const addition = Math.min(5, Math.abs(Math.floor(scoreDelta / 5)))
    newRemainingCount = newRemainingCount + addition
    console.log(`[ai-roadmap-adapt] Score decreased by ${Math.abs(scoreDelta)} pts — adding ${addition} days (${remainingDays.length} → ${newRemainingCount})`)
  }

  // 4. Determine which categories are now resolved
  const resolvedCategories = getResolvedCategories(newScanResult)

  // 5. Filter out tasks for resolved categories from remaining days
  const filteredRemaining = remainingDays.filter(d => !resolvedCategories.has(d.category))

  // 6. Generate new remaining days via AI (or use filtered existing ones)
  let newRemainingDays: RoadmapDay[]

  if (newRemainingCount <= 0) {
    newRemainingDays = []
  } else if (filteredRemaining.length >= newRemainingCount) {
    // We have enough remaining days after filtering — just trim to the new count
    newRemainingDays = filteredRemaining.slice(0, newRemainingCount)
  } else {
    // Need to generate additional days to fill the gap
    try {
      const generatedDays = await generateRoadmap(newScanId, newRemainingCount, newScanResult)
      // Re-number generated days starting from currentDay + 1
      newRemainingDays = generatedDays.map((d, i) => ({
        ...d,
        day: currentDay + 1 + i,
      }))
    } catch (err) {
      console.error('[ai-roadmap-adapt] generateRoadmap failed during adaptation:', err)
      // Fall back to filtered remaining days, padded if needed
      newRemainingDays = filteredRemaining.slice(0, newRemainingCount)
    }
  }

  // Re-number remaining days to be sequential after the last completed day
  const lastCompletedDay = completedDays.length > 0
    ? Math.max(...completedDays.map(d => d.day))
    : 0

  const renumberedRemaining = newRemainingDays.map((d, i) => ({
    ...d,
    day: lastCompletedDay + 1 + i,
  }))

  // 7. Assemble the full adapted roadmap
  const adaptedRoadmap: RoadmapDay[] = [
    ...completedDays,   // preserved unchanged (same day numbers, same content)
    ...renumberedRemaining,
  ]

  const newTotalDays = adaptedRoadmap.length

  return {
    roadmap: adaptedRoadmap,
    newTotalDays,
    lastCrawlDay: currentDay,  // update lastCrawlDay to currentDay
  }
}
