'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Clock, Crown, Globe, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useProfile } from '@/hooks/use-profile'

interface ScanRow {
  id: string
  websiteUrl: string
  domain: string
  finalScore: number | null
  statusLabel: string | null
  isDetailed: boolean
  createdAt: string
}

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 ring-emerald-200 dark:ring-emerald-800/50' :
    score >= 60 ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 ring-amber-200 dark:ring-amber-800/50' :
                  'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 ring-red-200 dark:ring-red-800/50'
  return (
    <div className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 text-sm font-bold flex-shrink-0 ${color}`}>
      {score}
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  const style =
    label === 'High Chance' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
    label === 'Moderate'    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                              'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${style}`}>{label}</span>
}

export default function ScansPage() {
  const { token, isLoading, getToken } = useProfile()
  const [scans, setScans] = useState<ScanRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) return
    getToken().then(t => {
      if (!t) { setLoading(false); return }
      fetch('/api/scans?limit=50', { headers: { Authorization: `Bearer ${t}` } })
        .then(r => r.ok ? r.json() : { scans: [] })
        .then(d => setScans(d.scans ?? []))
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [token, getToken])

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="h-8 w-40 bg-muted rounded-lg animate-pulse mb-8" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-[72px] rounded-xl bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Scans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {scans.length} scan{scans.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="gap-2 shadow-sm shadow-primary/20">
            <Search className="h-4 w-4" /> New Scan
          </Button>
        </Link>
      </div>

      {scans.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-border/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mx-auto mb-4">
            <TrendingUp className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-foreground mb-1">No scans yet</p>
          <p className="text-sm text-muted-foreground mb-6">Run your first website analysis to see results here.</p>
          <Link href="/dashboard">
            <Button className="gap-2">Go to Dashboard <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {scans.map((scan) => (
            <Link key={scan.id} href={`/dashboard/scans/${scan.id}`}>
              <Card className="p-4 border-border/60 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  {/* Domain icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted flex-shrink-0">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {scan.domain || scan.websiteUrl}
                      </p>
                      {scan.isDetailed && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                          <Crown className="h-2.5 w-2.5" /> AI
                        </span>
                      )}
                      {scan.statusLabel && <StatusBadge label={scan.statusLabel} />}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="h-3 w-3" />
                      {new Date(scan.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {/* Score */}
                  {scan.finalScore !== null && <ScoreCircle score={scan.finalScore} />}

                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
