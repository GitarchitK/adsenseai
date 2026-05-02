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

  const prompt = `You are an expert SEO content writer and blog strategist. Write a complete, publication-ready blog article.

## Article Requirements
- Topic: ${topic}
- Target Keyword: ${keyword || topic}
- Niche: ${niche || 'general'}
- Tone: ${selectedTone}
- Target Audience: ${selectedAudience}
- Target Word Count: ~${targetWords} words

## Structure Required
Write the article with these exact sections:
1. **SEO Title** (50-60 chars, include keyword)
2. **Meta Description** (150-160 chars, compelling summary with keyword)
3. **Introduction** (hook the reader, state the promise, 100-150 words)
4. **Main Body** (use H2 and H3 subheadings, 4-8 sections depending on topic depth)
5. **Conclusion** (summary + clear call to action, 100-150 words)

## Content Guidelines
- Write in clear, engaging English — no fluff or padding
- Each section must be substantive with real depth and value
- Use numbered lists, bullet points, and bold text for scannability
- Include a FAQ section at the end (3-5 questions based on the topic)
- End with a compelling call-to-action that encourages newsletter signup or engagement
- Target 3-5 secondary keywords naturally throughout the article
- Make content original, evidence-based, and actionable
- Write like a confident expert — clear assertions, no hedging

## Return Format
Return a single JSON object:
{
  "title": "SEO-optimized article title",
  "meta_description": "compelling 155-char description",
  "introduction": "full introduction text",
  "body": "full body text with all headings and formatting",
  "conclusion": "full conclusion text",
  "faq": [{"question": "...", "answer": "..."}],
  "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
  "estimated_read_time": "5 min",
  "word_count": 1200
}`

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
      'You are an expert SEO content writer and blog strategist with 10+ years of experience.',
      prompt,
      { title: '', meta_description: '', introduction: '', body: '', conclusion: '', faq: [], secondary_keywords: [], estimated_read_time: '', word_count: 0 }
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('[Article Writer] Error:', error)
    return NextResponse.json({ error: 'Failed to generate article. Please try again.' }, { status: 500 })
  }
}
