import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { showPending } from '../lib/ui';
import {
  LayoutDashboard, Briefcase, Wallet, ShieldCheck, Bell, LogOut,
  Search, SlidersHorizontal, MapPin, DollarSign, SearchX,
  TrendingUp, PlusSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gigs', href: '/opportunities', icon: Briefcase },
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/verification', icon: ShieldCheck },
];

const TRENDING_SKILLS = ['Invisalign', 'iTero Scanning', 'Dental AI', 'Sleep Apnea', 'Implants', 'Oral Surgery'];

export default function OpportunityEngine() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="ds-layout">
      {/* Sidebar */}
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <BrandMark size={32} showText={false} />
        </div>
        <nav className="ds-sidebar-nav">
          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-label">Navigation</div>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href} className={`ds-nav-item${location.pathname === href ? ' active' : ''}`}>
                <Icon size={16} className="nav-icon" /> {label}
              </Link>
            ))}
          </div>
          <div className="ds-sidebar-section">
            <button className="ds-nav-item" style={{ color: 'var(--color-ruby)' }}
              onClick={async () => { await logout(); navigate('/'); }}>
              <LogOut size={16} className="nav-icon" /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Top Bar */}
      <header className="ds-topbar">
        <div>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Opportunity Engine</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ padding: '7px 10px', borderRadius: '50%' }}>
            <Bell size={15} />
          </button>
          <div className="ds-avatar ds-avatar-md">
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ds-main">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Opportunities</p>
          <h1 className="ds-page-title">Opportunity Engine</h1>
          <p className="ds-page-subtitle">Filter through verified dental gigs, specialist consults, and remote opportunities.</p>
        </div>

        {/* Filter Bar */}
        <div className="ds-card" style={{ padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 240px' }}>
              <Search size={14} color="var(--color-fog-4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="ds-input" placeholder="Search by role or clinic name…" style={{ paddingLeft: 36 }} />
            </div>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <FilterChip icon={<SlidersHorizontal size={12} />} label="All Types" />
              <FilterChip icon={<MapPin size={12} />} label="Remote Only" />
              <FilterChip icon={<DollarSign size={12} />} label="$100+/hr" />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Left: Gig List */}
          <div>
            <div className="ds-card" style={{ padding: 56, textAlign: 'center' }}>
              <SearchX size={40} color="var(--color-fog-3)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 16, marginBottom: 8 }}>No matching gigs found</h4>
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)', maxWidth: 380, margin: '0 auto 20px', lineHeight: 1.6 }}>
                There are currently no active opportunities matching your profile criteria. Check back later or adjust your filters.
              </p>
              <button onClick={() => setSearchQuery('')} className="ds-btn ds-btn-ghost ds-btn-sm">Clear Filters</button>
            </div>
          </div>

          {/* Right: Sidebar Insights */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile Reach */}
            <div className="ds-card" style={{ padding: 24 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-ink-4)', marginBottom: 16 }}>
                Your Reach
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>Profile Visibility</span>
                <span className="ds-badge ds-badge-teal">TOP 5%</span>
              </div>
              <div className="ds-progress-track" style={{ marginBottom: 10 }}>
                <div className="ds-progress-fill" style={{ width: '85%' }} />
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.55 }}>
                Your profile was viewed by 12 dental clinics in the last 24 hours.
              </p>
            </div>

            {/* Trending Skills */}
            <div className="ds-card" style={{ padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <TrendingUp size={14} color="var(--color-teal)" />
                <p style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: 'var(--color-ink-4)' }}>
                  Trending Skills
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TRENDING_SKILLS.map(skill => (
                  <span key={skill} className="ds-tag">{skill}</span>
                ))}
              </div>
            </div>

            {/* Upgrade Card */}
            <div className="ds-card ds-card-teal" style={{ padding: 24 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
                Consult Pro
              </p>
              <h5 className="font-display" style={{ fontSize: 20, color: '#fff', letterSpacing: '-0.02em', marginBottom: 8 }}>
                Upgrade your access
              </h5>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginBottom: 20 }}>
                Get priority access to high-value specialist consults and daily rate guarantees.
              </p>
              <Link to="/verification" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', color: 'var(--color-teal-dark)', borderRadius: 8, padding: '9px 16px', fontWeight: 700, fontSize: 12, textDecoration: 'none', letterSpacing: '0.01em' }}>
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* FAB */}
      <button
        className="ds-btn ds-btn-primary"
        style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: 14, padding: 0, justifyContent: 'center', boxShadow: '0 8px 24px rgba(13,122,107,0.3)', zIndex: 80 }}
      >
        <PlusSquare size={20} />
      </button>
    </div>
  );
}

function FilterChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ gap: 6 }}>
      {icon} {label}
    </button>
  );
}
