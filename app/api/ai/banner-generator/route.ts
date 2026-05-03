import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import OpenAI from 'openai'

export const maxDuration = 60

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const STYLES: Record<string, string> = {
  modern_tech:    'futuristic dark blue gradient background with glowing circuit patterns, professional tech aesthetic, bold white typography, high contrast',
  bold_contrast:  'deep black background with vivid red and orange accent colors, dramatic high-contrast design, bold impactful typography',
  minimal_clean:  'clean white background with subtle gray accents, minimalist modern design, elegant sans-serif typography, lots of whitespace',
  creative_color: 'vibrant gradient from purple to pink to orange, creative colorful design, playful modern typography',
  news_style:     'professional newspaper-inspired layout, dark navy and white, authoritative editorial design, clean structured typography',
  corporate:      'professional corporate blue and white, clean business aesthetic, trustworthy and authoritative design',
}

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) {
    return NextResponse.json({ error: 'Banner Generator requires Pro plan.', upgrade_required: true }, { status: 403 })
  }

  const { headline, subheadline, tone, category, style = 'modern_tech', size = 'wide' } = await request.json()
  if (!headline) return NextResponse.json({ error: 'Headline is required.' }, { status: 400 })

  const styleDesc = STYLES[style] ?? STYLES.modern_tech
  const dimensions = size === 'square' ? '1024x1024' : '1792x1024'

  const prompt = `Create a professional article banner image with the following specifications:

HEADLINE TEXT (display prominently): "${headline}"
SUBHEADLINE TEXT (display smaller below): "${subheadline || ''}"
CATEGORY: ${category || 'General'}
TONE: ${tone || 'Professional'}
VISUAL STYLE: ${styleDesc}

Design requirements:
- Wide banner format optimized for blog/article headers
- The headline text must be clearly readable and prominently displayed on the left side
- Include a relevant, high-quality background image or illustration on the right side that matches the category "${category || 'General'}"
- Professional typography with strong visual hierarchy
- The design should look like a premium article thumbnail from a top publication
- No watermarks, no borders, photorealistic quality
- Text should be white or high-contrast against the background`

  try {
    const response = await client.images.generate({
      model:   'gpt-image-1',
      prompt,
      size:    dimensions as '1024x1024' | '1792x1024',
      quality: 'high',
      n: 1,
    })

    const imageData = response.data?.[0]

    // gpt-image-1 returns base64 by default
    if (imageData?.b64_json) {
      return NextResponse.json({
        success: true,
        imageBase64: imageData.b64_json,
        imageUrl: `data:image/png;base64,${imageData.b64_json}`,
        revisedPrompt: prompt,
      })
    }

    // Fallback: url format
    if (imageData?.url) {
      return NextResponse.json({
        success: true,
        imageUrl: imageData.url,
        revisedPrompt: (imageData as { revised_prompt?: string }).revised_prompt ?? prompt,
      })
    }

    return NextResponse.json({ error: 'No image returned from AI.' }, { status: 500 })
  } catch (err) {
    console.error('[banner-generator]', err)
    const msg = err instanceof Error ? err.message : 'Image generation failed.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
