'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  AlertCircle, CheckCircle2, AlertTriangle, Shield, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { ArticleAnalysis } from '@/types'

function riskBg(risk: ArticleAnalysis['adsense_risk']) {
  return risk === 'critical' ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/50'
       : risk === 'warning'  ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50'
       : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50'
}
function riskIcon(risk: ArticleAnalysis['adsense_risk']) {
  return risk === 'critical' ? <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
       : risk === 'warning'  ? <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
       : <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
}
function plagBadge(risk: ArticleAnalysis['plagiarism_risk']) {
  return risk === 'high'   ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
       : risk === 'medium' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
       : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
}
function ScoreBar({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 flex-shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-mono text-foreground w-6 text-right">{score}</span>
    </div>
  )
}

export function ArticleCard({ article }: { article: ArticleAnalysis }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className={`border ${riskBg(article.adsense_risk)} overflow-hidden`}>
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start gap-3">
          {riskIcon(article.adsense_risk)}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="font-semibold text-sm text-foreground truncate max-w-[60%]">
                {article.title}
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {article.is_thin && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    THIN
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${plagBadge(article.plagiarism_risk)}`}>
                  PLAG: {article.plagiarism_risk.toUpperCase()}
                </span>
                <span className="text-xs text-muted-foreground font-mono">{article.word_count}w</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{article.url}</p>
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" /> : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border/40 pt-4 space-y-4">
          <div className="space-y-2">
            <ScoreBar score={article.readability_score} label="Readability" />
            <ScoreBar score={article.originality_score} label="Originality" />
            <ScoreBar score={article.depth_score}       label="Depth" />
            <ScoreBar score={Math.max(0, 100 - article.spam_score)} label="Not Spammy" />
          </div>

          {article.risk_reasons.length > 0 && (
            <div>
              <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
                AdSense Risk Factors
              </p>
              <ul className="space-y-1.5">
                {article.risk_reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.plagiarism_signals.length > 0 && (
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                Plagiarism Signals
              </p>
              <ul className="space-y-1.5">
                {article.plagiarism_signals.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <Shield className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.strengths.length > 0 && (
            <div>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                Strengths
              </p>
              <ul className="space-y-1.5">
                {article.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {article.recommended_fix && article.recommended_fix !== 'None needed' && (
            <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 py-3">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Recommended Fix</p>
              <p className="text-sm text-foreground">{article.recommended_fix}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
