/**
 * /api/dev-tools — Server-side HTTP utility tools
 * Performs real network requests: headers, redirects, SSL, robots, sitemap, canonical, ads.txt, domain age
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedProfile } from '@/lib/auth-server'

// ── Types ───────────────────────────────────────────────────────────────────

type ToolResult = Record<string, unknown>

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Normalize a URL — ensure it has a protocol */
function ensureProtocol(url: string, preferHttps = true): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return (preferHttps ? 'https://' : 'http://') + url
}

/** Extract hostname from URL, stripping protocol and path */
function extractDomain(url: string): string {
  try {
    return new URL(ensureProtocol(url)).hostname
  } catch {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] ?? url
  }
}

// ── Tool handlers ───────────────────────────────────────────────────────────

/** http-headers: fetch only response headers via HEAD (or GET no-body) */
async function httpHeaders(inputs: Record<string, string>): Promise<ToolResult> {
  const url = ensureProtocol(inputs.url ?? '')
  if (!url) throw new Error('url is required')

  const res = await fetch(url, {
    method: 'HEAD',
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  })

  const headers: Record<string, string> = {}
  res.headers.forEach((value, key) => {
    headers[key] = value
  })

  return {
    url,
    status: res.status,
    statusText: res.statusText,
    headers,
  }
}

/** redirect-checker: manually follow redirect chain up to 10 hops */
async function redirectChecker(inputs: Record<string, string>): Promise<ToolResult> {
  const startUrl = ensureProtocol(inputs.url ?? '')
  if (!startUrl) throw new Error('url is required')

  const chain: Array<{ url: string; status: number; location: string | null }> = []
  let currentUrl = startUrl
  const maxHops = 10

  for (let i = 0; i < maxHops; i++) {
    const res = await fetch(currentUrl, {
      method: 'HEAD',
      redirect: 'manual',
      signal: AbortSignal.timeout(8000),
    })

    const location = res.headers.get('location')
    chain.push({ url: currentUrl, status: res.status, location })

    // Stop if not a redirect
    if (res.status < 300 || res.status >= 400 || !location) break

    // Resolve relative redirects
    try {
      currentUrl = new URL(location, currentUrl).href
    } catch {
      currentUrl = location
    }
  }

  const final = chain[chain.length - 1]
  return {
    chain,
    hops: chain.length,
    final_url: final?.url ?? startUrl,
    final_status: final?.status ?? null,
    has_redirect: chain.length > 1,
    redirect_type:
      chain.length > 1
        ? chain[0]?.status === 301
          ? '301 Permanent'
          : chain[0]?.status === 302
            ? '302 Temporary'
            : `${chain[0]?.status}`
        : 'None',
  }
}

/** ssl-checker: verify HTTPS reachability and extract best-effort cert info */
async function sslChecker(inputs: Record<string, string>): Promise<ToolResult> {
  let url = inputs.url ?? ''
  if (!url) throw new Error('url is required')

  // Force HTTPS
  url = url.replace(/^http:\/\//, 'https://')
  if (!url.startsWith('https://')) url = 'https://' + url

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })

    // In Next.js serverless/Node.js fetch we can't get raw TLS cert info
    // We return best-effort info: whether HTTPS works and the response URL
    return {
      valid: res.ok || res.status < 500,
      https_reachable: true,
      final_url: res.url,
      status: res.status,
      expires: 'N/A — low-level TLS access not available in this environment',
      issuer: 'N/A',
      subject: extractDomain(res.url),
      note: 'Full certificate details require a dedicated TLS inspection service. HTTPS connection succeeded, which confirms a valid certificate is present.',
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const isCertError =
      message.includes('certificate') ||
      message.includes('SSL') ||
      message.includes('TLS') ||
      message.includes('CERT')

    return {
      valid: false,
      https_reachable: false,
      error: message,
      cert_error: isCertError,
      expires: null,
      issuer: null,
      subject: null,
    }
  }
}

/** robots-tester: fetch robots.txt and check if test_url is blocked */
async function robotsTester(inputs: Record<string, string>): Promise<ToolResult> {
  const domain = extractDomain(inputs.url ?? inputs.domain ?? '')
  if (!domain) throw new Error('url or domain is required')

  const robotsUrl = `https://${domain}/robots.txt`
  const testUrl = inputs.test_url ?? ''

  let rawContent = ''
  let fetchError: string | null = null

  try {
    const res = await fetch(robotsUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      fetchError = `HTTP ${res.status} — robots.txt not found or inaccessible`
    } else {
      rawContent = await res.text()
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  // Simple robots.txt parser — check if test_url is disallowed for Googlebot or *
  let isBlocked = false
  let blockingRule: string | null = null

  if (rawContent && testUrl) {
    const lines = rawContent.split('\n').map(l => l.trim())
    let currentAgent = ''
    let applyToAll = false
    let applyToGoogle = false

    for (const line of lines) {
      if (line.startsWith('#') || line === '') continue

      if (line.toLowerCase().startsWith('user-agent:')) {
        const agent = line.slice('user-agent:'.length).trim().toLowerCase()
        currentAgent = agent
        applyToAll = agent === '*'
        applyToGoogle = agent === 'googlebot'
        continue
      }

      if (line.toLowerCase().startsWith('disallow:') && (applyToAll || applyToGoogle)) {
        const path = line.slice('disallow:'.length).trim()
        if (path && testUrl.includes(path)) {
          isBlocked = true
          blockingRule = `User-agent: ${currentAgent} → Disallow: ${path}`
          break
        }
      }
    }
  }

  return {
    robots_url: robotsUrl,
    fetch_error: fetchError,
    content: rawContent || null,
    test_url: testUrl || null,
    is_blocked: testUrl ? isBlocked : null,
    blocking_rule: blockingRule,
    has_sitemap: rawContent.toLowerCase().includes('sitemap:'),
  }
}

/** sitemap-validator: fetch sitemap, validate XML, return URL count and preview */
async function sitemapValidator(inputs: Record<string, string>): Promise<ToolResult> {
  let url = ensureProtocol(inputs.url ?? inputs.sitemap_url ?? '')
  if (!url) throw new Error('url is required')

  const res = await fetch(url, { signal: AbortSignal.timeout(12000) })
  if (!res.ok) throw new Error(`HTTP ${res.status} — sitemap not found`)

  const text = await res.text()

  // Basic XML validation
  const isXml = text.trim().startsWith('<?xml') || text.trim().startsWith('<urlset') || text.trim().startsWith('<sitemapindex')
  const isSitemapIndex = text.includes('<sitemapindex')

  // Extract URLs from <loc> tags
  const locMatches = text.match(/<loc>(.*?)<\/loc>/g) ?? []
  const urls = locMatches
    .map(m => m.replace(/<\/?loc>/g, '').trim())
    .filter(Boolean)

  // Extract last modified dates
  const lastmodMatches = text.match(/<lastmod>(.*?)<\/lastmod>/g) ?? []
  const lastmods = lastmodMatches.map(m => m.replace(/<\/?lastmod>/g, '').trim())

  return {
    sitemap_url: url,
    is_valid_xml: isXml,
    is_sitemap_index: isSitemapIndex,
    url_count: urls.length,
    preview_urls: urls.slice(0, 10),
    has_lastmod: lastmods.length > 0,
    latest_lastmod: lastmods[0] ?? null,
    content_length: text.length,
  }
}

/** canonical-checker: fetch page and parse <link rel="canonical"> */
async function canonicalChecker(inputs: Record<string, string>): Promise<ToolResult> {
  const url = ensureProtocol(inputs.url ?? '')
  if (!url) throw new Error('url is required')

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AdSenseCheckerBot/1.0)' },
    signal: AbortSignal.timeout(12000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const html = await res.text()

  // Parse <link rel="canonical" href="...">
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)

  const canonical = match?.[1] ?? null
  const finalUrl = res.url

  return {
    checked_url: url,
    final_url: finalUrl,
    canonical_tag: canonical,
    has_canonical: canonical !== null,
    is_self_referencing: canonical === url || canonical === finalUrl,
    redirected: url !== finalUrl,
  }
}

/** ads-txt: fetch /ads.txt and check for pub_id */
async function adsTxt(inputs: Record<string, string>): Promise<ToolResult> {
  const domain = extractDomain(inputs.url ?? inputs.domain ?? '')
  if (!domain) throw new Error('url or domain is required')

  const adsTxtUrl = `https://${domain}/ads.txt`
  const pubId = inputs.pub_id ?? ''

  let rawContent = ''
  let fetchError: string | null = null

  try {
    const res = await fetch(adsTxtUrl, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) {
      fetchError = `HTTP ${res.status} — ads.txt not found`
    } else {
      rawContent = await res.text()
    }
  } catch (err) {
    fetchError = err instanceof Error ? err.message : String(err)
  }

  // Parse ads.txt entries
  const entries = rawContent
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(line => {
      const parts = line.split(',').map(p => p.trim())
      return {
        domain: parts[0] ?? '',
        publisher_id: parts[1] ?? '',
        relationship: parts[2] ?? '',
        cert_authority_id: parts[3] ?? '',
      }
    })

  const pubIdFound = pubId
    ? entries.some(e => e.publisher_id.toLowerCase() === pubId.toLowerCase())
    : null

  return {
    ads_txt_url: adsTxtUrl,
    fetch_error: fetchError,
    content: rawContent || null,
    entry_count: entries.length,
    entries: entries.slice(0, 20),
    pub_id_checked: pubId || null,
    pub_id_found: pubIdFound,
    has_google_adsense: entries.some(e =>
      e.domain.toLowerCase() === 'google.com' && e.publisher_id.toLowerCase().startsWith('pub-')
    ),
  }
}

/** domain-age: use RDAP to get domain registration date */
async function domainAge(inputs: Record<string, string>): Promise<ToolResult> {
  const domain = extractDomain(inputs.url ?? inputs.domain ?? '')
  if (!domain) throw new Error('url or domain is required')

  // Use the RDAP bootstrap to find the correct server
  try {
    const rdapUrl = `https://rdap.org/domain/${domain}`
    const res = await fetch(rdapUrl, {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) throw new Error(`RDAP query failed: HTTP ${res.status}`)

    const data = await res.json() as {
      events?: Array<{ eventAction: string; eventDate: string }>
      entities?: Array<{ roles: string[]; publicIds?: Array<{ identifier: string }>; handle?: string }>
      nameservers?: Array<{ ldhName: string }>
      status?: string[]
    }

    // Parse events
    const events: Record<string, string> = {}
    for (const ev of (data.events ?? [])) {
      if (ev.eventAction && ev.eventDate) events[ev.eventAction] = ev.eventDate
    }

    const registeredOn = events['registration'] ?? events['registered'] ?? null
    const expiresOn = events['expiration'] ?? events['expires'] ?? null
    const updatedOn = events['last changed'] ?? null

    let domainAgeDays: number | null = null
    let domainAgeMonths: number | null = null
    let domainAgeYears: number | null = null

    if (registeredOn) {
      const regDate = new Date(registeredOn)
      const now = new Date()
      domainAgeDays = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))
      domainAgeMonths = Math.floor(domainAgeDays / 30)
      domainAgeYears = parseFloat((domainAgeDays / 365).toFixed(2))
    }

    let isExpiringSoon = false
    if (expiresOn) {
      const expDate = new Date(expiresOn)
      const daysUntilExpiry = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      isExpiringSoon = daysUntilExpiry <= 60
    }

    return {
      domain,
      registered_on: registeredOn,
      expires_on: expiresOn,
      updated_on: updatedOn,
      domain_age_days: domainAgeDays,
      domain_age_months: domainAgeMonths,
      domain_age_years: domainAgeYears,
      is_new_domain: (domainAgeDays ?? 999) < 180,
      is_expiring_soon: isExpiringSoon,
      status: data.status ?? [],
    }
  } catch (err) {
    // Fallback: try the internal /api/whois GET endpoint
    throw err
  }
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // Auth — allow unauthenticated access (free public tools)
    await getAuthenticatedProfile(request.headers.get('authorization'))

    const body = await request.json()
    const { tool, inputs } = body as { tool: string; inputs: Record<string, string> }

    if (!tool) {
      return NextResponse.json({ success: false, error: 'tool is required' }, { status: 400 })
    }

    let result: ToolResult

    switch (tool) {
      case 'http-headers':
        result = await httpHeaders(inputs ?? {})
        break
      case 'redirect-checker':
        result = await redirectChecker(inputs ?? {})
        break
      case 'ssl-checker':
        result = await sslChecker(inputs ?? {})
        break
      case 'robots-tester':
        result = await robotsTester(inputs ?? {})
        break
      case 'sitemap-validator':
        result = await sitemapValidator(inputs ?? {})
        break
      case 'canonical-checker':
        result = await canonicalChecker(inputs ?? {})
        break
      case 'ads-txt':
        result = await adsTxt(inputs ?? {})
        break
      case 'domain-age':
        result = await domainAge(inputs ?? {})
        break
      default:
        return NextResponse.json({ success: false, error: `Unknown tool: ${tool}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('[/api/dev-tools] Error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
