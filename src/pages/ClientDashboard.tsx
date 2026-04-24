import React from 'react';
import { useAuth } from '../contexts/AuthContext';
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Search, Stethoscope, UserCircle2 } from 'lucide-react';
=======
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Calendar, User, ArrowRight } from 'lucide-react';
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)

export default function ClientDashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50 font-body text-slate-900">
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2 text-white"><Stethoscope className="h-5 w-5" /></div>
            <span className="text-lg font-bold tracking-tight">DentSide Client</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:block">Home</Link>
            <span className="hidden text-sm font-medium text-slate-600 sm:block">{profile?.displayName || profile?.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              title="Log out"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
=======
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
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
        </div>
      </header>

<<<<<<< HEAD
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <UserCircle2 className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Welcome to your Client Portal</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <button className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 group-hover:bg-blue-100">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold">Find a Dentist</h2>
            <p className="mt-2 text-sm text-slate-600">Browse verified professionals for remote consults and case support.</p>
          </button>

          <button className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 inline-flex rounded-xl bg-teal-50 p-3 group-hover:bg-teal-100">
              <Calendar className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold">My Appointments</h2>
            <p className="mt-2 text-sm text-slate-600">View upcoming sessions, meeting links, and consultation summaries.</p>
          </button>
=======
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
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
        </div>

        {/* Empty state for appointments */}
        <div className="ds-card" style={{ padding: 48, textAlign: 'center' }}>
          <Calendar size={36} color="var(--color-fog-3)" style={{ margin: '0 auto 12px' }} />
          <h4 style={{ fontWeight: 600, color: 'var(--color-ink)', marginBottom: 6 }}>No Upcoming Appointments</h4>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', maxWidth: 340, margin: '0 auto 20px' }}>
            You don't have any teledentistry sessions scheduled. Find a dental professional to get started.
          </p>
          <button className="ds-btn ds-btn-primary ds-btn-sm">
            <Search size={14} /> Find a Dentist
          </button>
        </div>
      </main>
    </div>
  );
}
