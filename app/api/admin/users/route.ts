import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile, adminGetUsers, adminSetPlan } from '@/lib/auth-server'

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? '').split(',').map(e => e.trim()).filter(Boolean)

function isAdmin(email: string) {
  return ADMIN_EMAILS.includes(email)
}

export async function GET(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile || !isAdmin(profile.email)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 100)
  const users = await adminGetUsers(limit)
  return NextResponse.json({ users })
}

export async function PATCH(request: NextRequest) {
  const profile = await getAuthenticatedProfile(request.headers.get('authorization'))
  if (!profile || !isAdmin(profile.email)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }

  const { user_id, plan } = await request.json()
  if (!user_id || !['free', 'pro'].includes(plan)) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 })
  }

  await adminSetPlan(user_id, plan)
  return NextResponse.json({ success: true })
}
