import type { MetadataRoute } from 'next'

const BASE = 'https://www.adsensechecker.in'

// All blog posts with their actual publish/update dates
const blogPosts: Array<{ slug: string; date: string; priority: number }> = [
  // High-traffic target pages — highest priority
  { slug: 'adsense-approval-checker-tool-free',    date: '2026-05-17', priority: 0.9 },
  { slug: 'adsense-approval-requirements',          date: '2026-05-17', priority: 0.9 },
  { slug: 'why-adsense-keeps-rejecting-my-site',   date: '2026-05-17', priority: 0.9 },
  { slug: 'how-to-check-adsense-approval',         date: '2026-05-17', priority: 0.9 },
  { slug: 'adsense-low-value-content-fix',         date: '2026-05-17', priority: 0.85 },
  { slug: 'adsense-rejected-how-to-fix',           date: '2026-05-17', priority: 0.85 },
  // New SEO & Technical Guides (Added 2026-05-29)
  { slug: 'adsense-high-cpc-niches-2026',           date: '2026-05-29', priority: 0.9 },
  { slug: 'fix-adsense-valuable-inventory-under-construction', date: '2026-05-29', priority: 0.9 },
  { slug: 'adsense-vs-ezoic-vs-mediavine',          date: '2026-05-29', priority: 0.9 },
  { slug: 'how-to-increase-adsense-cpc-rpm',        date: '2026-05-29', priority: 0.9 },
  { slug: 'does-google-adsense-allow-ai-content',   date: '2026-05-29', priority: 0.85 },
  { slug: 'how-long-to-earn-100-on-adsense',        date: '2026-05-29', priority: 0.85 },
  { slug: 'adsense-account-disabled-appeal-guide',  date: '2026-05-29', priority: 0.85 },
  { slug: 'add-adsense-auto-ads-nextjs-react',      date: '2026-05-29', priority: 0.85 },
  { slug: 'adsense-tax-information-explained',      date: '2026-05-29', priority: 0.85 },
  { slug: 'best-traffic-sources-for-adsense',       date: '2026-05-29', priority: 0.85 },
  // New high-quality guides
  { slug: 'how-to-get-adsense-approved-first-time', date: '2026-05-17', priority: 0.85 },
  { slug: 'adsense-policy-complete-guide',          date: '2026-05-17', priority: 0.85 },
  { slug: 'why-adsense-rejects-sites',              date: '2026-05-17', priority: 0.85 },
  { slug: 'thin-content-guide',                     date: '2026-05-17', priority: 0.85 },
  { slug: 'website-monetization-strategies',        date: '2026-05-17', priority: 0.80 },
  { slug: 'domain-age-adsense',                     date: '2026-05-17', priority: 0.80 },
  // Mythos AI articles
  { slug: 'mythos-ai-review',                       date: '2026-05-17', priority: 0.80 },
  { slug: 'mythos-ai-vs-other-ai-tools',            date: '2026-05-17', priority: 0.80 },
  { slug: 'how-i-use-mythos-ai-for-adsense-blogs',  date: '2026-05-17', priority: 0.80 },
  // Supporting content
  { slug: 'how-to-use-adsense-checker-ai',          date: '2026-05-17', priority: 0.80 },
  { slug: 'adsense-readiness-score-explained',      date: '2026-05-17', priority: 0.80 },
  { slug: 'ai-adsense-approval-checker',            date: '2026-05-17', priority: 0.80 },
  { slug: 'optimize-website-for-adsense-approval',  date: '2026-05-17', priority: 0.75 },
  { slug: 'adsense-approval-success-case-study',    date: '2026-05-17', priority: 0.75 },
  { slug: 'monetize-website-without-adsense',       date: '2026-05-17', priority: 0.75 },
  { slug: 'how-many-articles-for-adsense-approval', date: '2026-05-17', priority: 0.75 },
  { slug: 'adsense-approval-time',                  date: '2026-05-17', priority: 0.75 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core pages
    { url: BASE,                  lastModified: new Date('2026-05-17'), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,     lastModified: new Date('2026-05-17'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/blog`,        lastModified: new Date('2026-05-17'), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/about`,       lastModified: new Date('2026-05-17'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,     lastModified: new Date('2026-05-17'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,     lastModified: new Date('2026-05-17'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/terms`,       lastModified: new Date('2026-05-17'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/disclaimer`,  lastModified: new Date('2026-05-17'), changeFrequency: 'yearly',  priority: 0.4 },
    // Blog posts
    ...blogPosts.map(({ slug, date, priority }) => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date(date),
      changeFrequency: 'monthly' as const,
      priority: 0.7, // As requested in the SEO Upgrade
    })),
  ]
}
