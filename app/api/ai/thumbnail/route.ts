import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { checkRateLimit } from '@/lib/rate-limit'
import OpenAI from 'openai'

export const maxDuration = 60

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
    const { allowed } = await checkRateLimit(ip)
    if (!allowed) return NextResponse.json({ error: 'Too many requests.' }, { status: 429 })

    const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
    if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    if (!hasFeature(profile.plan, 'ai_report')) {
      return NextResponse.json({ error: 'Thumbnail maker requires Pro plan.', upgrade_required: true }, { status: 403 })
    }

    const body = await request.json()
    const { description, imageUrl, style, articleTitle, size } = body

    if (!description && !imageUrl && !articleTitle) {
      return NextResponse.json({ error: 'Provide a description, image URL, or article title.' }, { status: 400 })
    }

    // Step 1: If reference image URL provided, analyze it with GPT-4o Vision
    let referenceDescription = ''
    if (imageUrl) {
      try {
        const visionRes = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: [
              { type: 'text', text: 'Describe this image in detail for use as a reference for creating a similar article thumbnail. Focus on: color scheme, style, composition, mood, typography style, and visual elements.' },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'low' } },
            ],
          }],
          max_tokens: 300,
        })
        referenceDescription = visionRes.choices[0]?.message?.content ?? ''
      } catch {
        // If vision fails, continue without reference
      }
    }

    // Step 2: Build the DALL-E prompt
    const styleMap: Record<string, string> = {
      'blog': 'professional blog thumbnail, clean modern design, bold typography space',
      'youtube': 'YouTube thumbnail style, high contrast, bold colors, eye-catching',
      'minimal': 'minimalist design, clean white space, subtle colors, elegant',
      'vibrant': 'vibrant colorful design, energetic, modern gradient background',
      'dark': 'dark theme, professional, dark background with light text areas',
      'news': 'news article style, editorial photography style, professional journalism',
    }

    const selectedStyle = styleMap[style ?? 'blog'] ?? styleMap['blog']

    let prompt = `Create a professional article thumbnail image. ${selectedStyle}.`

    if (articleTitle) {
      prompt += ` The article is titled: "${articleTitle}".`
    }

    if (description) {
      prompt += ` Visual concept: ${description}.`
    }

    if (referenceDescription) {
      prompt += ` Reference style: ${referenceDescription}.`
    }

    prompt += ` The image should be suitable for a blog article thumbnail. No text overlays unless specifically requested. High quality, professional, 16:9 aspect ratio composition.`

    // Step 3: Generate with DALL-E 3
    const imageSize = size === 'square' ? '1024x1024' : '1792x1024'

    const response = await client.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: imageSize,
      quality: 'standard',
      style: 'vivid',
    })

    const imageData = response?.data?.[0]
    if (!imageData?.url) {
      return NextResponse.json({ error: 'Image generation failed.' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imageUrl: imageData.url,
      revisedPrompt: imageData.revised_prompt,
    })
  } catch (err: unknown) {
    console.error('[/api/ai/thumbnail] error:', err)
    const msg = err instanceof Error ? err.message : 'Internal server error.'
    // Handle OpenAI content policy errors gracefully
    if (msg.includes('content_policy') || msg.includes('safety')) {
      return NextResponse.json({ error: 'Your description was flagged by content filters. Try a different description.' }, { status: 400 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
