import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdSense Approval Guides & Resources',
  description: 'Free guides on how to get Google AdSense approved. Learn about AdSense approval requirements, how to check your eligibility, and how to fix common rejection reasons.',
  alternates: { canonical: 'https://www.adsensechecker.in/blog' },
}

const posts = [
  { href: '/blog/how-to-use-adsense-checker-ai', title: 'How to Use AdSense Checker AI — Step-by-Step Guide', desc: 'Complete tutorial on how to scan your website, read your report, and fix issues to get AdSense approved.', tag: 'Tutorial' },
  { href: '/blog/adsense-readiness-score-explained', title: 'AdSense Readiness Score Explained — What Your Score Means', desc: 'How your score is calculated, what each category measures, and what score you need to get approved.', tag: 'Score Guide' },
  { href: '/blog/adsense-approval-checker-tool-free', title: 'Best Free AdSense Approval Checker Tool You Must Try', desc: 'Discover a powerful free AdSense approval checker that reveals exactly what\'s missing for approval.', tag: 'AdSense Tools' },
  { href: '/blog/ai-adsense-approval-checker', title: 'AI AdSense Approval Checker That Predicts Approval Chances', desc: 'How AI-powered checkers evaluate your website like Google does — with advanced signals and real-time suggestions.', tag: 'AI Tools' },
  { href: '/blog/how-to-check-adsense-approval', title: 'How to Check AdSense Approval: The Complete Guide for 2025', desc: 'Learn exactly how to check if your website is ready for Google AdSense approval — and what to fix if it\'s not.', tag: 'AdSense Guide' },
  { href: '/blog/adsense-approval-requirements', title: 'Google AdSense Approval Requirements 2025 — Complete Checklist', desc: 'Every requirement your website must meet before applying for AdSense, with a critical vs recommended breakdown.', tag: 'Checklist' },
  { href: '/blog/adsense-rejected-how-to-fix', title: 'AdSense Rejected? Here Is How to Fix Your Website Fast', desc: 'Got rejected by AdSense? Identify common issues, improve content quality, and reapply with confidence.', tag: 'Fix Guide' },
  { href: '/blog/optimize-website-for-adsense-approval', title: 'How to Optimize Your Website for AdSense Approval', desc: 'Improve content quality, site design, and technical SEO to increase your AdSense approval chances.', tag: 'Optimization' },
  { href: '/blog/adsense-approval-success-case-study', title: 'Real AdSense Approval Success Case Studies Explained', desc: 'Learn from real publishers who went from rejected to approved — with the exact issues they fixed.', tag: 'Case Studies' },
  { href: '/blog/monetize-website-without-adsense', title: 'How to Monetize Your Website Without AdSense Approval', desc: 'Discover alternative platforms and revenue streams to earn while working toward AdSense approval.', tag: 'Monetization' },
  { href: '/blog/how-many-articles-for-adsense-approval', title: 'How Many Articles Do You Need for AdSense Approval in 2025?', desc: 'The exact number of articles you need — and the quality standards they must meet to pass AdSense review.', tag: 'AdSense Guide' },
  { href: '/blog/adsense-approval-time', title: 'How Long Does AdSense Approval Take in 2025? (Real Timeline)', desc: 'The real AdSense review timeline, what happens during review, and how to get approved faster.', tag: 'AdSense Guide' },
  { href: '/blog/adsense-low-value-content-fix', title: 'How to Fix AdSense "Low Value Content" Rejection', desc: '"Low value content" is the #1 AdSense rejection reason. Here are 5 specific fixes to get approved.', tag: 'Fix Guide' },
  { href: '/blog/why-adsense-keeps-rejecting-my-site', title: 'Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes', desc: 'The 8 most common AdSense rejection reasons and exactly how to fix each one.', tag: 'Troubleshooting' },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-12">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">AdSense Resources</p>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4">AdSense Approval Guides</h1>
          <p className="text-lg text-muted-foreground">Free guides to help you get Google AdSense approved faster.</p>
        </div>
        <div className="space-y-4">
          {posts.map(post => (
            <Link key={post.href} href={post.href} className="block group">
              <div className="p-6 rounded-2xl border border-border/60 bg-card hover:border-primary/40 transition-colors">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{post.tag}</span>
                <h2 className="text-lg font-black text-foreground mt-1 mb-2 group-hover:text-primary transition-colors">{post.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{post.desc}</p>
                <span className="text-xs font-bold text-primary flex items-center gap-1">Read guide <ArrowRight className="h-3 w-3" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
