<<<<<<< HEAD
import {
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Upload,
  UserCircle2,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type FormState = {
  legalName: string;
  email: string;
  clinic: string;
  issuingState: string;
  licenseNumber: string;
  documentName: string;
  hasSelfieCheck: boolean;
  hasDisclosureConsent: boolean;
};

const STATE_OPTIONS = ['California', 'New York', 'Texas', 'Florida', 'Washington'];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
    isActive ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
  }`;

export default function IdentityVerification() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [form, setForm] = useState<FormState>({
    legalName: profile?.displayName || '',
    email: profile?.email || '',
    clinic: '',
    issuingState: STATE_OPTIONS[0],
    licenseNumber: '',
    documentName: '',
    hasSelfieCheck: false,
    hasDisclosureConsent: false,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const checks = useMemo(() => {
    const personalComplete = form.legalName.trim().length > 2 && form.email.includes('@') && form.clinic.trim().length > 2;
    const licenseComplete = form.licenseNumber.trim().length >= 6 && !!form.documentName;
    const finalReviewComplete = form.hasSelfieCheck && form.hasDisclosureConsent;
    const completedCount = Number(personalComplete) + Number(licenseComplete) + Number(finalReviewComplete);

    return {
      personalComplete,
      licenseComplete,
      finalReviewComplete,
      completedCount,
      progress: Math.round((completedCount / 3) * 100),
    };
  }, [form]);

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!checks.personalComplete) {
      setError('Please complete all personal information fields with valid values.');
      return;
    }
    if (!checks.licenseComplete) {
      setError('Please provide a valid license number and upload a license document.');
      return;
    }
    if (!checks.finalReviewComplete) {
      setError('Please confirm the identity and consent checkboxes before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: form.legalName.trim(),
        onboardingComplete: true,
      });
      setSuccess('Verification submitted. Review typically completes within 24–48 business hours.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save verification details right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-body">
      <header className="fixed top-0 z-50 w-full border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/dashboard" className="text-xl font-extrabold tracking-tight text-primary">DentSide</Link>

          <nav className="hidden items-center gap-2 md:flex">
            <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Dashboard</NavLink>
            <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
            <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
            <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
          </nav>

          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              className="relative rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100"
              aria-label="Toggle notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-semibold text-white">2</span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-12 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-bold">Verification tips</h4>
                  <button type="button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">Use a clear scan and match your legal name exactly as listed on the license board.</p>
              </div>
            )}
            <div className="h-9 w-9 overflow-hidden rounded-full border-2 border-primary/20">
              <img className="h-full w-full object-cover" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="User avatar" />
            </div>
=======
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, Wallet, ShieldCheck, Bell, LogOut,
  ArrowLeft, Upload, Clock, BadgeCheck, HelpCircle, Lock
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Gigs', href: '/opportunities', icon: Briefcase },
  { label: 'Wallet', href: '/wallet', icon: Wallet },
  { label: 'Profile', href: '/verification', icon: ShieldCheck },
];

const STEPS = [
  { num: 1, label: 'Personal Information', sub: 'Basic contact & dental residency details.', active: true },
  { num: 2, label: 'License Verification', sub: 'Official state licensure documentation.', active: true },
  { num: 3, label: 'Verification Status', sub: 'Review and final confirmation.', active: false },
];

export default function IdentityVerification() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="ds-layout">
      {/* Sidebar */}
      <aside className="ds-sidebar">
        <div className="ds-sidebar-logo">
          <div className="ds-sidebar-logo-mark">DentSide</div>
          <div className="ds-sidebar-logo-sub">Remote Platform</div>
        </div>
        <nav className="ds-sidebar-nav">
          <div className="ds-sidebar-section">
            <div className="ds-sidebar-section-label">Navigation</div>
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <Link key={href} to={href} className={`ds-nav-item${location.pathname === href ? ' active' : ''}`}>
                <Icon size={16} className="nav-icon" /> {label}
              </Link>
            ))}
          </div>
          <div className="ds-sidebar-section">
            <button className="ds-nav-item" style={{ color: 'var(--color-ruby)' }}
              onClick={async () => { await logout(); navigate('/'); }}>
              <LogOut size={16} className="nav-icon" /> Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Top Bar */}
      <header className="ds-topbar">
        <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Identity Verification</p>
        <div className="flex items-center gap-3">
          <button className="ds-btn ds-btn-ghost ds-btn-sm" style={{ padding: '7px 10px', borderRadius: '50%' }}>
            <Bell size={15} />
          </button>
          <div className="ds-avatar ds-avatar-md">
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
          </div>
        </div>
      </header>

<<<<<<< HEAD
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-24 md:px-6">
        <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">Profile verification</h1>
            <p className="mt-2 max-w-2xl text-slate-600">Complete all three steps to unlock verified status, premium gigs, and faster client trust.</p>
          </div>
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary">Progress: {checks.progress}%</div>
        </section>

        <div className="mb-6 h-2 w-full rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${checks.progress}%` }} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <aside className="space-y-4 lg:col-span-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Verification stages</h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`mt-0.5 h-5 w-5 ${checks.personalComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <p className="font-semibold">1. Profile details</p>
                    <p className="text-xs text-slate-500">Legal name, practice email, and clinic name.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className={`mt-0.5 h-5 w-5 ${checks.licenseComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <p className="font-semibold">2. License upload</p>
                    <p className="text-xs text-slate-500">Issuing state, license number, and readable document.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock3 className={`mt-0.5 h-5 w-5 ${checks.finalReviewComplete ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <div>
                    <p className="font-semibold">3. Consent & review</p>
                    <p className="text-xs text-slate-500">Confirm identity check and submission consent.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ShieldCheck className="h-4 w-4" />
                <h3 className="font-semibold">Secure verification</h3>
              </div>
              <p className="text-sm text-slate-600">Documents are encrypted and used only for credential checks and platform trust controls.</p>
            </div>
          </aside>

          <div className="space-y-6 lg:col-span-8">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold">Step 1: Professional profile</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Legal full name</label>
                  <input
                    type="text"
                    value={form.legalName}
                    onChange={(event) => handleChange('legalName', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-primary transition focus:ring-2"
                    placeholder="Dr. Julianne Mercer"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Email address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-primary transition focus:ring-2"
                    placeholder="j.mercer@dentalhub.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Current clinic / institution</label>
                  <input
                    type="text"
                    value={form.clinic}
                    onChange={(event) => handleChange('clinic', event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-primary transition focus:ring-2"
                    placeholder="St. Apollonia Dental Center"
                  />
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-xl font-bold">Step 2: License details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Issuing state</label>
                    <select
                      value={form.issuingState}
                      onChange={(event) => handleChange('issuingState', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-primary transition focus:ring-2"
                    >
                      {STATE_OPTIONS.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">License number</label>
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(event) => handleChange('licenseNumber', event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-primary transition focus:ring-2"
                      placeholder="DDS-123456"
                    />
=======
      {/* Main */}
      <main className="ds-main">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Verification</p>
          <h1 className="ds-page-title">Identity Verification</h1>
          <p className="ds-page-subtitle">As a premier platform for dental professionals, we require a standard verification process to ensure clinical integrity.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28, alignItems: 'start' }}>
          {/* Left: Progress Steps */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="ds-card" style={{ padding: 24 }}>
              {STEPS.map((step, i) => (
                <div key={step.num} style={{ display: 'flex', gap: 14, marginBottom: i < STEPS.length - 1 ? 0 : 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: step.active ? 'var(--color-teal)' : 'var(--color-fog)',
                      color: step.active ? '#fff' : 'var(--color-fog-4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 13,
                    }}>
                      {step.num}
                    </div>
                    {i < STEPS.length - 1 && (
                      <div style={{ width: 1, flex: 1, minHeight: 32, background: step.active ? 'var(--color-teal-light)' : 'var(--color-fog-2)', margin: '6px 0' }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: i < STEPS.length - 1 ? 24 : 0 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, color: step.active ? 'var(--color-teal)' : 'var(--color-fog-4)', marginBottom: 2 }}>
                      Step {step.num}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: step.active ? 'var(--color-ink)' : 'var(--color-fog-4)', marginBottom: 2 }}>
                      {step.label}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.5 }}>{step.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Privacy Notice */}
            <div className="ds-card" style={{ padding: 20, borderLeft: '3px solid var(--color-teal)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Lock size={14} color="var(--color-teal)" />
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-ink)' }}>Privacy Guaranteed</p>
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.6 }}>
                Your data is encrypted using clinical-grade security standards. We never share your license details with third parties.
              </p>
            </div>
          </aside>

          {/* Right: Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Personal Details */}
            <div className="ds-card">
              <div className="ds-card-header">
                <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)' }}>Personal Details</h2>
                <span className="ds-badge ds-badge-amber">In Progress</span>
              </div>
              <div className="ds-card-body">
                <div className="ds-grid-2">
                  <div className="ds-form-group">
                    <label className="ds-label">Legal Full Name</label>
                    <input type="text" className="ds-input" defaultValue={profile?.displayName || ''} placeholder="Dr. Julianne Mercer" />
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">Email Address</label>
                    <input type="email" className="ds-input" defaultValue={profile?.email || ''} placeholder="j.mercer@dental.com" />
                  </div>
                  <div className="ds-form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="ds-label">Current Clinic / Institution</label>
                    <input type="text" className="ds-input" placeholder="St. Apollonia Dental Center" />
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
                  </div>
                </div>
              </div>
            </div>

<<<<<<< HEAD
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                <div className="mb-3 rounded-full bg-primary/10 p-4 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <h4 className="font-semibold">Upload license document</h4>
                <p className="mt-1 text-xs text-slate-500">Accepted: PDF, JPG, PNG. Ensure all text is legible.</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(event) => handleChange('documentName', event.target.files?.[0]?.name || '')}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                >
                  Choose file
                </button>
                {form.documentName && <p className="mt-3 text-xs font-semibold text-emerald-600">Selected: {form.documentName}</p>}
=======
            {/* License Section */}
            <div className="ds-grid-2">
              {/* State Licensure */}
              <div className="ds-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>State Licensure</h3>
                <div className="ds-form-group">
                  <label className="ds-label">Issuing State</label>
                  <select className="ds-select">
                    <option>California</option>
                    <option>New York</option>
                    <option>Texas</option>
                    <option>Florida</option>
                    <option>Kenya</option>
                  </select>
                </div>
                <div className="ds-form-group" style={{ marginBottom: 0 }}>
                  <label className="ds-label">License Number</label>
                  <input type="text" className="ds-input" placeholder="DDS-XXXXXX-2024" />
                </div>
              </div>

              {/* Upload */}
              <div style={{
                border: '1.5px dashed var(--color-fog-2)', borderRadius: 12,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: 32, textAlign: 'center',
                cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
                background: 'var(--color-paper)',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--color-teal-mid)'; e.currentTarget.style.background = 'var(--color-teal-light)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--color-fog-2)'; e.currentTarget.style.background = 'var(--color-paper)'; }}
              >
                <div className="ds-feature-icon" style={{ marginBottom: 12 }}>
                  <Upload size={18} color="var(--color-teal)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)', marginBottom: 6 }}>Upload License Photo</p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.55, marginBottom: 16 }}>
                  PDF, JPG, or PNG. Ensure all text is legible and edges are visible.
                </p>
                <button className="ds-btn ds-btn-ghost ds-btn-sm">Browse Files</button>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 text-xl font-bold">Step 3: Final review</h3>
              <div className="space-y-3 text-sm">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.hasSelfieCheck}
                    onChange={(event) => handleChange('hasSelfieCheck', event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>I confirm the uploaded license belongs to me and matches my legal name.</span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.hasDisclosureConsent}
                    onChange={(event) => handleChange('hasDisclosureConsent', event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <span>I consent to DentSide reviewing this information for verification and trust controls.</span>
                </label>
              </div>
            </section>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <CircleAlert className="mt-0.5 h-4 w-4" /> {error}
              </div>
            )}
            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4" /> {success}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isSubmitting ? 'Submitting…' : 'Submit verification'}
              </button>
            </div>

            {/* Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 }}>
              <button onClick={() => navigate(-1)} className="ds-btn ds-btn-ghost ds-btn-sm">
                <ArrowLeft size={14} /> Back
              </button>
              <button className="ds-btn ds-btn-primary ds-btn-lg">
                Submit Verification <BadgeCheck size={16} />
              </button>
            </div>
          </div>
        </div>
<<<<<<< HEAD
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Home</NavLink>
          <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
          <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
          <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
        </div>
      </nav>
=======

        {/* Insights Row */}
        <div className="ds-grid-3" style={{ marginTop: 40 }}>
          <InsightCard icon={<Clock size={18} color="var(--color-teal)" />} bg="var(--color-teal-light)" title="Fast Review" body="Our clinical team typically verifies credentials within 24–48 business hours." />
          <InsightCard icon={<BadgeCheck size={18} color="var(--color-amber)" />} bg="var(--color-amber-light)" title="Active Status" body="Once verified, you'll receive a 'Clinical Pro' badge and full access to remote gigs." />
          <InsightCard icon={<HelpCircle size={18} color="var(--color-sage)" />} bg="var(--color-sage-light)" title="Need Help?" body="Our credentialing specialists are available at support@dentside.com" />
        </div>
      </main>
    </div>
  );
}

function InsightCard({ icon, bg, title, body }: { icon: React.ReactNode; bg: string; title: string; body: string }) {
  return (
    <div className="ds-card" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)', marginBottom: 6 }}>{title}</p>
        <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.6 }}>{body}</p>
      </div>
>>>>>>> e86dec5 (feat: implement new sidebar-based dashboard layout and update navigation structure)
    </div>
  );
}
