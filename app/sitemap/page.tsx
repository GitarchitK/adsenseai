import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const sections = [
  {
    title: 'Main Pages',
    links: [
      { href: '/',         label: 'Home',          desc: 'Landing page and product overview' },
      { href: '/pricing',  label: 'Pricing',        desc: 'Plans, pricing, and feature comparison' },
      { href: '/about',    label: 'About Us',       desc: 'Our story, mission, and values' },
      { href: '/contact',  label: 'Contact',        desc: 'Get in touch with our team' },
    ],
  },
  {
    title: 'Account',
    links: [
      { href: '/auth/login',  label: 'Sign In',       desc: 'Sign in to your account' },
      { href: '/auth/signup', label: 'Sign Up',        desc: 'Create a free account' },
    ],
  },
  {
    title: 'Dashboard',
    links: [
      { href: '/dashboard',           label: 'Dashboard',    desc: 'Run scans and view your overview' },
      { href: '/dashboard/scans',     label: 'My Scans',     desc: 'View your complete scan history' },
      { href: '/dashboard/results',   label: 'Scan Results', desc: 'View detailed scan reports' },
      { href: '/dashboard/ai-tools',  label: 'AI Tools',     desc: 'Content rewriting and generators (Pro)' },
      { href: '/dashboard/settings',  label: 'Settings',     desc: 'Account and billing settings' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy',  desc: 'How we collect and use your data' },
      { href: '/terms',   label: 'Terms of Service', desc: 'Terms and conditions of use' },
      { href: '/sitemap', label: 'Sitemap',          desc: 'All pages on AdSenseAI' },
    ],
  },
]

export default function SitemapPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-foreground mb-2">Sitemap</h1>
          <p className="text-sm text-muted-foreground">All pages on AdSenseAI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map(({ title, links }) => (
            <div key={title}>
              <h2 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">{title}</h2>
              <div className="space-y-2">
                {links.map(({ href, label, desc }) => (
                  <Link key={href} href={href} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-sm transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
