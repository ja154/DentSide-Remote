import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Calendar, User, ArrowRight } from 'lucide-react';

export default function ClientDashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const showPending = (feature: string) => {
    alert(`${feature} is pending and will be available soon.`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-paper)', fontFamily: 'var(--font-sans)' }}>
      {/* Top Bar */}
      <header style={{
        background: 'var(--color-white)', borderBottom: '1px solid var(--color-fog-2)',
        height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', position: 'sticky', top: 0, zIndex: 90,
      }}>
        <div className="flex items-center gap-2">
          <div style={{ background: 'var(--color-teal)', borderRadius: 8, padding: '5px 7px' }}>
            <User size={16} color="#fff" />
          </div>
          <span className="font-display" style={{ fontSize: 18, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}>
            DentSide <span style={{ color: 'var(--color-teal)', fontStyle: 'italic' }}>Client</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>
            {profile?.displayName || profile?.email}
          </span>
          <button
            onClick={handleLogout}
            className="ds-btn ds-btn-ghost ds-btn-sm"
            style={{ color: 'var(--color-ruby)', borderColor: 'transparent', gap: 6 }}
          >
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px' }}>
        {/* Header */}
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Client Portal</p>
          <h1 className="ds-page-title">
            Welcome, {profile?.displayName?.split(' ')[0] || 'there'}
          </h1>
          <p className="ds-page-subtitle">
            Access your appointments, find dental professionals, and manage your consultations all in one place.
          </p>
        </div>

        {/* Action Cards */}
        <div className="ds-grid-2" style={{ marginBottom: 40 }}>
          {/* Find a Dentist */}
          <div className="ds-card" style={{ padding: 28, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,122,107,0.1)')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
            onClick={() => showPending('Dentist directory')}
          >
            <div className="ds-feature-icon" style={{ marginBottom: 16 }}>
              <Search size={20} color="var(--color-teal)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>Find a Dentist</h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.6, marginBottom: 20 }}>
              Search our global network of verified dental professionals for consults or freelance work.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
              Browse Network <ArrowRight size={13} />
            </div>
          </div>

          {/* My Appointments */}
          <div className="ds-card" style={{ padding: 28, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
            onMouseOver={e => (e.currentTarget.style.boxShadow = '0 8px 24px rgba(13,122,107,0.1)')}
            onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
            onClick={() => showPending('Appointment management')}
          >
            <div className="ds-feature-icon" style={{ marginBottom: 16, background: 'var(--color-amber-light)' }}>
              <Calendar size={20} color="var(--color-amber)" />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 8 }}>My Appointments</h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.6, marginBottom: 20 }}>
              View your upcoming teledentistry sessions and past consultation notes.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-teal)', fontWeight: 600 }}>
              View Appointments <ArrowRight size={13} />
            </div>
          </div>
        </div>

        {/* Empty state for appointments */}
        <div className="ds-card" style={{ padding: 48, textAlign: 'center' }}>
          <Calendar size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>No Upcoming Appointments</h4>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', maxWidth: 340, margin: '0 auto 20px' }}>
            You don't have any teledentistry sessions scheduled. Find a dental professional to get started.
          </p>
          <button className="ds-btn ds-btn-primary ds-btn-sm" onClick={() => showPending('Find a dentist')}>
            <Search size={14} /> Find a Dentist
          </button>
        </div>
      </main>
    </div>
  );
}
