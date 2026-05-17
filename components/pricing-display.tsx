'use client'

import { useCurrency } from '@/hooks/use-currency'

/**
 * Renders a localized price string.
 * Falls back to the INR price while geo is loading.
 */
interface PriceProps {
  inr: string          // e.g. '₹19' or '₹199/mo'
  className?: string
}

export function LocalPrice({ inr, className }: PriceProps) {
  const { currency, loading, country } = useCurrency()

  if (loading) return <span className={className}>{inr}</span>

  // For Indian users just show INR as-is
  if (country === 'IN') return <span className={className}>{inr}</span>

  // For others show local currency equivalent
  const localPrice = inr.includes('199') ? currency.proMonthly.replace('/mo', '') : currency.reportUnlock
  return (
    <span className={className} title={`≈ ${inr} (charged in INR)`}>
      {localPrice}
    </span>
  )
}

/**
 * Small currency badge shown to non-Indian users below prices.
 */
export function CurrencyNote({ inr }: { inr: string }) {
  const { country, currency, loading } = useCurrency()
  if (loading || country === 'IN') return null
  return (
    <p className="text-[10px] text-muted-foreground/60 mt-0.5">
      ≈ {inr} · charged in INR
    </p>
  )
}
