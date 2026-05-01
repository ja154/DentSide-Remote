import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  BadgeCheck,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  Users,
  Wallet,
} from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import {
  apiRequest,
  type AdminUser,
  type AdminOverview,
  type Appointment,
  type Gig,
  type VerificationRecord,
  type WithdrawalRecord,
} from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

type VerificationActionState = {
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
} | null;

type RoleActionState = {
  userId: string;
  role: 'dentist' | 'client' | 'admin';
} | null;

type WithdrawalActionState = {
  withdrawalId: string;
  status: 'queued' | 'paid' | 'failed';
} | null;

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, AdminUser['role']>>({});
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionState, setActionState] = useState<VerificationActionState>(null);
  const [roleActionState, setRoleActionState] = useState<RoleActionState>(null);
  const [withdrawalActionState, setWithdrawalActionState] = useState<WithdrawalActionState>(null);

  const pendingVerifications = useMemo(
    () => verifications.filter((verification) => verification.status === 'pending').length,
    [verifications],
  );

  const unresolvedWithdrawals = useMemo(
    () =>
      withdrawals.filter(
        (withdrawal) =>
          withdrawal.status === 'queued' || withdrawal.status === 'pending_provider_setup',
      ).length,
    [withdrawals],
  );

  useEffect(() => {
    loadAdminData(true);
  }, []);

  const loadAdminData = async (initialLoad = false) => {
    setError('');
    setStatusMessage('');

    if (initialLoad) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const [overviewData, userData, verificationData, gigData, appointmentData, withdrawalData] =
        await Promise.all([
          apiRequest<AdminOverview>('/api/admin/overview'),
          apiRequest<AdminUser[]>('/api/admin/users'),
          apiRequest<VerificationRecord[]>('/api/admin/verifications'),
          apiRequest<Gig[]>('/api/admin/gigs'),
          apiRequest<Appointment[]>('/api/admin/appointments'),
          apiRequest<WithdrawalRecord[]>('/api/admin/withdrawals'),
        ]);

      setOverview(overviewData);
      setUsers(userData);
      setVerifications(verificationData);
      setGigs(gigData);
      setAppointments(appointmentData);
      setWithdrawals(withdrawalData);
      setSelectedRoles((current) => {
        const next: Record<string, AdminUser['role']> = {};

        userData.forEach((user) => {
          next[user.id] = current[user.id] ?? user.role;
        });

        return next;
      });
      setReviewNotes((current) => {
        const next: Record<string, string> = {};

        verificationData.forEach((verification) => {
          next[verification.id] = current[verification.id] ?? verification.reviewNote ?? '';
        });

        return next;
      });
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load admin data right now.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleVerificationDecision = async (
    userId: string,
    status: 'pending' | 'approved' | 'rejected',
  ) => {
    setActionState({ userId, status });
    setError('');
    setStatusMessage('');

    try {
      const updated = await apiRequest<VerificationRecord>(`/api/admin/verifications/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          reviewNote: reviewNotes[userId]?.trim() || undefined,
        }),
      });

      setVerifications((current) =>
        current.map((verification) => (verification.id === userId ? updated : verification)),
      );
      setReviewNotes((current) => ({
        ...current,
        [userId]: updated.reviewNote ?? '',
      }));
      setStatusMessage(
        status === 'approved'
          ? 'Verification approved successfully.'
          : status === 'rejected'
            ? 'Verification rejected and note saved.'
            : 'Verification returned to pending review.',
      );
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : 'Unable to update verification status right now.';
      setError(message);
    } finally {
      setActionState(null);
    }
  };

  const handleRoleUpdate = async (userId: string) => {
    const role = selectedRoles[userId];

    if (!role) {
      return;
    }

    setRoleActionState({ userId, role });
    setError('');
    setStatusMessage('');

    try {
      const updated = await apiRequest<AdminUser>(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });

      setUsers((current) =>
        current.map((user) => (user.id === userId ? updated : user)),
      );
      setStatusMessage(`Updated user role to ${role}.`);
    } catch (roleError) {
      const message =
        roleError instanceof Error ? roleError.message : 'Unable to update that user role right now.';
      setError(message);
    } finally {
      setRoleActionState(null);
    }
  };

  const handleWithdrawalDecision = async (
    withdrawalId: string,
    status: 'queued' | 'paid' | 'failed',
  ) => {
    setWithdrawalActionState({ withdrawalId, status });
    setError('');
    setStatusMessage('');

    try {
      const updated = await apiRequest<WithdrawalRecord>(
        `/api/admin/withdrawals/${withdrawalId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        },
      );

      setWithdrawals((current) =>
        current.map((withdrawal) =>
          withdrawal.id === withdrawalId ? updated : withdrawal,
        ),
      );
      setStatusMessage(`Withdrawal moved to ${status.replace(/_/g, ' ')}.`);
    } catch (withdrawalError) {
      const message =
        withdrawalError instanceof Error
          ? withdrawalError.message
          : 'Unable to update that withdrawal right now.';
      setError(message);
    } finally {
      setWithdrawalActionState(null);
    }
  };

  return (
    <AdminLayout title="Admin Command Center">
      <section id="overview" className="scroll-mt-24">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Operations</p>
          <h1 className="ds-page-title">Admin Command Center</h1>
          <p className="ds-page-subtitle">
            Review onboarding risk, monitor platform readiness, and keep every operational queue moving.
          </p>
        </div>

        <div className="ds-card ds-card-dark" style={{ padding: 28, marginBottom: 24 }}>
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="ds-stat-label" style={{ color: 'rgba(255,255,255,0.58)' }}>
                Admin Pulse
              </p>
              <p className="ds-stat-value" style={{ color: '#fff', marginBottom: 10 }}>
                {pendingVerifications} pending checks
              </p>
              <p style={{ maxWidth: 520, fontSize: 14, color: 'var(--color-fog-3)' }}>
                Use this console to approve clinicians, spot payout blockers, and verify that every backend service is configured before growth ramps up.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="ds-btn"
                style={{ background: '#fff', color: 'var(--color-ink)', borderColor: '#fff' }}
                onClick={() => loadAdminData(false)}
                disabled={isRefreshing}
              >
                {isRefreshing ? <Loader2 size={14} className="spin" /> : <RefreshCcw size={14} />}
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--color-ruby-light)',
              border: '1px solid var(--color-ruby)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 18,
              color: 'var(--color-ruby)',
              fontSize: 13,
            }}
          >
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        {statusMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--color-sage-light)',
              border: '1px solid var(--color-sage)',
              borderRadius: 10,
              padding: '12px 16px',
              marginBottom: 18,
              color: 'var(--color-sage)',
              fontSize: 13,
            }}
          >
            <CheckCircle2 size={15} />
            {statusMessage}
          </div>
        )}

        {isLoading ? (
          <div className="ds-card" style={{ padding: 56, textAlign: 'center' }}>
            <Loader2 size={28} className="spin" color="var(--color-teal)" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>Loading admin operations…</p>
          </div>
        ) : (
          <>
            <div className="ds-grid-4" style={{ marginBottom: 24 }}>
              <AdminStatCard
                icon={<BadgeCheck size={18} color="var(--color-teal)" />}
                label="Verification Queue"
                value={String(pendingVerifications)}
                detail={`${overview?.counts.verifications || 0} total submissions`}
              />
              <AdminStatCard
                icon={<Briefcase size={18} color="var(--color-amber)" />}
                label="Active Gig Records"
                value={String(overview?.counts.gigs || 0)}
                detail={`${gigs.filter((gig) => gig.status === 'open').length} currently open`}
              />
              <AdminStatCard
                icon={<CalendarRange size={18} color="var(--color-sage)" />}
                label="Consult Requests"
                value={String(overview?.counts.bookings || 0)}
                detail={`${appointments.filter((appointment) => appointment.status === 'requested').length} awaiting triage`}
              />
              <AdminStatCard
                icon={<Wallet size={18} color="var(--color-ruby)" />}
                label="Withdrawal Queue"
                value={String(unresolvedWithdrawals)}
                detail={`${overview?.counts.withdrawals || 0} total payout records`}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]" style={{ marginBottom: 28 }}>
              <div className="ds-card" style={{ padding: 24 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 18 }}>
                  <div className="ds-feature-icon" style={{ marginBottom: 0 }}>
                    <ShieldAlert size={18} color="var(--color-teal)" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                      Readiness Snapshot
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                      Service flags reported by `/api/admin/overview`.
                    </p>
                    {overview ? (
                      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', marginTop: 4 }}>
                        Auth: {overview.providers.auth} · Data: {overview.providers.data} · Storage:{' '}
                        {overview.providers.storage}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {overview &&
                    Object.entries(overview.integrations).map(([key, enabled]) => (
                      <div
                        key={key}
                        style={{
                          border: '1px solid var(--color-fog-2)',
                          borderRadius: 10,
                          padding: 14,
                          background: enabled ? 'var(--color-teal-light)' : 'var(--color-fog)',
                        }}
                      >
                        <p
                          style={{
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: enabled ? 'var(--color-teal-dark)' : 'var(--color-ink-4)',
                            marginBottom: 8,
                          }}
                        >
                          {key}
                        </p>
                        <span className={`ds-badge ${enabled ? 'ds-badge-teal' : 'ds-badge-fog'}`}>
                          {enabled ? 'Configured' : 'Needs setup'}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div className="ds-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 14 }}>
                  Queue Priorities
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <QueueCallout
                    title="Credentialing"
                    body={`${pendingVerifications} clinician profiles still need a reviewer decision.`}
                  />
                  <QueueCallout
                    title="Payout Ops"
                    body={`${withdrawals.filter((item) => item.status === 'pending_provider_setup').length} withdrawals are blocked by provider setup.`}
                  />
                  <QueueCallout
                    title="Consult Matching"
                    body={`${appointments.filter((item) => !item.dentistId).length} appointment requests have no assigned dentist yet.`}
                  />
                </div>
              </div>
            </div>

            <AdminSection
              id="users"
              title="User Management"
              subtitle="Review account roles, onboarding progress, and verification state without leaving the admin console."
            >
              {users.length === 0 ? (
                <EmptyAdminState message="No users are available yet." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Role</th>
                        <th>Verification</th>
                        <th>Onboarding</th>
                        <th>Created</th>
                        <th>Change Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => {
                        const isSaving = roleActionState?.userId === user.id;
                        const selectedRole = selectedRoles[user.id] ?? user.role;
                        const isOwnAccount = user.uid === profile?.uid;

                        return (
                          <tr key={user.id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <strong style={{ color: 'var(--color-ink)' }}>
                                  {user.displayName || 'Unnamed user'}
                                </strong>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {user.email}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {user.uid}
                                </span>
                              </div>
                            </td>
                            <td>
                              <StatusBadge status={user.role} />
                            </td>
                            <td>
                              <StatusBadge status={user.verificationStatus || 'unverified'} />
                            </td>
                            <td>{user.onboardingComplete ? 'Complete' : 'Incomplete'}</td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td style={{ minWidth: 220 }}>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <select
                                  className="ds-select"
                                  value={selectedRole}
                                  onChange={(event) =>
                                    setSelectedRoles((current) => ({
                                      ...current,
                                      [user.id]: event.target.value as AdminUser['role'],
                                    }))
                                  }
                                  disabled={isSaving || isOwnAccount}
                                >
                                  <option value="client">Client</option>
                                  <option value="dentist">Dentist</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  type="button"
                                  className="ds-btn ds-btn-sm"
                                  onClick={() => handleRoleUpdate(user.id)}
                                  disabled={isSaving || selectedRole === user.role || isOwnAccount}
                                >
                                  {isSaving ? <Loader2 size={13} className="spin" /> : 'Save'}
                                </button>
                              </div>
                              {isOwnAccount ? (
                                <p style={{ marginTop: 6, fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  You cannot change your own role.
                                </p>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminSection>

            <AdminSection
              id="verifications"
              title="Verification Review"
              subtitle="Approve, reject, or return submissions to pending while saving reviewer notes."
            >
              {verifications.length === 0 ? (
                <EmptyAdminState message="No verification submissions are available yet." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Clinician</th>
                        <th>License</th>
                        <th>Status</th>
                        <th>Submitted</th>
                        <th>Reviewer Note</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {verifications.map((verification) => {
                        const isSaving = actionState?.userId === verification.id;

                        return (
                          <tr key={verification.id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <strong style={{ color: 'var(--color-ink)' }}>{verification.legalName}</strong>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {verification.email}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {verification.clinic}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <span>{verification.issuingState}</span>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {verification.licenseNumber}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {verification.documentName}
                                </span>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {verification.storageMode === 'bucket' ? 'Stored in bucket' : 'Metadata only'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <StatusBadge status={verification.status} />
                            </td>
                            <td>{formatDate(verification.submittedAt)}</td>
                            <td style={{ minWidth: 220 }}>
                              <textarea
                                value={reviewNotes[verification.id] || ''}
                                onChange={(event) =>
                                  setReviewNotes((current) => ({
                                    ...current,
                                    [verification.id]: event.target.value,
                                  }))
                                }
                                className="ds-input"
                                rows={3}
                                placeholder="Add reviewer guidance or rejection context…"
                                style={{ resize: 'vertical', minHeight: 88 }}
                              />
                            </td>
                            <td style={{ minWidth: 220 }}>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <button
                                  type="button"
                                  className="ds-btn ds-btn-sm"
                                  style={{ background: 'var(--color-sage)', color: '#fff', borderColor: 'var(--color-sage)' }}
                                  onClick={() => handleVerificationDecision(verification.id, 'approved')}
                                  disabled={isSaving}
                                >
                                  {isSaving && actionState?.status === 'approved' ? (
                                    <Loader2 size={13} className="spin" />
                                  ) : null}
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  className="ds-btn ds-btn-sm"
                                  style={{ background: 'var(--color-ruby)', color: '#fff', borderColor: 'var(--color-ruby)' }}
                                  onClick={() => handleVerificationDecision(verification.id, 'rejected')}
                                  disabled={isSaving}
                                >
                                  {isSaving && actionState?.status === 'rejected' ? (
                                    <Loader2 size={13} className="spin" />
                                  ) : null}
                                  Reject
                                </button>
                                <button
                                  type="button"
                                  className="ds-btn ds-btn-ghost ds-btn-sm"
                                  onClick={() => handleVerificationDecision(verification.id, 'pending')}
                                  disabled={isSaving}
                                >
                                  {isSaving && actionState?.status === 'pending' ? (
                                    <Loader2 size={13} className="spin" />
                                  ) : null}
                                  Set Pending
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminSection>

            <AdminSection
              id="gigs"
              title="Gig Marketplace"
              subtitle="Review the current supply side of the marketplace and who created each listing."
            >
              <div className="mb-4 flex justify-end">
                <Link to="/gig-studio" className="ds-btn ds-btn-ghost ds-btn-sm no-underline">
                  Open Gig Studio
                </Link>
              </div>
              {gigs.length === 0 ? (
                <EmptyAdminState message="No gigs have been created yet." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Gig</th>
                        <th>Rate</th>
                        <th>Status</th>
                        <th>Created By</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gigs.map((gig) => (
                        <tr key={gig.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                              <strong style={{ color: 'var(--color-ink)' }}>{gig.title}</strong>
                              <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                {gig.company} · {gig.type}
                              </span>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                {gig.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="ds-tag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </td>
                          <td>{gig.rateLabel}</td>
                          <td>
                            <StatusBadge status={gig.status} />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span>{gig.createdByRole}</span>
                              <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                {gig.createdBy}
                              </span>
                            </div>
                          </td>
                          <td>{formatDate(gig.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminSection>

            <AdminSection
              id="appointments"
              title="Appointments"
              subtitle="Track consult requests, assignment gaps, and scheduled sessions."
            >
              {appointments.length === 0 ? (
                <EmptyAdminState message="No appointment records are available yet." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Dentist</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Scheduled</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <strong style={{ color: 'var(--color-ink)' }}>{appointment.clientName}</strong>
                              <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                {appointment.clientId}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span>{appointment.dentistName || 'Unassigned'}</span>
                              <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                {appointment.dentistId || 'Awaiting match'}
                              </span>
                            </div>
                          </td>
                          <td style={{ maxWidth: 320 }}>{appointment.reason}</td>
                          <td>
                            <StatusBadge status={appointment.status} />
                          </td>
                          <td>{appointment.scheduledFor ? formatDate(appointment.scheduledFor) : 'Pending'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminSection>

            <AdminSection
              id="withdrawals"
              title="Withdrawals"
              subtitle="Inspect payout readiness and identify requests blocked by provider setup."
            >
              {withdrawals.length === 0 ? (
                <EmptyAdminState message="No withdrawal requests are available yet." />
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ds-table">
                    <thead>
                      <tr>
                        <th>Practitioner</th>
                        <th>Provider</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Destination</th>
                        <th>Created</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => {
                        const isBusy = withdrawalActionState?.withdrawalId === withdrawal.id;
                        const isTerminal =
                          withdrawal.status === 'paid' || withdrawal.status === 'failed';

                        return (
                          <tr key={withdrawal.id}>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <strong style={{ color: 'var(--color-ink)' }}>{withdrawal.email}</strong>
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  {withdrawal.userId}
                                </span>
                              </div>
                            </td>
                            <td style={{ textTransform: 'capitalize' }}>{withdrawal.provider}</td>
                            <td>{formatCurrency(withdrawal.amount, withdrawal.currency)}</td>
                            <td>
                              <StatusBadge status={withdrawal.status} />
                            </td>
                            <td>{withdrawal.destinationLabel}</td>
                            <td>{formatDate(withdrawal.createdAt)}</td>
                            <td style={{ minWidth: 230 }}>
                              {isTerminal ? (
                                <span style={{ fontSize: 12, color: 'var(--color-ink-4)' }}>
                                  Terminal state
                                </span>
                              ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                  <button
                                    type="button"
                                    className="ds-btn ds-btn-sm"
                                    onClick={() => handleWithdrawalDecision(withdrawal.id, 'queued')}
                                    disabled={isBusy || withdrawal.status === 'queued'}
                                  >
                                    {isBusy && withdrawalActionState?.status === 'queued' ? (
                                      <Loader2 size={13} className="spin" />
                                    ) : null}
                                    Queue
                                  </button>
                                  <button
                                    type="button"
                                    className="ds-btn ds-btn-sm"
                                    style={{ background: 'var(--color-sage)', color: '#fff', borderColor: 'var(--color-sage)' }}
                                    onClick={() => handleWithdrawalDecision(withdrawal.id, 'paid')}
                                    disabled={isBusy}
                                  >
                                    {isBusy && withdrawalActionState?.status === 'paid' ? (
                                      <Loader2 size={13} className="spin" />
                                    ) : null}
                                    Mark Paid
                                  </button>
                                  <button
                                    type="button"
                                    className="ds-btn ds-btn-sm"
                                    style={{ background: 'var(--color-ruby)', color: '#fff', borderColor: 'var(--color-ruby)' }}
                                    onClick={() => handleWithdrawalDecision(withdrawal.id, 'failed')}
                                    disabled={isBusy}
                                  >
                                    {isBusy && withdrawalActionState?.status === 'failed' ? (
                                      <Loader2 size={13} className="spin" />
                                    ) : null}
                                    Mark Failed
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </AdminSection>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

function AdminSection({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24" style={{ marginBottom: 28 }}>
      <div className="ds-card">
        <div className="ds-card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>{title}</h2>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>{subtitle}</p>
        </div>
        <div className="ds-card-body">{children}</div>
      </div>
    </section>
  );
}

function AdminStatCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="ds-card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        {icon}
        <span style={{ fontSize: 12, color: 'var(--color-ink-4)', fontWeight: 600 }}>{label}</span>
      </div>
      <p className="font-display" style={{ fontSize: 30, color: 'var(--color-ink)', letterSpacing: '-0.03em', marginBottom: 6 }}>
        {value}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.55 }}>{detail}</p>
    </div>
  );
}

function QueueCallout({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: '1px solid var(--color-fog-2)',
        borderRadius: 10,
        padding: 14,
        background: 'var(--color-white)',
      }}
    >
      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>{title}</p>
      <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.55 }}>{body}</p>
    </div>
  );
}

function EmptyAdminState({ message }: { message: string }) {
  return (
    <div style={{ padding: 32, textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'approved' || status === 'paid' || status === 'completed' || status === 'open'
      ? 'ds-badge-teal'
      : status === 'rejected' || status === 'failed' || status === 'cancelled' || status === 'closed'
        ? 'ds-badge-ruby'
        : status === 'pending' || status === 'requested' || status === 'queued'
          ? 'ds-badge-amber'
          : 'ds-badge-fog';

  return (
    <span className={`ds-badge ${tone}`} style={{ textTransform: 'capitalize' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleString() : 'Not available';
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
