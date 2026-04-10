import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: {
    default: 'AdSenseAI — Free AdSense Checker & Website Audit Tool',
    template: '%s | AdSenseAI',
  },
  description: 'Free AdSense checker and website audit tool. Check if your site is ready for Google AdSense approval. AI-powered AdSense audit scans content, policy, SEO & trust signals in 30 seconds.',
  keywords: [
    'adsense checker',
    'adsense audit',
    'website audit',
    'adsense approval checker',
    'google adsense checker',
    'adsense readiness checker',
    'adsense approval tool',
    'website adsense audit',
    'adsense eligibility checker',
    'how to get adsense approved',
    'adsense policy checker',
    'adsense site audit',
  ],
  authors: [{ name: 'Navroll Studio' }],
  creator: 'Navroll Studio',
  publisher: 'AdSenseAI',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'AdSenseAI',
    title: 'AdSenseAI — Free AdSense Checker & Website Audit Tool',
    description: 'Check if your website is ready for Google AdSense approval. Free AdSense audit tool — scans content, policy, SEO & trust signals in 30 seconds.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'AdSenseAI — AdSense Checker & Website Audit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AdSenseAI — Free AdSense Checker & Website Audit',
    description: 'Check if your website is ready for Google AdSense approval in 30 seconds.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png',  media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: 'https://adsenseai.in',
  },
  other: {
    'monetag': 'c092ffbcd84afc2e9a6dd1b8a7c4fced',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

// JSON-LD structured data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': 'https://adsenseai.in/#webapp',
      name: 'AdSenseAI',
      url: 'https://adsenseai.in',
      description: 'Free AdSense checker and website audit tool. AI-powered AdSense approval checker that scans your site for content quality, policy compliance, SEO, and trust signals.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        description: 'Free AdSense readiness check',
      },
      featureList: [
        'AdSense eligibility checker',
        'Website content audit',
        'Policy compliance check',
        'SEO analysis',
        'Trust signal detection',
        'AI-powered fix suggestions',
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://adsenseai.in/#org',
      name: 'AdSenseAI',
      url: 'https://adsenseai.in',
      logo: 'https://adsenseai.in/icon.svg',
      sameAs: [],
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is an AdSense checker?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AdSense checker is a tool that analyzes your website to determine if it meets Google AdSense\'s approval requirements. It checks content quality, policy compliance, site structure, and trust signals.',
          },
        },
        {
          '@type': 'Question',
          name: 'How do I check if my website is AdSense ready?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Enter your website URL in AdSenseAI\'s free AdSense audit tool. It will scan your site in 30 seconds and give you a readiness score from 0-100, along with specific fixes to get approved.',
          },
        },
        {
          '@type': 'Question',
          name: 'What does an AdSense audit check?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'An AdSense audit checks content quality and originality, policy compliance (adult content, copyright), required pages (Privacy Policy, About, Contact), SEO signals (H1 tags, meta descriptions), and trust indicators.',
          },
        },
      ],
    },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="monetag" content="c092ffbcd84afc2e9a6dd1b8a7c4fced" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
