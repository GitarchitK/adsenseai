import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) {
    return NextResponse.json({ error: 'Pro plan required.', upgrade_required: true }, { status: 403 })
  }

  const { topic, keyword, niche, tone, target_audience, word_count } = await request.json()
  if (!topic) return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })

  const targetWords = Math.min(Math.max(word_count || 1200, 500), 3000)
  const selectedTone = tone || 'informative'
  const selectedAudience = target_audience || 'general readers interested in the topic'

  const systemPrompt = `You are an expert SEO content writer and blog strategist with 10+ years of experience. You MUST respond with valid JSON only — no markdown, no code blocks, no extra text before or after the JSON.`

  const userPrompt = `Write a complete, publication-ready blog article and return it as a single JSON object.

Topic: ${topic}
Target Keyword: ${keyword || topic}
Niche: ${niche || 'general'}
Tone: ${selectedTone}
Target Audience: ${selectedAudience}
Target Word Count: ~${targetWords} words

Return this exact JSON structure (no other text):
{
  "title": "SEO-optimized title 50-60 chars with keyword",
  "meta_description": "compelling 150-160 char description with keyword",
  "introduction": "hook paragraph 100-150 words",
  "body": "full article body with H2/H3 headings using ## and ###, bullet points, numbered lists — minimum ${Math.round(targetWords * 0.65)} words",
  "conclusion": "summary and CTA 100-150 words",
  "faq": [{"question": "...", "answer": "..."}],
  "secondary_keywords": ["kw1", "kw2", "kw3"],
  "estimated_read_time": "X min read",
  "word_count": ${targetWords}
}

Requirements:
- body must have real depth and value, use \\n\\n between sections
- Include 3-5 FAQ items relevant to the topic
- No placeholder text — write real, useful content
- Return ONLY the JSON object`

  try {
    const result = await callOpenAI<{
      title: string
      meta_description: string
      introduction: string
      body: string
      conclusion: string
      faq: Array<{ question: string; answer: string }>
      secondary_keywords: string[]
      estimated_read_time: string
      word_count: number
    }>(
      systemPrompt,
      userPrompt,
      { title: '', meta_description: '', introduction: '', body: '', conclusion: '', faq: [], secondary_keywords: [], estimated_read_time: '', word_count: 0 },
      'gpt-4o-mini',
      4096
    )

    if (!result.title || !result.body) {
      console.error('[Article Writer] Empty result from callOpenAI — check OPENAI_API_KEY and quota')
      return NextResponse.json({
        error: 'Article generation failed — AI returned empty content. Please try again.'
      }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    const msg = (error as Error).message ?? 'Unknown error'
    console.error('[Article Writer] Error:', msg)
    return NextResponse.json({ error: `Article generation failed: ${msg}` }, { status: 500 })
  }
}
