import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'How to Fix AdSense Valuable Inventory: Under Construction Error',
  description: 'Step-by-step guide on how to fix the Google AdSense Valuable Inventory: Under Construction rejection. Learn what causes it and how to get your site approved.',
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
    { '@type': 'ListItem', position: 3, name: 'Fix Valuable Inventory Under Construction', item: 'https://www.adsensechecker.in/blog/fix-adsense-valuable-inventory-under-construction' }
  ]
}

export default function FixValuableInventory() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            AdSense Rejections
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            How to Fix AdSense Valuable Inventory: Under Construction Error
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">By Archit Karmakar</span>
            <span>•</span>
            <span>May 29, 2026</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            There is nothing more frustrating than waiting two weeks for an AdSense review only to receive the dreaded "Valuable Inventory: Under Construction" email. Here is exactly what this error means and how to fix it permanently.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <p>
            Hi, I'm Archit Karmakar. Over the years, I've seen thousands of AdSense rejections, and "Valuable Inventory: Under Construction" is consistently in the top three. It sounds like Google thinks your website is literally showing an "under construction" banner, but usually, that's not the case.
          </p>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">What Does This Error Actually Mean?</h2>
          <p>
            When Google sends this rejection, they are essentially saying: <em>"Your website does not feel complete enough to provide a good user experience for visitors."</em>
          </p>
          <p>
            They want to serve ads on finished, polished websites. If their automated crawlers (or human reviewers) hit dead ends, empty categories, or broken links, they will flag the site as "under construction."
          </p>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Top Causes & How to Fix Them</h2>
          
          <div className="space-y-6">
            <div className="p-5 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Empty Categories or Tags
              </h3>
              <p className="text-muted-foreground">
                <strong>The Issue:</strong> You have categories in your main menu (e.g., "Technology", "Health") but when a user clicks on them, there is only 1 article or nothing at all.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>The Fix:</strong> Remove any categories that have fewer than 3-4 articles. Hide them from your navigation menu until you've written enough content to fill them.
              </p>
            </div>

            <div className="p-5 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Placeholder Text (Lorem Ipsum)
              </h3>
              <p className="text-muted-foreground">
                <strong>The Issue:</strong> You bought a premium theme and forgot to change the default "Lorem Ipsum" text in the footer, sidebar, or about page.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>The Fix:</strong> Search your entire site for placeholder text. Make sure your "About Us" and "Contact" pages are fully written out.
              </p>
            </div>

            <div className="p-5 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Broken Links (404 Errors)
              </h3>
              <p className="text-muted-foreground">
                <strong>The Issue:</strong> Social media icons in the header that link to `#`, or internal links that go to 404 pages.
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>The Fix:</strong> Run a broken link checker tool. Remove any social media icons if you haven't created the profiles yet. Update all `#` hrefs to actual URLs.
              </p>
            </div>
            
            <div className="p-5 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10">
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" /> Not Enough Total Content
              </h3>
              <p className="text-muted-foreground">
                <strong>The Issue:</strong> Applying with only 5 or 10 articles. The site feels "bare."
              </p>
              <p className="text-muted-foreground mt-2">
                <strong>The Fix:</strong> Write at least 20-30 high-quality, comprehensive articles before reapplying. Make sure each article is well-formatted and easy to navigate.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">The Final Pre-Application Checklist</h2>
          <ul className="list-none space-y-2 pl-0">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> All menu links go to pages with content.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> No default theme data or placeholder text remains.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Essential pages (Privacy Policy, Contact, About) are active.</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Site navigation is clear and intuitive.</li>
          </ul>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 my-8">
            <p className="font-bold text-foreground mb-2">Still struggling with rejections?</p>
            <p className="text-sm text-muted-foreground mb-4">
              My AI-powered scanner can instantly detect empty categories, broken links, and missing essential pages that cause the "Under Construction" error.
            </p>
            <Link href="/">
              <Button className="gap-2 rounded-xl">
                Scan Your Site Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Conclusion</h2>
          <p>
            The "Valuable Inventory: Under Construction" error is completely fixable. Take a weekend to audit your site, remove dead links, fill out your categories, and present a professional, finished product. Once your site looks complete to a human, it will look complete to Google AdSense.
          </p>
        </div>
      
          <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
            <h3 className="text-xl font-bold mb-2 text-foreground">Ready to get approved?</h3>
            <p className="text-muted-foreground">Use our AI-powered tool to <Link href="/" className="text-primary hover:underline font-bold">check your site's AdSense readiness</Link> and get a step-by-step roadmap to monetization.</p>
          </div>
  
      </article>
      <SiteFooter />
    </div>
  )
}
