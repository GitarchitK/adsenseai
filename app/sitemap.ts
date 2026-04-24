import type { MetadataRoute } from 'next'

const BASE = 'https://www.adsensechecker.in'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${BASE}`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE}/pricing`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE}/blog`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE}/blog/how-to-check-adsense-approval`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/adsense-approval-requirements`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/adsense-low-value-content-fix`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/how-many-articles-for-adsense-approval`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/adsense-approval-time`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/blog/why-adsense-keeps-rejecting-my-site`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE}/about`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE}/contact`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE}/privacy`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/terms`,
      lastModified: new Date('2025-04-23'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
