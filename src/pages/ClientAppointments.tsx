import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CalendarClock,
  CircleAlert,
  Loader2,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { apiRequest, type Appointment } from '../lib/api';

type AppointmentActionState = {
  appointmentId: string;
  action: 'cancel';
} | null;

export default function ClientAppointments() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reason, setReason] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionState, setActionState] = useState<AppointmentActionState>(null);

  const selectedDentistId = searchParams.get('dentistId') || '';
  const selectedDentistName = searchParams.get('dentistName') || '';

  const loadAppointments = async () => {
    try {
      setError('');
      const data = await apiRequest<Appointment[]>('/api/appointments');
      setAppointments(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Unable to load appointments right now.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCreateAppointment = async () => {
    setError('');
    setStatusMessage('');

    if (reason.trim().length < 10) {
      setError('Please share a clear reason for the consult with at least 10 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        reason: reason.trim(),
        dentistId: selectedDentistId || undefined,
        dentistName: selectedDentistName || undefined,
        scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
      };

      const created = await apiRequest<Appointment>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setAppointments((current) => [created, ...current]);
      setReason('');
      setScheduledFor('');
      setStatusMessage(
        created.dentistName
          ? `Consult request sent to ${created.dentistName}.`
          : 'Consult request submitted successfully.',
      );

      if (selectedDentistId || selectedDentistName) {
        setSearchParams((current) => {
          const next = new URLSearchParams(current);
          next.delete('dentistId');
          next.delete('dentistName');
          return next;
        });
      }
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to create the appointment right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setActionState({ appointmentId, action: 'cancel' });
    setError('');
    setStatusMessage('');

    try {
      const updated = await apiRequest<Appointment>(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId ? updated : appointment,
        ),
      );
      setStatusMessage('Appointment cancelled successfully.');
    } catch (actionError) {
      const message =
        actionError instanceof Error
          ? actionError.message
          : 'Unable to cancel the appointment right now.';
      setError(message);
    } finally {
      setActionState(null);
    }
  };

  return (
    <ClientLayout title="My Appointments">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Appointments</p>
        <h1 className="ds-page-title">My Appointments</h1>
        <p className="ds-page-subtitle">
          Send a new consult request, track scheduling updates, and cancel appointments that are no longer needed.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-6">
          <div className="ds-card">
            <div className="ds-card-header">
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-ink)' }}>
                  Request a Consult
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                  This form now posts directly to the appointments API.
                </p>
              </div>
              <span className="ds-badge ds-badge-teal">Live</span>
            </div>

            <div className="ds-card-body">
              {selectedDentistName ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    border: '1px solid var(--color-fog-2)',
                    borderRadius: 12,
                    padding: 14,
                    background: 'var(--color-teal-light)',
                    marginBottom: 18,
                  }}
                >
                  <div>
                    <p style={{ fontSize: 12, color: 'var(--color-teal-dark)', marginBottom: 4 }}>
                      Selected dentist
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-ink)' }}>
                      {selectedDentistName}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="ds-btn ds-btn-ghost ds-btn-sm"
                    onClick={() => {
                      setSearchParams((current) => {
                        const next = new URLSearchParams(current);
                        next.delete('dentistId');
                        next.delete('dentistName');
                        return next;
                      });
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : null}

              <div className="ds-form-group">
                <label className="ds-label">Reason for consult</label>
                <textarea
                  className="ds-input"
                  rows={5}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Describe the symptoms, case review, or second opinion you need."
                  style={{ resize: 'vertical', minHeight: 140 }}
                />
              </div>

              <div className="ds-form-group" style={{ marginBottom: 0 }}>
                <label className="ds-label">Preferred time (optional)</label>
                <input
                  type="datetime-local"
                  className="ds-input"
                  value={scheduledFor}
                  onChange={(event) => setScheduledFor(event.target.value)}
                />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="ds-btn ds-btn-primary"
                  onClick={handleCreateAppointment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={14} className="spin" /> : <CalendarClock size={14} />}
                  Send Request
                </button>

                <Link to="/client/network" className="ds-btn ds-btn-ghost no-underline">
                  <Search size={14} />
                  Browse Dentists
                </Link>
              </div>
            </div>
          </div>

          {error ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--color-ruby)',
                background: 'var(--color-ruby-light)',
                color: 'var(--color-ruby)',
                fontSize: 13,
              }}
            >
              <CircleAlert size={15} />
              {error}
            </div>
          ) : null}

          {statusMessage ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '12px 16px',
                borderRadius: 10,
                border: '1px solid var(--color-sage)',
                background: 'var(--color-sage-light)',
                color: 'var(--color-sage)',
                fontSize: 13,
              }}
            >
              <ShieldCheck size={15} />
              {statusMessage}
            </div>
          ) : null}

          {isLoading ? (
            <div className="ds-card p-12 text-center">
              <Loader2 size={28} className="mx-auto mb-4 animate-spin text-[var(--color-teal)]" />
              <p className="text-[13px] text-[var(--color-ink-4)]">Loading your appointments…</p>
            </div>
          ) : appointments.length > 0 ? (
            <div className="grid gap-4">
              {appointments.map((appointment) => {
                const isCancelling = actionState?.appointmentId === appointment.id;
                const canCancel =
                  appointment.status === 'requested' || appointment.status === 'confirmed';

                return (
                  <div key={appointment.id} className="ds-card p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                            {appointment.dentistName || 'Dentist assignment pending'}
                          </p>
                          <StatusBadge status={appointment.status} />
                        </div>

                        <p className="text-[13px] text-[var(--color-ink-4)] leading-relaxed">
                          {appointment.reason}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-[var(--color-ink-4)]">
                          <span>Requested {formatDate(appointment.createdAt)}</span>
                          <span>
                            {appointment.scheduledFor
                              ? `Preferred time: ${formatDate(appointment.scheduledFor)}`
                              : 'Awaiting scheduling confirmation'}
                          </span>
                        </div>
                      </div>

                      {canCancel ? (
                        <button
                          type="button"
                          className="ds-btn ds-btn-ghost ds-btn-sm"
                          style={{ color: 'var(--color-ruby)' }}
                          onClick={() => handleCancelAppointment(appointment.id)}
                          disabled={isCancelling}
                        >
                          {isCancelling ? <Loader2 size={13} className="spin" /> : <XCircle size={13} />}
                          Cancel
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ds-card p-12 text-center">
              <Calendar
                size={40}
                color="var(--color-fog-3)"
                style={{ margin: '0 auto 16px' }}
              />
              <h4 className="text-[16px] font-semibold text-[var(--color-ink)] mb-2">
                No Appointments Yet
              </h4>
              <p className="text-[13px] text-[var(--color-ink-4)] max-w-[420px] mx-auto leading-relaxed">
                You do not have any teledentistry sessions scheduled yet. Start with the verified dentist directory to send your first request.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/client/network"
                  className="ds-btn ds-btn-primary ds-btn-sm no-underline"
                >
                  <Search size={14} />
                  Find a Dentist
                </Link>
                <Link to="/client-dashboard" className="ds-btn ds-btn-ghost ds-btn-sm no-underline">
                  Back to dashboard
                </Link>
              </div>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <div className="ds-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-teal)] mb-3">
              Consult Flow
            </p>
            <h2 className="text-[18px] font-semibold text-[var(--color-ink)] mb-2">
              Server-backed scheduling
            </h2>
            <p className="text-[13px] leading-relaxed text-[var(--color-ink-4)]">
              Requests now persist through the backend, which means dentists and admins can act on the same appointment record you create here.
            </p>
          </div>

          <div className="ds-card p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-4)] mb-3">
              Client actions
            </p>
            <div className="space-y-3 text-[13px] text-[var(--color-ink-4)] leading-relaxed">
              <p>You can cancel requested or confirmed appointments before they are completed.</p>
              <p>Dentists can confirm the appointment and mark it completed from their own dashboard.</p>
              <p>Admins can monitor the full queue from the command center.</p>
            </div>
          </div>
        </aside>
      </div>
    </ClientLayout>
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
