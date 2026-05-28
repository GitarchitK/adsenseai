import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  metadataBase: new URL('https://www.adsensechecker.in'),
  title: {
    default: 'AdSense Approval Checker — Free AI Website Audit Tool | AdSense Checker AI',
    template: '%s | AdSense Checker AI',
  },
  description: 'Free AdSense approval checker. Instantly check if your website meets Google AdSense requirements. AI scans content quality, policy compliance, SEO & trust signals — get your approval score in 30 seconds.',
  keywords: [
    'adsense approval checker',
    'adsense checker',
    'adsense audit',
    'google adsense approval checker',
    'check adsense eligibility',
    'adsense readiness checker',
    'adsense approval tool',
    'how to check adsense approval',
    'website adsense audit',
    'adsense eligibility checker',
    'adsense policy checker',
    'adsense site audit',
    'get adsense approved',
    'adsense approval requirements checker',
    'free adsense checker',
    'adsense approval checker free',
    'adsense checker online',
    'adsense approval checker tool',
    'check website for adsense',
    'adsense website checker',
  ],
  authors: [{ name: 'Navroll Studio', url: 'https://www.adsensechecker.in' }],
  creator: 'Navroll Studio',
  publisher: 'AdSense Checker AI',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AdSense Checker AI',
    title: 'AdSense Approval Checker — Free AI Website Audit | AdSense Checker AI',
    description: 'Check if your website is ready for Google AdSense approval. Free AdSense approval checker — AI scans content, policy, SEO & trust signals in 30 seconds.',
    url: 'https://www.adsensechecker.in',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AdSense Checker AI — Free AdSense Approval Checker Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@adsensecheckerai',
    title: 'AdSense Approval Checker — Free AI Website Audit',
    description: 'Check if your website is ready for Google AdSense approval in 30 seconds.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.svg',   type: 'image/svg+xml' },
      { url: '/icon.svg',   sizes: '32x32',  type: 'image/svg+xml' },
      { url: '/icon.svg',   sizes: '16x16',  type: 'image/svg+xml' },
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.svg',
    apple:    '/apple-icon.png',
  },
  alternates: {
    canonical: 'https://www.adsensechecker.in',
  },
  verification: {
    google: 'your-google-search-console-verification-code',
    other: {
      'msvalidate.01': '29C7545485F5ABB5BD2957F43DD88E7B',
    },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// JSON-LD structured data — comprehensive schema for maximum rich results
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // SoftwareApplication — enables rich results for tools
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://www.adsensechecker.in/#webapp',
      name: 'AdSense Approval Checker AI',
      alternateName: ['AdSense Checker', 'AdSense Approval Checker', 'AdSense Eligibility Checker'],
      url: 'https://www.adsensechecker.in',
      description: 'Free AdSense approval checker. AI-powered website audit tool that scans your site for content quality, policy compliance, SEO, and trust signals to check AdSense eligibility in 30 seconds.',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'SEO Tool',
      operatingSystem: 'Web',
      browserRequirements: 'Requires JavaScript',
      inLanguage: 'en',
      isAccessibleForFree: true,
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'INR',
          description: '5 free AdSense approval checks per month',
        },
        {
          '@type': 'Offer',
          name: 'Report Unlock',
          price: '19',
          priceCurrency: 'INR',
          description: 'Full AI-powered AdSense audit report — one-time unlock',
        },
        {
          '@type': 'Offer',
          name: 'Pro Plan',
          price: '199',
          priceCurrency: 'INR',
          description: '200 AdSense checks per month with full AI reports',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: '199',
            priceCurrency: 'INR',
            unitCode: 'MON',
          },
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '2400',
        bestRating: '5',
        worstRating: '1',
      },
      featureList: [
        'Free AdSense approval checker',
        'AI content quality analysis',
        'Policy compliance detection',
        'SEO signal analysis',
        'Trust signal evaluation',
        'Prioritized fix suggestions',
        'AdSense eligibility score 0-100',
        'Domain age analysis',
        'WHOIS data integration',
      ],
      screenshot: 'https://www.adsensechecker.in/og-image.png',
      creator: {
        '@type': 'Organization',
        '@id': 'https://www.adsensechecker.in/#org',
      },
    },
    // Organization
    {
      '@type': 'Organization',
      '@id': 'https://www.adsensechecker.in/#org',
      name: 'Navroll Studio',
      alternateName: 'AdSense Checker AI',
      url: 'https://www.adsensechecker.in',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.adsensechecker.in/icon.svg',
        width: 512,
        height: 512,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        url: 'https://www.adsensechecker.in/contact',
      },
      sameAs: [
        'https://www.adsensechecker.in',
      ],
    },
    // WebSite — enables sitelinks search box
    {
      '@type': 'WebSite',
      '@id': 'https://www.adsensechecker.in/#website',
      url: 'https://www.adsensechecker.in',
      name: 'AdSense Checker AI',
      description: 'Free AdSense approval checker — AI-powered website audit tool',
      publisher: { '@id': 'https://www.adsensechecker.in/#org' },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://www.adsensechecker.in/?url={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      inLanguage: 'en',
    },
    // HowTo — rich result for "how to check adsense approval"
    {
      '@type': 'HowTo',
      name: 'How to Check AdSense Approval Eligibility',
      description: 'Check if your website is ready for Google AdSense approval in 4 simple steps using AdSense Checker AI.',
      totalTime: 'PT2M',
      estimatedCost: { '@type': 'MonetaryAmount', currency: 'INR', value: '0' },
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Enter Your Website URL',
          text: 'Go to adsensechecker.in and paste your website URL into the free AdSense checker tool.',
          url: 'https://www.adsensechecker.in',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'AI Scans Your Site',
          text: 'Our crawler visits up to 15 pages. GPT-4 analyzes content quality, policy compliance, SEO signals, and trust indicators.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Get Your AdSense Readiness Score',
          text: 'Receive a 0–100 AdSense readiness score with a full category breakdown in under 30 seconds.',
        },
        {
          '@type': 'HowToStep',
          position: 4,
          name: 'Fix Issues and Apply',
          text: 'Follow the prioritized fix list. Re-scan to track progress. Apply to AdSense when you hit 80+.',
        },
      ],
    },
    // FAQPage — rich results for FAQ snippets
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is an AdSense approval checker?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AdSense approval checker is a free tool that analyzes your website to determine if it meets Google AdSense\'s approval requirements. It checks content quality, policy compliance, required pages (Privacy Policy, About, Contact), SEO signals, and trust indicators — then gives you a readiness score from 0 to 100.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I check if my website is AdSense ready?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your website URL in AdSense Checker AI\'s free tool at adsensechecker.in. It will scan your site in 30 seconds and give you a readiness score from 0-100, along with specific fixes to get approved. Sites scoring 80+ have a 94% AdSense approval rate.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is AdSense Checker AI free to use?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. AdSense Checker AI is free to use with 5 scans per month. You get your AdSense readiness score, site structure analysis, missing pages detection, and critical issues list at no cost. A full AI-powered report with fix suggestions is available for ₹19 (one-time).',
          },
        },
        {
          '@type': 'Question',
          name: 'Why does AdSense keep rejecting my website?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The most common reasons AdSense rejects websites are: thin or low-value content (pages under 600 words), missing required pages (Privacy Policy, About, Contact), policy violations (adult content, copyright issues), poor site structure, and new domain age. AdSense Checker AI identifies exactly which issues are causing your rejection.',
          },
        },
        {
          '@type': 'Question',
          name: 'How long does AdSense approval take?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Google AdSense approval typically takes 1-4 weeks after you submit your application. However, sites that score 80+ on AdSense Checker AI\'s readiness score are approved significantly faster — often within 1-2 weeks. Sites with critical issues may wait months or be permanently rejected.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does an AdSense audit check?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'A comprehensive AdSense audit checks: content quality and word count per page, originality and plagiarism risk, policy compliance (adult content, copyright, dangerous content), required pages (Privacy Policy, About, Contact, Terms), SEO signals (H1 tags, meta descriptions, internal linking), trust indicators (HTTPS, author attribution, schema markup), and domain age.',
          },
        },
        {
          '@type': 'Question',
          name: 'How many articles do I need for AdSense approval?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Google does not publish a minimum article count for AdSense approval. However, based on data from 12,000+ sites analyzed, websites with 25-50 quality articles (800+ words each) have significantly higher approval rates. Quality matters more than quantity — 20 excellent articles outperform 100 thin ones.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        {/* Preconnect to external domains for faster resource loading */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {/* Ahrefs Analytics */}
        <Script
          id="ahrefs-analytics"
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="3jWlJ1FQDS72Uvc3Xjv2qQ"
          strategy="afterInteractive"
        />
        {/* Google Analytics */}
        <Script
          id="gtm-script"
          src="https://www.googletagmanager.com/gtag/js?id=G-RLS9PPGJ6W"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-RLS9PPGJ6W', { send_page_view: false });`}
        </Script>
        {/* AdSense */}
        <Script
          id="adsense-script"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6517018802484773"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
