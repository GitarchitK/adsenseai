'use client'

import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import type { UserProfile } from '@/lib/firebase-types'
import { PLANS } from '@/lib/plans'

export interface Usage {
  scans_this_month: number
  scans_limit: number
  total_scans: number
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [usage, setUsage] = useState<Usage | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)
  const [guestId, setGuestId] = useState<string | null>(null)

  const fetchProfile = useCallback(async (idToken: string | null, gId: string | null) => {
    try {
      const headers: Record<string, string> = {}
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`
      if (gId) headers['x-guest-id'] = gId

      const res = await fetch('/api/profile', { headers })
      if (res.ok) {
        const data = await res.json()
        setProfile(data.profile)
        setUsage(data.usage)
      } else {
        console.warn('[useProfile] /api/profile returned', res.status)
      }
    } catch (err) {
      console.error('[useProfile] fetch error:', err)
    }
  }, [])

  useEffect(() => {
    let gid = typeof window !== 'undefined' ? localStorage.getItem('adsense_guest_id') : null
    if (typeof window !== 'undefined' && !gid) {
      gid = 'guest_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now().toString(36)
      localStorage.setItem('adsense_guest_id', gid)
    }
    setGuestId(gid)

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken()
        setToken(idToken)
        await fetchProfile(idToken, null)
      } else {
        setToken(null)
        await fetchProfile(null, gid)
      }
      setIsLoading(false)
    })
    return () => unsub()
  }, [fetchProfile])

  const getToken = useCallback(async (): Promise<string | null> => {
    const user = auth.currentUser
    if (!user) return null
    const fresh = await user.getIdToken()
    setToken(fresh)
    return fresh
  }, [])

  const isPro = profile?.plan === 'pro'
  const limit = profile ? PLANS[profile.plan].scans_per_month : 1
  const used  = usage?.scans_this_month ?? 0
  const canScan = true

  return { profile, usage, token, guestId, isLoading, isPro, canScan, getToken }
}
