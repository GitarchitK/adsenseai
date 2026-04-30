import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) return NextResponse.json({ error: 'Pro required.', upgrade_required: true }, { status: 403 })

  const { content } = await request.json()
  if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 })

  const words = content.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter((w: string) => w.length > 3)
  const totalWords = words.length

  const stopWords = new Set(['that','this','with','from','they','have','been','were','will','would','could','should','their','there','these','those','about','after','before','being','between','during','every','first','found','great','having','other','people','right','since','still','think','under','until','using','where','which','while','years','place','large','often','never','might','small','along','below','above','never','always','every','quite','rather','really','seems','since','still','think','those','three','under','until','using','where','which','while','years'])

  const freq: Record<string, number> = {}
  for (const w of words) {
    if (!stopWords.has(w) && w.length > 3) {
      freq[w] = (freq[w] || 0) + 1
    }
  }

  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word, count]) => {
      const density = parseFloat(((count / totalWords) * 100).toFixed(2))
      const status = density > 3 ? 'stuffed' : density > 2 ? 'high' : density > 1 ? 'good' : 'low'
      return { word, count, density, status }
    })

  const stuffedKeywords = keywords.filter(k => k.status === 'stuffed')
  const overallStatus = stuffedKeywords.length > 0 ? 'warning' : 'good'

  return NextResponse.json({
    total_words: totalWords,
    unique_words: Object.keys(freq).length,
    keywords,
    stuffed_keywords: stuffedKeywords,
    overall_status: overallStatus,
    recommendation: stuffedKeywords.length > 0
      ? `${stuffedKeywords.length} keyword(s) appear too frequently. Reduce "${stuffedKeywords[0]?.word}" from ${stuffedKeywords[0]?.density}% to under 2%.`
      : 'Keyword density looks natural. No stuffing detected.',
  })
}
