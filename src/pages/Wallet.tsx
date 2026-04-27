import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet as WalletIcon, Bell,
  CreditCard, Smartphone, Plus, ShieldCheck as ShieldIcon,
  Clock, Receipt, RefreshCcw, ArrowRight, Lock, BadgeCheck, HelpCircle, Menu, ShieldCheck
} from 'lucide-react';
import DentistSidebar from '../components/DentistSidebar';

export default function Wallet() {
  const { profile } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Wallet & Earnings</p>
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
          <p className="ds-page-eyebrow">Finance</p>
          <h1 className="ds-page-title">Wallet & Earnings</h1>
          <p className="ds-page-subtitle">Manage your clinical earnings, track pending settlements, and choose your preferred withdrawal method.</p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          {/* Left Column */}
          <div className="flex flex-col gap-5">
            {/* Balance Hero */}
            <div className="ds-card ds-card-teal" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div className="mb-7 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="ds-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Available Balance</p>
                    <p className="ds-stat-value text-[40px] sm:text-[52px]" style={{ color: '#fff' }}>$0.00</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
                    <WalletIcon size={24} color="#fff" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button style={{ background: '#fff', color: 'var(--color-teal-dark)', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Withdraw Now
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }}>
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
          <div className="flex flex-col gap-5">
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
                />
                <PayoutMethod
                  icon={<Smartphone size={18} color="#fff" />}
                  iconBg="#4CAF50"
                  label="M-Pesa Mobile"
                  sub="Instant mobile wallet. East Africa."
                />
              </div>
              <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ marginTop: 16, width: '100%', justifyContent: 'center', gap: 6 }}>
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

function PayoutMethod({ icon, iconBg, label, sub, active }: { icon: React.ReactNode; iconBg: string; label: string; sub: string; active?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderRadius: 10, border: `1px solid ${active ? 'var(--color-teal)' : 'var(--color-fog-2)'}`,
      background: active ? 'var(--color-teal-light)' : 'var(--color-white)',
      cursor: 'pointer', transition: 'border-color 0.15s',
    }}>
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
