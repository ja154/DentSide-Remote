import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  CalendarCheck2,
  CalendarX,
  Key,
  Loader2,
  Menu,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import DentistSidebar from './DentistSidebar';
import NotificationMenu from './NotificationMenu';
import { apiRequest, type Appointment, type WalletSummary } from '../lib/api';

type AppointmentActionState = {
  appointmentId: string;
  nextStatus: 'confirmed' | 'completed' | 'cancelled';
} | null;

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [actionState, setActionState] = useState<AppointmentActionState>(null);

  const profileStrength = useMemo(() => {
    const points = [profile?.displayName, profile?.email, profile?.photoURL].filter(Boolean).length;
    return Math.round((points / 3) * 100);
  }, [profile]);

  const activeAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) =>
          appointment.status === 'requested' || appointment.status === 'confirmed',
      ),
    [appointments],
  );

  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === 'completed').length,
    [appointments],
  );

  const loadDashboardData = async () => {
    try {
      setError('');
      const [appointmentData, walletData] = await Promise.all([
        apiRequest<Appointment[]>('/api/appointments'),
        apiRequest<WalletSummary>('/api/withdraw/summary'),
      ]);

      setAppointments(appointmentData);
      setWalletSummary(walletData);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load dashboard data right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key first.');
      return;
    }

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

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed');
      }

      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      }
    } catch (matchError: any) {
      alert(matchError.message);
    } finally {
      setIsMatching(false);
    }
  };

  const handleAppointmentAction = async (
    appointmentId: string,
    nextStatus: 'confirmed' | 'completed' | 'cancelled',
  ) => {
    setActionState({ appointmentId, nextStatus });
    setError('');

    try {
      const updated = await apiRequest<Appointment>(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment,
        ),
      );
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : 'Unable to update that appointment right now.';
      setError(message);
    } finally {
      setActionState(null);
    }
  };

  const currency = walletSummary?.defaultCurrency || 'USD';
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  return (
    <div className="ds-layout">
      {isSidebarOpen ? (
        <button
          type="button"
          className="ds-sidebar-backdrop md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      ) : null}

      <DentistSidebar
        pathname={location.pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
            Good day,{' '}
            <span style={{ color: 'var(--color-ink)', fontWeight: 600 }}>
              {profile?.displayName || 'Doctor'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationMenu />
          <div className="ds-avatar ds-avatar-md" style={{ overflow: 'hidden' }}>
            <img
              src={
                profile?.photoURL ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`
              }
              alt="avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </header>

      <main className="ds-main">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Clinical Workspace</p>
          <h1 className="ds-page-title">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'Dr.'}
          </h1>
          <p className="ds-page-subtitle">
            {activeAppointments.length > 0
              ? `You have ${activeAppointments.length} active consult${activeAppointments.length === 1 ? '' : 's'} waiting for attention.`
              : 'Your queue is clear for now. New consult requests will appear here.'}
          </p>
        </div>

        <div className="mb-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div
            className="ds-card ds-card-teal md:col-span-2"
            style={{ padding: 28, position: 'relative', overflow: 'hidden' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 24,
              }}
            >
              <div>
                <p className="ds-stat-label" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Available Balance
                </p>
                <p className="ds-stat-value" style={{ color: '#fff' }}>
                  {formatMoney(walletSummary?.availableBalance || 0)}
                </p>
                <p className="ds-stat-meta" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Pending settlements: {formatMoney(walletSummary?.pendingBalance || 0)}
                </p>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  padding: '4px 12px',
                  fontSize: 11,
                  color: '#fff',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                WALLET
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Completed
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontFamily: 'var(--font-display)',
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {completedAppointments}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 600,
                    marginBottom: 4,
                  }}
                >
                  Lifetime Paid Out
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontFamily: 'var(--font-display)',
                    color: '#fff',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {formatMoney(walletSummary?.lifetimeWithdrawn || 0)}
                </p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Link
                  to="/wallet"
                  style={{
                    background: '#fff',
                    color: 'var(--color-teal-dark)',
                    borderRadius: 8,
                    padding: '10px 18px',
                    fontWeight: 700,
                    fontSize: 12,
                    letterSpacing: '0.04em',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  OPEN WALLET
                </Link>
              </div>
            </div>
            <TrendingUp
              size={120}
              color="rgba(255,255,255,0.06)"
              style={{ position: 'absolute', right: -20, bottom: -20 }}
            />
          </div>

          <div className="ds-card" style={{ padding: 28, display: 'flex', flexDirection: 'column' }}>
            <div
              className="ds-card-header"
              style={{ padding: '0 0 16px 0', border: 'none', marginBottom: 16 }}
            >
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                Verification
              </span>
              <ShieldCheck size={16} color="var(--color-amber)" />
            </div>
            <div className="ds-progress-track" style={{ marginBottom: 12 }}>
              <div
                className="ds-progress-fill"
                style={{ width: `${profileStrength}%`, background: 'var(--color-amber)' }}
              />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.55, flex: 1 }}>
              Profile completion is <strong style={{ color: 'var(--color-ink)' }}>{profileStrength}%</strong>. Current review state:{' '}
              <strong style={{ color: 'var(--color-ink)' }}>
                {(profile?.verificationStatus || 'unverified').replace(/_/g, ' ')}
              </strong>
              .
            </p>
            <Link
              to="/verification"
              className="ds-btn ds-btn-ghost ds-btn-sm"
              style={{ marginTop: 20, justifyContent: 'center' }}
            >
              Review Verification
            </Link>
          </div>
        </div>

        <div className="ds-main-split">
          <div>
            <div
              className="ds-card-header"
              style={{ background: 'none', border: 'none', padding: '0 0 20px 0', marginBottom: 0 }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                Consult Queue
              </h2>
              <span style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
                {activeAppointments.length} active
              </span>
            </div>

            {isLoading ? (
              <div className="ds-card" style={{ padding: 40, textAlign: 'center' }}>
                <Loader2
                  size={28}
                  className="spin"
                  color="var(--color-teal)"
                  style={{ margin: '0 auto 12px' }}
                />
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                  Loading your appointment queue…
                </p>
              </div>
            ) : activeAppointments.length === 0 ? (
              <div className="ds-card" style={{ padding: 40, textAlign: 'center' }}>
                <CalendarX size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
                <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>
                  No Active Consults
                </h4>
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                  New client appointment requests will land here once they are assigned to you.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {activeAppointments.slice(0, 4).map((appointment) => {
                  const isBusy = actionState?.appointmentId === appointment.id;

                  return (
                    <div key={appointment.id} className="ds-card" style={{ padding: 24 }}>
                      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3
                              style={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: 'var(--color-ink)',
                              }}
                            >
                              {appointment.clientName}
                            </h3>
                            <StatusBadge status={appointment.status} />
                          </div>
                          <p
                            style={{
                              fontSize: 13,
                              color: 'var(--color-ink-4)',
                              lineHeight: 1.6,
                              marginBottom: 12,
                            }}
                          >
                            {appointment.reason}
                          </p>
                          <p style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                            {appointment.scheduledFor
                              ? `Scheduled for ${formatDate(appointment.scheduledFor)}`
                              : 'No time confirmed yet'}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {appointment.status === 'requested' ? (
                          <button
                            type="button"
                            className="ds-btn ds-btn-primary ds-btn-sm"
                            onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            disabled={isBusy}
                          >
                            {isBusy && actionState?.nextStatus === 'confirmed' ? (
                              <Loader2 size={13} className="spin" />
                            ) : (
                              <CalendarCheck2 size={13} />
                            )}
                            Confirm
                          </button>
                        ) : null}

                        {appointment.status === 'confirmed' ? (
                          <button
                            type="button"
                            className="ds-btn ds-btn-primary ds-btn-sm"
                            onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                            disabled={isBusy}
                          >
                            {isBusy && actionState?.nextStatus === 'completed' ? (
                              <Loader2 size={13} className="spin" />
                            ) : (
                              <CalendarCheck2 size={13} />
                            )}
                            Mark Complete
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="ds-btn ds-btn-ghost ds-btn-sm"
                          style={{ color: 'var(--color-ruby)' }}
                          onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                          disabled={isBusy}
                        >
                          {isBusy && actionState?.nextStatus === 'cancelled' ? (
                            <Loader2 size={13} className="spin" />
                          ) : (
                            <CalendarX size={13} />
                          )}
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {error ? (
              <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-ruby)' }}>{error}</p>
            ) : null}
          </div>

          <div>
            <div
              className="ds-card-header"
              style={{ background: 'none', border: 'none', padding: '0 0 20px 0' }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)' }}>
                AI Matchmaker
              </h2>
              <Sparkles size={16} color="var(--color-teal)" />
            </div>
            <div className="ds-card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Key
                    size={14}
                    color="var(--color-fog-4)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="password"
                    placeholder="Gemini API Key"
                    value={apiKey}
                    onChange={(event) => setApiKey(event.target.value)}
                    className="ds-input"
                    style={{ paddingLeft: 36, fontSize: 13 }}
                  />
                </div>
                <button
                  type="button"
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
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid var(--color-fog-2)',
                        borderRadius: 10,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseOver={(event) => {
                        event.currentTarget.style.borderColor = 'var(--color-teal-mid)';
                      }}
                      onMouseOut={(event) => {
                        event.currentTarget.style.borderColor = 'var(--color-fog-2)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)' }}>
                          {match.title}
                        </span>
                        <span style={{ fontSize: 13, color: 'var(--color-teal)', fontWeight: 700 }}>
                          {match.rate}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', marginBottom: 8 }}>
                        {match.company} · {match.match} Match
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {match.tags.map((tag: string, index: number) => (
                          <span key={`${tag}-${index}`} className="ds-tag" style={{ fontSize: 10 }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <Sparkles size={28} color="var(--color-fog-3)" style={{ margin: '0 auto 10px' }} />
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                    Enter your API key to get personalised gig recommendations.
                  </p>
                </div>
              )}

              <Link
                to="/opportunities"
                className="ds-btn ds-btn-ghost ds-btn-sm"
                style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
              >
                Explore All Gigs
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'confirmed' || status === 'completed'
      ? 'ds-badge-teal'
      : status === 'cancelled'
        ? 'ds-badge-ruby'
        : 'ds-badge-amber';

  return (
    <span className={`ds-badge ${tone}`} style={{ textTransform: 'capitalize' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : 'Not scheduled';
}
