import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
import { ArrowRight, BadgeCheck, Briefcase, Building2, PlayCircle, ShieldCheck, Stethoscope, Video } from 'lucide-react';
=======
import { Stethoscope, ArrowRight, Play, Check, Video, FileSearch, Briefcase, Building2 } from 'lucide-react';
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)

interface LandingProps {
  onGetStarted: () => void;
}

const MARQUEE_ITEMS = [
  'Teledentistry', '·', 'Claims Review', '·', 'Freelance Gigs', '·',
  'Corporate Roles', '·', 'AI Matching', '·', 'Stripe Payouts', '·',
  'M-Pesa', '·', 'HIPAA Compliant', '·', 'Identity Verified', '·',
  'Teledentistry', '·', 'Claims Review', '·', 'Freelance Gigs', '·',
  'Corporate Roles', '·', 'AI Matching', '·', 'Stripe Payouts', '·',
  'M-Pesa', '·', 'HIPAA Compliant', '·', 'Identity Verified', '·',
];

export default function Landing({ onGetStarted }: LandingProps) {
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background font-body text-on-surface">
      <nav className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-6 w-6" />
            <span className="text-xl font-extrabold tracking-tight">DentSide</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-primary">Features</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-600 hover:text-primary">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:block">
              Log in
            </button>
            <button onClick={onGetStarted} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary/90">
              Start earning <ArrowRight className="h-4 w-4" />
=======
    <div style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── Hero ── */}
      <section className="ds-hero-section">
        {/* Nav */}
        <nav className="ds-hero-nav">
          <div className="flex items-center gap-2">
            <div style={{ background: 'var(--color-teal)', borderRadius: 8, padding: '6px 8px', display: 'flex', alignItems: 'center' }}>
              <Stethoscope size={18} color="#fff" />
            </div>
            <span className="font-display" style={{ fontSize: 20, color: 'var(--color-white)', letterSpacing: '-0.02em' }}>
              DentSide
            </span>
            <span style={{ fontSize: 10, color: 'var(--color-ink-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginLeft: 4, fontWeight: 600 }}>
              Remote
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" style={{ color: 'var(--color-fog-3)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--color-white)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-fog-3)')}>
              Features
            </a>
            <a href="#pricing" style={{ color: 'var(--color-fog-3)', fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'color 0.15s' }}
              onMouseOver={e => (e.currentTarget.style.color = 'var(--color-white)')}
              onMouseOut={e => (e.currentTarget.style.color = 'var(--color-fog-3)')}>
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={onGetStarted} className="ds-btn ds-btn-ghost ds-btn-sm"
              style={{ color: 'var(--color-fog-3)', borderColor: 'var(--color-ink-3)' }}>
              Log In
            </button>
            <button onClick={onGetStarted} className="ds-btn ds-btn-primary ds-btn-sm">
              Start Earning <ArrowRight size={14} />
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
            </button>
          </div>
        </nav>

<<<<<<< HEAD
      <section className="relative overflow-hidden pb-24 pt-40">
        <div className="absolute inset-0 bg-primary/5" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mx-auto max-w-4xl">
            <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-primary">
              <BadgeCheck className="h-4 w-4" /> The Future of Dental Careers
            </span>
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight md:text-7xl">
              Your all-in-one <span className="text-primary">remote career hub</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 md:text-xl">
              DentSide Remote unifies teledentistry, insurance review, freelance gigs, and corporate roles into one trusted dashboard.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button onClick={onGetStarted} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-md hover:bg-primary/90 sm:w-auto">
                Create free profile <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#features" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto">
                <PlayCircle className="h-4 w-4 text-primary" /> Watch demo
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-extrabold md:text-4xl">Every opportunity, one login</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">Focus on clinical excellence while we centralize remote opportunities and credential trust.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={<Video className="h-6 w-6" />} title="Teledentistry" description="Built-in secure video for triage, consults, and treatment planning." />
            <FeatureCard icon={<ShieldCheck className="h-6 w-6" />} title="Claims Vault" description="Review records remotely and submit expert prior-authorization insights." />
            <FeatureCard icon={<Briefcase className="h-6 w-6" />} title="Freelance Gigs" description="Bid on writing, tutoring, and consulting projects in one place." />
            <FeatureCard icon={<Building2 className="h-6 w-6" />} title="Corporate Roles" description="Discover curated remote roles from DSOs and dental tech companies." />
          </div>
        </div>
      </section>

      <section id="pricing" className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto grid max-w-4xl gap-6 px-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h3 className="text-3xl font-extrabold">Free</h3>
            <p className="mt-2 text-sm text-slate-600">Perfect for getting started and building visibility.</p>
            <button onClick={onGetStarted} className="mt-8 w-full rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Get started</button>
          </div>
          <div className="rounded-2xl bg-primary p-8 text-white shadow-xl">
            <h3 className="text-3xl font-extrabold">Consult Pro</h3>
            <p className="mt-2 text-sm text-white/90">Priority matching, expedited verification, and premium support.</p>
            <button onClick={onGetStarted} className="mt-8 w-full rounded-xl bg-white py-3 text-sm font-bold text-primary hover:bg-slate-100">Upgrade to Pro</button>
=======
        {/* Hero Content */}
        <div className="ds-hero-content">
          <div style={{ maxWidth: 720 }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="ds-badge ds-badge-teal" style={{ marginBottom: 28, fontSize: 11 }}>
                The Future of Dental Careers
              </div>
              <h1 className="ds-hero-h1">
                Your All-in-One<br />
                <em>Remote Career Hub</em>
              </h1>
              <p className="ds-hero-body">
                Stop jumping between platforms. DentSide Remote unifies teledentistry, insurance review, freelance gigs, and corporate roles into a single dashboard.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={onGetStarted} className="ds-btn ds-btn-primary ds-btn-lg">
                  Create Free Profile <ArrowRight size={16} />
                </button>
                <a href="#features" className="ds-btn ds-btn-ghost ds-btn-lg"
                  style={{ color: 'var(--color-fog-3)', borderColor: 'var(--color-ink-3)' }}>
                  <Play size={16} /> Watch Demo
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        <div className="ds-hero-marquee">
          <div className="ds-marquee-inner">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} style={{ marginRight: 32, fontSize: 12, letterSpacing: '0.1em', color: 'var(--color-ink-4)', fontWeight: 500 }}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="ds-feature-row" style={{ padding: '96px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="ds-page-eyebrow">Platform</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.03em', color: 'var(--color-ink)', lineHeight: 1.05, marginBottom: 16 }}>
              Every Opportunity, One Login
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-ink-4)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              We've consolidated the fragmented remote dental market so you can focus on what you do best: providing clinical expertise.
            </p>
          </div>

          <div className="ds-feature-grid">
            <FeatureItem icon={<Video size={20} color="var(--color-teal)" />} title="Teledentistry" description="Built-in HIPAA-compliant video. 5–30 min sessions for emergency advice, triage, and treatment planning." />
            <FeatureItem icon={<FileSearch size={20} color="var(--color-teal)" />} title="Claims Vault" description="Review records remotely for major insurers. Submit expert opinions for prior authorizations." />
            <FeatureItem icon={<Briefcase size={20} color="var(--color-teal)" />} title="Freelance Gigs" description="Dental writing, online tutoring, and consulting. Bid on projects or post your own services." />
            <FeatureItem icon={<Building2 size={20} color="var(--color-teal)" />} title="Corporate Roles" description="Curated job board for remote roles at DSOs and tech companies. One-click apply." />
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ background: 'var(--color-ink)', padding: '96px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p className="ds-page-eyebrow" style={{ color: 'var(--color-teal-mid)' }}>Pricing</p>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px,4vw,48px)', letterSpacing: '-0.03em', color: 'var(--color-white)', lineHeight: 1.05, marginBottom: 16 }}>
              Simple, Transparent Pricing
            </h2>
            <p style={{ fontSize: 16, color: 'var(--color-fog-3)', maxWidth: 440, margin: '0 auto' }}>
              Start free. Upgrade when you're ready to maximise your clinical earnings.
            </p>
          </div>

          <div className="ds-grid-2" style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Free */}
            <div className="ds-card ds-card-dark" style={{ padding: 36, display: 'flex', flexDirection: 'column' }}>
              <div className="ds-badge ds-badge-fog" style={{ marginBottom: 20, alignSelf: 'flex-start' }}>Base Profile</div>
              <div className="font-display" style={{ fontSize: 52, letterSpacing: '-0.04em', color: 'var(--color-white)', lineHeight: 1, marginBottom: 8 }}>
                Free
              </div>
              <p style={{ fontSize: 13, color: 'var(--color-fog-4)', marginBottom: 32 }}>Perfect for building your digital clinical presence.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
                {['Access to freelance gigs', 'Standard identity verification', 'Global wallet withdrawals'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--color-fog-3)' }}>
                    <Check size={14} color="var(--color-teal-mid)" strokeWidth={2.5} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} className="ds-btn ds-btn-ghost" style={{ color: 'var(--color-fog-3)', borderColor: 'var(--color-ink-3)', width: '100%', justifyContent: 'center' }}>
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="ds-card ds-card-teal" style={{ padding: 36, display: 'flex', flexDirection: 'column', transform: 'translateY(-8px)' }}>
              <div className="ds-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: 20, alignSelf: 'flex-start' }}>Consult Pro</div>
              <div className="font-display" style={{ fontSize: 52, letterSpacing: '-0.04em', color: 'var(--color-white)', lineHeight: 1, marginBottom: 8 }}>
                $49<span style={{ fontSize: 20, fontFamily: 'var(--font-sans)', fontWeight: 400, opacity: 0.75 }}>/mo</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 32 }}>The ultimate toolkit for remote dental pioneers.</p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, flex: 1 }}>
                {['Priority matching for high-rate consults', '0% marketplace commission', 'Expedited clinical verification', 'Premium support network'].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.88)' }}>
                    <Check size={14} color="#fff" strokeWidth={2.5} /> {f}
                  </li>
                ))}
              </ul>
              <button onClick={onGetStarted} style={{ background: '#fff', color: 'var(--color-teal-dark)', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%', letterSpacing: '0.01em', transition: 'opacity 0.15s' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                Upgrade to Pro
              </button>
            </div>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span className="text-lg font-bold">DentSide Remote</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 DentSide Remote. All rights reserved.</p>
          <div className="flex gap-5 text-sm font-semibold text-slate-600">
            <Link to="/terms" className="hover:text-primary">Terms</Link>
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <a href="mailto:support@dentsideremote.com" className="hover:text-primary">Contact</a>
=======
      {/* ── Footer ── */}
      <footer style={{ background: 'var(--color-ink-2)', borderTop: '1px solid var(--color-ink-3)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div className="flex items-center gap-2">
            <Stethoscope size={16} color="var(--color-teal-mid)" />
            <span className="font-display" style={{ fontSize: 16, color: 'var(--color-white)' }}>DentSide Remote</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>© 2026 DentSide Remote. All rights reserved.</p>
          <div className="flex gap-6">
            {[['Terms', '/terms'], ['Privacy', '/privacy']].map(([label, href]) => (
              <Link key={label} to={href} style={{ color: 'var(--color-fog-4)', fontSize: 12, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {label}
              </Link>
            ))}
            <a href="mailto:support@dentsideremote.com" style={{ color: 'var(--color-fog-4)', fontSize: 12, fontWeight: 600, textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Contact
            </a>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </footer>
    </div>
  );
}

<<<<<<< HEAD
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
=======
function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="ds-feature-item">
      <div className="ds-feature-icon">{icon}</div>
      <h3 className="font-display" style={{ fontSize: 22, letterSpacing: '-0.02em', color: 'var(--color-ink)', marginBottom: 10 }}>
        {title}
      </h3>
      <p style={{ fontSize: 14, color: 'var(--color-ink-4)', lineHeight: 1.65 }}>{description}</p>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
    </div>
  );
}
