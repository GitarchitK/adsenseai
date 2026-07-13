'use client'

import { useState, useEffect } from 'react'
import {
  Sparkles,
  FileText,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NICHES = [
  { name: 'Tech & Software', risk: 'low' },
  { name: 'Lifestyle & Travel', risk: 'low' },
  { name: 'Finance & Investing', risk: 'high' },
  { name: 'Health & Wellness', risk: 'high' },
  { name: 'Food & Recipes', risk: 'low' },
  { name: 'News & Media', risk: 'medium' }
]

export function InteractiveEstimator() {
  const [niche, setNiche] = useState('Tech & Software')
  const [articles, setArticles] = useState(15)
  const [words, setWords] = useState(600)
  const [pages, setPages] = useState({
    privacy: true,
    about: true,
    contact: true,
    disclaimer: false
  })
  const [score, setScore] = useState(0)

  // Calculate score in real-time
  useEffect(() => {
    let computed = 0

    // 1. Articles volume (Max 35 points)
    if (articles >= 30) computed += 35
    else computed += Math.round((articles / 30) * 35)

    // 2. Average Word Count (Max 25 points)
    if (words >= 1200) computed += 25
    else if (words >= 800) computed += 20
    else if (words >= 500) computed += 15
    else computed += Math.round((words / 500) * 10)

    // 3. Mandatory Pages (Max 30 points)
    let pageScore = 0
    if (pages.privacy) pageScore += 10
    if (pages.about) pageScore += 8
    if (pages.contact) pageScore += 7
    if (pages.disclaimer) pageScore += 5
    computed += pageScore

    // 4. Niche & Risk adjustment (Max 10 points)
    const selectedNiche = NICHES.find(n => n.name === niche)
    if (selectedNiche?.risk === 'low') {
      computed += 10
    } else if (selectedNiche?.risk === 'medium') {
      computed += 7
    } else {
      // YMYL categories have stricter content requirements
      computed += words >= 1000 ? 10 : 3
    }

    setScore(Math.min(100, computed))
  }, [niche, articles, words, pages])

  const getScoreInfo = () => {
    if (score >= 80) return { label: 'High Approval Rate', color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10' }
    if (score >= 60) return { label: 'Medium Eligibility', color: 'text-amber-500 border-amber-500/30 bg-amber-500/10' }
    return { label: 'Low Eligibility', color: 'text-red-500 border-red-500/30 bg-red-500/10' }
  };

  const getRecommendations = () => {
    const list = []
    if (articles < 25) {
      list.push(`Publish at least ${25 - articles} more high-quality articles.`)
    }
    if (words < 800) {
      list.push('Aim for an average of 800+ words per article.')
    }
    const missing = []
    if (!pages.privacy) missing.push('Privacy Policy')
    if (!pages.about) missing.push('About Us')
    if (!pages.contact) missing.push('Contact Us')
    if (!pages.disclaimer) missing.push('Disclaimer')

    if (missing.length > 0) {
      list.push(`Create missing pages: ${missing.join(', ')}.`)
    }
    if (niche === 'Finance & Investing' || niche === 'Health & Wellness') {
      if (words < 1000) {
        list.push('YMYL niches require deeper articles (1000+ words) to prove authority.')
      }
    }
    return list.slice(0, 3)
  }

  const recommendations = getRecommendations()
  const scoreInfo = getScoreInfo()

  return (
    <div className="relative w-full max-w-[620px] mx-auto mt-12 lg:mt-0 group">
      {/* Glow Backdrop */}
      <div className="absolute -inset-1.5 bg-gradient-to-tr from-red-600 via-transparent to-rose-500/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />

      {/* Main Glassmorphic Card */}
      <div className="relative bg-card/70 dark:bg-black/40 border border-white/10 dark:border-white/5 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-7">
        
        {/* Header Indicator */}
        <div className="flex items-center justify-between pb-4 border-b border-border/40 mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-red-500" />
            <h4 className="font-bold text-sm text-foreground uppercase tracking-widest">Eligibility Estimator</h4>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/80">Interactive Sandbox</span>
        </div>

        <div className="grid md:grid-cols-12 gap-6">
          {/* Inputs Section */}
          <div className="md:col-span-7 space-y-5">
            {/* Niche Dropdown */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                Niche / Category
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-border/60 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                {NICHES.map(n => (
                  <option key={n.name} value={n.name}>{n.name}</option>
                ))}
              </select>
            </div>

            {/* Articles Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Total Articles
                </label>
                <span className="text-sm font-black text-foreground">{articles} posts</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={articles}
                onChange={(e) => setArticles(Number(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Word Count Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Avg. Word Count
                </label>
                <span className="text-sm font-black text-foreground">{words} words</span>
              </div>
              <input
                type="range"
                min="200"
                max="2000"
                step="50"
                value={words}
                onChange={(e) => setWords(Number(e.target.value))}
                className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
                Mandatory Pages
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.keys(pages).map((pageKey) => {
                  const label = pageKey === 'privacy' ? 'Privacy Policy' :
                                pageKey === 'about' ? 'About Us' :
                                pageKey === 'contact' ? 'Contact Us' : 'Disclaimer';
                  return (
                    <label
                      key={pageKey}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-border/40 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={pages[pageKey as keyof typeof pages]}
                        onChange={(e) => setPages({ ...pages, [pageKey]: e.target.checked })}
                        className="rounded text-red-600 focus:ring-red-500 accent-red-600 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold text-foreground/80">{label}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Results Score Gauge */}
          <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-border/40 p-4 relative overflow-hidden">
            {/* Score Ring */}
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-zinc-800"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * score) / 100}
                    className="text-red-500 transition-all duration-500 ease-out"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-foreground">{score}</span>
                  <span className="text-[10px] block text-muted-foreground mt-0.5 font-bold uppercase">Ready</span>
                </div>
              </div>
              
              <div className="mt-3.5">
                <div className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${scoreInfo.color}`}>
                  {scoreInfo.label}
                </div>
              </div>
            </div>

            {/* Mini Recommendations list */}
            <div className="border-t border-border/40 pt-3 mt-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Top Priority Fixes
              </span>
              <div className="space-y-1.5 min-h-[96px]">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <div key={i} className="flex gap-2 items-start text-xs font-semibold text-foreground/80 leading-snug">
                      <AlertTriangle className="h-3.5 w-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex gap-2 items-center text-xs font-bold text-emerald-500">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Looking great! Run a full crawl now to confirm.</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
