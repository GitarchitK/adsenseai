import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) return NextResponse.json({ error: 'Pro required.', upgrade_required: true }, { status: 403 })

  const { title, content, url } = await request.json()
  if (!title && !content) return NextResponse.json({ error: 'Provide title or content.' }, { status: 400 })

  const prompt = `You are an SEO expert. Generate 3 meta descriptions for the following page.

Rules:
- Each must be 150-160 characters exactly
- Include the primary keyword naturally
- Be compelling and click-worthy
- No clickbait — be accurate
- Each should have a different angle/hook

Page info:
Title: ${title || 'Not provided'}
URL: ${url || 'Not provided'}
Content snippet: ${(content || '').slice(0, 500)}

Return JSON: { "descriptions": [{ "text": "...", "chars": 155, "angle": "benefit-focused" }, ...] }`

  const result = await callOpenAI<{ descriptions: Array<{ text: string; chars: number; angle: string }> }>(
    'You are an SEO meta description expert.',
    prompt,
    { descriptions: [] }
  )

  return NextResponse.json(result)
}
