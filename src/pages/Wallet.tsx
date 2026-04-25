import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import BrandMark from '../components/BrandMark';
import { showPending } from '../lib/ui';
import {
  LayoutDashboard, Briefcase, Wallet as WalletIcon, ShieldCheck, Bell, LogOut,
  CreditCard, Smartphone, Plus, ShieldCheck as ShieldIcon,
  Clock, Receipt, RefreshCcw, ArrowRight, Lock, BadgeCheck, HelpCircle, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gigs', href: '/opportunities', icon: Briefcase },
  { label: 'Wallet', href: '/wallet', icon: WalletIcon },
  { label: 'Profile', href: '/verification', icon: ShieldCheck },
];

export default function Wallet() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className={`ds-layout ${isSidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Sidebar */}
      <aside className={`ds-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <button className="ds-sidebar-close" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation menu">
          <X size={18} />
        </button>
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
      {isSidebarOpen && <button className="ds-sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-label="Close navigation backdrop" />}

      {/* Top Bar */}
      <header className="ds-topbar">
        <div>
          <button
            className="ds-sidebar-toggle"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            <Menu size={16} />
          </button>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Wallet & Earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="ds-btn ds-btn-ghost ds-btn-sm"
            style={{ padding: '7px 10px', borderRadius: '50%' }}
            onClick={() => showPending('Notifications')}
          >
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
          <p className="ds-page-eyebrow">Finance</p>
          <h1 className="ds-page-title">Wallet & Earnings</h1>
          <p className="ds-page-subtitle">Manage your clinical earnings, track pending settlements, and choose your preferred withdrawal method.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Balance Hero */}
            <div className="ds-card ds-card-teal" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                  <div>
                    <p className="ds-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Available Balance</p>
                    <p className="ds-stat-value" style={{ color: '#fff', fontSize: 52 }}>$0.00</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
                    <WalletIcon size={24} color="#fff" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button style={{ background: '#fff', color: 'var(--color-teal-dark)', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => showPending('Withdrawals')}>
                    Withdraw Now
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }} onClick={() => showPending('Adding funds')}>
                    Add Funds
                  </button>
                </div>
              </div>
              <WalletIcon size={160} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: -20, bottom: -24 }} />
            </div>

            {/* Sub-stats */}
            <div className="ds-grid-2">
              <StatCard icon={<Clock size={16} color="var(--color-amber)" />} label="Pending Settlements" value="$0.00" sub="Payments currently in clearing from completed consultations." />
              <StatCard icon={<RefreshCcw size={16} color="var(--color-teal)" />} label="Automated Payout" value="Not Scheduled" sub="Scheduled for your linked Stripe account." />
            </div>

            {/* Transaction History */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Recent Activity</h3>
                <Link to="/wallet" style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600, textDecoration: 'none' }}>View Full Ledger</Link>
              </div>
              <div className="ds-card" style={{ padding: 48, textAlign: 'center' }}>
                <Receipt size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>No Transactions Yet</h4>
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Your recent earnings and withdrawals will appear here.</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Payout Channels */}
            <div className="ds-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>Payout Channels</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <PayoutMethod
                  icon={<CreditCard size={18} color="#fff" />}
                  iconBg="#635BFF"
                  label="Stripe Connect"
                  sub="Direct bank transfer. Global."
                  active
                  onSelect={() => showPending('Stripe payout setup')}
                />
                <PayoutMethod
                  icon={<Smartphone size={18} color="#fff" />}
                  iconBg="#4CAF50"
                  label="M-Pesa Mobile"
                  sub="Instant mobile wallet. East Africa."
                  onSelect={() => showPending('M-Pesa payout setup')}
                />
              </div>
              <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center', gap: 6 }} onClick={() => showPending('Linking payout accounts')}>
                <Plus size={14} /> Link New Account
              </button>
            </div>

            {/* Security */}
            <div className="ds-card ds-card-dark" style={{ padding: 24 }}>
              <ShieldIcon size={28} color="var(--color-teal-mid)" style={{ marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-white)', marginBottom: 8 }}>Enterprise Security</h3>
              <p style={{ fontSize: 13, color: 'var(--color-fog-4)', lineHeight: 1.6, marginBottom: 16 }}>
                AES-256 encryption & PCI-DSS compliance on every gig settlement.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[{ icon: <Lock size={13} />, label: 'Encrypted Vault Access' }, { icon: <BadgeCheck size={13} />, label: 'Multi-Factor Auth Required' }].map(({ icon, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-fog-3)', fontWeight: 500 }}>
                    {icon} {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Help */}
            <div className="ds-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <HelpCircle size={14} color="var(--color-ink-4)" />
                <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>Need assistance?</h4>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-ink-4)', marginBottom: 12, lineHeight: 1.55 }}>
                Our financial compliance team is available 24/7 for dental practitioners.
              </p>
              <a href="mailto:support@dentsideremote.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-teal)', fontWeight: 600, textDecoration: 'none' }}>
                Contact Support <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="ds-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        {icon}
        <span style={{ fontSize: 12, color: 'var(--color-ink-4)', fontWeight: 500 }}>{label}</span>
      </div>
      <p className="font-display" style={{ fontSize: 26, letterSpacing: '-0.03em', color: 'var(--color-ink)', marginBottom: 8 }}>{value}</p>
      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

function PayoutMethod({ icon, iconBg, label, sub, active, onSelect }: { icon: React.ReactNode; iconBg: string; label: string; sub: string; active?: boolean; onSelect: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderRadius: 10, border: `1px solid ${active ? 'var(--color-teal)' : 'var(--color-fog-2)'}`,
      background: active ? 'var(--color-teal-light)' : 'var(--color-white)',
      cursor: 'pointer', transition: 'border-color 0.15s',
    }} onClick={onSelect}>
      <div style={{ width: 40, height: 40, borderRadius: 8, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>{sub}</p>
      </div>
      {active && <ShieldCheck size={16} color="var(--color-teal)" />}
    </div>
  );
}
