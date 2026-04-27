import type { MetadataRoute } from 'next'

const BASE = 'https://www.adsensechecker.in'

const blogPosts = [
  'how-to-use-adsense-checker-ai',
  'adsense-readiness-score-explained',
  'adsense-approval-checker-tool-free',
  'ai-adsense-approval-checker',
  'how-to-check-adsense-approval',
  'adsense-approval-requirements',
  'adsense-rejected-how-to-fix',
  'optimize-website-for-adsense-approval',
  'adsense-approval-success-case-study',
  'monetize-website-without-adsense',
  'how-many-articles-for-adsense-approval',
  'adsense-approval-time',
  'adsense-low-value-content-fix',
  'why-adsense-keeps-rejecting-my-site',
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE,                  lastModified: new Date('2025-04-24'), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/pricing`,     lastModified: new Date('2025-04-24'), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/blog`,        lastModified: new Date('2025-04-24'), changeFrequency: 'weekly',  priority: 0.9 },
    ...blogPosts.map(slug => ({
      url: `${BASE}/blog/${slug}`,
      lastModified: new Date('2025-04-24'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${BASE}/about`,       lastModified: new Date('2025-04-24'), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/contact`,     lastModified: new Date('2025-04-24'), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`,     lastModified: new Date('2025-04-24'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/terms`,       lastModified: new Date('2025-04-24'), changeFrequency: 'yearly',  priority: 0.4 },
    { url: `${BASE}/disclaimer`,  lastModified: new Date('2025-04-24'), changeFrequency: 'yearly',  priority: 0.4 },
  ]
}
