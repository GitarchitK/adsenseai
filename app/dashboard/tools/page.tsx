'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { ALL_TOOLS, TOOL_CATEGORIES, type ToolCategory, type ToolDef } from '@/lib/tool-catalog'
import * as LucideIcons from 'lucide-react'

type LucideIconName = keyof typeof LucideIcons

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (LucideIcons as any)[name] as React.ComponentType<{ className?: string }>
  if (!Icon) return <Sparkles className={className} />
  return <Icon className={className} />
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const href = tool.apiRoute?.startsWith('/dashboard')
    ? tool.apiRoute
    : `/dashboard/tools/${tool.id}`

  return (
    <Link href={href}>
      <Card className="group p-5 border-border/40 rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer h-full bg-card/50 hover:bg-card">
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tool.color} flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <DynamicIcon name={tool.icon} className={`h-5 w-5 ${tool.textColor}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-sm text-foreground truncate">{tool.name}</p>
              {tool.badge && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 uppercase tracking-wider
                  ${tool.badge === 'Popular' ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20' :
                    tool.badge === 'New' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                    'bg-blue-500/15 text-blue-400 border border-blue-500/20'}`}>
                  {tool.badge === 'AI' ? '✦ AI' : tool.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{tool.tagline}</p>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0 mt-1" />
        </div>
      </Card>
    </Link>
  )
}

const CATEGORY_ORDER: ToolCategory[] = ['adsense', 'content', 'seo', 'technical', 'legal', 'media']

export default function ToolsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')

  const filtered = useMemo(() => {
    let tools = ALL_TOOLS
    if (activeCategory !== 'all') tools = tools.filter(t => t.category === activeCategory)
    if (search.trim()) {
      const q = search.toLowerCase()
      tools = tools.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.category.includes(q)
      )
    }
    return tools
  }, [search, activeCategory])

  const grouped = useMemo(() => {
    if (activeCategory !== 'all' || search.trim()) {
      return { [activeCategory !== 'all' ? activeCategory : 'results']: filtered }
    }
    const g: Partial<Record<ToolCategory, ToolDef[]>> = {}
    for (const cat of CATEGORY_ORDER) {
      const items = ALL_TOOLS.filter(t => t.category === cat)
      if (items.length) g[cat] = items
    }
    return g
  }, [filtered, activeCategory, search])

  const totalCount = ALL_TOOLS.length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15">
              <Zap className="h-4 w-4 text-violet-400" />
            </div>
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Free Tools</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">All Tools</h1>
          <p className="text-muted-foreground mt-1.5">
            {totalCount}+ free tools for bloggers, website owners &amp; agencies. No limits, no paywalls.
          </p>
        </div>

        {/* Search + Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tools…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 h-10 bg-muted/30 border-border/60 rounded-xl"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                activeCategory === 'all'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              All ({totalCount})
            </button>
            {CATEGORY_ORDER.map(cat => {
              const { label, emoji } = TOOL_CATEGORIES[cat]
              const count = ALL_TOOLS.filter(t => t.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 text-xs font-semibold px-4 py-2 rounded-xl border transition-all ${
                    activeCategory === cat
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {emoji} {label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Tools Grid */}
        {search.trim() || activeCategory !== 'all' ? (
          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
                <p>No tools found for "{search}"</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filtered.map(tool => <ToolCard key={tool.id} tool={tool} />)}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {CATEGORY_ORDER.map(cat => {
              const tools = grouped[cat]
              if (!tools?.length) return null
              const { label, emoji, description } = TOOL_CATEGORIES[cat]
              return (
                <section key={cat}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                        <span>{emoji}</span> {label}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <button
                      onClick={() => setActiveCategory(cat)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      See all <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tools.map(tool => <ToolCard key={tool.id} tool={tool} />)}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
