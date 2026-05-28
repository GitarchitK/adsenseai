import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Calculator } from 'lucide-react'

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'How Long Does It Take to Earn Your First $100 on AdSense?',
  description: 'A realistic timeline and traffic calculator for reaching your first $100 payout on Google AdSense. See exactly how many pageviews you need.',
  image: 'https://www.adsensechecker.in/og-image.png',
  author: {
    '@type': 'Person',
    name: 'Archit Karmakar',
    url: 'https://www.adsensechecker.in/about'
  },
  publisher: {
    '@type': 'Organization',
    name: 'AdSense Checker AI',
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.adsensechecker.in/logo.png'
    }
  },
  datePublished: '2026-05-29',
  dateModified: '2026-05-29'
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'How Long to Earn $100', item: 'https://www.adsensechecker.in/blog/how-long-to-earn-100-on-adsense' }
  ]
}

export default function EarnFirst100() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            Earnings & Traffic
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            How Long Does It Take to Earn Your First $100 on AdSense?
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">By Archit Karmakar</span>
            <span>•</span>
            <span>May 29, 2026</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Reaching the $100 payout threshold is a major milestone for every blogger. But how long does it actually take? Let's do the math based on average RPMs and traffic.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <p>
            Hi, I'm Archit Karmakar. When I started my first blog years ago, checking my AdSense dashboard was an obsession. I would refresh the page to see $0.02 added to my balance and wonder if I would ever reach the $100 minimum payout limit.
          </p>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">The Math Behind the $100 Milestone</h2>
          <p>
            To understand how long it takes, we need to understand <strong>Page RPM</strong> (Revenue Per Mille, or revenue per 1,000 pageviews).
          </p>
          <div className="p-5 border border-border/60 rounded-xl bg-muted/10 mb-6">
            <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-500" /> The Traffic Formula
            </h3>
            <p className="font-mono text-sm bg-background p-2 rounded border border-border mt-2 mb-2">
              Required Pageviews = ($100 ÷ Page RPM) × 1,000
            </p>
            <p className="text-muted-foreground mb-0 text-sm">
              If your RPM is $5.00, you need 20,000 pageviews to make $100.
            </p>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">The Three Scenarios</h2>
          
          <div className="space-y-6">
            <div className="p-5 border border-border/60 rounded-xl">
              <h3 className="font-bold text-foreground mb-1">Scenario A: The Tier-3 Traffic Blog (Entertainment/News)</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mb-2">
                <li><strong>Average RPM:</strong> $0.50</li>
                <li><strong>Required Pageviews:</strong> 200,000 views</li>
                <li><strong>Estimated Time for Beginners:</strong> 12 to 18 months</li>
              </ul>
              <p className="text-sm">If your audience is mostly from India, Pakistan, or Africa, and your niche is general news or entertainment, your RPM will be low. You need massive viral traffic to hit $100.</p>
            </div>

            <div className="p-5 border border-border/60 rounded-xl">
              <h3 className="font-bold text-foreground mb-1">Scenario B: The Average Niche Blog (Tech/Lifestyle)</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mb-2">
                <li><strong>Average RPM:</strong> $4.00</li>
                <li><strong>Required Pageviews:</strong> 25,000 views</li>
                <li><strong>Estimated Time for Beginners:</strong> 6 to 9 months</li>
              </ul>
              <p className="text-sm">This is where most bloggers sit. Targeting a mix of US and global traffic in a decent niche. A well-written blog publishing 3 times a week can hit 25k pageviews in under a year.</p>
            </div>

            <div className="p-5 border border-border/60 rounded-xl bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
              <h3 className="font-bold text-green-900 dark:text-green-300 mb-1">Scenario C: The High-End Niche (Finance/Software)</h3>
              <ul className="text-sm text-muted-foreground space-y-1 mb-2">
                <li><strong>Average RPM:</strong> $15.00</li>
                <li><strong>Required Pageviews:</strong> 6,600 views</li>
                <li><strong>Estimated Time for Beginners:</strong> 3 to 5 months</li>
              </ul>
              <p className="text-sm">If you write about SaaS, insurance, or investing, and target US audiences, you barely need any traffic to hit $100. A few good articles ranking on Google can get you there in months.</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 my-8">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Speed Up Your Approval
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You can't start the countdown to $100 until you get approved. Don't waste weeks waiting for Google to review a broken site. Scan it first.
            </p>
            <Link href="/">
              <Button className="gap-2 rounded-xl">
                Scan Site for Approval <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Conclusion</h2>
          <p>
            For a brand new blogger writing in a standard niche, expect it to take about <strong>6 to 9 months</strong> to receive your first $100 check from Google. The hardest part is getting from $0 to $10. Once Google ranks your site and traffic starts compounding, you will go from making $100 every 6 months to $100 every single day!
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
