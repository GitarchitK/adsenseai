/**
 * WHOIS / RDAP Domain Info API
 * Uses IANA RDAP bootstrap + fallback to whois.domaintools.com JSON API
 * No external library needed — pure fetch.
 */

import { NextRequest, NextResponse } from 'next/server'

export interface WhoisData {
  domain: string
  registrar?: string
  registered_on?: string   // ISO date string
  expires_on?: string      // ISO date string
  updated_on?: string      // ISO date string
  domain_age_days?: number
  domain_age_years?: number
  status?: string[]
  name_servers?: string[]
  is_new_domain: boolean   // < 6 months old
  is_expiring_soon: boolean // expires within 60 days
  error?: string
}

// RDAP bootstrap — maps TLD to RDAP server
const RDAP_BOOTSTRAP = 'https://data.iana.org/rdap/dns.json'

async function getRdapServer(tld: string): Promise<string | null> {
  try {
    const res = await fetch(RDAP_BOOTSTRAP, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json() as { services: [string[][], string[]][] }
    for (const [tlds, urls] of data.services) {
      if (tlds.flat().includes(tld.toLowerCase()) && urls[0]) {
        return urls[0]
      }
    }
    return null
  } catch {
    return null
  }
}

async function queryRdap(domain: string): Promise<WhoisData | null> {
  try {
    const parts = domain.split('.')
    const tld = parts.slice(-1)[0] ?? ''
    const rdapBase = await getRdapServer(tld)
    const baseUrl = rdapBase ?? 'https://rdap.org/'
    const url = `${baseUrl.replace(/\/$/, '')}/domain/${domain}`

    const res = await fetch(url, {
      headers: { Accept: 'application/rdap+json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null

    const data = await res.json()

    // Parse events
    const events: Record<string, string> = {}
    if (Array.isArray(data.events)) {
      for (const ev of data.events) {
        if (ev.eventAction && ev.eventDate) {
          events[ev.eventAction] = ev.eventDate
        }
      }
    }

    const registeredOn = events['registration'] ?? events['registered']
    const expiresOn    = events['expiration']   ?? events['expires']
    const updatedOn    = events['last changed'] ?? events['last update of RDAP database']

    // Domain age
    let domainAgeDays: number | undefined
    let domainAgeYears: number | undefined
    if (registeredOn) {
      const regDate = new Date(registeredOn)
      const now = new Date()
      domainAgeDays  = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24))
      domainAgeYears = parseFloat((domainAgeDays / 365).toFixed(2))
    }

    // Expiry check
    let isExpiringSoon = false
    if (expiresOn) {
      const expDate = new Date(expiresOn)
      const daysUntilExpiry = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      isExpiringSoon = daysUntilExpiry <= 60
    }

    // Registrar
    let registrar: string | undefined
    if (Array.isArray(data.entities)) {
      for (const entity of data.entities) {
        if (Array.isArray(entity.roles) && entity.roles.includes('registrar')) {
          registrar = entity.publicIds?.[0]?.identifier
            ?? entity.vcardArray?.[1]?.find((v: string[]) => v[0] === 'fn')?.[3]
            ?? entity.handle
          break
        }
      }
    }

    // Name servers
    const nameServers: string[] = []
    if (Array.isArray(data.nameservers)) {
      for (const ns of data.nameservers) {
        if (ns.ldhName) nameServers.push(ns.ldhName.toLowerCase())
      }
    }

    // Status
    const status: string[] = Array.isArray(data.status) ? data.status : []

    return {
      domain,
      registrar,
      registered_on: registeredOn,
      expires_on: expiresOn,
      updated_on: updatedOn,
      domain_age_days: domainAgeDays,
      domain_age_years: domainAgeYears,
      status,
      name_servers: nameServers.slice(0, 4),
      is_new_domain: (domainAgeDays ?? 999) < 180,
      is_expiring_soon: isExpiringSoon,
    }
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get('domain')?.toLowerCase().trim()

  if (!domain) {
    return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 })
  }

  // Strip www and protocol
  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] ?? domain

  const result = await queryRdap(cleanDomain)

  if (!result) {
    return NextResponse.json({
      domain: cleanDomain,
      is_new_domain: false,
      is_expiring_soon: false,
      error: 'WHOIS data unavailable for this domain',
    } satisfies WhoisData)
  }

  return NextResponse.json(result)
}
