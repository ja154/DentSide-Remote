import React, { useEffect, useState } from 'react';
import { Calendar, Loader2, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';
import { apiRequest, type Appointment } from '../lib/api';

export default function ClientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadAppointments = async () => {
      try {
        const data = await apiRequest<Appointment[]>('/api/appointments');
        if (!cancelled) {
          setAppointments(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          const message =
            loadError instanceof Error ? loadError.message : 'Unable to load appointments right now.';
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadAppointments();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ClientLayout title="My Appointments">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Appointments</p>
        <h1 className="ds-page-title">My Appointments</h1>
        <p className="ds-page-subtitle">
          Track upcoming sessions and review your consultation history.
        </p>
      </div>

      {isLoading ? (
        <div className="ds-card p-12 text-center">
          <Loader2 size={28} className="mx-auto mb-4 animate-spin text-[var(--color-teal)]" />
          <p className="text-[13px] text-[var(--color-ink-4)]">Loading your appointments…</p>
        </div>
      ) : appointments.length > 0 ? (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="ds-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-[var(--color-ink)]">
                    {appointment.dentistName || 'Dentist assignment pending'}
                  </p>
                  <p className="mt-1 text-[13px] text-[var(--color-ink-4)]">
                    {appointment.reason}
                  </p>
                </div>
                <span className="ds-badge ds-badge-teal">
                  {appointment.status.replace('_', ' ')}
                </span>
              </div>
              <p className="mt-4 text-[12px] text-[var(--color-ink-4)]">
                {appointment.scheduledFor
                  ? `Scheduled for ${new Date(appointment.scheduledFor).toLocaleString()}`
                  : 'Scheduling confirmation pending'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="ds-card p-12 text-center">
          <Calendar
            size={40}
            color="var(--color-fog-3)"
            style={{ margin: '0 auto 16px' }}
          />
          <h4 className="text-[16px] font-semibold text-[var(--color-ink)] mb-2">
            No Upcoming Appointments
          </h4>
          <p className="text-[13px] text-[var(--color-ink-4)] max-w-[420px] mx-auto leading-relaxed">
            You do not have any teledentistry sessions scheduled yet. Find a dentist to
            request a consult.
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

      {error && (
        <p className="mt-4 text-[13px] text-[var(--color-ruby)]">{error}</p>
      )}
    </ClientLayout>
  );
}
