import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Code2 } from 'lucide-react'

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'How to Add AdSense Auto Ads to Next.js and React (2026 Guide)',
  description: 'A complete developer guide on integrating Google AdSense Auto Ads into a modern Next.js 16/React application without hydration errors.',
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
    { '@type': 'ListItem', position: 3, name: 'Add AdSense to Next.js', item: 'https://www.adsensechecker.in/blog/add-adsense-auto-ads-nextjs-react' }
  ]
}

export default function AdsenseNextjs() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            Developer Guides
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            How to Add AdSense Auto Ads to Next.js and React
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">By Archit Karmakar</span>
            <span>•</span>
            <span>May 29, 2026</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Integrating Google AdSense into a Single Page Application (SPA) like Next.js can be tricky. If done wrong, you will get hydration errors or the ads simply won't render on client-side navigation. Here is the correct way to do it in Next.js 16.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <p>
            Hi, I'm Archit Karmakar. As a developer building tools like AdSense Checker AI, I often get asked by other devs how to properly insert AdSense into modern React frameworks. Let's look at the optimal approach using the Next.js `Script` component.
          </p>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">The Solution: Next.js Script Component</h2>
          <p>
            Google provides a single `&lt;script&gt;` tag for Auto Ads. You want this script to load efficiently without blocking your main thread. In the App Router (`app/layout.tsx`), you can use `next/script` to achieve this.
          </p>

          <div className="p-4 bg-muted/20 border border-border/60 rounded-xl overflow-x-auto mb-6">
            <pre className="text-xs text-foreground bg-transparent m-0 p-0">
{`import Script from 'next/script'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          id="adsense-init"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}`}
            </pre>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Key Things to Notice</h2>
          <ul className="space-y-2">
            <li><strong>strategy="afterInteractive"</strong>: This tells Next.js to inject the script immediately after the page becomes interactive. It won't block the initial HTML render, which is great for your Core Web Vitals.</li>
            <li><strong>client=ca-pub-XXX</strong>: Remember to replace `ca-pub-XXXXXXXXXXXXXXXX` with your actual AdSense Publisher ID.</li>
          </ul>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Handling Client-Side Routing</h2>
          <p>
            Auto Ads are smart enough to detect mutations in the DOM. However, if you are manually inserting specific Ad Units (display ads, in-feed ads) using a custom React component, you must call `(window.adsbygoogle = window.adsbygoogle || []).push({})` inside a `useEffect` hook to force AdSense to render the ad on route changes.
          </p>

          <div className="p-4 bg-muted/20 border border-border/60 rounded-xl overflow-x-auto mb-6">
            <pre className="text-xs text-foreground bg-transparent m-0 p-0">
{`'use client'

import { useEffect } from 'react'

export default function AdBanner() {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
         data-ad-slot="1234567890"
         data-ad-format="auto"
         data-full-width-responsive="true"></ins>
  )
}`}
            </pre>
          </div>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 my-8">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" /> Is your Next.js site fully compliant?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Even if the code is perfect, your content might still fail Google's review. Use our AI scanner to check your Next.js blog for content and SEO issues.
            </p>
            <Link href="/">
              <Button className="gap-2 rounded-xl">
                Scan Your Next.js App <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Conclusion</h2>
          <p>
            Adding AdSense to Next.js is straightforward if you leverage the built-in `&lt;Script&gt;` component. Avoid using standard HTML script tags to prevent hydration mismatches and performance bottlenecks.
          </p>
        </div>
      
          <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-2 text-foreground">Ready to get approved?</h3>
            <p className="text-muted-foreground">Use our AI-powered tool to <Link href="/" className="text-primary hover:underline font-bold">check your AdSense eligibility</Link> and get a step-by-step roadmap to monetization.</p>
          </div>
  
      </article>
      <SiteFooter />
    </div>
  )
}
