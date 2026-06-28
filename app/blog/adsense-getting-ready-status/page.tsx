import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AdSense Getting Ready Status Explained: Why is it Stuck?',
  description: 'Is your AdSense account stuck on the getting ready status? Learn what adsense getting ready status means, how long it takes, and how to fix it.',
  keywords: ['adsense getting ready status', 'adsense getting ready meaning', 'adsense getting ready stuck', 'google adsense getting ready', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-getting-ready-status' },
  openGraph: {
    type: 'article',
    title: 'AdSense Getting Ready Status Explained: Why is it Stuck?',
    description: 'Learn what the AdSense "Getting Ready" status means and how to speed it up.',
    url: 'https://www.adsensechecker.in/blog/adsense-getting-ready-status',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'AdSense Getting Ready Status Explained: Why is it Stuck?',
  description: 'Learn what the AdSense "Getting Ready" status means and how to speed it up.',
  url: 'https://www.adsensechecker.in/blog/adsense-getting-ready-status',
  datePublished: '2026-06-28',
  dateModified: '2026-06-28',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/adsense-getting-ready-status' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Getting Ready Status', item: 'https://www.adsensechecker.in/blog/adsense-getting-ready-status' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What does AdSense getting ready status mean?', acceptedAnswer: { '@type': 'Answer', text: 'The "Getting Ready" status means Google is actively reviewing your website to see if it complies with the AdSense Program Policies. During this time, they are checking your content quality, navigation, and traffic sources.' } },
    { '@type': 'Question', name: 'How long does the AdSense getting ready status last?', acceptedAnswer: { '@type': 'Answer', text: 'Usually, the "Getting Ready" status lasts for a few days to two weeks. However, in some cases, it can be stuck for up to 4-6 weeks if Google requires a deeper manual review.' } },
    { '@type': 'Question', name: 'Why is my AdSense stuck on getting ready?', acceptedAnswer: { '@type': 'Answer', text: 'If it is stuck for more than 2 weeks, it often means your site has borderline quality issues, low traffic, or navigation problems. Ensure you have added the AdSense code correctly to your header.' } },
  ],
}

export default function AdsenseGettingReadyStatus() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            AdSense Guide
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            AdSense Getting Ready Status Explained: Why is it Stuck?
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            You applied for Google AdSense, added the code to your site, and now your dashboard says "Getting Ready." What does it mean, and why does it sometimes get stuck for weeks? Let's dive in.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">What is the "Getting Ready" Status?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The <strong>AdSense Getting Ready status</strong> simply means that Google's review team (and their automated bots) are currently evaluating your website. They are crawling your pages to ensure you meet all the AdSense Program Policies. 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              During this phase, they are looking for high-quality, original content, clear navigation, required legal pages, and a good user experience. 
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How Long Does it Usually Take?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google officially states that the review process typically takes a few days, but in some cases, it can take up to 2-4 weeks. If your site is extremely high quality, you might see approval in 24-48 hours. If your site is in a complex niche (like YMYL - Your Money or Your Life), it will require a manual human review, which takes longer.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Why is My AdSense Stuck on Getting Ready?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If your dashboard has been stuck on "Getting Ready" for more than 14 days, it is likely due to one of the following reasons:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong>Missing AdSense Code:</strong> Google bots cannot find the verification code in your site's <code>&lt;head&gt;</code> tag. Ensure it is placed correctly and caching plugins aren't blocking it.</li>
              <li><strong>Borderline Content:</strong> Your site is not bad enough to be automatically rejected, but not good enough to be automatically approved. It is sitting in a queue waiting for a human reviewer.</li>
              <li><strong>Site is Unreachable:</strong> Your site might be experiencing downtime, or your robots.txt file is blocking Google's AdSense bot from crawling your pages.</li>
              <li><strong>Zero Traffic:</strong> While AdSense doesn't have a strict minimum traffic rule, sites with absolutely zero traffic are often put on the back burner for review.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">How to Speed Up the Process</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You cannot contact Google to speed up the process, but you can do the following while you wait:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong>Keep Publishing:</strong> Continue posting 2-3 high-quality articles per week. An active site signals to Google that you are a serious publisher.</li>
              <li><strong>Drive Organic Traffic:</strong> Share your posts on social media and work on your SEO. A steady stream of visitors proves your site has value.</li>
              <li><strong>Check Your Code:</strong> Double-check that the AdSense code snippet is present on every page of your site, especially the homepage.</li>
            </ul>
          </section>
        </div>
      
        <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
          <h3 className="text-xl font-bold mb-2 text-foreground">Tired of Waiting?</h3>
          <p className="text-muted-foreground mb-4">Use our AI-powered tool to scan your site for hidden issues that might be delaying your AdSense approval.</p>
          <Link href="/auth/signup">
            <Button className="gap-2 rounded-xl">
              Scan My Site Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
