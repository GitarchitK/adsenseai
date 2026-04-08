import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'content_rewrite')) {
    return NextResponse.json({ error: 'Upgrade to Pro to use content rewriting.', upgrade_required: true }, { status: 403 })
  }

  const { content, target_score = 80 } = await request.json()
  if (!content) return NextResponse.json({ error: 'Missing content.' }, { status: 400 })

  const result = await callOpenAI<{ rewritten: string; improvements: string[] }>(
    `You are an expert content writer specialising in AdSense-compliant, high-quality web content.
Rewrite the provided content to achieve a quality score of at least ${target_score}/100.
Return JSON with:
- rewritten: the improved content (preserve the topic and key information)
- improvements: array of 3-5 specific changes you made`,
    content.slice(0, 3000),
    { rewritten: content, improvements: [] }
  )

  return NextResponse.json(result)
}
