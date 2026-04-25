import React from 'react';
import { Calendar, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClientLayout from '../components/ClientLayout';

export default function ClientAppointments() {
  return (
    <ClientLayout title="My Appointments">
      <div className="ds-page-header">
        <p className="ds-page-eyebrow">Appointments</p>
        <h1 className="ds-page-title">My Appointments</h1>
        <p className="ds-page-subtitle">
          Track upcoming sessions and review your consultation history.
        </p>
      </div>

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
    </ClientLayout>
  );
}

