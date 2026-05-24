import React, { useEffect, useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
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

  const pendingVerificationsCount = useMemo(
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
    if (!role) return;

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
    <AdminLayout title="Overview">
      {/* Hero Section */}
      <section id="overview" className="scroll-mt-24 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="pl-4 border-l-4 border-primary">
            <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
              Command Center
            </h2>
            <p className="text-on-surface-variant font-medium">
              Review onboarding risk, monitor platform readiness, and manage operational queues.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => loadAdminData(false)}
              disabled={isRefreshing}
              className="px-5 py-2.5 bg-surface-container-low text-on-surface-variant text-xs font-bold rounded-xl border border-surface-variant/20 shadow-sm flex items-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">refresh</span>}
              Sync Data
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-8 p-4 bg-error-container/20 text-error rounded-xl text-sm font-bold flex items-center gap-2 border border-error/10">
          <span className="material-symbols-outlined">error</span> {error}
        </div>
      )}

      {statusMessage && (
        <div className="mb-8 p-4 bg-primary-container/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2 border border-primary/20">
          <span className="material-symbols-outlined">check_circle</span> {statusMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-surface-container-lowest rounded-xl editorial-shadow">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-slate-500 font-medium font-headline">Accessing secure infrastructure...</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Bento Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <AdminStatCard
              icon="verified_user"
              label="Verification Queue"
              value={String(pendingVerificationsCount)}
              detail={`${overview?.counts.verifications || 0} total submissions`}
              color="primary"
            />
            <AdminStatCard
              icon="work"
              label="Marketplace Supply"
              value={String(overview?.counts.gigs || 0)}
              detail={`${gigs.filter(g => g.status === 'open').length} currently active`}
              color="tertiary"
            />
            <AdminStatCard
              icon="event"
              label="Consult Triage"
              value={String(appointments.filter(a => a.status === 'requested').length)}
              detail={`${overview?.counts.bookings || 0} lifetime requests`}
              color="secondary"
            />
            <AdminStatCard
              icon="account_balance_wallet"
              label="Pending Payouts"
              value={String(unresolvedWithdrawals)}
              detail={`${overview?.counts.withdrawals || 0} total records`}
              color="error"
            />
          </div>

          {/* Infrastructure & Queue Status */}
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)]">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">Infrastructure Readiness</h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-1">Service flags reported by clinical core.</p>
                </div>
                <span className="material-symbols-outlined text-primary">analytics</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {overview && Object.entries(overview.integrations).map(([key, enabled]) => (
                  <div key={key} className={`p-4 rounded-xl border transition-all ${enabled ? 'bg-primary-container/5 border-primary/10' : 'bg-surface-container-low border-surface-variant/20 opacity-60'}`}>
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-2">{key}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold ${enabled ? 'text-primary' : 'text-outline'}`}>
                        {enabled ? 'READY' : 'OFFLINE'}
                      </span>
                      <span className={`material-symbols-outlined text-sm ${enabled ? 'text-primary' : 'text-outline'}`}>
                        {enabled ? 'cloud_done' : 'cloud_off'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-xl p-8 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <span className="material-symbols-outlined text-[120px]">shield</span>
              </div>
              <h3 className="font-headline text-xl font-bold mb-4 relative z-10">Queue Priority</h3>
              <div className="space-y-4 relative z-10">
                <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Onboarding</p>
                  <p className="text-xs font-bold">{pendingVerificationsCount} clinician profiles await review.</p>
                </div>
                <div className="p-3 bg-white/10 rounded-lg border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Financials</p>
                  <p className="text-xs font-bold">{unresolvedWithdrawals} payouts blocked by setup.</p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-white text-primary text-[11px] font-bold rounded-xl uppercase tracking-widest hover:bg-primary-container hover:text-on-primary transition-all">Resolve Queue</button>
            </div>
          </div>

          {/* User Management Section */}
          <AdminSection id="users" title="Identity Registry" subtitle="Manage account roles and monitor clinical onboarding status.">
            {users.length === 0 ? <EmptyAdminState message="No identity records found." /> : (
              <div className="overflow-x-auto -mx-4 sm:-mx-8">
                <div className="inline-block min-w-full align-middle px-4 sm:px-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline font-bold">
                        <th className="px-6 py-4">Clinical Identity</th>
                        <th className="px-6 py-4">System Role</th>
                        <th className="px-6 py-4">Verification</th>
                        <th className="px-6 py-4">Onboarding</th>
                        <th className="px-6 py-4">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/10">
                      {users.map((user) => {
                        const isSaving = roleActionState?.userId === user.id;
                        const selectedRole = selectedRoles[user.id] ?? user.role;
                        const isOwnAccount = user.uid === profile?.uid;

                        return (
                          <tr key={user.id} className="group hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                                  <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName || 'U'}`} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-on-surface leading-tight">{user.displayName || 'Dr. Practitioner'}</p>
                                  <p className="text-[10px] text-on-surface-variant font-medium">{user.email || user.phoneNumber || 'No direct contact saved'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={user.role} /></td>
                            <td className="px-6 py-4"><StatusBadge status={user.verificationStatus || 'unverified'} /></td>
                            <td className="px-6 py-4"><span className="text-[11px] font-bold text-on-surface">{user.onboardingComplete ? 'COMPLETE' : 'PENDING'}</span></td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <select
                                  className="bg-surface-container-low border-none rounded-lg text-[11px] font-bold focus:ring-2 focus:ring-primary/20 py-1.5 pl-3 pr-8 appearance-none cursor-pointer outline-none"
                                  value={selectedRole}
                                  onChange={(e) => setSelectedRoles(curr => ({ ...curr, [user.id]: e.target.value as AdminUser['role'] }))}
                                  disabled={isSaving || isOwnAccount}
                                >
                                  <option value="dentist">Dentist</option>
                                  <option value="client">Client</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <button
                                  onClick={() => handleRoleUpdate(user.id)}
                                  disabled={isSaving || selectedRole === user.role || isOwnAccount}
                                  className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors disabled:opacity-0"
                                >
                                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <span className="material-symbols-outlined text-sm">save</span>}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </AdminSection>

          {/* Verification Review Section */}
          <AdminSection id="verifications" title="Credential Review" subtitle="Inspect licensure documentation and issue clinical certifications.">
            {verifications.length === 0 ? <EmptyAdminState message="No pending credentials for review." /> : (
              <div className="grid gap-8">
                {verifications.map((verification) => {
                  const isSaving = actionState?.userId === verification.id;
                  return (
                    <div key={verification.id} className="bg-surface-container-lowest p-8 rounded-xl border border-transparent hover:border-primary/20 transition-all shadow-sm">
                      <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-bold text-on-surface">{verification.legalName}</h4>
                            <StatusBadge status={verification.status} />
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                            <div>
                              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">State & License</p>
                              <p className="text-xs font-bold text-on-surface">{verification.issuingState} · {verification.licenseNumber}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Affiliation</p>
                              <p className="text-xs font-bold text-on-surface">{verification.clinic || 'Private Practice'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Submission Date</p>
                              <p className="text-xs font-bold text-on-surface">{formatDate(verification.submittedAt)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-lg border border-surface-variant/20 mb-4">
                            <span className="material-symbols-outlined text-primary">description</span>
                            <span className="text-[11px] font-bold text-on-surface truncate">{verification.documentName}</span>
                            <button className="text-[10px] font-bold text-primary ml-auto hover:underline uppercase tracking-widest">View PDF</button>
                          </div>
                        </div>

                        <div className="lg:w-80 flex flex-col gap-4">
                          <textarea
                            className="w-full bg-surface-container-low border-none rounded-lg text-xs font-medium focus:ring-2 focus:ring-primary/20 p-3 resize-none outline-none"
                            rows={3}
                            placeholder="Add reviewer notes..."
                            value={reviewNotes[verification.id] || ''}
                            onChange={(e) => setReviewNotes(curr => ({ ...curr, [verification.id]: e.target.value }))}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleVerificationDecision(verification.id, 'approved')}
                              disabled={isSaving}
                              className="flex-1 py-3 bg-primary text-on-primary text-[10px] font-bold rounded-lg uppercase tracking-widest hover:opacity-90"
                            >
                              {isSaving && actionState?.status === 'approved' ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleVerificationDecision(verification.id, 'rejected')}
                              disabled={isSaving}
                              className="flex-1 py-3 bg-error text-on-error text-[10px] font-bold rounded-lg uppercase tracking-widest hover:opacity-90"
                            >
                              {isSaving && actionState?.status === 'rejected' ? <Loader2 size={12} className="animate-spin mx-auto" /> : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </AdminSection>

          {/* Withdrawal Operations Section */}
          <AdminSection id="withdrawals" title="Financial Payouts" subtitle="Process clinical earnings and monitor withdrawal throughput.">
            {withdrawals.length === 0 ? <EmptyAdminState message="No withdrawal requests available." /> : (
              <div className="overflow-x-auto -mx-4 sm:-mx-8">
                <div className="inline-block min-w-full align-middle px-4 sm:px-8">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low text-[10px] uppercase tracking-widest text-outline font-bold">
                        <th className="px-6 py-4">Practitioner</th>
                        <th className="px-6 py-4">Amount</th>
                        <th className="px-6 py-4">Destination</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/10">
                      {withdrawals.map((withdrawal) => {
                        const isBusy = withdrawalActionState?.withdrawalId === withdrawal.id;
                        const isTerminal = withdrawal.status === 'paid' || withdrawal.status === 'failed';
                        return (
                          <tr key={withdrawal.id} className="group hover:bg-surface-container-low transition-colors">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-on-surface leading-tight">{withdrawal.email || withdrawal.phoneNumber || 'No contact saved'}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">{withdrawal.provider}</p>
                            </td>
                            <td className="px-6 py-4 font-black text-on-surface">{formatCurrency(withdrawal.amount, withdrawal.currency)}</td>
                            <td className="px-6 py-4">
                              <p className="text-xs font-bold text-on-surface">{withdrawal.destinationLabel}</p>
                              <p className="text-[10px] text-on-surface-variant font-medium">{withdrawal.destinationAccount || 'No payout account saved'}</p>
                              <p className="text-[10px] text-outline font-medium">{formatDate(withdrawal.createdAt)}</p>
                            </td>
                            <td className="px-6 py-4"><StatusBadge status={withdrawal.status} /></td>
                            <td className="px-6 py-4 text-right">
                              {isTerminal ? (
                                <span className="text-[10px] font-bold text-outline uppercase">Settled</span>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => handleWithdrawalDecision(withdrawal.id, 'paid')}
                                    disabled={isBusy}
                                    className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">payments</span>
                                  </button>
                                  <button
                                    onClick={() => handleWithdrawalDecision(withdrawal.id, 'failed')}
                                    disabled={isBusy}
                                    className="p-1.5 text-error hover:bg-error/10 rounded transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-sm">block</span>
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
              </div>
            )}
          </AdminSection>
        </div>
      )}
    </AdminLayout>
  );
}

function AdminSection({ id, title, subtitle, children }: { id: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight leading-tight">{title}</h2>
          <p className="text-on-surface-variant font-medium mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="bg-surface-container-low/50 rounded-2xl p-8">
        {children}
      </div>
    </section>
  );
}

function AdminStatCard({ icon, label, value, detail, color }: { icon: string; label: string; value: string; detail: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10',
    tertiary: 'text-tertiary bg-tertiary/10',
    secondary: 'text-secondary bg-secondary/10',
    error: 'text-error bg-error/10',
  };

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-transparent hover:border-primary/10 transition-all">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.primary}`}>
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
        <span className="text-[11px] font-bold text-outline uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-headline text-3xl font-black text-on-surface mb-1">{value}</p>
      <p className="text-[11px] text-on-surface-variant font-medium">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colorClass = (status: string) => {
    switch (status) {
      case 'approved': case 'paid': case 'completed': case 'open': case 'dentist': return 'bg-primary/10 text-primary';
      case 'rejected': case 'failed': case 'cancelled': case 'closed': case 'admin': return 'bg-error-container text-error';
      case 'pending': case 'requested': case 'queued': case 'client': return 'bg-tertiary-fixed text-tertiary';
      default: return 'bg-surface-container-high text-outline';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${colorClass(status)}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function EmptyAdminState({ message }: { message: string }) {
  return <div className="py-20 text-center"><p className="text-sm text-on-surface-variant font-medium">{message}</p></div>;
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}
