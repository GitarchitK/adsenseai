'use client'

import { useState } from 'react'

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    // Simulate send — replace with your email API if needed
    await new Promise(r => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-950/30 p-8 text-center">
        <div className="text-3xl mb-3">✅</div>
        <p className="font-bold text-foreground mb-1">Message sent!</p>
        <p className="text-sm text-muted-foreground">We&apos;ll get back to you within 24 hours.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-7">
      <h3 className="font-bold text-foreground mb-5">Send us a message</h3>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Name</label>
          <input required type="text" placeholder="Your name" className="w-full h-11 rounded-xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Email</label>
          <input required type="email" placeholder="you@example.com" className="w-full h-11 rounded-xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <input required type="text" placeholder="How can we help?" className="w-full h-11 rounded-xl border border-border/80 bg-muted/30 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors" />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Message</label>
          <textarea required rows={4} placeholder="Tell us more..." className="w-full rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background transition-colors resize-none" />
        </div>
        <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-60">
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
