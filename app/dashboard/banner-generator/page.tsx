'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sparkles, Download, RefreshCw, AlertCircle, Crown,
  Zap, Image, Palette, Settings2, FileText, Lock,
} from 'lucide-react'
import { useProfile } from '@/hooks/use-profile'
import Link from 'next/link'

// ── Style presets matching the design reference ───────────────────────────────
const STYLES = [
  { id: 'modern_tech',    label: 'Modern Tech',    bg: 'from-blue-900 to-indigo-900',   text: 'text-blue-300'   },
  { id: 'bold_contrast',  label: 'Bold Contrast',  bg: 'from-gray-900 to-red-900',      text: 'text-red-300'    },
  { id: 'minimal_clean',  label: 'Minimal Clean',  bg: 'from-gray-100 to-white',        text: 'text-gray-500'   },
  { id: 'creative_color', label: 'Creative Color', bg: 'from-purple-600 to-pink-500',   text: 'text-pink-200'   },
  { id: 'news_style',     label: 'News Style',     bg: 'from-slate-900 to-blue-950',    text: 'text-slate-300'  },
  { id: 'corporate',      label: 'Corporate',      bg: 'from-blue-700 to-blue-900',     text: 'text-blue-200'   },
]

const TONES      = ['Professional', 'Informative', 'Inspirational', 'Bold', 'Friendly', 'Urgent']
const CATEGORIES = ['Technology', 'Business', 'Health', 'Finance', 'Education', 'Lifestyle', 'Marketing', 'Travel', 'Food', 'Sports']
const TABS       = [
  { id: 'content',  label: 'Content',  icon: FileText   },
  { id: 'style',    label: 'Style',    icon: Palette    },
  { id: 'settings', label: 'Settings', icon: Settings2  },
] as const

export default function BannerGeneratorPage() {
  const { isPro, getToken } = useProfile()

  // Form state
  const [headline,    setHeadline]    = useState('The Future of Artificial Intelligence is Here')
  const [subheadline, setSubheadline] = useState('Discover how AI is transforming businesses and shaping tomorrow.')
  const [tone,        setTone]        = useState('Informative')
  const [category,    setCategory]    = useState('Technology')
  const [style,       setStyle]       = useState('modern_tech')
  const [size,        setSize]        = useState<'wide' | 'square'>('wide')
  const [activeTab,   setActiveTab]   = useState<'content' | 'style' | 'settings'>('content')

  // Result state
  const [imageUrl,  setImageUrl]  = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [generated, setGenerated] = useState(false)

  const generate = async () => {
    if (!headline.trim()) return
    setLoading(true)
    setError('')
    try {
      const t = await getToken()
      const res = await fetch('/api/ai/banner-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ headline, subheadline, tone, category, style, size }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Generation failed.'); return }
      setImageUrl(data.imageUrl)
      setGenerated(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const download = () => {
    if (!imageUrl) return
    const a = document.createElement('a')
    a.href = imageUrl
    a.download = `banner-${Date.now()}.png`
    a.click()
  }

  // ── Locked state for free users ───────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-foreground">Banner Generator</h1>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 uppercase tracking-widest">New</span>
          </div>
          <p className="text-sm text-muted-foreground">Create stunning article banners in seconds with AI</p>
        </div>
        <Card className="p-12 text-center border-dashed border-2 border-border/60 rounded-3xl">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-900/30 mx-auto mb-4">
            <Lock className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Pro Feature</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Banner Generator uses ChatGPT image generation to create professional article banners. Upgrade to Pro to unlock it.
          </p>
          <Link href="/pricing">
            <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/25">
              <Crown className="h-4 w-4" /> Upgrade to Pro — ₹199/mo
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">

      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-black text-foreground">Banner Generator</h1>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 uppercase tracking-widest">New</span>
        </div>
        <p className="text-sm text-muted-foreground">Create stunning article banners in seconds with AI</p>
      </div>

      {/* ── Feature pills ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: Sparkles, title: 'AI Powered',    desc: 'Smart layouts & content' },
          { icon: Image,    title: 'Ready to Use',  desc: 'Perfect sizes for any platform' },
          { icon: Zap,      title: 'Save Time',     desc: 'Create in seconds, not hours' },
        ].map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="p-4 border-border/60 rounded-2xl flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Main layout ── */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Left: Form ── */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-border/40">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 justify-center ${
                  activeTab === tab.id ? 'bg-background text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </div>

          <Card className="p-5 border-border/60 rounded-2xl space-y-4">
            {/* CONTENT TAB */}
            {activeTab === 'content' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Headline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-none pr-16"
                      placeholder="Your compelling headline..."
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      maxLength={100}
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">{headline.length}/100</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Subheadline</label>
                  <div className="relative">
                    <textarea
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring min-h-[72px] resize-none pr-16"
                      placeholder="Supporting description..."
                      value={subheadline}
                      onChange={e => setSubheadline(e.target.value)}
                      maxLength={150}
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] text-muted-foreground">{subheadline.length}/150</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Tone</label>
                    <select value={tone} onChange={e => setTone(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      {TONES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Category</label>
                    <select value={category} onChange={e => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* STYLE TAB */}
            {activeTab === 'style' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-foreground">Choose a Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`relative h-16 rounded-xl overflow-hidden border-2 transition-all ${
                        style === s.id ? 'border-primary shadow-md shadow-primary/20' : 'border-border/60 hover:border-border'
                      }`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg}`} />
                      <div className="absolute inset-0 flex flex-col items-start justify-center px-3">
                        <p className="text-[10px] font-black text-white leading-tight">Your Headline</p>
                        <p className="text-[8px] text-white/70">Goes Here</p>
                      </div>
                      {style === s.id && (
                        <div className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <p className={`absolute bottom-1.5 left-3 text-[9px] font-bold ${s.text}`}>{s.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground">Banner Size</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'wide',   label: 'Wide (1792×1024)', desc: 'Blog / Article header' },
                      { id: 'square', label: 'Square (1024×1024)', desc: 'Social media post' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSize(opt.id as 'wide' | 'square')}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          size === opt.id ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border'
                        }`}
                      >
                        <p className="text-xs font-bold text-foreground">{opt.label}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    ⚡ Uses ChatGPT gpt-image-1 model — high quality, ~15–30 seconds per generation.
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Generate button */}
          <Button
            onClick={generate}
            disabled={loading || !headline.trim()}
            className="w-full h-12 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25 rounded-xl text-sm font-bold"
          >
            {loading
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Generating... (15–30s)</>
              : <><Sparkles className="h-4 w-4" /> Generate Banner</>}
          </Button>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
            </div>
          )}
        </div>

        {/* ── Right: Preview ── */}
        <div className="space-y-4">
          <Card className="border-border/60 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
              <p className="text-sm font-semibold text-foreground">Preview</p>
              {generated && imageUrl && (
                <Button onClick={download} size="sm" variant="outline" className="gap-1.5 text-xs h-8 rounded-lg">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
              )}
            </div>

            <div className="p-4">
              {loading ? (
                <div className="aspect-video rounded-xl bg-muted/50 flex flex-col items-center justify-center gap-3 border border-border/40">
                  <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <p className="text-sm text-muted-foreground">AI is creating your banner...</p>
                  <p className="text-xs text-muted-foreground">This takes 15–30 seconds</p>
                </div>
              ) : imageUrl ? (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imageUrl} alt="Generated banner" className="w-full rounded-xl border border-border/40 shadow-lg" />
                  <div className="flex gap-2">
                    <Button onClick={generate} variant="outline" size="sm" className="flex-1 gap-1.5 text-xs h-9 rounded-xl">
                      <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                    </Button>
                    <Button onClick={download} size="sm" className="flex-1 gap-1.5 text-xs h-9 rounded-xl">
                      <Download className="h-3.5 w-3.5" /> Download PNG
                    </Button>
                  </div>
                </div>
              ) : (
                /* Placeholder preview matching the design */
                <div className="aspect-video rounded-xl overflow-hidden relative border border-border/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900" />
                  <div className="absolute inset-0 flex items-center px-8">
                    <div className="flex-1 space-y-3">
                      <p className="text-2xl font-black text-white leading-tight">
                        {headline || 'Your Headline Goes Here'}
                      </p>
                      {subheadline && (
                        <p className="text-sm text-blue-200 leading-relaxed max-w-xs">{subheadline}</p>
                      )}
                    </div>
                    <div className="flex-shrink-0 w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
                      <Image className="h-12 w-12 text-white/30" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-8">
                    <p className="text-[10px] text-blue-300/60 uppercase tracking-widest">Click Generate to create your banner</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Style preview strip */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-widest">Choose a Style</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {STYLES.map(s => (
                <button
                  key={s.id}
                  onClick={() => { setStyle(s.id); setActiveTab('style') }}
                  className={`flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    style === s.id ? 'border-primary' : 'border-border/60 hover:border-border'
                  }`}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${s.bg} flex items-center justify-center`}>
                    <p className="text-[8px] font-black text-white text-center px-1 leading-tight">{s.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
