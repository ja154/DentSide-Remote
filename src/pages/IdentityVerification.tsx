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
          </div>
        </div>
      </header>

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
                  </div>
                </div>
              </div>

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
          </div>
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around">
          <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard className="h-4 w-4" />Home</NavLink>
          <NavLink to="/opportunities" className={navLinkClass}><Briefcase className="h-4 w-4" />Gigs</NavLink>
          <NavLink to="/wallet" className={navLinkClass}><Wallet className="h-4 w-4" />Wallet</NavLink>
          <NavLink to="/verification" className={navLinkClass}><UserCircle2 className="h-4 w-4" />Profile</NavLink>
        </div>
      </nav>
    </div>
  );
}
