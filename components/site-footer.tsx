import Link from 'next/link'

const footerLinks = {
  'Monetization Guides': [
    { href: '/blog/adsense-high-cpc-niches-2026', label: 'High CPC Niches 2026' },
    { href: '/blog/how-to-increase-adsense-cpc-rpm', label: 'Increase CPC & RPM' },
    { href: '/blog/adsense-vs-ezoic-vs-mediavine', label: 'AdSense vs Ezoic vs Mediavine' },
    { href: '/blog/website-monetization-strategies', label: 'Monetization Strategies' },
  ],
  'Policy & Approval': [
    { href: '/blog', label: 'All Publisher Guides' },
    { href: '/blog/adsense-approval-requirements', label: 'Approval Checklist' },
    { href: '/blog/adsense-low-value-content-fix', label: 'Fix Low Value Content' },
    { href: '/blog/why-adsense-keeps-rejecting-my-site', label: 'Why AdSense Rejects Sites' },
    { href: '/blog/thin-content-guide', label: 'Thin Content Guide' },
  ],
  'Official Resources': [
    { href: 'https://support.google.com/adsense/?hl=en#topic=16344192', label: 'AdSense Help Center' },
    { href: 'https://support.google.com/adsense/answer/48182?hl=en', label: 'Program Policies' },
    { href: 'https://support.google.com/adsense/answer/9724?hl=en', label: 'AdSense Approval Guide' },
    { href: 'https://support.google.com/adsense/answer/1346295?hl=en', label: 'Ad Placement Tips' },
  ],
  Company: [
    { href: '/about',   label: 'About Our Publication' },
    { href: '/contact', label: 'Contact Editorial Team' },
    { href: '/blog',    label: 'Publisher Insights' },
  ],
  Legal: [
    { href: '/privacy',    label: 'Privacy Policy' },
    { href: '/terms',      label: 'Terms of Service' },
    { href: '/disclaimer', label: 'Legal Disclaimer' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-sm bg-primary/10">
                <img src="/icon.svg" alt="AdSense Publisher Insights" className="w-full h-full object-cover" width="32" height="32" loading="lazy" />
              </div>
              <span className="font-black text-foreground">AdSense <span className="text-primary">Insights</span></span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px] mb-2">
              Independent educational blog & publisher insights portal.
            </p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Published by Navroll Studio
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <p className="text-[11px] font-bold text-foreground uppercase tracking-widest mb-4">{section}</p>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => {
                  const isExternal = href.startsWith('http')
                  return (
                    <li key={href}>
                      <Link 
                        href={href} 
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} AdSense Checker AI by Navroll Studio. All rights reserved.
          </p>
          <div className="flex flex-wrap gap-5 text-xs text-muted-foreground justify-center">
            <Link href="/privacy"    className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms"     className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Legal Disclaimer</Link>
            <Link href="/blog"      className="hover:text-foreground transition-colors">AdSense Approval Guides</Link>
            <Link href="/contact"   className="hover:text-foreground transition-colors">Contact Our Team</Link>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
          This site uses Google AdSense. Google uses cookies to serve ads based on your prior visits. <Link href="/privacy" className="underline hover:text-muted-foreground">Learn more</Link>. AdSense Checker AI is an independent educational publication and is not affiliated with Google LLC.
        </p>
        <p className="text-center text-[10px] text-muted-foreground/30 mt-2">
          v3.0.0 — Educational Blog Edition
        </p>
      </div>
    </footer>
  )
}
