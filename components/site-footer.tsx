import Link from 'next/link'

const footerLinks = {
  Product: [
    { href: '/#features', label: 'Features' },
    { href: '/pricing',   label: 'Pricing' },
    { href: '/dashboard', label: 'Dashboard' },
  ],
  'AdSense Guides': [
    { href: '/blog', label: 'All Guides' },
    { href: '/blog/how-to-check-adsense-approval', label: 'How to Check Approval' },
    { href: '/blog/adsense-approval-requirements', label: 'Approval Requirements' },
    { href: '/blog/why-adsense-keeps-rejecting-my-site', label: 'Why AdSense Rejects Sites' },
  ],
  'AdSense Resources': [
    { href: 'https://support.google.com/adsense/?hl=en#topic=16344192', label: 'AdSense Help Center' },
    { href: 'https://support.google.com/adsense/answer/48182?hl=en', label: 'Program Policies' },
    { href: 'https://support.google.com/adsense/answer/9724?hl=en', label: 'AdSense Approval Guide' },
    { href: 'https://support.google.com/adsense/answer/1346295?hl=en', label: 'Ad Placement Tips' },
  ],
  Company: [
    { href: '/about',   label: 'About Us' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog',    label: 'Guides' },
  ],
  Legal: [
    { href: '/privacy',    label: 'Privacy Policy' },
    { href: '/terms',      label: 'Terms of Service' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
  Account: [
    { href: '/auth/login',  label: 'Sign In' },
    { href: '/auth/signup', label: 'Sign Up Free' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/20">
      <div className="container mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden">
                <img src="/icon.svg" alt="AdSenseAI" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-foreground">AdSense Approval <span className="text-primary">Checker AI</span></span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px] mb-2">
              AI-powered AdSense readiness analysis for publishers.
            </p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
              A Product of Navroll Studio
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
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            © {new Date().getFullYear()} AdSense Checker AI by Navroll Studio. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex flex-wrap gap-5 text-xs text-muted-foreground justify-center">
            <Link href="/privacy"    className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms"     className="hover:text-foreground transition-colors">Terms</Link>
            <Link href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</Link>
            <Link href="/blog"      className="hover:text-foreground transition-colors">Guides</Link>
            <Link href="/contact"   className="hover:text-foreground transition-colors">Contact</Link>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
          This site uses Google AdSense. Google uses cookies to serve ads based on your prior visits. <Link href="/privacy" className="underline hover:text-muted-foreground">Learn more</Link>. AdSense Checker AI is not affiliated with Google LLC.
        </p>
      </div>
    </footer>
  )
}
