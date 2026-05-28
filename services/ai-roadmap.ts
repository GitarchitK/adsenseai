/**
 * AI Roadmap Generator
 * Calls GPT-4o to produce an N-day personalised coaching roadmap.
 * Falls back to a deterministic roadmap built from approval_workflow data on any failure or timeout.
 */

import { callOpenAIAdvanced } from './openai'
import type { AIReport } from './ai-report'
import type { RoadmapDay } from '@/lib/firebase-types'

export type { RoadmapDay }

const TIMEOUT_MS = 60_000
const VALID_PRIORITIES = new Set<string>(['high', 'medium', 'low'])

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AdSense coaching specialist. Given a website audit report and a target number of days, generate a personalised day-by-day coaching roadmap.

Return a JSON object with a single key "roadmap" containing an array of exactly {totalDays} objects.

Each object must have:
- day: integer (1-indexed, sequential)
- title: string (short, actionable, max 10 words)
- category: string — one of: "Content", "Policy", "SEO", "UX", "Trust", "Technical"
- priority: "high" | "medium" | "low"
- estimatedMinutes: integer (15–120)
- instructions: array of 4–8 strings (specific, actionable steps)
- whyItMatters: string (1–2 sentences explaining the AdSense impact)
- successCriteria: string (how the user knows they completed this day)

Rules:
1. No single category should exceed 40% of all days
2. High-priority tasks (policy violations, missing required pages) must appear in the first 7 days
3. Each instruction must be specific to the site's actual issues — reference real scores and problems
4. Days should build on each other logically
5. Later days should focus on refinement and content creation`

// ── Validation ────────────────────────────────────────────────────────────────

function isValidRoadmapDay(item: unknown): item is RoadmapDay {
  if (!item || typeof item !== 'object') return false
  const d = item as Record<string, unknown>
  if (typeof d.day !== 'number') return false
  if (typeof d.title !== 'string' || !d.title) return false
  if (typeof d.category !== 'string' || !d.category) return false
  if (typeof d.priority !== 'string' || !VALID_PRIORITIES.has(d.priority)) return false
  if (typeof d.estimatedMinutes !== 'number') return false
  if (!Array.isArray(d.instructions) || d.instructions.length < 4 || d.instructions.length > 8) return false
  if (typeof d.whyItMatters !== 'string' || !d.whyItMatters) return false
  if (typeof d.successCriteria !== 'string' || !d.successCriteria) return false
  return true
}

function validateAndFixRoadmap(raw: RoadmapDay[], totalDays: number): RoadmapDay[] | null {
  if (!Array.isArray(raw) || raw.length !== totalDays) return null
  for (const day of raw) {
    if (!isValidRoadmapDay(day)) return null
  }
  // Check category distribution — no single category > 40%
  const counts: Record<string, number> = {}
  for (const day of raw) {
    counts[day.category] = (counts[day.category] ?? 0) + 1
  }
  for (const [cat, count] of Object.entries(counts)) {
    if (count / totalDays > 0.4) {
      console.warn(`[ai-roadmap] Category "${cat}" exceeds 40% (${count}/${totalDays}) — using fallback`)
      return null
    }
  }
  return raw
}

// ── Deterministic fallback ────────────────────────────────────────────────────

const GENERIC_CATEGORIES: RoadmapDay['category'][] = [
  'Content', 'SEO', 'Trust', 'UX', 'Technical', 'Policy', 'Content',
]

function buildFallbackRoadmap(totalDays: number, aiReport: AIReport): RoadmapDay[] {
  const roadmap: RoadmapDay[] = []

  // Use approval_workflow steps as the base if available
  const workflowSteps = aiReport.approval_workflow ?? []

  for (let i = 0; i < totalDays; i++) {
    const dayNum = i + 1
    const workflow = workflowSteps[i % Math.max(workflowSteps.length, 1)]
    const category = GENERIC_CATEGORIES[i % GENERIC_CATEGORIES.length]

    if (workflow && i < workflowSteps.length) {
      roadmap.push({
        day: dayNum,
        title: workflow.task,
        category,
        priority: i < 7 ? 'high' : i < 14 ? 'medium' : 'low',
        estimatedMinutes: 45,
        instructions: [
          workflow.details,
          'Review the changes you made and verify they look correct.',
          'Check that the page loads properly on mobile.',
          'Save your work and note what you completed today.',
        ],
        whyItMatters: `This task directly impacts your AdSense approval chances. ${workflow.details.slice(0, 100)}`,
        successCriteria: `You have completed: ${workflow.task}`,
      })
    } else {
      // Generic padding tasks
      const genericTasks: Array<{ title: string; cat: string; instructions: string[]; why: string; criteria: string }> = [
        {
          title: 'Improve Article Word Count',
          cat: 'Content',
          instructions: [
            'Open one of your shorter articles (under 600 words).',
            'Add a new section with 2–3 paragraphs of original content.',
            'Include a real example or personal experience.',
            'Add a subheading to break up the content.',
            'Proofread and publish the updated article.',
          ],
          why: 'Google AdSense prefers sites with substantial, original content. Thin articles reduce approval chances.',
          criteria: 'The article is now at least 600 words with a new section added.',
        },
        {
          title: 'Add Internal Links',
          cat: 'SEO',
          instructions: [
            'Open one of your recent articles.',
            'Identify 2–3 related articles on your site.',
            'Add a natural link to each related article within the text.',
            'Make sure the anchor text describes the linked page.',
          ],
          why: 'Internal linking helps Google understand your site structure and improves topical authority.',
          criteria: 'At least 2 new internal links added to an existing article.',
        },
        {
          title: 'Optimise Meta Descriptions',
          cat: 'SEO',
          instructions: [
            'Open your CMS or page editor.',
            'Find pages missing meta descriptions.',
            'Write a 150–160 character description for each page.',
            'Include the main keyword naturally.',
            'Save and verify the changes.',
          ],
          why: 'Meta descriptions improve click-through rates from search results and signal content quality to Google.',
          criteria: 'All checked pages now have meta descriptions under 160 characters.',
        },
        {
          title: 'Review and Fix Readability',
          cat: 'Content',
          instructions: [
            'Open one of your articles.',
            'Break any paragraphs longer than 3 sentences into shorter ones.',
            'Replace complex words with simpler alternatives.',
            'Add a subheading every 200–300 words.',
            'Read the article aloud to check flow.',
          ],
          why: 'Readable content keeps visitors on your site longer, which signals quality to Google.',
          criteria: 'The article has short paragraphs, clear subheadings, and reads naturally.',
        },
        {
          title: 'Check Mobile Experience',
          cat: 'UX',
          instructions: [
            'Open your site on a mobile device or use browser dev tools.',
            'Check that text is readable without zooming.',
            'Verify buttons and links are easy to tap.',
            'Check that images load and display correctly.',
            'Note any issues and fix them in your theme settings.',
          ],
          why: 'Over 60% of web traffic is mobile. Google penalises sites with poor mobile experience.',
          criteria: 'Site is fully readable and usable on a mobile screen.',
        },
      ]

      const task = genericTasks[(i - workflowSteps.length) % genericTasks.length]
      roadmap.push({
        day: dayNum,
        title: task.title,
        category: task.cat,
        priority: 'low',
        estimatedMinutes: 30,
        instructions: task.instructions,
        whyItMatters: task.why,
        successCriteria: task.criteria,
      })
    }
  }

  return roadmap
}

// ── Main function ─────────────────────────────────────────────────────────────

export async function generateRoadmap(
  scanId: string,
  totalDays: number,
  aiReport: AIReport
): Promise<RoadmapDay[]> {
  const fallback = buildFallbackRoadmap(totalDays, aiReport)

  // Build compact report summary for GPT-4o
  const reportSummary = {
    scanId,
    totalDays,
    final_score: aiReport.final_score,
    quality_score: aiReport.quality_score,
    policy_score: aiReport.policy_score,
    seo_score: aiReport.seo_score,
    ux_score: aiReport.ux_score,
    trust_score: aiReport.trust_score,
    top_issues: aiReport.top_issues,
    adsense_ready: aiReport.adsense_ready,
    approval_workflow: aiReport.approval_workflow,
    fix_suggestions: (aiReport.fix_suggestions ?? []).slice(0, 10).map(f => ({
      category: f.category,
      title: f.title,
      impact: f.impact,
    })),
    missing_pages: {
      privacy: !(aiReport.trust?.trust_score > 0),
    },
  }

  const userContent = `Generate a ${totalDays}-day coaching roadmap for this site audit:\n${JSON.stringify(reportSummary, null, 2)}`
  const systemWithDays = SYSTEM_PROMPT.replace('{totalDays}', String(totalDays))

  try {
    const timeoutPromise = new Promise<null>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS)
    )

    const aiPromise = callOpenAIAdvanced<{ roadmap?: unknown }>(
      systemWithDays,
      userContent,
      { roadmap: null }
    )

    const result = await Promise.race([aiPromise, timeoutPromise])

    if (!result || !result.roadmap) {
      console.error('[ai-roadmap] Empty or null response from GPT-4o')
      return fallback
    }

    const validated = validateAndFixRoadmap(result.roadmap as RoadmapDay[], totalDays)
    if (!validated) {
      console.error('[ai-roadmap] Validation failed — using deterministic fallback')
      return fallback
    }

    return validated
  } catch (err) {
    const msg = (err as Error).message
    if (msg === 'timeout') {
      console.error('[ai-roadmap] GPT-4o call timed out after 60s — using deterministic fallback')
    } else {
      console.error('[ai-roadmap] GPT-4o call failed:', msg)
    }
    return fallback
  }
}
