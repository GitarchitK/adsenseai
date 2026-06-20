import { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ArrowRight, Clock, Zap, Search, AlertCircle, Shield, TrendingUp } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why AdSense Keeps Rejecting Your Site — Real Reasons & Fixes (2026) (2026 Complete Guide)',
  description: 'Decode those vague AdSense rejection emails. We break down the 6 real reasons Google rejects sites and give you actionable fixes for each one.',
  keywords: ['why adsense rejected my site', 'adsense rejection reasons', 'adsense keeps rejecting', 'adsense rejection fix', 'google adsense rejected'],
  alternates: { canonical: 'https://www.adsensechecker.in/blog/why-adsense-rejects-sites' },
  openGraph: { type: 'article', title: 'Why AdSense Keeps Rejecting Your Site — Real Reasons & Fixes', description: 'Decode AdSense rejection emails and fix the real issues.', url: 'https://www.adsensechecker.in/blog/why-adsense-rejects-sites', siteName: 'AdSense Checker AI' },
}

export default function BlogPost() {
  const publishDate = 'May 7, 2026'
  const readTime = '7 min read'
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero */}
      <section className="border-b border-border/60 bg-muted/20">
        <div className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                Troubleshooting
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> {readTime}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight">
              Why AdSense Keeps Rejecting Your Site
            </h1>
            <p className="text-lg text-muted-foreground">
              Decode those vague rejection emails. We break down the real reasons Google rejects sites and provide actionable fixes for each scenario.
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
              You've done everything right. You have great content, a beautiful design, and all the required pages. Yet AdSense keeps rejecting you with a vague email that says nothing helpful. The truth? Google sends the same generic rejection to many different problems.
            </p>

            <p className="mb-6">
              In this guide, we'll decode the most common rejection reasons, explain what Google really means, and give you specific actions to fix each issue.
            </p>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">The Most Common Rejection Reasons</h2>

            {/* Issue 1 */}
            <div className="mb-8">
              <Card className="p-5 border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"We found policy violations on your site"</h3>
                    <p className="text-sm text-muted-foreground">This is the most common — and least helpful — rejection message.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                Google detected content that violates their policies, but their automated system won't tell you exactly what. It could be anything from adult content in comments to copyrighted images you didn't know were illegal to use.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Audit all your images — remove any you don't have explicit rights to use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Check all comments on your site for policy-violating content</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Review every page for adult themes, violence, or controversial topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Ensure your Privacy Policy accurately reflects all data collection</span>
                </li>
              </ul>
            </div>

            {/* Issue 2 */}
            <div className="mb-8">
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Search className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"Insufficient content"</h3>
                    <p className="text-sm text-muted-foreground">Or "Not Enough Content" — Google needs more to evaluate.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                Your site either has too few pages, pages that are too short, or content that Google doesn't consider valuable. They need enough content to determine your site is a legitimate publication.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Publish at least 30-50 quality articles before applying</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Each article should be at least 800 words (ideally 1,200+)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Remove or merge pages with under 300 words</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Focus on depth, not just word count — provide real value</span>
                </li>
              </ul>
            </div>

            {/* Issue 3 */}
            <div className="mb-8">
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"Low value content"</h3>
                    <p className="text-sm text-muted-foreground">Or "Thin content" — Your content doesn't provide enough value.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                Your content exists primarily to attract search traffic rather than serve readers. It's either too short, too generic, scraped from other sites, or provides no original insights.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Add original analysis, opinions, and experiences to every article</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Answer all questions a reader might have about the topic</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Include practical, actionable advice readers can use</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Never copy content from other sites — even with attribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Update old content to keep it fresh and relevant</span>
                </li>
              </ul>
            </div>

            {/* Issue 4 */}
            <div className="mb-8">
              <Card className="p-5 border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"Missing required pages"</h3>
                    <p className="text-sm text-muted-foreground">One or more mandatory pages were not found.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                You're missing at least one of the required pages: Privacy Policy, Contact Us, About Us, or Terms of Service. These are non-negotiable for AdSense approval.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Create a comprehensive Privacy Policy that mentions cookies and ad serving</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Add a Contact Us page with a valid email or contact form</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Write an About Us page explaining who runs the site</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Add Terms of Service outlining user rules</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Place links to these pages in your footer on every page</span>
                </li>
              </ul>
            </div>

            {/* Issue 5 */}
            <div className="mb-8">
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"Site not accessible"</h3>
                    <p className="text-sm text-muted-foreground">Google couldn't properly crawl your site.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                Either your site was down when they tried to crawl it, there are technical issues preventing access, or your robots.txt is blocking Googlebot.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Ensure your site is always accessible (reliable hosting)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Check your robots.txt doesn't block Googlebot</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Fix any redirect loops or 404 errors</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Verify your site with Google Search Console</span>
                </li>
              </ul>
            </div>

            {/* Issue 6 */}
            <div className="mb-8">
              <Card className="p-5 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-foreground mb-1">"Domain age requirements not met"</h3>
                    <p className="text-sm text-muted-foreground">Your domain may be too new.</p>
                  </div>
                </div>
              </Card>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">What Google Really Means:</h4>
              <p className="mb-3">
                While there's no official minimum age, Google prefers established sites. New domains (less than 6 months old) face extra scrutiny and higher rejection rates.
              </p>

              <h4 className="text-lg font-bold text-foreground mt-5 mb-2">How to Fix It:</h4>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Wait until your domain is at least 3-6 months old</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Build content and traffic before applying</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Consider using an older domain if you have one available</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-1" />
                  <span>Newer domains CAN get approved — focus on exceptional content</span>
                </li>
              </ul>
            </div>

            <h2 className="text-2xl font-black text-foreground mt-10 mb-4">The Reapplication Strategy</h2>

            <p className="mb-4">
              After fixing issues, here's the best approach to reapplication:
            </p>

            <ol className="space-y-3 mb-8 list-decimal list-inside">
              <li className="pl-2 pb-2"><strong>Wait 2-4 weeks</strong> — Google needs time to see your changes</li>
              <li className="pl-2 pb-2"><strong>Add more content</strong> — Publish more articles while you wait</li>
              <li className="pl-2 pb-2"><strong>Test your fixes</strong> — Run our checker to confirm issues are resolved</li>
              <li className="pl-2 pb-2"><strong>Reapply</strong> — Submit again with confidence</li>
              <li className="pl-2 pb-2"><strong>Document everything</strong> — Keep notes on what you fixed for reference</li>
            </ol>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-5 mb-8">
              <h4 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Multiple Rejections?</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300">
                If you've been rejected 3+ times, we strongly recommend using our AdSense Approval Checker. It scans for 50+ issues that could be causing rejections, giving you a clear action plan before applying again.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Card className="p-6 md:p-8 mt-10 border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground mb-2">Find Out Why You're Being Rejected</h3>
                <p className="text-muted-foreground mb-4">
                  Our free tool identifies the exact issues preventing your approval.
                </p>
                <Link href="/auth/signup">
                  <Button className="gap-2 rounded-xl">
                    Check My Site Now <ArrowRight className="h-4 w-4" />
                  </Button>
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