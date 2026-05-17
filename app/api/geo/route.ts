import { NextRequest, NextResponse } from 'next/server'

/**
 * Returns the visitor's country code using Vercel's built-in geo headers.
 * No external API needed — Vercel sets x-vercel-ip-country on every request.
 * Falls back to 'IN' (India) if the header is absent (local dev).
 */
export async function GET(request: NextRequest) {
  const country =
    request.headers.get('x-vercel-ip-country') ??
    request.headers.get('cf-ipcountry') ??   // Cloudflare fallback
    'IN'

  return NextResponse.json({ country }, {
    headers: {
      'Cache-Control': 'private, max-age=3600',
    },
  })
}
