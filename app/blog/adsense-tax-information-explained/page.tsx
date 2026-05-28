import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Receipt, Info } from 'lucide-react'

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: 'Google AdSense Tax Information Explained for Creators',
  description: 'A simple guide for global creators on how to fill out the Google AdSense tax forms (W-8BEN and W-9) to avoid the 30% withholding tax.',
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
    { '@type': 'ListItem', position: 3, name: 'AdSense Tax Info Explained', item: 'https://www.adsensechecker.in/blog/adsense-tax-information-explained' }
  ]
}

export default function AdsenseTaxInfo() {
  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Navbar />
      
      <article className="container mx-auto px-6 py-16 max-w-3xl">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-4">
            Payments & Taxes
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">
            Google AdSense Tax Information Explained for Creators
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="font-semibold text-foreground">By Archit Karmakar</span>
            <span>•</span>
            <span>May 29, 2026</span>
          </div>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Filling out tax forms is the most confusing part of getting paid by Google. If you don't submit your tax information correctly, Google may withhold up to 30% of your earnings worldwide. Let's simplify the process.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <p>
            Hi, I'm Archit Karmakar. While I am not a certified accountant (please consult a local tax professional!), I have guided hundreds of publishers through the terrifying red warning banner in their AdSense dashboard that reads: <em>"Important: Check if additional tax information is required from you."</em>
          </p>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Why Does Google Ask for Tax Info?</h2>
          <p>
            Google is a US-based company. Under Chapter 3 of the US Internal Revenue Code, they have a responsibility to withhold taxes when non-US creators earn income from viewers in the US. If you are a US creator, they just need your SSN or EIN for IRS reporting.
          </p>
          <div className="p-5 border border-red-200 dark:border-red-900/50 rounded-xl bg-red-50/50 dark:bg-red-900/10 mb-6">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
              <Receipt className="h-5 w-5" /> The 30% Default Penalty
            </h3>
            <p className="text-muted-foreground mb-0">
              If you ignore the tax form, Google is legally required to withhold <strong>24% to 30% of your total global earnings</strong>, not just your US earnings. Submitting the form restricts the withholding to only your US-based earnings (and often reduces that rate to 0-15%).
            </p>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Form W-9: For US Creators</h2>
          <p>
            If you are a US citizen or resident alien, this is straightforward.
          </p>
          <ul>
            <li>Select <strong>Individual/Sole proprietor</strong> if you are running the blog yourself.</li>
            <li>Provide your Social Security Number (SSN) or Employer Identification Number (EIN).</li>
            <li>Google will not withhold taxes from your payouts, but they will send you a 1099-MISC at the end of the year to file your own taxes.</li>
          </ul>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Form W-8BEN: For Non-US Creators</h2>
          <p>
            If you live outside the US (e.g., India, UK, Australia, Nigeria), you must fill out the W-8BEN form. This tells the US government that you are not a US taxpayer.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-muted/20 border border-border/60 rounded-lg">
              <h4 className="font-bold mb-2">Claiming Tax Treaty Benefits</h4>
              <p className="text-sm text-muted-foreground mb-0">Many countries have a tax treaty with the US. For example, India and the UK have treaties that reduce the US withholding tax on royalties (AdSense) from 30% down to 15% or even 0%.</p>
            </div>
            <div className="p-4 bg-muted/20 border border-border/60 rounded-lg">
              <h4 className="font-bold mb-2">Foreign TIN (Taxpayer Identification Number)</h4>
              <p className="text-sm text-muted-foreground mb-0">To claim the treaty benefit, you must provide your local tax ID. For example, in India, this is your PAN Card number. In the UK, it is your UTR or National Insurance Number.</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Step-by-Step Submission</h2>
          <ol className="space-y-2">
            <li>Go to AdSense &gt; Payments &gt; Payments info.</li>
            <li>Click <strong>Manage settings</strong>, scroll to "United States tax info", and click the pencil icon.</li>
            <li>Select "Individual" and "Non-US citizen".</li>
            <li>Select the W-8BEN form.</li>
            <li>Enter your name, country, and your Foreign TIN (local tax ID).</li>
            <li>Select "Yes" for the tax treaty and select your country.</li>
            <li>Check the boxes for Services (AdSense), Motion Picture/TV (YouTube), and Other Copyright (Play).</li>
            <li>Sign electronically by typing your full name.</li>
          </ol>

          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 my-8">
            <p className="font-bold text-foreground mb-2 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Before getting paid...
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              You only need to worry about taxes once you're approved and making money. If your site is still pending approval, use our AI tool to guarantee you meet the quality guidelines first!
            </p>
            <Link href="/">
              <Button className="gap-2 rounded-xl">
                Scan Your Site Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <h2 className="text-2xl font-black text-foreground mt-8 mb-4">Conclusion</h2>
          <p>
            Never ignore the AdSense tax warnings. Taking 5 minutes to submit your W-8BEN with your local tax ID ensures you get to keep all of the hard-earned money your blog generates. Once approved, the form is valid for 3 calendar years!
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  )
}
