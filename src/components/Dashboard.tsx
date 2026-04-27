import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell, Loader2, Key, Sparkles, CalendarX, ShieldCheck,
  Menu,
  TrendingUp
} from 'lucide-react';
import DentistSidebar from './DentistSidebar';

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const profileStrength = useMemo(() => {
    const points = [profile?.displayName, profile?.email, profile?.photoURL].filter(Boolean).length;
    return Math.round((points / 3) * 100);
  }, [profile]);

  const handleAIMatch = async () => {
    if (!apiKey) { alert('Please enter your Gemini API Key first.'); return; }
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
      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Failed'); }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) setMatches(data);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="ds-layout">
      {isSidebarOpen && (
        <button
          type="button"
          className="ds-sidebar-backdrop md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <DentistSidebar
        pathname={location.pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Top Bar */}
      <header className="ds-topbar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="ds-sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={16} />
          </button>
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
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ds-main">
        {/* Page Header */}
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Clinical Workspace</p>
          <h1 className="ds-page-title">Welcome back, {profile?.displayName?.split(' ')[0] || 'Dr.'}</h1>
          <p className="ds-page-subtitle">You have 0 active consultations scheduled for today.</p>
        </div>

        {/* Stats Row */}
        <div className="mb-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {/* Earnings Hero Card */}
          <div className="ds-card ds-card-teal md:col-span-2" style={{ padding: 28, position: 'relative', overflow: 'hidden' }}>
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
              <div className="ds-progress-fill" style={{ width: `${profileStrength}%`, background: 'var(--color-amber)' }} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.55, flex: 1 }}>
              Credentials are <strong style={{ color: 'var(--color-ink)' }}>{profileStrength}% complete</strong>. Add your license to unlock gigs.
            </p>
            <Link to="/verification" className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 20, justifyContent: 'center' }}>
              Update License
            </Link>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="ds-main-split">
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
              </Link>
            </div>
          </div>

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
                </button>
              </div>

              {matches.length > 0 ? (
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
                </div>
              )}

              <Link to="/opportunities" className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}>
                Explore All Gigs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
