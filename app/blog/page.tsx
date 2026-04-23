import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdSense Approval Guides & Resources',
  description: 'Free guides on how to get Google AdSense approved. Learn about AdSense approval requirements, how to check your eligibility, and how to fix common rejection reasons.',
  alternates: { canonical: 'https://adsensechecker.in/blog' },
}

const posts = [
  {
    href: '/blog/how-to-check-adsense-approval',
    title: 'How to Check AdSense Approval: The Complete Guide for 2025',
    desc: 'Learn exactly how to check if your website is ready for Google AdSense approval — and what to fix if it\'s not.',
    tag: 'AdSense Guide',
  },
  {
    href: '/blog/adsense-approval-requirements',
    title: 'Google AdSense Approval Requirements 2025 — Complete Checklist',
    desc: 'Every requirement your website must meet before applying for AdSense, with a critical vs recommended breakdown.',
    tag: 'Checklist',
  },
  {
    href: '/blog/adsense-low-value-content-fix',
    title: 'How to Fix AdSense "Low Value Content" Rejection',
    desc: '"Low value content" is the #1 AdSense rejection reason. Here are 5 specific fixes to get approved.',
    tag: 'Fix Guide',
  },
  {
    href: '/blog/why-adsense-keeps-rejecting-my-site',
    title: 'Why Does AdSense Keep Rejecting My Site? 8 Real Reasons + Fixes',
    desc: 'The 8 most common AdSense rejection reasons and exactly how to fix each one.',
    tag: 'Troubleshooting',
  },
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
