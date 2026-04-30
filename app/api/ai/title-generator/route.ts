import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) return NextResponse.json({ error: 'Pro required.', upgrade_required: true }, { status: 403 })

  const { topic, keyword, content_type } = await request.json()
  if (!topic) return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })

  const prompt = `You are an SEO title expert. Generate 5 optimized article titles for the following topic.

Topic: ${topic}
Target keyword: ${keyword || topic}
Content type: ${content_type || 'blog post'}

Rules:
- Each title must be 50-60 characters (ideal for Google)
- Include the target keyword naturally
- Use proven title formulas: How-to, Numbers, Questions, "Best X", "Complete Guide"
- Be specific and benefit-driven
- No clickbait — must accurately describe the content
- Avoid ALL CAPS

Return JSON: { "titles": [{ "text": "...", "chars": 55, "formula": "how-to", "seo_score": 85, "why": "one sentence on why this works" }] }`

  const result = await callOpenAI<{ titles: Array<{ text: string; chars: number; formula: string; seo_score: number; why: string }> }>(
    'You are an SEO title optimization expert.',
    prompt,
    { titles: [] }
  )

  return NextResponse.json(result)
}
