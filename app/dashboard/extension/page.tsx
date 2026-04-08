'use client'

import { Navbar } from '@/components/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ShieldCheck, Zap, Download, Chrome, 
  CheckCircle2, AlertCircle, Sparkles, Layout,
  MousePointer2, FileText, Search
} from 'lucide-react'
import Link from 'next/link'

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
              <Sparkles className="h-3.5 w-3.5" /> New: AdSense Policy Shield
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
              Real-time Policy <span className="gradient-text">Protection</span> while you browse
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Stop waiting for rejections. Our browser extension flags policy violations and thin content instantly as you browse your site or write in your CMS.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold shadow-xl shadow-primary/20 gap-3 text-lg">
              <Download className="h-6 w-6" /> Download Beta (.zip)
            </Button>
            <p className="text-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              Available for Chrome & Edge
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { 
              icon: Search, 
              title: 'Live Content Audit', 
              desc: 'Instantly calculates word count and flags thin content that triggers AdSense rejections.',
              color: 'text-blue-500', bg: 'bg-blue-500/10'
            },
            { 
              icon: ShieldCheck, 
              title: 'Policy Guard', 
              desc: 'Scans for prohibited keywords (adult, gambling, etc.) and missing mandatory legal pages.',
              color: 'text-emerald-500', bg: 'bg-emerald-500/10'
            },
            { 
              icon: Zap, 
              title: 'One-Click Analysis', 
              desc: 'Deep-links directly to your dashboard for a full AI-powered site audit in one click.',
              color: 'text-amber-500', bg: 'bg-amber-500/10'
            }
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <Card key={title} className="p-6 border-border/60 rounded-2xl bg-card hover:border-primary/40 transition-colors group">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg} mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className={`h-6 w-6 ${color}`} />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </Card>
          ))}
        </div>

        {/* How to Install */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-black text-foreground mb-8 flex items-center gap-3">
            <Layout className="h-6 w-6 text-primary" /> How to Install (Beta)
          </h2>
          <div className="space-y-4">
            {[
              { n: '1', text: 'Download and extract the .zip file to your computer.' },
              { n: '2', text: 'Open Chrome/Edge and go to Extensions (chrome://extensions).' },
              { n: '3', text: 'Enable "Developer Mode" in the top-right corner.' },
              { n: '4', text: 'Click "Load unpacked" and select the extracted folder.' },
              { n: '5', text: 'Pin the extension to your toolbar for instant access!' },
            ].map(({ n, text }) => (
              <div key={n} className="flex items-start gap-4 p-5 rounded-2xl bg-muted/30 border border-border/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-black text-sm shrink-0">
                  {n}
                </div>
                <p className="text-foreground font-medium leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Banner */}
        <Card className="mt-16 overflow-hidden border-0 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 md:p-12 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white mb-6 uppercase tracking-widest backdrop-blur-sm">
                <Crown className="h-4 w-4" /> Included in Pro
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                Unlock full extension power with AdSenseAI Pro
              </h2>
              <p className="text-white/80 leading-relaxed mb-8">
                Pro users get unlimited real-time scans, full keyword risk reports, and priority access to our upcoming "Auto-Fix" suggestions.
              </p>
              <Link href="/pricing">
                <Button variant="secondary" className="h-12 px-8 rounded-xl font-bold text-primary shadow-xl shadow-black/20 group">
                  Upgrade to Pro <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
               {/* Mock Browser Extension Visual */}
               <div className="bg-slate-900 rounded-2xl p-6 shadow-2xl border border-white/10 rotate-3 transform hover:rotate-0 transition-transform duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-4 w-4 rounded-full bg-red-500/50" />
                    <div className="h-4 w-4 rounded-full bg-amber-500/50" />
                    <div className="h-4 w-4 rounded-full bg-emerald-500/50" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-20 w-full rounded-xl bg-slate-800 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl font-black text-emerald-400">92</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Policy Score</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-red-200">Thin content detected (240 words)</div>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-emerald-200">Mandatory pages detected. [OK]</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}

function Crown({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>
}

function ArrowRight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
}
