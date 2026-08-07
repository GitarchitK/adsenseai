import Link from 'next/link'
import { Calendar, User, ShieldCheck, CheckCircle2 } from 'lucide-react'

interface AuthorBoxProps {
  publishedDate?: string
  updatedDate?: string
  readTime?: string
}

export function AuthorBox({ publishedDate = 'May 29, 2026', updatedDate = 'July 14, 2026', readTime = '8 min read' }: AuthorBoxProps) {
  return (
    <div className="my-8 p-6 rounded-2xl border border-border/70 bg-muted/30 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/50 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-primary via-violet-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
            AK
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" title="Verified Author">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-sm sm:text-base">Archit Karmakar</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                AdSense Specialist
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Founder & Lead Publisher Auditor at Navroll Studio</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Updated: {updatedDate}</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5">
            <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span>{readTime}</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Reviewed for accuracy according to current <strong>Google AdSense Publisher Policies</strong> & E-E-A-T quality guidelines. Archit has audited over 1,200+ websites for AdSense approval and monetization compliance.
      </p>
    </div>
  )
}
