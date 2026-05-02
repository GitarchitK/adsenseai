import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, consumeThumbnailCredit, getThumbnailCredits } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import openaiClient from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) {
    return NextResponse.json({ error: 'Pro plan required.', upgrade_required: true }, { status: 403 })
  }

  const credits = await getThumbnailCredits(profile)
  if (credits.remaining <= 0) {
    return NextResponse.json({
      error: 'Thumbnail credits exhausted for this month.',
      upgrade_required: true,
      credits: { remaining: 0, limit: credits.limit }
    }, { status: 403 })
  }

  const { topic, keyword, style } = await request.json()
  if (!topic) return NextResponse.json({ error: 'Topic is required.' }, { status: 400 })

  const imageStyle = style || 'modern blog thumbnail, clean design, professional'

  const prompt = `Create a compelling blog post thumbnail image for an article about: "${topic}"
Keyword focus: ${keyword || topic}

Style requirements:
- Modern, clean, professional blog thumbnail aesthetic
- ${imageStyle}
- Bold typography-friendly layout with clear focal point
- Vibrant but not overwhelming colors (blue, purple, teal, orange palette)
- No text or words in the image — pure visual storytelling
- High contrast, thumbnail-optimized composition
- Suitable for a tech/business/lifestyle blog
- Cinematic lighting and depth
- Centered subject matter with abstract digital elements`

  try {
    const consumed = await consumeThumbnailCredit(profile.uid)
    if (!consumed) {
      return NextResponse.json({ error: 'Failed to consume thumbnail credit.', upgrade_required: true }, { status: 403 })
    }

    const response = await openaiClient.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) throw new Error('No image URL returned from OpenAI')

    return NextResponse.json({
      image_url: imageUrl,
      revised_prompt: response.data?.[0]?.revised_prompt || prompt,
      credits_remaining: credits.remaining - 1,
    })
  } catch (error) {
    const msg = (error as Error).message ?? 'Unknown error'
    console.error('[Thumbnail Generator] Error:', msg)

    if (msg.includes('content_policy') || msg.includes('safety')) {
      return NextResponse.json({ error: 'Image was rejected by content policy. Try a different description.' }, { status: 400 })
    }
    if (msg.includes('billing') || msg.includes('quota') || msg.includes('insufficient_quota')) {
      return NextResponse.json({ error: 'OpenAI quota exceeded. Please contact support.' }, { status: 503 })
    }
    return NextResponse.json({ error: `Thumbnail generation failed: ${msg}` }, { status: 500 })
  }
}
