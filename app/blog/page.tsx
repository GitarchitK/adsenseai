import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Card } from '@/components/ui/card'
import { Zap, Shield, TrendingUp, BookOpen, ArrowRight, CheckCircle2, Clock, BarChart3, Search, Globe, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'AdSense & Monetization Guides — Expert Tips for Publishers',
  description: 'Complete guides on AdSense approval, website monetization strategies, and building a profitable publishing business.',
}

const guides = [
  {
    slug: 'adsense-high-cpc-niches-2026',
    title: 'AdSense High CPC Niches 2026: The Ultimate Guide',
    excerpt: 'Discover the most profitable and highest paying AdSense CPC niches for 2026. Learn how to maximize your ad revenue with high-value traffic.',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-500',
    readTime: '8 min read',
    category: 'Monetization',
  },
  {
    slug: 'fix-adsense-valuable-inventory-under-construction',
    title: 'How to Fix AdSense Valuable Inventory: Under Construction Error',
    excerpt: 'Step-by-step guide on how to fix the Google AdSense Valuable Inventory rejection. Learn what causes it and how to get your site approved.',
    icon: Shield,
    color: 'bg-red-500/10 text-red-500',
    readTime: '6 min read',
    category: 'AdSense Rejections',
  },
  {
    slug: 'adsense-vs-ezoic-vs-mediavine',
    title: 'AdSense vs Ezoic vs Mediavine: Which is Best in 2026?',
    excerpt: 'Comparing Google AdSense, Ezoic, and Mediavine. Discover which ad network is best for your blog traffic level and niche.',
    icon: BarChart3,
    color: 'bg-blue-500/10 text-blue-500',
    readTime: '7 min read',
    category: 'Monetization',
  },
  {
    slug: 'how-to-increase-adsense-cpc-rpm',
    title: 'How to Increase AdSense CPC and RPM (Proven Strategies)',
    excerpt: 'Learn proven techniques to increase your Google AdSense CPC (Cost Per Click) and RPM (Revenue Per Mille) to double your ad revenue.',
    icon: TrendingUp,
    color: 'bg-emerald-500/10 text-emerald-500',
    readTime: '7 min read',
    category: 'Monetization',
  },
  {
    slug: 'does-google-adsense-allow-ai-content',
    title: 'Does Google AdSense Allow AI Content? 2026 Guidelines Explained',
    excerpt: 'Can you get AdSense approval with AI-generated content? We explain Google\'s official stance and policy guidelines for 2026.',
    icon: Star,
    color: 'bg-violet-500/10 text-violet-500',
    readTime: '8 min read',
    category: 'Policies',
  },
  {
    slug: 'how-long-to-earn-100-on-adsense',
    title: 'How Long Does It Take to Earn Your First $100 on AdSense?',
    excerpt: 'A realistic timeline and traffic calculator for reaching your first $100 payout on Google AdSense.',
    icon: Clock,
    color: 'bg-orange-500/10 text-orange-500',
    readTime: '5 min read',
    category: 'Earnings',
  },
  {
    slug: 'adsense-account-disabled-appeal-guide',
    title: 'Google AdSense Account Disabled? Here is How to Appeal',
    excerpt: 'Has your AdSense account been disabled for invalid click activity? Follow this step-by-step guide to write a successful appeal.',
    icon: Shield,
    color: 'bg-red-500/10 text-red-500',
    readTime: '7 min read',
    category: 'Policy & Bans',
  },
  {
    slug: 'add-adsense-auto-ads-nextjs-react',
    title: 'How to Add AdSense Auto Ads to Next.js and React',
    excerpt: 'A complete developer guide on integrating Google AdSense Auto Ads into a modern Next.js 16/React application without hydration errors.',
    icon: Zap,
    color: 'bg-cyan-500/10 text-cyan-500',
    readTime: '6 min read',
    category: 'Developer Guides',
  },
  {
    slug: 'adsense-tax-information-explained',
    title: 'Google AdSense Tax Information Explained for Creators',
    excerpt: 'A simple guide for global creators on how to fill out the Google AdSense tax forms to avoid the 30% withholding tax.',
    icon: BookOpen,
    color: 'bg-blue-500/10 text-blue-500',
    readTime: '6 min read',
    category: 'Payments',
  },
  {
    slug: 'best-traffic-sources-for-adsense',
    title: 'Top 5 Traffic Sources for AdSense Approval and Earnings',
    excerpt: 'Discover the safest and most profitable traffic sources for Google AdSense. Learn why organic traffic is king.',
    icon: Globe,
    color: 'bg-pink-500/10 text-pink-500',
    readTime: '8 min read',
    category: 'Traffic',
  },
  {
    slug: 'how-to-get-adsense-approved-first-time',
    title: 'How to Get AdSense Approved on Your First Try',
    excerpt: 'Stop wasting months on rejections. This comprehensive guide walks you through every requirement Google looks for — from content quality to policy compliance.',
    icon: Zap,
    color: 'bg-emerald-500/10 text-emerald-500',
    readTime: '8 min read',
    category: 'AdSense Approval',
  },
  {
    slug: 'mythos-ai-review',
    title: 'Mythos AI Review: I Used It for 3 Months — Honest Take',
    excerpt: 'After building two websites and writing 80+ articles with Mythos AI, here\'s what actually works, what doesn\'t, and whether it\'s worth your money for AdSense content.',
    icon: Star,
    color: 'bg-violet-500/10 text-violet-500',
    readTime: '11 min read',
    category: 'AI Tools',
  },
  {
    slug: 'adsense-policy-complete-guide',
    title: 'Complete AdSense Policy Guide for Publishers',
    excerpt: 'Understanding Google\'s policies is crucial for maintaining your account. Learn exactly what content triggers rejections and how to stay compliant.',
    icon: Shield,
    color: 'bg-red-500/10 text-red-500',
    readTime: '12 min read',
    category: 'Policy & Compliance',
  },
  {
    slug: 'how-i-use-mythos-ai-for-adsense-blogs',
    title: 'My Exact Workflow: Using Mythos AI for AdSense Blogs',
    excerpt: 'The step-by-step process I follow to turn AI drafts into content that passes Google\'s quality review — including the editing checklist I use every time.',
    icon: BookOpen,
    color: 'bg-emerald-500/10 text-emerald-500',
    readTime: '10 min read',
    category: 'Workflow Guide',
  },
  {
    slug: 'website-monetization-strategies',
    title: 'Website Monetization Strategies That Actually Work',
    excerpt: 'Beyond AdSense: Explore affiliate marketing, sponsored content, digital products, and hybrid strategies to maximize your site\'s revenue potential.',
    icon: TrendingUp,
    color: 'bg-amber-500/10 text-amber-500',
    readTime: '10 min read',
    category: 'Monetization',
  },
  {
    slug: 'mythos-ai-vs-other-ai-tools',
    title: 'Mythos AI vs Jasper vs Copy.ai: Which Helps AdSense Approval?',
    excerpt: 'I ran the same content brief through three AI tools and checked each output against AdSense quality criteria. The results were more interesting than I expected.',
    icon: BarChart3,
    color: 'bg-blue-500/10 text-blue-500',
    readTime: '13 min read',
    category: 'AI Tools',
  },
  {
    slug: 'why-adsense-rejects-sites',
    title: 'Why AdSense Keeps Rejecting Your Site (And How to Fix It)',
    excerpt: 'Decode those vague rejection emails. We break down the real reasons Google rejects sites and provide actionable fixes for each scenario.',
    icon: Search,
    color: 'bg-pink-500/10 text-pink-500',
    readTime: '7 min read',
    category: 'Troubleshooting',
  },
  {
    slug: 'thin-content-guide',
    title: 'What is Thin Content? A Complete Guide to High-Value Articles',
    excerpt: 'Thin content is the #1 reason for AdSense rejections. Learn how to create substantive, valuable articles that satisfy both readers and Google.',
    icon: BookOpen,
    color: 'bg-violet-500/10 text-violet-500',
    readTime: '9 min read',
    category: 'Content Quality',
  },
  {
    slug: 'domain-age-adsense',
    title: 'Does Domain Age Matter for AdSense? Truth Revealed',
    excerpt: 'New domain owners fear rejection due to age. Learn the truth about domain age requirements and strategies for newer sites to get approved.',
    icon: Clock,
    color: 'bg-cyan-500/10 text-cyan-500',
    readTime: '5 min read',
    category: 'AdSense Approval',
  },
  {
    slug: 'cpc-keyword-research',
    title: 'High CPC Keyword Research for Maximum Ad Revenue',
    excerpt: 'Not all traffic is equal. Discover how to identify high-value keywords in your niche that attract premium advertisers and boost your CPM.',
    icon: BarChart3,
    color: 'bg-pink-500/10 text-pink-500',
    readTime: '11 min read',
    category: 'SEO & Revenue',
  },
  {
    slug: 'adsense-alternatives',
    title: 'Best AdSense Alternatives for Publishers in 2024',
    excerpt: 'If AdSense isn\'t right for you or you want to diversify, explore these legitimate ad networks that can monetize your traffic effectively.',
    icon: Globe,
    color: 'bg-orange-500/10 text-orange-500',
    readTime: '8 min read',
    category: 'Monetization',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Publisher Guides</p>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4 leading-tight">
              Master AdSense Approval & Website Monetization
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Expert guides, proven strategies, and insider tips to get your site approved and maximize your publishing revenue.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Free guides</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Updated for 2024</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Actionable tips</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/blog/${guide.slug}`}>
              <Card className="h-full p-6 border-border/60 rounded-2xl hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${guide.color}`}>
                    <guide.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted px-2 py-1 rounded-full">
                    {guide.category}
                  </span>
                </div>
                
                <h2 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {guide.title}
                </h2>
                
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                  {guide.excerpt}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/40">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {guide.readTime}
                  </span>
                  <span className="text-sm font-semibold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read Guide <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-muted/20">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <Card className="p-8 md:p-12 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-2xl">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-black text-foreground mb-3">
                Ready to Check Your AdSense Readiness?
              </h2>
              <p className="text-muted-foreground mb-6">
                Use our free AI-powered tool to scan your site and get personalized recommendations before applying to AdSense.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link 
                  href="/auth/signup"
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  <Zap className="h-4 w-4" /> Check My Site Free
                </Link>
                <Link 
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 h-11 px-7 rounded-xl border border-border bg-background font-semibold hover:bg-muted transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}