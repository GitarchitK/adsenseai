import Link from 'next/link'
import { Zap, CheckCircle2, TrendingUp, Clock, Users } from 'lucide-react'

const benefits = [
  { icon: TrendingUp, text: '94% approval rate for users who score 80+' },
  { icon: Clock,      text: 'Full site audit in under 30 seconds' },
  { icon: CheckCircle2, text: 'Page-by-page fixes, not generic advice' },
  { icon: Users,      text: 'Trusted by 12,000+ publishers worldwide' },
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col bg-[oklch(0.10_0.015_265)] dark:bg-[oklch(0.07_0.012_265)]">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/15 blur-[100px] translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/20 transition-colors">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">AdSenseAI</span>
          </Link>

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center space-y-8 max-w-md">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white/80 mb-5">
                <Zap className="h-3 w-3" /> AI-Powered AdSense Analysis
              </div>
              <h2 className="text-4xl font-black text-white leading-[1.1] mb-4">
                Stop getting rejected.<br />
                <span className="text-primary">Start getting paid.</span>
              </h2>
              <p className="text-white/60 text-base leading-relaxed">
                AdSenseAI tells you exactly what Google wants to see — and exactly what to fix to get approved.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {benefits.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 flex-shrink-0">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <p className="text-sm text-white/75">{text}</p>
                </div>
              ))}
            </div>

            {/* Score preview card */}
            <div className="rounded-2xl bg-white/8 backdrop-blur-sm border border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">Sample Score</p>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">High Chance</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-5xl font-black text-white">84</div>
                <div className="flex-1 space-y-1.5">
                  {[['Content', 82], ['Policy', 90], ['SEO', 78]].map(([l, v]) => (
                    <div key={l} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/50 w-12">{l}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${v}%` }} />
                      </div>
                      <span className="text-[10px] text-white/50 w-6 text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-white/40">Your site could look like this after following our fixes.</p>
            </div>
          </div>

          <p className="text-white/25 text-xs">© {new Date().getFullYear()} AdSenseAI</p>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden border-b border-border px-6 py-4 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </div>
            <span className="font-bold text-foreground">AdSenseAI</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
