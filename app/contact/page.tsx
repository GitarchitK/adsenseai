import { Navbar } from '@/components/navbar'
import { SiteFooter } from '@/components/site-footer'
import { Mail, MessageSquare, Clock } from 'lucide-react'
import { ContactForm } from './contact-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact AdSenseAI — AdSense Checker Support',
  description: 'Get help with AdSenseAI\'s AdSense checker and website audit tool. Contact our support team for questions about your AdSense audit results.',
  alternates: { canonical: 'https://adsenseai.in/contact' },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative overflow-hidden mesh-bg">
        <div className="absolute inset-0 dot-grid-anim opacity-40" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="hero-orb-1 absolute top-[-10%] right-[10%] w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />
        </div>
        <div className="relative container mx-auto px-6 pt-20 pb-28 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold text-primary mb-6">
            <MessageSquare className="h-3.5 w-3.5" /> Get in Touch
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4">We&apos;re here to help</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Have a question, feedback, or need support? We typically respond within 24 hours.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="container mx-auto px-6 py-20 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-foreground mb-4">Contact information</h2>
              <p className="text-muted-foreground leading-relaxed">
                We&apos;re a small team passionate about helping publishers succeed with AdSense. Reach out and we&apos;ll get back to you as soon as possible.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Mail,          title: 'Email',         value: 'support@adsenseai.in',  desc: 'For general inquiries and support' },
                { icon: MessageSquare, title: 'Billing',       value: 'billing@adsenseai.in',  desc: 'For payment and subscription issues' },
                { icon: Clock,         title: 'Response time', value: 'Within 24 hours',       desc: 'Monday to Saturday, 9am–6pm IST' },
              ].map(({ icon: Icon, title, value, desc }) => (
                <div key={title} className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{title}</p>
                    <p className="font-semibold text-foreground text-sm">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
