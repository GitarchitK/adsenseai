'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'

// Reuse the full results UI by injecting the stored scan into sessionStorage
export default function SavedScanPage() {
  const { id } = useParams<{ id: string }>()
  const { token } = useProfile()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    if (!token || !id) return
    fetch(`/api/scans/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(({ scan }) => {
        if (!scan) { setStatus('error'); return }
        // Reconstruct the shape the results page expects
        const payload = {
          ...(scan.scores ?? {}),
          success: true,
          pages: [],
          site_structure: { has_privacy: false, has_about: false, has_contact: false, has_terms: false },
          total_pages: 0,
          domain: scan.domain,
          crawl_time_ms: 0,
          scores: scan.scores,
          ai_report: scan.ai_report,
        }
        sessionStorage.setItem('lastCrawlData', JSON.stringify(payload))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [token, id])

  useEffect(() => {
    if (status === 'ready') {
      window.location.href = '/dashboard/results'
    }
  }, [status])

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/dashboard/scans">
        <Button variant="ghost" size="sm" className="gap-2 mb-6"><ArrowLeft className="h-4 w-4" /> Back to Scans</Button>
      </Link>
      <div className="flex items-center justify-center min-h-[40vh]">
        {status === 'loading' && (
          <div className="text-center space-y-3">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
            <p className="text-sm text-muted-foreground">Loading scan...</p>
          </div>
        )}
        {status === 'error' && (
          <p className="text-muted-foreground">Scan not found or you don&apos;t have access.</p>
        )}
      </div>
    </div>
  )
}
