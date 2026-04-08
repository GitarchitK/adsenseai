import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'
import { hasFeature } from '@/lib/plans'
import { callOpenAI } from '@/services/openai'

export async function POST(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  if (!hasFeature(profile.plan, 'privacy_generator')) {
    return NextResponse.json({ error: 'Upgrade to Pro to generate a Privacy Policy.', upgrade_required: true }, { status: 403 })
  }

  const { domain, business_name } = await request.json()
  if (!domain) return NextResponse.json({ error: 'Missing domain.' }, { status: 400 })

  const result = await callOpenAI<{ policy: string }>(
    `You are a legal document specialist. Generate a comprehensive, AdSense-compliant Privacy Policy.
Return a JSON object with a single key "policy" containing the full policy as a markdown string.
Include sections: Introduction, Information We Collect, How We Use Information, Cookies & Advertising (mention Google AdSense/DoubleClick), Third-Party Links, Data Retention, Your Rights, Contact Information.`,
    `Domain: ${domain}\nBusiness name: ${business_name ?? domain}\nDate: ${new Date().toLocaleDateString()}`,
    { policy: 'Failed to generate policy.' }
  )

  return NextResponse.json(result)
}
