'use client'

import { Info } from 'lucide-react'

export function PromoAdBanner() {
  return (
    <div className="w-full max-w-5xl mx-auto mb-4">
      <div className="relative group border border-border/50 bg-card rounded flex flex-col md:flex-row items-center justify-between p-2 md:px-4 md:py-2.5 gap-3 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] hover:border-primary/30 transition-all">
        
        {/* Ad Tag */}
        <div className="absolute top-0 right-0 bg-muted text-[9px] font-medium text-muted-foreground px-1.5 py-0.5 rounded-bl rounded-tr flex items-center gap-1 z-10 border-b border-l border-border/50">
          Ad <Info className="h-2 w-2" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-hidden relative z-0 pr-6 md:pr-0">
          <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 text-white flex items-center justify-center rounded shadow-inner text-base">
            🚀
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 tracking-widest leading-none">For Entrepreneurs</span>
              <span className="text-[10px] text-muted-foreground hidden lg:inline font-medium">· AI Tools · SaaS · Payments</span>
            </div>
            <p className="text-sm font-bold text-foreground truncate leading-snug">Want a tools website like this?</p>
            <p className="text-[11px] text-muted-foreground truncate hidden md:block mt-0.5">We build custom, production-ready platforms launched fast.</p>
          </div>
        </div>

        <a 
          href="https://wa.me/916296992939?text=Hi%2C%20I%27m%20interested%20in%20building%20a%20similar%20tools%2FSaaS%20website.%20Please%20get%20in%20touch."
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-md w-full md:w-auto text-center transition-colors shadow-sm"
        >
          Let&apos;s Connect
        </a>
      </div>
    </div>
  )
}
