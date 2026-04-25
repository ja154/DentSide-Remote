import React from 'react';
import { Link } from 'react-router-dom';
<<<<<<< HEAD
<<<<<<< HEAD
import { ArrowRight, BadgeCheck, Briefcase, Building2, PlayCircle, ShieldCheck, Stethoscope, Video } from 'lucide-react';
=======
import { Stethoscope, ArrowRight, Play, Check, Video, FileSearch, Briefcase, Building2 } from 'lucide-react';
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
=======
>>>>>>> 2f4dd20 (refactor: update Landing page layout with new navigation, hero section, and feature components)

interface LandingProps {
  onGetStarted: () => void;
}

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 10l-4 4l6 6l4-16l-18 7l4 2l2 6l3-4"/>
      </svg>
    ),
    title: 'Teledentistry',
    desc: 'HIPAA-compliant async & live video. 5–30 min triage sessions. No scheduling software required.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/>
      </svg>
    ),
    title: 'Claims Vault',
    desc: 'Review records remotely for major insurers. Submit expert opinions and prior auth documentation.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>
    ),
    title: 'Freelance Gigs',
    desc: 'Dental writing, tutoring, consulting. Post services or bid on projects from clinics globally.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      </svg>
    ),
    title: 'Corporate Roles',
    desc: 'Curated remote openings at DSOs and healthtech. One-click apply with your verified profile.',
  },
];

const TICKER_ITEMS = [
  'Teledentistry → $85/hr', 'Insurance Review → $120/hr',
  'Academic Writing', 'Case Consultation', 'Remote DSO Roles',
  'M-Pesa Payouts', 'AI Matchmaker', 'License Verification',
  'Teledentistry → $85/hr', 'Insurance Review → $120/hr',
  'Academic Writing', 'Case Consultation', 'Remote DSO Roles',
  'M-Pesa Payouts', 'AI Matchmaker', 'License Verification',
];

export default function Landing({ onGetStarted }: LandingProps) {
  return (
<<<<<<< HEAD
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
=======
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--color-ink)', color: 'var(--color-white)' }}>

      {/* ── Nav ── */}
      <nav style={{
        padding: '0 40px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-ink-3)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--color-ink)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="var(--color-teal)"/>
            <path d="M14 6c-2.2 0-4 1.8-4 4v4h2v-4a2 2 0 0 1 4 0v4h2v-4c0-2.2-1.8-4-4-4Z" fill="white"/>
            <circle cx="14" cy="18" r="3" fill="white"/>
          </svg>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '20px',
            letterSpacing: '-0.02em',
            color: 'var(--color-white)',
          }}>DentSide</span>
>>>>>>> 2f4dd20 (refactor: update Landing page layout with new navigation, hero section, and feature components)
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {NAV_LINKS.map(l => (
            <a key={l.href} href={l.href} style={{
              fontSize: '13px',
              color: 'var(--color-fog-3)',
              textDecoration: 'none',
              fontWeight: 400,
              letterSpacing: '0.01em',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'white')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-fog-3)')}
            >{l.label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onGetStarted} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-fog-3)', fontSize: '13px', fontWeight: 400,
            fontFamily: 'var(--font-sans)',
          }}>Log in</button>
          <button onClick={onGetStarted} className="ds-btn ds-btn-primary" style={{ fontSize: '13px' }}>
            Get started
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ padding: '120px 40px 80px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--color-ink-3)', border: '1px solid var(--color-ink-4)',
          borderRadius: '100px', padding: '6px 14px', marginBottom: '40px',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-teal-mid)', flexShrink: 0 }}/>
          <span style={{ fontSize: '12px', color: 'var(--color-fog-3)', fontWeight: 400 }}>Remote dental income, unified</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(52px, 8vw, 96px)',
          letterSpacing: '-0.04em',
          lineHeight: '0.94',
          color: 'var(--color-white)',
          marginBottom: '28px',
        }}>
          Your clinical<br/>
          <em style={{ fontStyle: 'italic', color: 'var(--color-teal-mid)' }}>career hub.</em>
        </h1>

        <p style={{
          fontSize: '18px',
          color: 'var(--color-fog-3)',
          maxWidth: '480px',
          margin: '0 auto 48px',
          lineHeight: '1.65',
          fontWeight: 300,
        }}>
          Stop juggling platforms. DentSide Remote connects verified dentists with teledentistry, insurance review, freelance gigs, and corporate roles — all in one dashboard.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={onGetStarted} className="ds-btn ds-btn-primary ds-btn-lg">
            Create free profile
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <a href="#features" className="ds-btn ds-btn-lg" style={{
            background: 'var(--color-ink-3)', color: 'var(--color-fog)',
            border: '1px solid var(--color-ink-4)', textDecoration: 'none', fontSize: '15px',
          }}>
            See how it works
          </a>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div style={{
        borderTop: '1px solid var(--color-ink-3)',
        borderBottom: '1px solid var(--color-ink-3)',
        padding: '14px 0',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'inline-block', animation: 'marquee 30s linear infinite', whiteSpace: 'nowrap' }}>
          {TICKER_ITEMS.map((item, i) => (
            <span key={i} style={{ marginRight: '0' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-fog-4)', fontWeight: 400, padding: '0 20px' }}>
                {item}
              </span>
              <span style={{ color: 'var(--color-ink-4)', fontSize: '12px' }}>—</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features ── */}
      <section id="features" style={{ background: 'var(--color-paper)', padding: '96px 40px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <div style={{ marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-teal)', fontWeight: 600, marginBottom: '12px' }}>
              Platform capabilities
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '-0.03em', color: 'var(--color-ink)', lineHeight: 1.1, maxWidth: '480px' }}>
              Every opportunity, one login.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--color-fog-2)', border: '1px solid var(--color-fog-2)', borderRadius: '12px', overflow: 'hidden' }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ background: 'var(--color-white)', padding: '40px 36px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '10px',
                  background: 'var(--color-teal-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-teal)',
                  marginBottom: '20px',
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--color-ink)', marginBottom: '10px', letterSpacing: '-0.01em' }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-ink-4)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ background: 'var(--color-ink)', padding: '96px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-teal-mid)', fontWeight: 600, marginBottom: '12px' }}>
              Pricing
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '42px', letterSpacing: '-0.03em', color: 'var(--color-white)', lineHeight: 1.1 }}>
              Start free. Scale when ready.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Free */}
            <div style={{ background: 'var(--color-ink-2)', border: '1px solid var(--color-ink-3)', borderRadius: '16px', padding: '36px 32px' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-fog-4)', fontWeight: 600, marginBottom: '12px' }}>Base Profile</p>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', letterSpacing: '-0.04em', color: 'var(--color-white)', lineHeight: 1, marginBottom: '8px' }}>Free</div>
              <p style={{ fontSize: '14px', color: 'var(--color-fog-4)', marginBottom: '32px' }}>Everything you need to start earning remotely.</p>

              {['Access to all freelance gigs', 'Standard identity verification', 'Global wallet & withdrawals', 'AI Matchmaker (BYOK)'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-teal-mid)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span style={{ fontSize: '14px', color: 'var(--color-fog-3)' }}>{item}</span>
                </div>
              ))}

              <button onClick={onGetStarted} className="ds-btn ds-btn-ghost" style={{ width: '100%', marginTop: '28px', color: 'var(--color-fog)', borderColor: 'var(--color-ink-4)' }}>
                Get started for free
              </button>
            </div>

            {/* Pro */}
            <div style={{ background: 'var(--color-teal)', border: '1px solid var(--color-teal)', borderRadius: '16px', padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }}/>
              <p style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontWeight: 600, marginBottom: '12px', position: 'relative' }}>Consult Pro</p>
              <div style={{ position: 'relative' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '52px', letterSpacing: '-0.04em', color: 'var(--color-white)', lineHeight: 1, marginBottom: '4px' }}>
                  $49<span style={{ fontSize: '18px', opacity: 0.7 }}>/mo</span>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '32px' }}>The complete toolkit for remote dental pioneers.</p>

                {['Priority gig matching', '0% platform commission', 'Expedited credential review', 'Premium support 24/7', 'Guaranteed daily rate access'].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.88)' }}>{item}</span>
                  </div>
                ))}

                <button onClick={onGetStarted} style={{
                  width: '100%', marginTop: '28px', padding: '12px',
                  background: 'white', color: 'var(--color-teal-dark)',
                  border: 'none', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-sans)',
                }}>
                  Upgrade to Pro
                </button>
              </div>
            </div>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </section>

<<<<<<< HEAD
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
=======
      {/* ── Footer Ticker ── */}
      <div style={{ background: 'var(--color-ink)', overflow: 'hidden', borderTop: '1px solid var(--color-ink-3)', paddingTop: '48px' }}>
        {/* Row 1 — scrolls left */}
        <div style={{ overflow: 'hidden', marginBottom: '8px' }}>
          <div style={{ display: 'inline-block', animation: 'marquee 22s linear infinite', whiteSpace: 'nowrap' }}>
            {[
              'Teledentistry', '·', 'Claims Review', '·', 'Freelance Gigs', '·',
              'Corporate Roles', '·', 'AI Matchmaker', '·', 'Stripe Payouts', '·',
              'M-Pesa', '·', 'HIPAA Compliant', '·', 'License Verified', '·',
              'Teledentistry', '·', 'Claims Review', '·', 'Freelance Gigs', '·',
              'Corporate Roles', '·', 'AI Matchmaker', '·', 'Stripe Payouts', '·',
              'M-Pesa', '·', 'HIPAA Compliant', '·', 'License Verified', '·',
            ].map((word, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 6vw, 80px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: word === '·' ? 'var(--color-teal)' : 'transparent',
                WebkitTextStroke: word === '·' ? '0' : '1px var(--color-ink-4)',
                marginRight: '24px',
                display: 'inline-block',
              }}>{word}</span>
            ))}
>>>>>>> 2f4dd20 (refactor: update Landing page layout with new navigation, hero section, and feature components)
          </div>
        </div>

<<<<<<< HEAD
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
=======
        {/* Row 2 — scrolls right */}
        <div style={{ overflow: 'hidden', marginBottom: '48px' }}>
          <div style={{ display: 'inline-block', animation: 'marquee-reverse 26s linear infinite', whiteSpace: 'nowrap' }}>
            {[
              '$85/hr', '·', 'Verified Dentists', '·', '$120/hr', '·',
              'Remote DSO Roles', '·', 'AI-Powered', '·', 'Global Network', '·',
              '0% Commission', '·', 'Instant Payouts', '·', 'KYC Protected', '·',
              '$85/hr', '·', 'Verified Dentists', '·', '$120/hr', '·',
              'Remote DSO Roles', '·', 'AI-Powered', '·', 'Global Network', '·',
              '0% Commission', '·', 'Instant Payouts', '·', 'KYC Protected', '·',
            ].map((word, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(48px, 6vw, 80px)',
                letterSpacing: '-0.03em',
                lineHeight: 1,
                color: word === '·' ? 'var(--color-teal)' : 'var(--color-ink-3)',
                marginRight: '24px',
                display: 'inline-block',
                fontStyle: i % 6 === 0 ? 'italic' : 'normal',
              }}>{word}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{
        background: 'var(--color-ink)',
        borderTop: '1px solid var(--color-ink-3)',
        padding: '28px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', color: 'var(--color-fog-3)', letterSpacing: '-0.01em' }}>DentSide Remote</span>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-4)' }}>© 2026 DentSide Remote. All rights reserved.</p>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[['Terms', '/terms'], ['Privacy', '/privacy'], ['Contact', 'mailto:support@dentsideremote.com']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '13px', color: 'var(--color-ink-4)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-fog-3)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-ink-4)')}
            >{label}</a>
          ))}
        </div>
      </footer>

      <style>{`
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes marquee-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        a { transition: color 0.15s ease; }
      `}</style>
>>>>>>> 2f4dd20 (refactor: update Landing page layout with new navigation, hero section, and feature components)
    </div>
  );
}
