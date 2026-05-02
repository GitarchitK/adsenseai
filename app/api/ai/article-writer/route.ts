import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

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

  const systemPrompt = `You are an expert SEO content writer. You MUST respond with valid JSON only — no markdown, no code blocks, no extra text. Just raw JSON.`

  const userPrompt = `Write a complete blog article and return it as a JSON object.

Topic: ${topic}
Target Keyword: ${keyword || topic}
Niche: ${niche || 'general'}
Tone: ${selectedTone}
Target Audience: ${selectedAudience}
Target Word Count: ~${targetWords} words

Return this exact JSON structure:
{
  "title": "SEO title 50-60 chars",
  "meta_description": "compelling 150-160 char description with keyword",
  "introduction": "hook paragraph 100-150 words",
  "body": "full article body with H2/H3 headings, lists, and depth — at least ${Math.round(targetWords * 0.7)} words",
  "conclusion": "summary and CTA 100-150 words",
  "faq": [{"question": "...", "answer": "..."}],
  "secondary_keywords": ["kw1", "kw2", "kw3"],
  "estimated_read_time": "X min read",
  "word_count": ${targetWords}
}

Rules:
- body must be substantive with real depth, use \\n\\n between sections
- Include 3-5 FAQ items
- No placeholder text — write real content
- Return ONLY the JSON object, nothing else`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 4096,
    })

    const raw = response.choices[0]?.message?.content
    if (!raw) {
      const finishReason = response.choices[0]?.finish_reason
      console.error('[Article Writer] Empty response, finish_reason:', finishReason)
      return NextResponse.json({
        error: `OpenAI returned empty content (finish_reason: ${finishReason}). Please try again.`
      }, { status: 500 })
    }

    let result
    try {
      result = JSON.parse(raw)
    } catch (parseErr) {
      console.error('[Article Writer] JSON parse error. Raw:', raw.slice(0, 500))
      return NextResponse.json({ error: 'Failed to parse AI response. Please try again.' }, { status: 500 })
    }

    if (!result.title || !result.body) {
      console.error('[Article Writer] Missing fields. Keys:', Object.keys(result))
      return NextResponse.json({ error: 'AI returned incomplete article. Please try again.' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error) {
    const msg = (error as Error).message ?? 'Unknown error'
    console.error('[Article Writer] OpenAI error:', msg)

    if (msg.includes('billing') || msg.includes('quota') || msg.includes('insufficient_quota')) {
      return NextResponse.json({ error: 'OpenAI quota exceeded. Please contact support.' }, { status: 503 })
    }
    if (msg.includes('context_length') || msg.includes('maximum context')) {
      return NextResponse.json({ error: 'Prompt too long. Try a shorter topic description.' }, { status: 400 })
    }
    return NextResponse.json({ error: `Article generation failed: ${msg}` }, { status: 500 })
  }
}
