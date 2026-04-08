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

  const fetchProfile = useCallback(async (idToken: string) => {
    try {
      const res = await fetch('/api/profile', {
        headers: { Authorization: `Bearer ${idToken}` },
      })
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
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken()
        setToken(idToken)
        await fetchProfile(idToken)
      } else {
        setProfile(null)
        setUsage(null)
        setToken(null)
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
  const canScan = used < limit

  return { profile, usage, token, isLoading, isPro, canScan, getToken }
}
