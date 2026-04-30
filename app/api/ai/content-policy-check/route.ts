import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'ai_report')) return NextResponse.json({ error: 'Pro required.', upgrade_required: true }, { status: 403 })

  const { content, title } = await request.json()
  if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 })

  const wordCount = content.trim().split(/\s+/).length

  const prompt = `You are a Google AdSense policy compliance expert. Analyze this article content for AdSense policy compliance.

Title: ${title || 'Not provided'}
Word count: ${wordCount}
Content:
${content.slice(0, 3000)}

Return JSON with EXACTLY these fields:
{
  "verdict": "pass" | "warning" | "fail",
  "overall_risk": "low" | "medium" | "high",
  "policy_score": 0-100,
  "issues": [{ "type": "adult_content"|"copyright"|"dangerous"|"thin_content"|"keyword_stuffing"|"misleading"|"other", "severity": "critical"|"warning", "description": "plain English explanation", "fix": "how to fix it" }],
  "strengths": ["what the content does well for AdSense"],
  "word_count_verdict": "thin" | "borderline" | "good",
  "originality_signals": "assessment of how original the content appears",
  "summary": "2-3 sentence plain English verdict"
}`

  const result = await callOpenAI<{
    verdict: string; overall_risk: string; policy_score: number;
    issues: Array<{ type: string; severity: string; description: string; fix: string }>;
    strengths: string[]; word_count_verdict: string; originality_signals: string; summary: string;
  }>(
    'You are a Google AdSense policy compliance specialist.',
    prompt,
    { verdict: 'warning', overall_risk: 'medium', policy_score: 50, issues: [], strengths: [], word_count_verdict: 'borderline', originality_signals: 'Unable to assess.', summary: 'Analysis failed.' }
  )

  return NextResponse.json({ ...result, word_count: wordCount })
}
