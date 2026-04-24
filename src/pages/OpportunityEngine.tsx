<<<<<<< HEAD
import {
  ArrowRight,
  Bell,
  Briefcase,
  ChevronDown,
  CirclePlus,
  LayoutDashboard,
  Search,
  SearchX,
  SlidersHorizontal,
  UserCircle2,
  Wallet,
} from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type FilterPillProps = {
  label: string;
  value: string;
  icon?: ReactNode;
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;

function FilterPill({ label, value, icon }: FilterPillProps) {
  return (
    <button className="flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-colors hover:bg-slate-50">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
      {icon}
    </button>
  );
}

const TRENDING_SKILLS = ['Invisalign', 'iTero Scanning', 'Dental AI', 'Sleep Apnea'];
=======
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
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
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)

export default function OpportunityEngine() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
<<<<<<< HEAD
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background pb-24 text-on-surface font-body md:pb-0">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-primary">DentSide</Link>
          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
            <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
            <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
            <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <button className="rounded-xl p-2 text-slate-600 hover:bg-slate-100" aria-label="Open notifications"><Bell className="h-5 w-5" /></button>
            <div className="h-8 w-8 overflow-hidden rounded-full border border-slate-200">
              <img alt="User avatar" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} />
            </div>
=======
  const location = useLocation();

  return (
    <div className="ds-layout">
      {/* Sidebar */}
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <div className="ds-sidebar-logo-mark">DentSide</div>
          <div className="ds-sidebar-logo-sub">Remote Platform</div>
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
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <main className="mx-auto max-w-7xl px-4 pt-24 md:px-6">
        <div className="mb-10">
          <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">Opportunity Engine</h1>
          <p className="max-w-2xl text-lg text-slate-600">Find verified remote dental gigs, specialist consults, and high-trust opportunities that match your profile.</p>
        </div>

        <section className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 text-sm outline-none ring-primary focus:ring-2"
              placeholder="Search by role or clinic name..."
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <FilterPill label="Type" value="All Opportunities" icon={<ChevronDown size={16} />} />
            <FilterPill label="Location" value="Remote Only" icon={<ChevronDown size={16} />} />
            <FilterPill label="Rate" value="$100+/hr" icon={<SlidersHorizontal size={16} />} />
=======
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
              <input type="text" className="ds-input" placeholder="Search by role or clinic name…" style={{ paddingLeft: 36 }} />
            </div>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <FilterChip icon={<SlidersHorizontal size={12} />} label="All Types" />
              <FilterChip icon={<MapPin size={12} />} label="Remote Only" />
              <FilterChip icon={<DollarSign size={12} />} label="$100+/hr" />
            </div>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>

<<<<<<< HEAD
        <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <SearchX className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="mb-2 text-xl font-bold">No matching gigs found</h4>
              <p className="mx-auto mb-6 max-w-md text-slate-600">No active opportunities match your current filters. Clear filters to discover more openings.</p>
              <button onClick={() => setSearchQuery('')} className="rounded-xl bg-primary/10 px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary/20">Clear filters</button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Your Reach</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Profile Visibility</span>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-700">TOP 5%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-full w-[85%] rounded-full bg-primary" /></div>
                <p className="text-xs text-slate-600">Your profile was viewed by 12 dental clinics in the last 24 hours.</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">Trending skills</h4>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SKILLS.map((skill) => (
                  <div key={skill} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">{skill}</div>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-primary p-6 text-white shadow-md">
              <h5 className="text-xl font-bold">Upgrade to Consult Pro</h5>
              <p className="mb-4 mt-2 text-sm text-white/90">Get priority access to high-value specialist consults and daily rate guarantees.</p>
              <Link to="/verification" className="inline-flex items-center gap-2 text-sm font-bold">Learn more <ArrowRight className="h-4 w-4" /></Link>
=======
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
              <button className="ds-btn ds-btn-ghost ds-btn-sm">Clear Filters</button>
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

      <button
        onClick={() => navigate('/opportunities')}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-xl transition-transform hover:scale-110 active:scale-95 md:bottom-8 md:right-8"
        aria-label="Create opportunity alert"
      >
        <CirclePlus className="h-6 w-6" />
=======
      {/* FAB */}
      <button
        className="ds-btn ds-btn-primary"
        style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: 14, padding: 0, justifyContent: 'center', boxShadow: '0 8px 24px rgba(13,122,107,0.3)', zIndex: 80 }}
      >
        <PlusSquare size={20} />
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
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
