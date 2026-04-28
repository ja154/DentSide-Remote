import React from 'react';
import BrandMark from '../components/BrandMark';

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

export default function LandingPage({ onGetStarted }: LandingProps) {
  return (
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
        <BrandMark size={30} textColor="#fff" subTextColor="rgba(255,255,255,0.75)" />

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
          </div>
        </div>
      </section>

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
          </div>
        </div>

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
    </div>
  );
}
