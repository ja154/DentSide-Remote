<<<<<<< HEAD
import { useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Bell,
  Briefcase,
  LayoutDashboard,
  Loader2,
  LogOut,
  Sparkles,
  UserCircle2,
  Wallet,
  X,
} from 'lucide-react';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;

export default function Dashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
=======
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Wallet, ShieldCheck,
  Bell, LogOut, Loader2, Key, Sparkles, CalendarX,
  TrendingUp, Clock
} from 'lucide-react';

function Sidebar({ activePath }: { activePath: string }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Gigs', href: '/opportunities', icon: Briefcase },
    { label: 'Wallet', href: '/wallet', icon: Wallet },
    { label: 'Profile', href: '/verification', icon: ShieldCheck },
  ];

  return (
    <aside className="ds-sidebar">
      <div className="ds-sidebar-logo">
        <div className="ds-sidebar-logo-mark">DentSide</div>
        <div className="ds-sidebar-logo-sub">Remote Platform</div>
      </div>
      <nav className="ds-sidebar-nav">
        <div className="ds-sidebar-section">
          <div className="ds-sidebar-section-label">Navigation</div>
          {navItems.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`ds-nav-item${activePath === href ? ' active' : ''}`}
            >
              <Icon size={16} className="nav-icon" />
              {label}
            </Link>
          ))}
        </div>
        <div className="ds-sidebar-section" style={{ marginTop: 'auto' }}>
          <button
            className="ds-nav-item"
            style={{ color: 'var(--color-ruby)' }}
            onClick={async () => { await logout(); navigate('/'); }}
          >
            <LogOut size={16} className="nav-icon" />
            Sign Out
          </button>
        </div>
      </nav>
    </aside>
  );
}

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)

  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

<<<<<<< HEAD
  const profileStrength = useMemo(() => {
    const points = [profile?.displayName, profile?.email, profile?.photoURL].filter(Boolean).length;
    return Math.round((points / 3) * 100);
  }, [profile]);

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key first.');
      return;
    }

=======
  const handleAIMatch = async () => {
    if (!apiKey) { alert('Please enter your Gemini API Key first.'); return; }
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
    setIsMatching(true);
    try {
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          profile: {
            experience: profile?.experience || 'General Dental Practitioner',
            licenses: profile?.licenses || ['Pending License Review'],
            availability: profile?.availability || 'Open',
            interests: profile?.interests || ['General Consulting', 'Teledentistry'],
          },
        }),
      });
<<<<<<< HEAD

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch matches');
      }

      const data = await response.json();
      setMatches(Array.isArray(data) ? data : []);
=======
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed'); }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) setMatches(data);
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-background text-on-surface font-body">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-primary">DentSide</Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </NavLink>
            <NavLink to="/opportunities" className={navLinkClass}>
              <Briefcase className="h-4 w-4" /> Gigs
            </NavLink>
            <NavLink to="/wallet" className={navLinkClass}>
              <Wallet className="h-4 w-4" /> Wallet
            </NavLink>
            <NavLink to="/verification" className={navLinkClass}>
              <UserCircle2 className="h-4 w-4" /> Profile
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-white">1</span>
            </button>

            {showNotifications && (
              <div className="absolute right-20 top-14 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold">Notifications</h4>
                  <button type="button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">Your profile is almost complete. Finish verification to increase your match rate.</p>
              </div>
            )}

            <button
              onClick={async () => {
                await logout();
                navigate('/');
              }}
              className="hidden items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 md:inline-flex"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>

            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20">
              <img alt="User avatar" className="h-full w-full object-cover" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} />
            </div>
=======
    <div className="ds-layout">
      <Sidebar activePath={location.pathname} />

      {/* Top Bar */}
      <header className="ds-topbar">
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>
            Good day, <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>{profile?.displayName || 'Doctor'}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ padding: '7px 10px', borderRadius: '50%' }}>
            <Bell size={15} />
          </button>
          <div className="ds-avatar ds-avatar-md" style={{ overflow: 'hidden' }}>
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 md:px-6">
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">Remote command center</p>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Welcome back, {profile?.displayName || 'Doctor'}</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Stay on top of gigs, complete profile verification, and improve your AI match quality from one dashboard.</p>
          </div>
          <Link
            to="/verification"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Improve Profile
          </Link>
        </section>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
            <p className="text-sm font-semibold text-slate-500">Monthly earnings</p>
            <h2 className="mt-2 text-4xl font-extrabold tracking-tight">$0.00</h2>
            <p className="mt-3 text-sm text-slate-600">No payouts yet this month. Completing verification unlocks premium consult opportunities.</p>
            <Link to="/wallet" className="mt-5 inline-flex rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
              Open wallet
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Profile strength</p>
            <p className="mt-2 text-3xl font-extrabold">{profileStrength}%</p>
            <div className="mt-4 h-2 w-full rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${profileStrength}%` }} />
            </div>
            <p className="mt-3 text-xs text-slate-600">Complete your verification checklist to improve this score.</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="mb-4 text-2xl font-bold">Active Gigs</h3>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-slate-300" />
              <h4 className="mt-3 text-lg font-bold">No active gigs</h4>
              <p className="mt-1 text-sm text-slate-600">You’re all clear right now. Explore opportunities and apply for new remote roles.</p>
              <Link to="/opportunities" className="mt-4 inline-flex rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Browse opportunities
=======
      {/* Main */}
      <main className="ds-main">
        {/* Page Header */}
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Clinical Workspace</p>
          <h1 className="ds-page-title">Welcome back, {profile?.displayName?.split(' ')[0] || 'Dr.'}</h1>
          <p className="ds-page-subtitle">You have 0 active consultations scheduled for today.</p>
        </div>

        {/* Stats Row */}
        <div className="ds-grid-3" style={{ marginBottom: 28 }}>
          {/* Earnings Hero Card */}
          <div className="ds-card ds-card-teal" style={{ gridColumn: 'span 2', padding: 28, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <p className="ds-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Earnings This Month</p>
                <p className="ds-stat-value" style={{ color: '#fff' }}>$0.00</p>
                <p className="ds-stat-meta" style={{ color: 'rgba(255,255,255,0.55)' }}>0% vs last month</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: '#fff', fontWeight: 600, letterSpacing: '0.04em' }}>
                THIS MONTH
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Completed</p>
                <p style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}>0</p>
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>Hours</p>
                <p style={{ fontSize: 22, fontFamily: 'var(--font-display)', color: '#fff', letterSpacing: '-0.02em' }}>0h</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link to="/wallet" style={{ background: '#fff', color: 'var(--color-teal-dark)', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', textDecoration: 'none', display: 'inline-block' }}>
                  WITHDRAW FUNDS
                </Link>
              </div>
            </div>
            <TrendingUp size={120} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: -20, bottom: -20 }} />
          </div>

          {/* Verification Card */}
          <div className="ds-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div className="ds-card-header" style={{ padding: '0 0 16px 0', border: 'none', marginBottom: 16 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>Verification</span>
              <ShieldCheck size={16} color="var(--color-amber)" />
            </div>
            <div className="ds-progress-track" style={{ marginBottom: 12 }}>
              <div className="ds-progress-fill" style={{ width: '40%', background: 'var(--color-amber)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.55, flex: 1 }}>
              Credentials are <strong style={{ color: 'var(--color-ink)' }}>40% complete</strong>. Add your license to unlock gigs.
            </p>
            <Link to="/verification" className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 20, justifyContent: 'center' }}>
              Update License
            </Link>
          </div>
        </div>

        {/* Bottom Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
          {/* Active Gigs */}
          <div>
            <div className="ds-card-header" style={{ background: 'none', border: 'none', padding: '0 0 20px 0', marginBottom: 0 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>Active Gigs</h2>
              <Link to="/opportunities" style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600, textDecoration: 'none' }}>View All</Link>
            </div>
            <div className="ds-card" style={{ padding: 40, textAlign: 'center' }}>
              <CalendarX size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>No Active Gigs</h4>
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>You don't have any active gigs scheduled for today.</p>
              <Link to="/opportunities" className="ds-btn ds-btn-primary ds-btn-sm" style={{ marginTop: 20 }}>
                Browse Opportunities
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
              </Link>
            </div>
          </div>

<<<<<<< HEAD
          <div className="lg:col-span-5">
            <h3 className="mb-4 text-2xl font-bold">AI Matchmaker</h3>
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gemini API key (BYOK)</label>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 p-2">
                <input
                  type="password"
                  placeholder="Enter Gemini API key"
                  value={apiKey}
                  onChange={(event) => setApiKey(event.target.value)}
                  className="flex-1 border-none bg-transparent px-2 text-sm outline-none"
                />
                <button
                  onClick={handleAIMatch}
                  disabled={isMatching || !apiKey}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isMatching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Find matches'}
=======
          {/* AI Matchmaker */}
          <div>
            <div className="ds-card-header" style={{ background: 'none', border: 'none', padding: '0 0 20px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>AI Matchmaker</h2>
              <Sparkles size={16} color="var(--color-teal)" />
            </div>
            <div className="ds-card" style={{ padding: 20 }}>
              {/* API Key Input */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Key size={14} color="var(--color-fog-4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="password"
                    placeholder="Gemini API Key"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="ds-input"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                  />
                </div>
                <button
                  onClick={handleAIMatch}
                  disabled={isMatching || !apiKey}
                  className="ds-btn ds-btn-primary ds-btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {isMatching ? <Loader2 size={14} className="spin" /> : 'Find'}
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
                </button>
              </div>

              {matches.length > 0 ? (
<<<<<<< HEAD
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-200 p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{match.title}</h4>
                        <span className="text-sm font-bold text-primary">{match.rate}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{match.company} • {match.match} Match</p>
                    </div>
                  ))}
=======
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {matches.map((match, idx) => (
                    <div key={idx} style={{ padding: '14px 16px', border: '1px solid var(--color-fog-2)', borderRadius: 10, cursor: 'pointer', transition: 'border-color 0.15s' }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-teal-mid)')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-fog-2)')}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)' }}>{match.title}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 700 }}>{match.rate}</span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', marginBottom: 8 }}>{match.company} · {match.match} Match</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {match.tags.map((tag: string, i: number) => (
                          <span key={i} className="ds-tag" style={{ fontSize: 10 }}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <Sparkles size={28} color="var(--color-fog-3)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Enter your API key to get personalised gig recommendations.</p>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
                </div>
              ) : (
                <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">Add your API key to generate personalized opportunities instantly.</p>
              )}
<<<<<<< HEAD
=======

              <Link to="/opportunities" className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Explore All Gigs
              </Link>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
            </div>
          </div>
        </div>
      </main>
<<<<<<< HEAD

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Home</NavLink>
          <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
          <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
          <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
        </div>
      </nav>
=======
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
    </div>
  );
}
