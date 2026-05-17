'use client'

import { useState, useEffect } from 'react'
import { getCurrencyConfig, type CurrencyConfig } from '@/lib/pricing'

interface UseCurrencyResult {
  currency: CurrencyConfig
  country: string
  loading: boolean
}

// Module-level cache so we only fetch once per page load
let cachedCountry: string | null = null

export function useCurrency(): UseCurrencyResult {
  const [country, setCountry] = useState<string>(cachedCountry ?? 'IN')
  const [loading, setLoading] = useState(!cachedCountry)

  useEffect(() => {
    if (cachedCountry) {
      setCountry(cachedCountry)
      setLoading(false)
      return
    }

    fetch('/api/geo')
      .then(r => r.json())
      .then(data => {
        const c = data.country ?? 'IN'
        cachedCountry = c
        setCountry(c)
      })
      .catch(() => {
        cachedCountry = 'IN'
        setCountry('IN')
      })
      .finally(() => setLoading(false))
  }, [])

  return {
    currency: getCurrencyConfig(country),
    country,
    loading,
  }
}
