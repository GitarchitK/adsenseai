import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'fix_suggestions')) {
    return NextResponse.json({ error: 'Upgrade to Pro for SEO suggestions.', upgrade_required: true }, { status: 403 })
  }

  const { domain, pages } = await request.json()
  if (!domain || !pages) return NextResponse.json({ error: 'Missing domain or pages.' }, { status: 400 })

  const pagesSummary = (pages as Array<{ url: string; title: string; word_count: number; meta_description?: string }>)
    .slice(0, 10)
    .map(p => `- ${p.title} (${p.url}) | ${p.word_count} words | meta: ${p.meta_description ? 'yes' : 'no'}`)
    .join('\n')

  const result = await callOpenAI<{ suggestions: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low' }> }>(
    `You are an SEO specialist focused on AdSense-ready websites.
Analyse the provided site structure and return JSON with a "suggestions" array.
Each suggestion: { title, description, priority: "high"|"medium"|"low" }
Focus on: meta descriptions, title tags, heading structure, content depth, internal linking, page speed hints.
Return 6-8 actionable suggestions.`,
    `Domain: ${domain}\nPages:\n${pagesSummary}`,
    { suggestions: [] }
  )

  return NextResponse.json(result)
}
