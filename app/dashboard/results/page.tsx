'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const s = sessionStorage.getItem('lastCrawlData')
      if (s) {
        const parsed = JSON.parse(s)
        setData(parsed)
        if (parsed.scan_id) {
          router.replace(`/dashboard/scans/${parsed.scan_id}`)
        } else {
          setError('Invalid scan reference. Please retry.')
        }
      } else {
        setError('No scan data found. Please run a scan first.')
      }
    } catch { 
      setError('Failed to load results.') 
    } finally { 
      setLoading(false) 
    }
  }, [router])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Redirecting to your full consultant report...</p>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
      <p className="text-sm text-red-500 font-medium">{error}</p>
      <Link href="/dashboard">
        <Button variant="outline" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Redirecting to your report...</p>
    </div>
  )
}

function Button({ children, className, variant, ...props }: any) {
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-xl text-xs font-semibold h-10 px-4 border border-border/40 hover:bg-muted/40 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
