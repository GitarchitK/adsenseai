'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles, FileText, PenLine, Search, Crown,
  Copy, CheckCircle2, Lock,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { UpgradeModal } from '@/components/upgrade-modal'

// ── Locked tool preview ───────────────────────────────────────────────────────

function LockedTool({
  icon, title, description, onUnlock,
}: {
  icon: React.ReactNode; title: string; description: string; onUnlock: () => void
}) {
  return (
    <Card
      className="p-6 relative overflow-hidden cursor-pointer group border-border/60 hover:border-violet-300 dark:hover:border-violet-700 transition-colors"
      onClick={onUnlock}
    >
      {/* Blurred content preview */}
      <div className="blur-sm pointer-events-none select-none space-y-3" aria-hidden>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="h-10 rounded-lg bg-muted w-full" />
        <div className="h-10 rounded-lg bg-muted w-3/4" />
        <div className="h-9 rounded-lg bg-primary/20 w-32" />
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 backdrop-blur-[2px] group-hover:bg-background/60 transition-colors">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800/50">
          <Lock className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="text-center">
          <p className="font-bold text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">Pro feature</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30 px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800/50 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/50 transition-colors">
          <Crown className="h-3.5 w-3.5" /> Unlock with Pro
        </div>
      </div>
    </Card>
  )
}

// ── Active tool card ──────────────────────────────────────────────────────────

function ToolCard({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode
}) {
  return (
    <Card className="p-6 border-border/60">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </Card>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AIToolsPage() {
  const { token, isPro, isLoading, getToken } = useProfile()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalFeature, setModalFeature] = useState('')

  // Privacy Policy
  const [ppDomain, setPpDomain] = useState('')
  const [ppBusiness, setPpBusiness] = useState('')
  const [ppResult, setPpResult] = useState('')
  const [ppLoading, setPpLoading] = useState(false)
  const [ppCopied, setPpCopied] = useState(false)

  // Content Rewrite
  const [rwContent, setRwContent] = useState('')
  const [rwResult, setRwResult] = useState('')
  const [rwImprovements, setRwImprovements] = useState<string[]>([])
  const [rwLoading, setRwLoading] = useState(false)

  // SEO Suggestions
  const [seoDomain, setSeoDomain] = useState('')
  const [seoResult, setSeoResult] = useState<Array<{ title: string; description: string; priority: string }>>([])
  const [seoLoading, setSeoLoading] = useState(false)

  const openUpgrade = (feature: string) => {
    setModalFeature(feature)
    setModalOpen(true)
  }

  const getAuthHeader = async () => {
    const t = await getToken()
    return { Authorization: `Bearer ${t}` }
  }

  const generatePrivacyPolicy = async () => {
    if (!ppDomain) return
    setPpLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/privacy-policy', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: ppDomain, business_name: ppBusiness }),
    })
    const data = await res.json()
    setPpResult(data.policy ?? data.error ?? 'Failed to generate.')
    setPpLoading(false)
  }

  const copyPolicy = () => {
    navigator.clipboard.writeText(ppResult)
    setPpCopied(true)
    setTimeout(() => setPpCopied(false), 2000)
  }

  const rewriteContent = async () => {
    if (!rwContent) return
    setRwLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/rewrite', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: rwContent }),
    })
    const data = await res.json()
    setRwResult(data.rewritten ?? '')
    setRwImprovements(data.improvements ?? [])
    setRwLoading(false)
  }

  const getSeoSuggestions = async () => {
    if (!seoDomain) return
    setSeoLoading(true)
    const headers = await getAuthHeader()
    const res = await fetch('/api/ai/seo-suggestions', {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: seoDomain, pages: [] }),
    })
    const data = await res.json()
    setSeoResult(data.suggestions ?? [])
    setSeoLoading(false)
  }

  if (isLoading) return null

  return (
    <>
      <UpgradeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        feature={modalFeature}
      />

      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
              <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground">AI Tools</h1>
              <p className="text-sm text-muted-foreground">
                {isPro ? 'Pro-exclusive tools to improve your AdSense readiness' : 'Upgrade to Pro to unlock all AI tools'}
              </p>
            </div>
          </div>

          {!isPro && (
            <div
              className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-violet-200 dark:border-violet-800/50 bg-violet-50 dark:bg-violet-950/20 px-5 py-4 cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-950/30 transition-colors"
              onClick={() => openUpgrade('AI Tools')}
            >
              <div className="flex items-center gap-3">
                <Crown className="h-5 w-5 text-violet-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground text-sm">Unlock all AI tools with Pro</p>
                  <p className="text-xs text-muted-foreground">₹199/month · 200 scans · Cancel anytime</p>
                </div>
              </div>
              <Button
                size="sm"
                className="gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-sm shadow-violet-500/25 flex-shrink-0"
                onClick={e => { e.stopPropagation(); openUpgrade('AI Tools') }}
              >
                <Crown className="h-3.5 w-3.5" /> Upgrade
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-5">
          {/* Privacy Policy Generator */}
          {isPro ? (
            <ToolCard icon={<FileText className="h-4 w-4" />} title="Privacy Policy Generator" description="Generate an AdSense-compliant Privacy Policy for your site">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="yourdomain.com" value={ppDomain} onChange={e => setPpDomain(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                  <Input placeholder="Business name (optional)" value={ppBusiness} onChange={e => setPpBusiness(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                </div>
                <Button onClick={generatePrivacyPolicy} disabled={ppLoading || !ppDomain} className="gap-2 rounded-xl">
                  {ppLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Policy</>}
                </Button>
                {ppResult && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">Generated Policy</p>
                      <Button variant="ghost" size="sm" onClick={copyPolicy} className="gap-1.5 text-xs">
                        {ppCopied ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                      </Button>
                    </div>
                    <div className="rounded-xl bg-muted p-4 text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                      {ppResult}
                    </div>
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<FileText className="h-4 w-4" />} title="Privacy Policy Generator" description="Generate an AdSense-compliant Privacy Policy" onUnlock={() => openUpgrade('Privacy Policy Generator')} />
          )}

          {/* Content Rewriter */}
          {isPro ? (
            <ToolCard icon={<PenLine className="h-4 w-4" />} title="Content Rewriter" description="Improve low-quality content to meet AdSense standards">
              <div className="space-y-3">
                <textarea
                  className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[120px] resize-y"
                  placeholder="Paste your content here to rewrite it for better quality..."
                  value={rwContent}
                  onChange={e => setRwContent(e.target.value)}
                />
                <Button onClick={rewriteContent} disabled={rwLoading || !rwContent} className="gap-2 rounded-xl">
                  {rwLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Rewriting...</> : <><PenLine className="h-4 w-4" /> Rewrite Content</>}
                </Button>
                {rwResult && (
                  <div className="space-y-3 mt-2">
                    {rwImprovements.length > 0 && (
                      <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 p-3">
                        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Improvements made:</p>
                        <ul className="space-y-1">
                          {rwImprovements.map((imp, i) => (
                            <li key={i} className="text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" /> {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="rounded-xl bg-muted p-4 text-sm text-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {rwResult}
                    </div>
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<PenLine className="h-4 w-4" />} title="Content Rewriter" description="Improve low-quality content to meet AdSense standards" onUnlock={() => openUpgrade('Content Rewriter')} />
          )}

          {/* SEO Suggestions */}
          {isPro ? (
            <ToolCard icon={<Search className="h-4 w-4" />} title="SEO Optimization" description="Get targeted SEO suggestions for your domain">
              <div className="space-y-3">
                <Input placeholder="yourdomain.com" value={seoDomain} onChange={e => setSeoDomain(e.target.value)} className="rounded-xl bg-muted/30 border-border/80" />
                <Button onClick={getSeoSuggestions} disabled={seoLoading || !seoDomain} className="gap-2 rounded-xl">
                  {seoLoading ? <><div className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" /> Analyzing...</> : <><Search className="h-4 w-4" /> Get Suggestions</>}
                </Button>
                {seoResult.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {seoResult.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 rounded-xl border border-border/60 p-3">
                        <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${s.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : s.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-muted text-muted-foreground'}`}>
                          {s.priority}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{s.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ToolCard>
          ) : (
            <LockedTool icon={<Search className="h-4 w-4" />} title="SEO Optimization" description="Get targeted SEO suggestions for your domain" onUnlock={() => openUpgrade('SEO Optimization')} />
          )}
        </div>
      </div>
    </>
  )
}
