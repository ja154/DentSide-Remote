import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, LogOut, Search, Stethoscope, UserCircle2 } from 'lucide-react';

export default function ClientDashboard() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
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
        </div>
      </nav>

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
        </div>
      </main>
    </div>
  );
}
