'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Sparkles, FileText, Crown, Copy, CheckCircle2,
  Lock, AlertCircle, RefreshCw, Image, Download, Wand2,
  ArrowRight, Loader2, X, Check, Zap, Clock, BookOpen,
  User, MessageSquare, TrendingUp, Lightbulb, Eye, ChevronDown,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import { UpgradeModal } from '@/components/upgrade-modal'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface GeneratedArticle {
  title: string
  meta_description: string
  introduction: string
  body: string
  conclusion: string
  faq: Array<{ question: string; answer: string }>
  secondary_keywords: string[]
  estimated_read_time: string
  word_count: number
}

interface ThumbnailResult {
  image_url: string
  revised_prompt: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className={cn('flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all hover:bg-primary/5', className)}
    >
      {copied ? <><Check className="h-3 w-3 text-emerald-500" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
    </button>
  )
}

function SectionBlock({ title, icon, children, action }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <Card className="p-5 border-border/60 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">{icon}</div>
          <h3 className="font-bold text-sm text-foreground">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </Card>
  )
}

function ProBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 uppercase tracking-widest">
      <Crown className="h-2.5 w-2.5" /> Pro
    </span>
  )
}

// ── Main Studio Component ──────────────────────────────────────────────────────

export default function ArticleStudioPage() {
  const { profile, isLoading: profileLoading } = useProfile()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const [topic, setTopic] = useState('')
  const [keyword, setKeyword] = useState('')
  const [niche, setNiche] = useState('')
  const [tone, setTone] = useState('informative')
  const [targetAudience, setTargetAudience] = useState('')
  const [wordCount, setWordCount] = useState(1200)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [thumbnail, setThumbnail] = useState<ThumbnailResult | null>(null)
  const [generationTime, setGenerationTime] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')
  const [error, setError] = useState('')
  const [thumbCredits, setThumbCredits] = useState<number>(20)

  const isPro = profile?.plan === 'pro'
  const thumbLimit = isPro ? 20 : 0

  useEffect(() => {
    if (!profileLoading && !isPro) setShowUpgrade(true)
  }, [profileLoading, isPro])

  useEffect(() => {
    if (profile) {
      const currentMonth = new Date().toISOString().slice(0, 7)
      if (profile.plan === 'pro') {
        const credits = profile.thumbnailMonthKey !== currentMonth
          ? 20
          : (profile.thumbnailCreditsThisMonth ?? 20)
        setThumbCredits(credits)
      }
    }
  }, [profile])

  const handleGenerateArticle = async () => {
    if (!topic.trim()) return
    setIsGenerating(true)
    setError('')
    const start = Date.now()

    try {
      const t = localStorage.getItem('authToken')
      const res = await fetch('/api/ai/article-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify({ topic, keyword: keyword || topic, niche, tone, target_audience: targetAudience, word_count: wordCount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setGeneratedArticle(data)
      setGenerationTime(Math.round((Date.now() - start) / 1000))
      setActiveTab('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateThumbnail = async () => {
    if (!topic.trim()) return
    if (thumbCredits <= 0) {
      setError('Thumbnail credits exhausted. Upgrade to Pro or wait until next month.')
      return
    }
    setIsGeneratingThumb(true)
    setError('')

    try {
      const t = localStorage.getItem('authToken')
      const res = await fetch('/api/ai/thumbnail-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) },
        body: JSON.stringify({ topic, keyword: keyword || topic, style: 'modern blog thumbnail' }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.upgrade_required) {
          setError(`Thumbnail credits exhausted. You have 0 remaining this month.`)
          setThumbCredits(0)
        } else {
          throw new Error(data.error || 'Thumbnail generation failed')
        }
        return
      }
      setThumbnail(data)
      setThumbCredits(prev => Math.max(0, prev - 1))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thumbnail failed')
    } finally {
      setIsGeneratingThumb(false)
    }
  }

  const handleDownloadThumbnail = () => {
    if (!thumbnail?.image_url) return
    const a = document.createElement('a')
    a.href = thumbnail.image_url
    a.download = `thumbnail-${topic.slice(0, 30).replace(/\s+/g, '-')}.png`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    window.open(thumbnail.image_url, '_blank')
  }

  const articleContent = generatedArticle
    ? `${generatedArticle.title}\n\n${generatedArticle.introduction}\n\n${generatedArticle.body}\n\n${generatedArticle.conclusion}`
    : ''

  const WORD_COUNT_OPTIONS = [500, 800, 1000, 1200, 1500, 2000, 2500, 3000]
  const TONE_OPTIONS = [
    { value: 'informative', label: 'Informative', desc: 'Educational & detailed' },
    { value: 'conversational', label: 'Conversational', desc: 'Friendly & relatable' },
    { value: 'professional', label: 'Professional', desc: 'Formal & authoritative' },
    { value: 'casual', label: 'Casual', desc: 'Relaxed & personal' },
    { value: 'persuasive', label: 'Persuasive', desc: 'Compelling & action-driven' },
  ]

  if (showUpgrade && !isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <UpgradeModal open onClose={() => setShowUpgrade(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-violet-50/30 dark:to-violet-950/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/20">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">AI Article Studio</h1>
                <p className="text-sm text-muted-foreground">Generate publication-ready blog articles with thumbnails</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Thumbnail credit badge */}
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border',
              thumbCredits > 5
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400'
                : thumbCredits > 0
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400'
                : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400'
            )}>
              <Image className="h-3.5 w-3.5" />
              {thumbCredits} / {thumbLimit} thumbnails
            </div>
            <ProBadge />
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-xs font-bold gap-1.5">
                ← Back <span className="hidden sm:inline">to Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        {generatedArticle && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Word Count', value: generatedArticle.word_count.toLocaleString(), icon: <FileText className="h-4 w-4" />, color: 'text-violet-600' },
              { label: 'Read Time', value: generatedArticle.estimated_read_time, icon: <Clock className="h-4 w-4" />, color: 'text-blue-600' },
              { label: 'Keywords', value: generatedArticle.secondary_keywords.length.toString(), icon: <TrendingUp className="h-4 w-4" />, color: 'text-emerald-600' },
              { label: 'FAQ Items', value: generatedArticle.faq.length.toString(), icon: <MessageSquare className="h-4 w-4" />, color: 'text-amber-600' },
            ].map((stat) => (
              <Card key={stat.label} className="p-4 border-border/60 rounded-xl flex items-center gap-3">
                <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg bg-muted', stat.color)}>{stat.icon}</div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</p>
                  <p className="font-black text-sm text-foreground">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Input Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 border-border/60 rounded-2xl sticky top-6 space-y-5">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h2 className="font-bold text-sm">Article Configuration</h2>
              </div>

              {/* Topic */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Lightbulb className="h-3 w-3 text-amber-500" /> Article Topic *
                </label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. How to start a blog in 2025"
                  className="h-11 border-border/60 focus:border-violet-400 rounded-xl text-sm"
                />
              </div>

              {/* Keyword */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Primary Keyword</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. how to start a blog"
                  className="h-11 border-border/60 focus:border-violet-400 rounded-xl text-sm"
                />
              </div>

              {/* Niche */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground">Your Niche / Industry</label>
                <Input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Technology, Finance, Health"
                  className="h-11 border-border/60 focus:border-violet-400 rounded-xl text-sm"
                />
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MessageSquare className="h-3 w-3 text-blue-500" /> Writing Tone
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setTone(t.value)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all text-sm',
                        tone === t.value
                          ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300 font-bold'
                          : 'border-border/60 hover:border-violet-200 text-muted-foreground'
                      )}
                    >
                      <div className={cn('h-2 w-2 rounded-full flex-shrink-0', tone === t.value ? 'bg-violet-500' : 'bg-muted-foreground/30')} />
                      <span className="font-semibold text-foreground">{t.label}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <User className="h-3 w-3 text-emerald-500" /> Target Audience
                </label>
                <Input
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Beginner bloggers aged 20-35"
                  className="h-11 border-border/60 focus:border-violet-400 rounded-xl text-sm"
                />
              </div>

              {/* Word Count */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="h-3 w-3 text-amber-500" /> Target Word Count
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORD_COUNT_OPTIONS.map((wc) => (
                    <button
                      key={wc}
                      onClick={() => setWordCount(wc)}
                      className={cn(
                        'text-xs font-bold px-3 py-1.5 rounded-lg border transition-all',
                        wordCount === wc
                          ? 'border-violet-400 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300'
                          : 'border-border/60 hover:border-violet-200 text-muted-foreground'
                      )}
                    >
                      {wc >= 1000 ? `${wc / 1000}K` : wc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Buttons */}
              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleGenerateArticle}
                  disabled={!topic.trim() || isGenerating}
                  className="w-full h-12 rounded-xl font-bold gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                >
                  {isGenerating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating Article…</>
                  ) : (
                    <><Wand2 className="h-4 w-4" /> Generate Full Article</>
                  )}
                </Button>

                <Button
                  onClick={handleGenerateThumbnail}
                  disabled={!topic.trim() || isGeneratingThumb || thumbCredits <= 0}
                  variant="outline"
                  className={cn(
                    'w-full h-11 rounded-xl font-bold gap-2 border-violet-200 dark:border-violet-800/50 hover:bg-violet-50 dark:hover:bg-violet-950/30',
                    thumbCredits <= 0 ? 'text-red-600 dark:text-red-400' : 'text-violet-700 dark:text-violet-300'
                  )}
                >
                  {isGeneratingThumb ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating Thumbnail…</>
                  ) : thumbCredits <= 0 ? (
                    <><AlertCircle className="h-4 w-4" /> No Credits Left</>
                  ) : (
                    <><Image className="h-4 w-4" /> Generate Thumbnail <span className="ml-1 text-[10px] opacity-70">({thumbCredits} left)</span></>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800/50">
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" /> {error}
                  </div>
                )}
              </div>

              {generationTime && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Zap className="h-3 w-3" /> Generated in {generationTime}s
                </div>
              )}
            </Card>
          </div>

          {/* Right: Output Panel */}
          <div className="lg:col-span-3 space-y-4">
            {/* Thumbnail Preview */}
            {thumbnail && (
              <Card className="p-5 border-border/60 rounded-2xl space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Image className="h-4 w-4 text-violet-500" />
                  <h2 className="font-bold text-sm">Generated Thumbnail</h2>
                </div>
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted">
                  <img
                    src={thumbnail.image_url}
                    alt="Article thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadThumbnail} size="sm" className="h-9 rounded-xl font-bold gap-2 text-xs bg-gradient-to-r from-violet-600 to-purple-600">
                    <Download className="h-3 w-3" /> Download
                  </Button>
                  <Button onClick={handleGenerateThumbnail} variant="outline" size="sm" className="h-9 rounded-xl font-bold gap-2 text-xs">
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </Button>
                  <CopyButton text={thumbnail.revised_prompt} className="h-9 ml-auto text-xs" />
                </div>
              </Card>
            )}

            {/* Article Tabs */}
            {generatedArticle && (
              <div className="space-y-4">
                {/* Tab Bar */}
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-2xl w-fit">
                  {[
                    { id: 'write', label: 'Article', icon: <FileText className="h-3.5 w-3.5" /> },
                    { id: 'preview', label: 'Full Preview', icon: <Eye className="h-3.5 w-3.5" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as 'write' | 'preview')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                        activeTab === tab.id
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {tab.icon} {tab.label}
                    </button>
                  ))}
                </div>

                {/* Article Write View */}
                {activeTab === 'write' && (
                  <div className="space-y-4">
                    {/* Title + Meta */}
                    <SectionBlock
                      title="SEO Title"
                      icon={<TrendingUp className="h-4 w-4" />}
                      action={<CopyButton text={generatedArticle.title} />}
                    >
                      <h2 className="text-xl font-black text-foreground leading-tight">{generatedArticle.title}</h2>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{generatedArticle.meta_description}</p>
                    </SectionBlock>

                    {/* Introduction */}
                    <SectionBlock
                      title="Introduction"
                      icon={<Lightbulb className="h-4 w-4" />}
                      action={<CopyButton text={generatedArticle.introduction} />}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">{generatedArticle.introduction}</p>
                    </SectionBlock>

                    {/* Body */}
                    <SectionBlock
                      title="Article Body"
                      icon={<FileText className="h-4 w-4" />}
                      action={<CopyButton text={generatedArticle.body} />}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{generatedArticle.body}</p>
                      </div>
                    </SectionBlock>

                    {/* Conclusion */}
                    <SectionBlock
                      title="Conclusion"
                      icon={<CheckCircle2 className="h-4 w-4" />}
                      action={<CopyButton text={generatedArticle.conclusion} />}
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">{generatedArticle.conclusion}</p>
                    </SectionBlock>

                    {/* FAQ */}
                    {generatedArticle.faq.length > 0 && (
                      <SectionBlock
                        title="FAQ Section"
                        icon={<MessageSquare className="h-4 w-4" />}
                        action={<CopyButton text={generatedArticle.faq.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n')} />}
                      >
                        <div className="space-y-3">
                          {generatedArticle.faq.map((faq, i) => (
                            <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-1.5">
                              <p className="font-bold text-sm text-foreground flex items-start gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary/10 text-primary text-[10px] font-black flex-shrink-0 mt-0.5">Q</span>
                                {faq.question}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed pl-7">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </SectionBlock>
                    )}

                    {/* Keywords */}
                    <SectionBlock title="Secondary Keywords" icon={<TrendingUp className="h-4 w-4" />}>
                      <div className="flex flex-wrap gap-2">
                        {generatedArticle.secondary_keywords.map((kw, i) => (
                          <span key={i} className="text-[11px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full font-bold">{kw}</span>
                        ))}
                      </div>
                    </SectionBlock>

                    {/* Download All */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => { navigator.clipboard.writeText(articleContent); }}
                        className="flex-1 h-12 rounded-xl font-bold gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-violet-500/25"
                      >
                        <Copy className="h-4 w-4" /> Copy Full Article
                      </Button>
                      <Button
                        onClick={() => {
                          const blob = new Blob([articleContent], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `${generatedArticle.title.slice(0, 40)}.txt`
                          a.click()
                        }}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-bold gap-2"
                      >
                        <Download className="h-4 w-4" /> Download .txt
                      </Button>
                    </div>
                  </div>
                )}

                {/* Full Preview */}
                {activeTab === 'preview' && (
                  <Card className="p-8 rounded-2xl border-border/60 bg-background">
                    <div className="max-w-3xl mx-auto space-y-6">
                      {thumbnail && (
                        <div className="rounded-2xl overflow-hidden aspect-video bg-muted mb-4">
                          <img src={thumbnail.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="text-center space-y-3">
                        <p className="text-xs font-black uppercase tracking-widest text-violet-500">Article</p>
                        <h1 className="text-3xl sm:text-4xl font-black text-foreground leading-tight">{generatedArticle.title}</h1>
                        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">{generatedArticle.meta_description}</p>
                        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {generatedArticle.estimated_read_time}</span>
                          <span className="flex items-center gap-1.5"><FileText className="h-3 w-3" /> {generatedArticle.word_count.toLocaleString()} words</span>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {generatedArticle.secondary_keywords.map((kw, i) => (
                            <span key={i} className="text-[11px] bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2.5 py-1 rounded-full font-bold">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <hr className="border-border/60" />
                      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                        <p className="text-base font-semibold text-foreground italic">{generatedArticle.introduction}</p>
                        <div className="whitespace-pre-wrap">{generatedArticle.body}</div>
                        <p className="text-base font-semibold text-foreground italic">{generatedArticle.conclusion}</p>
                      </div>
                      {generatedArticle.faq.length > 0 && (
                        <div className="space-y-4 pt-6">
                          <h2 className="text-xl font-black text-foreground">Frequently Asked Questions</h2>
                          <div className="space-y-4">
                            {generatedArticle.faq.map((faq, i) => (
                              <div key={i} className="space-y-2">
                                <p className="font-bold text-foreground">{faq.question}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Empty State */}
            {!generatedArticle && !isGenerating && (
              <Card className="p-16 border-dashed border-2 border-border/40 rounded-3xl text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 dark:bg-violet-900/20 mx-auto">
                  <Wand2 className="h-8 w-8 text-violet-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-foreground">Your Article Awaits</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Enter your topic on the left and click Generate to create a full SEO-optimized article with a matching thumbnail.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 text-[11px] text-muted-foreground">
                  {['SEO-optimized content', 'Meta description', 'H2/H3 headings', 'FAQ section', 'Custom thumbnail'].map((f) => (
                    <span key={f} className="flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full">
                      <Check className="h-3 w-3 text-emerald-500" /> {f}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
