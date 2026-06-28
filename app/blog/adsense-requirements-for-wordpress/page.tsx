import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Google AdSense Requirements for WordPress Sites (2026)',
  description: 'Learn the specific Google AdSense requirements for WordPress websites. How to use Site Kit, configure themes, and get approved fast.',
  keywords: ['adsense requirements for wordpress', 'wordpress adsense approval', 'google site kit adsense', 'adsense wordpress plugin', 'adsense approval checker'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-requirements-for-wordpress' },
  openGraph: {
    type: 'article',
    title: 'Google AdSense Requirements for WordPress Sites (2026)',
    description: 'The ultimate guide to getting your WordPress blog approved for Google AdSense.',
    url: 'https://www.adsensechecker.in/blog/adsense-requirements-for-wordpress',
    siteName: 'AdSense Approval Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Google AdSense Requirements for WordPress Sites (2026)',
  description: 'The ultimate guide to getting your WordPress blog approved for Google AdSense.',
  url: 'https://www.adsensechecker.in/blog/adsense-requirements-for-wordpress',
  datePublished: '2026-06-28',
  dateModified: '2026-06-28',
  author: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Approval Checker AI', url: 'https://www.adsensechecker.in' },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/adsense-requirements-for-wordpress' },
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Requirements for WordPress', item: 'https://www.adsensechecker.in/blog/adsense-requirements-for-wordpress' },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Can I use AdSense on WordPress?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, WordPress is fully compatible with Google AdSense. In fact, Google has an official plugin called Site Kit that makes integrating AdSense into WordPress incredibly easy.' } },
    { '@type': 'Question', name: 'What are the AdSense requirements for WordPress?', acceptedAnswer: { '@type': 'Answer', text: 'The requirements are the same as any other site: high-quality original content, clear navigation, mandatory legal pages (Privacy Policy, Contact), and compliance with AdSense program policies.' } },
    { '@type': 'Question', name: 'Does my WordPress theme affect AdSense approval?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Slow, cluttered, or non-mobile-friendly WordPress themes can lead to rejection for poor user experience or navigation issues. Always use a clean, fast, and responsive theme.' } },
  ],
}

export default function AdsenseRequirementsForWordpress() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Navbar />
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            Platform Guides
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            Google AdSense Requirements for WordPress Sites (2026)
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            WordPress powers over 40% of the internet, making it the most popular platform for publishers. If you're running a WordPress blog, here are the specific AdSense requirements you need to meet to get approved on your first try.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">1. The Golden Rule: Use Self-Hosted WordPress (.org)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              There is a massive difference between WordPress.com and WordPress.org. Google AdSense generally does <strong>not</strong> approve free subdomains (e.g., <code>yourblog.wordpress.com</code>). 
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To get approved, you must be using self-hosted WordPress (WordPress.org) with your own top-level custom domain (e.g., <code>yourblog.com</code>) and a reliable hosting provider.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">2. Clean and Mobile-Friendly Theme</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              AdSense reviewers manually check your site's navigation. If your WordPress theme is cluttered, broken on mobile devices, or lacks a clear menu, you will be rejected for "Site Navigation" issues.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li>Use lightweight themes like GeneratePress, Astra, or Kadence.</li>
              <li>Ensure your main menu (Header) links to all important categories.</li>
              <li>Include a footer menu containing links to your Privacy Policy, Terms, and Contact page.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">3. The Google Site Kit Plugin (Recommended)</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You don't need to manually paste code into your <code>header.php</code> file anymore. Google offers an official WordPress plugin called <strong>Site Kit by Google</strong>.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Site Kit automatically connects your WordPress site to Search Console, Analytics, and AdSense. It securely places the verification code on your site, bypassing caching issues that often cause the "AdSense code not found" error during review.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">4. Watch Out for Caching Plugins</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you aren't using Site Kit and are manually pasting the AdSense code, be very careful with caching plugins like WP Rocket, Litespeed Cache, or W3 Total Cache.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Aggressive caching can minify or defer the AdSense JavaScript, making it impossible for Google's bots to verify your site. Always clear your cache after adding the code, and consider excluding the AdSense script from deferral settings during the review period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black text-foreground mb-4">5. Content Quality and Structure</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The core AdSense requirements remain the same for WordPress:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-6">
              <li><strong>Volume:</strong> Aim for 20-30 published posts.</li>
              <li><strong>Length:</strong> Posts should be 600+ words of original content.</li>
              <li><strong>Categories:</strong> Don't leave default WordPress categories like "Uncategorized". Organize your content into 3-4 clear categories.</li>
            </ul>
          </section>
        </div>
      
        <div className="mt-12 p-6 bg-primary/5 rounded-2xl border border-primary/20">
          <h3 className="text-xl font-bold mb-2 text-foreground">Is Your WordPress Site Ready?</h3>
          <p className="text-muted-foreground mb-4">Our AI tool scans your WordPress site exactly like Google's reviewers do. Catch theme errors and content issues before applying.</p>
          <Link href="/auth/signup">
            <Button className="gap-2 rounded-xl">
              Scan My WordPress Site <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
