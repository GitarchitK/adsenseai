'use client'

/**
 * BuildBanner — "Want a tools website like this?"
 * Reusable across all pages. Pass `name` for personalisation (optional).
 */

interface BuildBannerProps {
  name?: string | null
}

export function BuildBanner({ name }: BuildBannerProps) {
  const greeting = name ? `${name}, want a tools website like this?` : 'Want a tools website like this?'

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 shadow-lg shadow-violet-500/20 mx-4 md:mx-0">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl pointer-events-none" />

      <div className="relative z-10 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

          {/* Icon + text */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 flex-shrink-0 text-xl">
              🚀
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-0.5">
                For Entrepreneurs
              </p>
              <p className="text-sm md:text-base font-black text-white leading-snug">
                {greeting}
              </p>
              <p className="text-xs text-white/70 mt-1 leading-relaxed hidden sm:block">
                We build AI-powered SaaS tools, checker websites &amp; business platforms — custom, production-ready, launched fast.
              </p>
              {/* Mobile: compact feature pills */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 sm:hidden">
                {['AI tools', 'SaaS', 'Payments', 'Fast delivery'].map(f => (
                  <span key={f} className="text-[10px] text-white/70 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-400 flex-shrink-0" />{f}
                  </span>
                ))}
              </div>
              {/* Desktop: full feature pills */}
              <div className="hidden sm:flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {['AI tools & checkers', 'SaaS platforms', 'Payment integration', 'Fast delivery'].map(f => (
                  <span key={f} className="text-[10px] text-white/70 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />{f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA button */}
          <a
            href="mailto:contact@navroll.in?subject=I want to build a tools website like AdSense Checker AI&body=Hi, I'm interested in building a similar tools/SaaS website. Please get in touch."
            className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-violet-700 font-black text-sm shadow-md hover:bg-white/90 active:scale-95 transition-all whitespace-nowrap w-full sm:w-auto justify-center"
          >
            Let&apos;s Connect →
          </a>
        </div>
      </div>
    </div>
  )
}
