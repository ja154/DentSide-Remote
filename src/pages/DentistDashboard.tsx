import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import DentistLayout from '../components/DentistLayout';
import { apiRequest, type Appointment, type WalletSummary } from '../lib/api';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AppointmentActionState = {
  appointmentId: string;
  nextStatus: 'confirmed' | 'completed' | 'cancelled';
} | null;

export default function DentistDashboard() {
  const { profile } = useAuth();
  const firstName =
    typeof profile?.displayName === 'string' && profile.displayName.trim()
      ? profile.displayName.trim().split(/\s+/)[0]
      : 'Dr.';

  const [apiKey, setApiKey] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [walletSummary, setWalletSummary] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionState, setActionState] = useState<AppointmentActionState>(null);

  const profileStrength = useMemo(() => {
    const points = [
      profile?.displayName,
      profile?.email || profile?.phoneNumber,
      profile?.photoURL,
    ].filter(Boolean).length;
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

  useEffect(() => {
    if (!profile?.uid) {
      return;
    }

    const channel = supabase
      .channel(`bookings:${profile.uid}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `dentistId=eq.${profile.uid}`,
        },
        () => {
          void loadDashboardData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.uid]);

  const handleAIMatch = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key first.');
      return;
    }

    setIsMatching(true);

    try {
      const data = await apiRequest<any[]>('/api/match', {
        method: 'POST',
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
      if (Array.isArray(data) && data.length > 0) {
        setMatches(data);
      }
    } catch (matchError) {
      const message = matchError instanceof Error ? matchError.message : 'Failed to generate matches.';
      alert(message);
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
    <DentistLayout showSearch>
      {/* Welcome Section */}
      <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="pl-4 border-l-4 border-primary">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface tracking-tight mb-2">
            Welcome back, {firstName}
          </h2>
          <p className="text-on-surface-variant font-medium">
            Your precision hub is ready. You have {activeAppointments.length} pending consult{activeAppointments.length === 1 ? '' : 's'} today.
          </p>
        </div>
        <div className="bg-surface-container-low p-1.5 rounded-xl flex items-center gap-1 shadow-sm w-fit">
          <button className="px-5 py-2 bg-white text-primary text-xs font-bold rounded-lg shadow-sm border border-primary-container/10">Available</button>
          <button className="px-5 py-2 text-outline text-xs font-semibold hover:bg-surface-container transition-colors rounded-lg">On Break</button>
        </div>
      </section>

      {/* Bento Grid Main Content */}
      <div className="grid grid-cols-12 gap-8">
        {/* Earnings Overview */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 shadow-[0px_12px_32px_rgba(25,28,30,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/5 rounded-full -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-widest">Financial Performance</span>
                <h3 className="text-slate-500 font-medium">Total Balance</h3>
              </div>
              <span className="material-symbols-outlined text-primary bg-primary-fixed p-2 rounded-lg">trending_up</span>
            </div>
            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl md:text-5xl font-black font-headline text-on-surface">
                {formatMoney(walletSummary?.availableBalance || 0)}
              </span>
              <span className="text-primary font-bold text-sm bg-primary-container/10 px-2 py-0.5 rounded">
                {formatMoney(walletSummary?.pendingBalance || 0)} pending
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
              <div className="bg-surface-container-low p-4 rounded-xl">
                <p className="text-xs text-outline font-medium mb-1">Lifetime Earned</p>
                <p className="text-2xl font-bold text-on-surface">
                  {formatMoney(walletSummary?.lifetimeWithdrawn || 0)}
                </p>
              </div>
              <div className="flex items-center justify-end">
                <Link
                  to="/wallet"
                  className="bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg shadow-primary/30 active:scale-95 transition-all text-center w-full sm:w-auto"
                >
                  Withdraw Funds
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Credentialing Status */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6">Verification Progress</h3>
            <div className="relative pt-1">
              <div className="flex mb-4 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-3 uppercase rounded-full text-tertiary bg-tertiary-fixed">
                    {profileStrength}% complete
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold inline-block text-on-surface">{profileStrength}%</span>
                </div>
              </div>
              <div className="overflow-hidden h-3 mb-6 text-xs flex rounded-full bg-surface-container-highest">
                <div
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                  style={{ width: `${profileStrength}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your current status is <span className="font-bold">{(profile?.verificationStatus || 'unverified').replace(/_/g, ' ')}</span>.
              Complete your profile to unlock higher-tier gigs.
            </p>
          </div>
          <Link
            to="/verification"
            className="w-full mt-8 py-3 text-center outline outline-primary/20 text-primary font-bold text-sm rounded-xl hover:bg-white transition-all duration-300"
          >
            Update Credentials
          </Link>
        </div>

        {/* Active Gigs & Schedule */}
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">Consult Queue</h3>
            <span className="text-primary text-sm font-bold flex items-center gap-1">
              {activeAppointments.length} Active
            </span>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-white p-12 rounded-xl shadow-sm flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-slate-500 font-medium">Loading your queue...</p>
              </div>
            ) : activeAppointments.length === 0 ? (
              <div className="bg-white p-12 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-4xl text-slate-300 mb-4">calendar_today</span>
                <h4 className="font-bold text-on-surface mb-2">No Active Consults</h4>
                <p className="text-sm text-slate-500">Your queue is currently empty. New requests will appear here.</p>
              </div>
            ) : (
              activeAppointments.map((appointment) => {
                const isBusy = actionState?.appointmentId === appointment.id;
                return (
                  <div key={appointment.id} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-surface-container-low transition-colors duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-primary-fixed rounded-xl flex items-center justify-center text-primary flex-shrink-0">
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {appointment.status === 'confirmed' ? 'event_available' : 'pending_actions'}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface group-hover:text-primary transition-colors">{appointment.clientName}</h4>
                        <p className="text-sm text-outline font-medium">{appointment.reason}</p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {appointment.scheduledFor ? new Date(appointment.scheduledFor).toLocaleString() : 'Requested'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end">
                      <div className="flex gap-2">
                        {appointment.status === 'requested' && (
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'confirmed')}
                            disabled={!!actionState}
                            className="px-3 py-1.5 bg-primary text-on-primary text-[11px] font-bold rounded-lg flex items-center gap-1"
                          >
                            {isBusy && actionState?.nextStatus === 'confirmed' ? <Loader2 size={12} className="animate-spin" /> : 'Confirm'}
                          </button>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleAppointmentAction(appointment.id, 'completed')}
                            disabled={!!actionState}
                            className="px-3 py-1.5 bg-primary text-on-primary text-[11px] font-bold rounded-lg flex items-center gap-1"
                          >
                            {isBusy && actionState?.nextStatus === 'completed' ? <Loader2 size={12} className="animate-spin" /> : 'Complete'}
                          </button>
                        )}
                        <button
                          onClick={() => handleAppointmentAction(appointment.id, 'cancelled')}
                          disabled={!!actionState}
                          className="px-3 py-1.5 border border-error/20 text-error text-[11px] font-bold rounded-lg flex items-center gap-1 hover:bg-error/5"
                        >
                          {isBusy && actionState?.nextStatus === 'cancelled' ? <Loader2 size={12} className="animate-spin" /> : 'Cancel'}
                        </button>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        appointment.status === 'confirmed' ? 'text-primary bg-primary-fixed' : 'text-tertiary bg-tertiary-fixed'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Matchmaker Section */}
        <div className="col-span-12 lg:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline text-2xl font-bold text-on-surface">AI Matchmaker</h3>
            <span className="material-symbols-outlined text-primary">auto_awesome</span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
            <div className="bg-surface-container-lowest p-5 rounded-xl border border-transparent hover:border-primary/20 transition-all">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">key</span>
                  <input
                    type="password"
                    placeholder="Gemini API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <button
                  onClick={handleAIMatch}
                  disabled={isMatching || !apiKey}
                  className="px-4 py-2 bg-primary text-on-primary text-xs font-bold rounded-lg active:scale-95 transition-transform disabled:opacity-50"
                >
                  {isMatching ? <Loader2 size={14} className="animate-spin" /> : 'Match'}
                </button>
              </div>

              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((match, idx) => (
                    <div key={idx} className="p-3 border border-outline-variant/30 rounded-lg hover:border-primary/40 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-bold text-on-surface text-sm">{match.title}</h5>
                        <span className="text-xs font-black text-primary">{match.rate}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant mb-2">{match.company} • {match.match} Match</p>
                      <div className="flex flex-wrap gap-1">
                        {match.tags.map((tag: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant leading-relaxed text-center py-4">
                  Enter your API key to find clinical opportunities tailored to your expertise.
                </p>
              )}

              <Link
                to="/opportunities"
                className="block w-full mt-4 py-3 bg-surface-container-high text-on-surface text-center text-xs font-bold rounded-lg active:scale-95 transition-transform uppercase tracking-widest"
              >
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}
    </DentistLayout>
  );
}
