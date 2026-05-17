/**
 * Generates Article + BreadcrumbList JSON-LD schema for blog posts.
 * Use in every blog page for consistent structured data.
 */

const BASE = 'https://www.adsensechecker.in'

interface ArticleSchemaOptions {
  slug: string
  title: string
  description: string
  datePublished: string   // ISO 8601 e.g. '2026-05-07'
  dateModified?: string
  authorName?: string     // defaults to 'Navroll Studio'
  breadcrumbName: string  // short name for breadcrumb e.g. 'AdSense Policy Guide'
}

export function buildArticleSchema(opts: ArticleSchemaOptions) {
  const url = `${BASE}/blog/${opts.slug}`
  const author = opts.authorName ?? 'Navroll Studio'
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: opts.title,
      description: opts.description,
      url,
      datePublished: opts.datePublished,
      dateModified: opts.dateModified ?? opts.datePublished,
      author: {
        '@type': author === 'Navroll Studio' ? 'Organization' : 'Person',
        name: author,
        url: BASE,
      },
      publisher: {
        '@type': 'Organization',
        name: 'AdSense Checker AI',
        url: BASE,
        logo: { '@type': 'ImageObject', url: `${BASE}/icon.svg` },
      },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      image: { '@type': 'ImageObject', url: `${BASE}/og-image.png`, width: 1200, height: 630 },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE}/blog` },
        { '@type': 'ListItem', position: 3, name: opts.breadcrumbName, item: url },
      ],
    },
  ]
}
