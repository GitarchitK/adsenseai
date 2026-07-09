'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  ArrowLeft, Sparkles, Copy, CheckCircle2, Loader2,
  AlertCircle, ExternalLink, Zap
} from 'lucide-react'
import { getToolById, type ToolDef, type ToolInput } from '@/lib/tool-catalog'
import { useProfile } from '@/hooks/use-profile'
import * as LucideIcons from 'lucide-react'

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }>
  if (!Icon) return <Sparkles className={className} />
  return <Icon className={className} />
}

// ── Client-side calculators ───────────────────────────────────────────────────

function WordCountResult({ inputs }: { inputs: Record<string, string> }) {
  const text = inputs.content || ''
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const sentences = text.split(/[.!?]+/).filter(Boolean).length
  const paragraphs = text.split(/\n\n+/).filter(Boolean).length
  const readingTime = Math.ceil(words / 200)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
      {[
        { label: 'Words', value: words.toLocaleString(), color: 'text-violet-400' },
        { label: 'Characters', value: chars.toLocaleString(), color: 'text-blue-400' },
        { label: 'Chars (no spaces)', value: charsNoSpace.toLocaleString(), color: 'text-emerald-400' },
        { label: 'Sentences', value: sentences.toLocaleString(), color: 'text-amber-400' },
        { label: 'Paragraphs', value: paragraphs.toLocaleString(), color: 'text-rose-400' },
        { label: 'Reading Time', value: `~${readingTime} min`, color: 'text-indigo-400' },
      ].map(({ label, value, color }) => (
        <Card key={label} className="p-4 border-border/40 rounded-xl bg-muted/20 text-center">
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </Card>
      ))}
    </div>
  )
}

function CpcResult({ inputs }: { inputs: Record<string, string> }) {
  const impressions = parseFloat(inputs.impressions) || 0
  const clicks = parseFloat(inputs.clicks) || 0
  const earnings = parseFloat(inputs.earnings) || 0

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'
  const cpc = clicks > 0 ? (earnings / clicks).toFixed(2) : '0.00'
  const rpm = impressions > 0 ? ((earnings / impressions) * 1000).toFixed(2) : '0.00'
  const cpm = rpm

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
      {[
        { label: 'CTR', value: `${ctr}%`, desc: 'Click-through rate', color: 'text-violet-400' },
        { label: 'CPC', value: `₹${cpc}`, desc: 'Cost per click', color: 'text-emerald-400' },
        { label: 'RPM', value: `₹${rpm}`, desc: 'Revenue per 1000 impressions', color: 'text-amber-400' },
        { label: 'CPM', value: `₹${cpm}`, desc: 'Cost per 1000 impressions', color: 'text-blue-400' },
      ].map(({ label, value, desc, color }) => (
        <Card key={label} className="p-4 border-border/40 rounded-xl bg-muted/20 text-center">
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
        </Card>
      ))}
    </div>
  )
}

function RevenueResult({ inputs }: { inputs: Record<string, string> }) {
  const views = parseFloat(inputs.monthly_visitors) || 0
  const niche = inputs.niche || 'Other'
  const region = inputs.region || 'Rest of World (Tier 3)'

  // CPC and CTR estimates by niche and region
  const nicheRpm: Record<string, number> = {
    'Finance': 8, 'Technology': 5, 'Health': 6, 'Food & Cooking': 3,
    'Travel': 4, 'Education': 4.5, 'Entertainment': 2, 'Lifestyle': 3,
    'News': 2.5, 'Other': 3,
  }
  const regionMult: Record<string, number> = {
    'USA/UK/AU (Tier 1)': 1.0,
    'India/South Asia (Tier 2)': 0.2,
    'Rest of World (Tier 3)': 0.35,
  }

  const baseRpm = nicheRpm[niche] ?? 3
  const mult = regionMult[region] ?? 0.35
  const rpm = baseRpm * mult
  const monthlyEarnings = (views / 1000) * rpm
  const low = monthlyEarnings * 0.7
  const high = monthlyEarnings * 1.4

  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 border-border/40 rounded-xl bg-muted/20 text-center">
          <p className="text-xl font-bold text-rose-400">₹{Math.round(low).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Conservative</p>
        </Card>
        <Card className="p-4 border-border/40 rounded-xl bg-emerald-500/10 border-emerald-500/20 text-center">
          <p className="text-xl font-bold text-emerald-400">₹{Math.round(monthlyEarnings).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Estimated / mo</p>
        </Card>
        <Card className="p-4 border-border/40 rounded-xl bg-muted/20 text-center">
          <p className="text-xl font-bold text-violet-400">₹{Math.round(high).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Optimistic</p>
        </Card>
      </div>
      <div className="text-xs text-muted-foreground bg-muted/30 rounded-xl p-4 space-y-1">
        <p>📊 Estimated RPM: <strong>₹{rpm.toFixed(2)}</strong> per 1000 page views</p>
        <p>🌍 Region multiplier: <strong>{(mult * 100).toFixed(0)}%</strong> of US baseline</p>
        <p>💡 Tip: Finance + Tier 1 traffic earns 10-40x more than entertainment + Tier 3.</p>
      </div>
    </div>
  )
}

// ── Main tool page ────────────────────────────────────────────────────────────

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const resolvedParams = use(params)
  const { toolId } = resolvedParams
  const router = useRouter()
  const { token } = useProfile()

  const tool = getToolById(toolId)

  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [output, setOutput] = useState<string | null>(null)
  const [outputObj, setOutputObj] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // For live calculators — compute instantly
  const isCalculator = tool?.type === 'calculator'
  useEffect(() => {
    if (isCalculator && Object.keys(inputs).length > 0) setShowResult(true)
  }, [inputs, isCalculator])

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-lg font-bold">Tool not found</h2>
        <p className="text-muted-foreground text-sm">This tool doesn't exist or has been moved.</p>
        <Link href="/dashboard/tools">
          <Button variant="outline">← Back to Tools</Button>
        </Link>
      </div>
    )
  }

  // Tools that redirect to another page
  if (tool.apiRoute?.startsWith('/dashboard')) {
    router.push(tool.apiRoute)
    return null
  }

  const handleInputChange = (id: string, val: string) => {
    setInputs(prev => ({ ...prev, [id]: val }))
  }

  const handleSubmit = async () => {
    if (!tool) return
    setLoading(true)
    setError(null)
    setOutput(null)
    setOutputObj(null)

    try {
      // Client-side tools — no API needed
      if (tool.type === 'calculator') {
        setShowResult(true)
        setLoading(false)
        return
      }

      // Server-side fetcher or AI tools
      const isDevTool = tool.type === 'fetcher' && !tool.apiRoute
      const apiUrl = isDevTool ? '/api/dev-tools' : '/api/ai/tools'

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tool: tool.id, inputs }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.')
      } else if (typeof data.output === 'string') {
        setOutput(data.output)
      } else if (data.output || data.result) {
        setOutputObj(data.output ?? data.result)
        setOutput(JSON.stringify(data.output ?? data.result, null, 2))
      }
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const requiredFilled = tool.inputs
    .filter(i => i.required)
    .every(i => (inputs[i.id] ?? '').trim().length > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
          <Link href="/dashboard/tools" className="hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> All Tools
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{tool.name}</span>
        </div>

        {/* Tool Header */}
        <div className="flex items-start gap-4 mb-8">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${tool.color} flex-shrink-0`}>
            <DynamicIcon name={tool.icon} className={`h-7 w-7 ${tool.textColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{tool.name}</h1>
              {tool.badge && (
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest
                  ${tool.badge === 'Popular' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' :
                    tool.badge === 'New' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
                  {tool.badge === 'AI' ? '✦ AI' : tool.badge}
                </span>
              )}
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                FREE
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">{tool.description}</p>
          </div>
        </div>

        {/* Input Form */}
        {tool.inputs.length > 0 && (
          <Card className="p-6 border-border/40 rounded-2xl mb-6">
            <div className="space-y-5">
              {tool.inputs.map((input: ToolInput) => (
                <div key={input.id} className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">
                    {input.label}
                    {input.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  {input.description && (
                    <p className="text-xs text-muted-foreground">{input.description}</p>
                  )}

                  {input.type === 'textarea' ? (
                    <Textarea
                      placeholder={input.placeholder}
                      rows={input.rows ?? 4}
                      value={inputs[input.id] ?? ''}
                      onChange={e => handleInputChange(input.id, e.target.value)}
                      className="resize-none bg-muted/20 border-border/60 rounded-xl text-sm"
                    />
                  ) : input.type === 'select' ? (
                    <Select
                      value={inputs[input.id] ?? ''}
                      onValueChange={val => handleInputChange(input.id, val)}
                    >
                      <SelectTrigger className="bg-muted/20 border-border/60 rounded-xl">
                        <SelectValue placeholder={`Select ${input.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {input.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={input.type === 'url' ? 'url' : input.type === 'number' ? 'number' : 'text'}
                      placeholder={input.placeholder}
                      value={inputs[input.id] ?? ''}
                      onChange={e => handleInputChange(input.id, e.target.value)}
                      min={input.min}
                      max={input.max}
                      className="bg-muted/20 border-border/60 rounded-xl"
                    />
                  )}
                </div>
              ))}
            </div>

            {tool.type !== 'calculator' && (
              <Button
                onClick={handleSubmit}
                disabled={loading || !requiredFilled}
                className="mt-6 w-full h-11 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-900/30 transition-all"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running…</>
                ) : (
                  <><Zap className="h-4 w-4 mr-2" /> {tool.type === 'fetcher' ? 'Check' : 'Generate'}</>
                )}
              </Button>
            )}
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 mb-4 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Output */}
        {(output || showResult) && (
          <Card className="border-border/40 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-muted/20">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-foreground">{tool.outputLabel ?? 'Result'}</span>
              </div>
              {output && (
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-7 px-2 text-xs gap-1">
                  {copied ? <><CheckCircle2 className="h-3 w-3 text-emerald-400" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                </Button>
              )}
            </div>

            <div className="p-5">
              {/* Calculator-specific outputs */}
              {tool.id === 'word-count' && <WordCountResult inputs={inputs} />}
              {tool.id === 'cpc-calculator' && <CpcResult inputs={inputs} />}
              {tool.id === 'revenue-estimator' && <RevenueResult inputs={inputs} />}

              {/* AI / Fetcher text output */}
              {output && tool.type !== 'calculator' && (
                <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-sans">
                  {output}
                </pre>
              )}
            </div>
          </Card>
        )}

      </div>
    </div>
  )
}
