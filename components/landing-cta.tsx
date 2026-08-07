'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Shield } from 'lucide-react'

export function LandingCTA() {
  return (
    <section className="py-20 relative overflow-hidden border-t border-border/50">
      <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="container relative z-10 px-4 sm:px-6 mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-foreground leading-tight">
          Ready to Pass Google AdSense Review?
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Read our step-by-step master checklists and resolution guides to eliminate rejection risks and get approved fast.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-md mx-auto">
          <Link href="/blog/adsense-approval-requirements" className="w-full sm:w-auto">
            <Button size="lg" className="w-full h-12 px-8 text-base gap-2 rounded-xl font-bold shadow-lg shadow-primary/25">
              <Shield className="h-4 w-4" /> 2026 Approval Checklist
            </Button>
          </Link>
          <Link href="/blog/adsense-low-value-content-fix" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base gap-2 rounded-xl bg-background/80 backdrop-blur-sm border-border hover:bg-muted font-semibold">
              Fix Low Value Content <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
