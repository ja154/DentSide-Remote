import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  apiRequest,
  type WalletSummary,
  type WithdrawalProvider,
  type WithdrawalRecord,
} from '../lib/api';
import { Link, useLocation } from 'react-router-dom';
import {
  Wallet as WalletIcon,
  CreditCard, Smartphone, Plus, ShieldCheck as ShieldIcon,
  Clock, Receipt, RefreshCcw, ArrowRight, Lock, BadgeCheck, HelpCircle, Loader2, Menu
} from 'lucide-react';
import DentistSidebar from '../components/DentistSidebar';
import NotificationMenu from '../components/NotificationMenu';

export default function Wallet() {
  const { profile } = useAuth();
  const location = useLocation();
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWithdrawFormOpen, setIsWithdrawFormOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalProvider, setWithdrawalProvider] = useState<WithdrawalProvider>('stripe');
  const [destinationLabel, setDestinationLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadWallet = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [summary, history] = await Promise.all([
        apiRequest<WalletSummary>('/api/withdraw/summary'),
        apiRequest<WithdrawalRecord[]>('/api/withdraw/history'),
      ]);

      setWalletSummary(summary);
      setWithdrawals(history);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Unable to load wallet data right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const currency = walletSummary?.defaultCurrency || 'USD';
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  const handleWithdrawalSubmit = async () => {
    setError('');
    setStatusMessage('');

    const amount = Number(withdrawalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Enter a valid withdrawal amount greater than zero.');
      return;
    }

    if (destinationLabel.trim().length < 3) {
      setError('Enter a destination label with at least 3 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiRequest<WithdrawalRecord & { message?: string }>('/api/withdraw', {
        method: 'POST',
        body: JSON.stringify({
          amount,
          currency,
          provider: withdrawalProvider,
          destinationLabel: destinationLabel.trim(),
        }),
      });

      setStatusMessage(
        response.message ||
          `${withdrawalProvider === 'mpesa' ? 'M-Pesa' : 'Stripe'} withdrawal request submitted.`,
      );
      setWithdrawalAmount('');
      setDestinationLabel('');
      setIsWithdrawFormOpen(false);
      await loadWallet();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit the withdrawal request right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
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
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Wallet & Earnings</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationMenu />
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
                    <p className="ds-stat-value text-[40px] sm:text-[52px]" style={{ color: '#fff' }}>
                      {formatMoney(walletSummary?.availableBalance || 0)}
                    </p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 10 }}>
                    <WalletIcon size={24} color="#fff" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    style={{ background: '#fff', color: 'var(--color-teal-dark)', border: 'none', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }}
                    onClick={() => setIsWithdrawFormOpen((open) => !open)}
                  >
                    Withdraw Now
                  </button>
                  <button style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '10px 20px', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em', cursor: 'pointer', textTransform: 'uppercase' }}>
                    Add Funds
                  </button>
                </div>
              </div>
              <WalletIcon size={160} color="rgba(255,255,255,0.06)" style={{ position: 'absolute', right: -20, bottom: -24 }} />
            </div>

            {isWithdrawFormOpen ? (
              <div className="ds-card" style={{ padding: 24 }}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>
                      Request Withdrawal
                    </h3>
                    <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                      Submit a payout request through the new withdrawal endpoint.
                    </p>
                  </div>
                  <span className="ds-badge ds-badge-teal">API Connected</span>
                </div>

                <div className="ds-grid-2">
                  <div className="ds-form-group">
                    <label className="ds-label">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="ds-input"
                      value={withdrawalAmount}
                      onChange={(event) => setWithdrawalAmount(event.target.value)}
                      placeholder="250.00"
                    />
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">Provider</label>
                    <select
                      className="ds-select"
                      value={withdrawalProvider}
                      onChange={(event) => setWithdrawalProvider(event.target.value as WithdrawalProvider)}
                    >
                      <option value="stripe">Stripe</option>
                      <option value="mpesa">M-Pesa</option>
                    </select>
                  </div>
                </div>

                <div className="ds-form-group" style={{ marginBottom: 0 }}>
                  <label className="ds-label">Destination Label</label>
                  <input
                    type="text"
                    className="ds-input"
                    value={destinationLabel}
                    onChange={(event) => setDestinationLabel(event.target.value)}
                    placeholder={withdrawalProvider === 'mpesa' ? 'Safaricom 07xx xxx xxx' : 'Main business checking'}
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    className="ds-btn ds-btn-primary"
                    onClick={handleWithdrawalSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 size={14} className="spin" /> : <WalletIcon size={14} />}
                    Submit Request
                  </button>
                  <button
                    type="button"
                    className="ds-btn ds-btn-ghost"
                    onClick={() => setIsWithdrawFormOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : null}

            {/* Sub-stats */}
            <div className="ds-grid-2">
              <StatCard
                icon={<Clock size={16} color="var(--color-amber)" />}
                label="Pending Settlements"
                value={formatMoney(walletSummary?.pendingBalance || 0)}
                sub="Payments currently in clearing from completed consultations."
              />
              <StatCard
                icon={<RefreshCcw size={16} color="var(--color-teal)" />}
                label="Automated Payout"
                value={
                  walletSummary?.payoutsConfigured.stripe || walletSummary?.payoutsConfigured.mpesa
                    ? 'Configured'
                    : 'Needs Setup'
                }
                sub="Server-side payout channels are now tracked through the withdrawal API."
              />
            </div>

            {/* Transaction History */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>Recent Activity</h3>
                <Link to="/wallet" style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600, textDecoration: 'none' }}>View Full Ledger</Link>
              </div>
              {isLoading ? (
                <div className="ds-card" style={{ padding: 48, textAlign: 'center' }}>
                  <RefreshCcw size={18} className="spin" color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Loading wallet activity…</p>
                </div>
              ) : withdrawals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {withdrawals.slice(0, 5).map((record) => (
                    <div key={record.id} className="ds-card" style={{ padding: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                        <div>
                          <p style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 4 }}>
                            {record.provider === 'mpesa' ? 'M-Pesa' : 'Stripe'} withdrawal
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                            {new Date(record.createdAt).toLocaleString()} · {record.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <span className="ds-badge ds-badge-teal">{formatMoney(record.amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ds-card" style={{ padding: 48, textAlign: 'center' }}>
                  <Receipt size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>No Transactions Yet</h4>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Your recent earnings and withdrawals will appear here.</p>
                </div>
              )}
              {error && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-ruby)' }}>{error}</p>
              )}
              {statusMessage && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-sage)' }}>{statusMessage}</p>
              )}
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
                  active={Boolean(walletSummary?.payoutsConfigured.stripe)}
                />
                <PayoutMethod
                  icon={<Smartphone size={18} color="#fff" />}
                  iconBg="#4CAF50"
                  label="M-Pesa Mobile"
                  sub="Instant mobile wallet. East Africa."
                  active={Boolean(walletSummary?.payoutsConfigured.mpesa)}
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
      {active && <ShieldIcon size={16} color="var(--color-teal)" />}
    </div>
  );
}
