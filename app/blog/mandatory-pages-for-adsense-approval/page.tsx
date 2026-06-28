import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mandatory Pages Required for AdSense Approval (2026)',
  description: 'What pages are required for AdSense approval? Does missing privacy policy cause AdSense rejection? Get the exact list of mandatory pages needed to get approved.',
  keywords: ['pages required for adsense approval', 'does missing privacy policy cause adsense rejection', 'adsense missing privacy policy rejection', 'mandatory pages for adsense', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/mandatory-pages-for-adsense-approval' },
  openGraph: {
    type: 'article',
    title: 'Mandatory Pages Required for AdSense Approval',
    description: 'The 4 exact pages you must have on your website before applying for Google AdSense.',
    url: 'https://www.adsensechecker.in/blog/mandatory-pages-for-adsense-approval',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Mandatory Pages Required for AdSense Approval',
  description: 'The 4 exact pages you must have on your website before applying for Google AdSense.',
  url: 'https://www.adsensechecker.in/blog/mandatory-pages-for-adsense-approval',
  datePublished: '2026-06-28',
  dateModified: '2026-06-28',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/mandatory-pages-for-adsense-approval' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'Mandatory Pages for AdSense', item: 'https://www.adsensechecker.in/blog/mandatory-pages-for-adsense-approval' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What pages are required for AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'You must have 4 mandatory pages for AdSense approval: a Privacy Policy, an About Us page, a Contact Us page, and a Terms and Conditions (or Terms of Service) page.' } },
    { '@type': 'Question', name: 'Does missing privacy policy cause AdSense rejection?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Missing a Privacy Policy is a guaranteed way to get rejected by AdSense. Google requires all publishers to disclose what data they collect and how they use it, including cookie usage.' } },
    { '@type': 'Question', name: 'Do I need an About page for AdSense?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, an About page is highly recommended. While the Privacy Policy is legally mandatory, an About page proves your site is run by a real person or organization, adding to your trustworthiness.' } },
  ],
}

export default function MandatoryPagesForAdsenseApproval() {
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
            Mandatory Pages Required for AdSense Approval (2026)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            You can write the best articles in the world, but if your website is missing a few basic structural pages, Google AdSense will reject your application instantly. Here are the mandatory pages required for AdSense approval.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">The "Big Four" Mandatory Pages</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To prove to Google that your website is a legitimate, trustworthy business, you must have these 4 pages clearly accessible (usually in your site's footer):
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-muted-foreground mb-6">
              <li><strong>Privacy Policy (Critical)</strong></li>
              <li><strong>About Us</strong></li>
              <li><strong>Contact Us</strong></li>
              <li><strong>Terms and Conditions</strong></li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Does Missing Privacy Policy Cause AdSense Rejection?</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>Yes. Absolutely.</strong> 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The AdSense Program Policies explicitly state that all publishers must have a Privacy Policy. Because AdSense uses cookies to serve personalized ads based on a user's prior visits, you are legally required to disclose this to your visitors.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Your Privacy Policy must explicitly mention:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website.</li>
              <li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites.</li>
              <li>Users may opt out of personalized advertising by visiting Google's Ads Settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">About Us Page</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Google values E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness). An "About Us" page is the easiest way to establish trust. It shows reviewers that there is a real human or organization behind the content.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Include your story, your credentials (why are you qualified to write about this topic?), and a photo if possible.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Contact Us Page</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A site without a way to contact the owner looks suspicious. Your Contact page doesn't need to be complex. A simple contact form or an email address (e.g., <code>hello@yoursite.com</code>) is enough.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">Terms and Conditions</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Also known as "Terms of Service" or "Terms of Use." This page outlines the rules visitors must agree to when using your site. While slightly less critical than the Privacy Policy, having it adds a layer of professionalism that reviewers look for.
            </p>
          </section>
        </div>
      
        <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
          <h3 className="text-xl font-bold mb-2 text-foreground">Are You Missing Required Pages?</h3>
          <p className="text-muted-foreground mb-4">Our AI tool scans your entire website to ensure you have the mandatory pages (and checks if they contain the right legal clauses) before you apply to AdSense.</p>
          <Link href="/auth/signup">
            <Button className="gap-2 rounded-xl">
              Check My Site Now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
