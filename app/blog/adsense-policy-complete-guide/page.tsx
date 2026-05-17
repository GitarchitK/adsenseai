import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Clock, Zap, Shield, AlertTriangle, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Complete AdSense Policy Guide for Publishers — 2026',
  description: 'Understanding Google\'s policies is crucial for maintaining your AdSense account. Learn exactly what content triggers rejections and how to stay compliant long-term.',
  keywords: ['adsense policy guide', 'adsense program policies', 'adsense policy violations', 'google adsense policies', 'adsense compliance'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/adsense-policy-complete-guide' },
  openGraph: {
    type: 'article',
    title: 'Complete AdSense Policy Guide for Publishers — 2026',
    description: 'Learn exactly what content triggers AdSense rejections and how to stay compliant.',
    url: 'https://www.adsensechecker.in/blog/adsense-policy-complete-guide',
    siteName: 'AdSense Checker AI',
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Complete AdSense Policy Guide for Publishers',
  description: 'Understanding Google\'s policies is crucial for maintaining your AdSense account.',
  url: 'https://www.adsensechecker.in/blog/adsense-policy-complete-guide',
  datePublished: '2026-05-07',
  dateModified: '2026-05-17',
  author: { '@type': 'Organization', name: 'Navroll Studio', url: 'https://www.adsensechecker.in' },
  publisher: { '@type': 'Organization', name: 'AdSense Checker AI', url: 'https://www.adsensechecker.in', logo: { '@type': 'ImageObject', url: 'https://www.adsensechecker.in/icon.svg' } },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://www.adsensechecker.in/blog/adsense-policy-complete-guide' },
  breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.adsensechecker.in' },
    { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://www.adsensechecker.in/blog' },
    { '@type': 'ListItem', position: 3, name: 'AdSense Policy Guide', item: 'https://www.adsensechecker.in/blog/adsense-policy-complete-guide' },
  ]},
}

export default function BlogPost() {
  const publishDate = 'May 7, 2026'
  const readTime = '12 min read'
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      
      {/* Hero */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
                Policy & Compliance
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
              Complete AdSense Policy Guide for Publishers
            </h1>
            <p className="text-lg text-muted-foreground">
              Understanding Google's policies is crucial for maintaining your account. Learn exactly what content triggers rejections and how to stay compliant for the long term.
            </p>
            <div className="flex items-center gap-3 mt-6 text-sm text-muted-foreground">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center text-[11px] font-bold text-primary-foreground">
                NS
              </div>
              <div>
                <p className="font-medium text-foreground">Navroll Studio</p>
                <p className="text-xs">{publishDate}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <div className="max-w-3xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="lead text-xl text-foreground/90 mb-8">
              Google AdSense policies exist to protect the user experience and ensure advertisers get quality placements. But for publishers, these policies can feel like a minefield. One misstep and your account gets suspended — sometimes without warning.
            </p>

            <p className="mb-6">
              This guide covers every policy you need to know, from obvious restrictions to lesser-known rules that catch publishers off guard. We'll also share strategies for building a policy-compliant site that thrives long-term.
            </p>

            {/* Quick Navigation */}
            <Card className="p-5 mb-10 border-border/60 rounded-2xl bg-muted/20">
              <h3 className="font-bold text-foreground mb-3">What You'll Learn</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">01</span>
                  <span>Prohibited content types</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">02</span>
                  <span>Restricted content rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">03</span>
                  <span>Ad placement requirements</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">04</span>
                  <span>Traffic quality guidelines</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">05</span>
                  <span>Copyright and IP rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary font-bold">06</span>
                  <span>Account security requirements</span>
                </li>
              </ul>
            </Card>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">1. Prohibited Content: What You Cannot Publish</h2>

            <p className="mb-4">
              These are absolute deal-breakers. If your site contains any of this content, you will not only be rejected from AdSense — you may be permanently banned.
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Adult Content</h3>

            <p className="mb-4">
              Any sexually explicit content is strictly prohibited. This includes:
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Pornographic images or videos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Sexually explicit written content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Links to adult websites</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Sex toys or adult products (unless clearly not erotic)</span>
              </li>
            </ul>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-5 mb-8">
              <h4 className="font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" /> Important Warning
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300">
                Google uses automated systems to scan for policy violations. Even if adult content is hidden behind a paywall or age gate, it may still be detected. Don't take chances.
              </p>
            </div>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Dangerous Content</h3>

            <p className="mb-4">
              Content that promotes harm or illegal activities is strictly prohibited:
            </p>

            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Instructions for creating weapons or dangerous substances</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Promoting illegal drugs or substances</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Violence and graphic content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Harassment, hate speech, or discrimination</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Scams, fraud, or deceptive practices</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Malware, viruses, phishing, or hacking content</span>
              </li>
            </ul>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">2. Restricted Content: Proceed with Caution</h2>

            <p className="mb-4">
              These content types are allowed but come with significant restrictions. You need special approval from Google to monetize them:
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Alcohol and Tobacco</h3>

            <p className="mb-4">
              Content about alcohol and tobacco is restricted. You can write about these products, but:
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>You must not promote the sale of alcohol/tobacco</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Content must include age-gating where legally required</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>You cannot target minors in any way</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>You must request special permission from Google</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Gambling and Betting</h3>

            <p className="mb-4">
              Online gambling is one of the most restricted categories. Requirements include:
            </p>

            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Proper gambling license for your jurisdiction</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Age restriction to 18+ or higher where required</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Geo-restrictions where gambling is illegal</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Google certification as a licensed gambling operator</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Financial Products</h3>

            <p className="mb-4">
              If you publish content about finance, crypto, or investing, you must:
            </p>

            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Include prominent disclaimers about risk</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Not make unrealistic claims about returns</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Disclose affiliate relationships clearly</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                <span>Follow local financial regulations</span>
              </li>
            </ul>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">3. Ad Placement Policies</h2>

            <p className="mb-4">
              Even if your content is compliant, poor ad placement can get you in trouble:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-primary font-bold">01</span>
                <div>
                  <strong className="text-foreground">No accidental clicks</strong> — Don't place ads where users are likely to click by accident. This includes too close to navigation elements.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-primary font-bold">02</span>
                <div>
                  <strong className="text-foreground">No encouraging clicks</strong> — Never use phrases like "Click here to support us" or place ads under fake player controls.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-primary font-bold">03</span>
                <div>
                  <strong className="text-foreground">Maximum 3 ads per page</strong> — Google limits the number of ad units. More isn't always better.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-primary font-bold">04</span>
                <div>
                  <strong className="text-foreground">No ads in pop-ups</strong> — Never place ads in pop-ups, pop-overs, or new browser windows.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <span className="text-primary font-bold">05</span>
                <div>
                  <strong className="text-foreground">Maintain content ratio</strong> — Your ads should not exceed your content. Aim for 30% ad space maximum.
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">4. Copyright and Intellectual Property</h2>

            <p className="mb-4">
              Copyright violations are one of the most common reasons for AdSense account termination. Protect yourself:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Only use images you have rights to (stock photo sites with commercial licenses, or your own)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Don't copy content from other websites, even with attribution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Properly license all music, videos, and software</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Remove DMCA-violating content immediately when notified</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Include attribution where required by license</span>
              </li>
            </ul>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl p-5 mb-8">
              <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-2">Safe Stock Photo Sources</h4>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                These sources offer commercially safe images: Unsplash, Pexels, Pixabay, and Burst (by Shopify). Always verify the specific license terms.
              </p>
            </div>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">5. Traffic Quality Requirements</h2>

            <p className="mb-4">
              Where your visitors come from matters. Google is extremely strict about traffic quality:
            </p>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Prohibited Traffic Sources</h3>

            <ul className="space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Automated traffic (bots, click farms)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Paid traffic that doesn't comply with Google policies</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Traffic from doorways or gateway pages</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Reciprocal traffic exchanges</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-red-500 flex-shrink-0 mt-1" />
                <span>Encouraged clicks from your own visitors</span>
              </li>
            </ul>

            <h3 className="text-xl font-bold text-foreground mt-6 mb-3">Allowed Traffic Sources</h3>

            <ul className="space-y-2 mb-8">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Organic search traffic (Google, Bing, Yahoo)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Direct traffic (users typing your URL directly)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Social media traffic (real engagement, not purchased)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                <span>Referral traffic from legitimate websites</span>
              </li>
            </ul>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">6. Building a Policy-Compliant Site for the Long Term</h2>

            <p className="mb-4">
              The best way to maintain AdSense compliance is to build a legitimate publishing business. Here's how:
            </p>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Focus on Quality Content</strong> — Create genuinely useful content that serves your audience. This naturally keeps you compliant.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Stay Updated</strong> — Google updates policies regularly. Subscribe to the AdSense policy blog.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Audit Regularly</strong> — Use tools like our AdSense Checker to identify issues before they become problems.
                </div>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-foreground">Moderate User Content</strong> — If you allow comments or submissions, actively moderate to remove policy-violating content.
                </div>
              </li>
            </ul>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">Conclusion</h2>

            <p className="mb-6">
              AdSense policies may seem overwhelming, but they're fundamentally designed to ensure a quality ecosystem for publishers, advertisers, and users alike. By focusing on creating genuine value for your readers and maintaining professional publishing standards, compliance becomes natural rather than burdensome.
            </p>

            <p className="mb-8">
              Before applying to AdSense (or if you've been rejected), run our free AdSense Approval Checker to identify any policy issues on your site. We'll scan your content and flag anything that could jeopardize your application.
            </p>
          </div>

          {/* CTA */}
          <Card className="p-6 md:p-8 mt-10 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Check for Policy Issues</h3>
                <p className="text-muted-foreground mb-4">
                  Our free tool scans your site for policy violations and tells you exactly what needs fixing before you apply.
                </p>
                <Link href="/auth/signup">
                  <Button className="gap-2 rounded-xl">
                    Scan My Site Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Related Guides */}
          <div className="mt-12 pt-8 border-t border-border/60">
            <h3 className="text-lg font-bold text-foreground mb-4">Related Guides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href="/blog/how-to-get-adsense-approved-first-time" className="group">
                <Card className="p-4 border-border/60 rounded-xl hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Get Approved First Time</p>
                      <p className="text-xs text-muted-foreground">Complete preparation guide</p>
                    </div>
                  </div>
                </Card>
              </Link>
              <Link href="/blog/thin-content-guide" className="group">
                <Card className="p-4 border-border/60 rounded-xl hover:border-primary/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-violet-500" />
                    <div>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Thin Content Guide</p>
                      <p className="text-xs text-muted-foreground">Create high-value articles</p>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}