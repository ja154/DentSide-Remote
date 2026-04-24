import {
  ArrowLeft,
  Bell,
  Briefcase,
  CheckCircle2,
  CircleAlert,
  LayoutDashboard,
  ShieldCheck,
  Upload,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type FormState = {
  legalName: string;
  email: string;
  clinic: string;
  issuingState: string;
  licenseNumber: string;
  documentName: string;
};

const STATE_OPTIONS = ['California', 'New York', 'Texas', 'Florida', 'Washington'];

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
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const completedSteps = useMemo(() => {
    const personalComplete = form.legalName.trim().length > 2 && form.email.includes('@') && form.clinic.trim().length > 2;
    const licenseComplete = form.licenseNumber.trim().length >= 6 && !!form.documentName;

    return {
      personalComplete,
      licenseComplete,
      total: Number(personalComplete) + Number(licenseComplete),
    };
  }, [form]);

  const handleChange = (key: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!completedSteps.personalComplete) {
      setError('Please complete all personal information fields with valid values.');
      return;
    }

    if (!completedSteps.licenseComplete) {
      setError('Please provide a valid license number and upload a license document.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        displayName: form.legalName.trim(),
        onboardingComplete: true,
      });
      setSuccess('Verification details saved. Our team will review your credentials within 24–48 hours.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save verification details right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface min-h-screen font-body">
      <header className="bg-[#f7f9fb]/80 backdrop-blur-xl shadow-sm fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-6 h-16 w-full">
          <Link to="/dashboard" className="text-xl font-extrabold text-[#0077B6] tracking-tighter font-headline">DentSide</Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/dashboard" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm">Dashboard</Link>
            <Link to="/opportunities" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm">Gigs</Link>
            <Link to="/wallet" className="text-slate-500 hover:text-[#0077B6] font-semibold text-sm">Wallet</Link>
            <Link to="/verification" className="text-[#0077B6] font-semibold text-sm">Profile</Link>
          </nav>

          <div className="flex items-center gap-4 relative">
            <button
              type="button"
              onClick={() => setShowNotifications((current) => !current)}
              className="relative text-slate-600 hover:bg-[#f7f9fb] transition-colors p-2 rounded-full"
              aria-label="Toggle notifications"
            >
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] rounded-full bg-[#0077B6] text-white flex items-center justify-center">2</span>
            </button>
            {showNotifications && (
              <div className="absolute top-12 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-sm">Notifications</h4>
                  <button type="button" onClick={() => setShowNotifications(false)} aria-label="Close notifications">
                    <X size={14} className="text-slate-500" />
                  </button>
                </div>
                <p className="text-xs text-slate-600">Verification reminder: upload a valid license photo for faster approval.</p>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-primary-fixed overflow-hidden ring-2 ring-primary-container/20">
              <img className="w-full h-full object-cover" src={profile?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'} alt="User avatar" />
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-32 px-4 md:px-8 max-w-6xl mx-auto">
        <section className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-3 font-headline">Profile & Identity Verification</h1>
            <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed">Complete your professional profile to unlock high-trust remote opportunities and credentialed consult workflows.</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold">
            Progress: {completedSteps.total}/2 steps complete
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className={completedSteps.personalComplete ? 'text-emerald-600' : 'text-slate-400'} />
                <div>
                  <h3 className="font-bold">Step 1: Personal Information</h3>
                  <p className="text-xs text-on-surface-variant">Name, email, and active clinic details.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className={completedSteps.licenseComplete ? 'text-emerald-600' : 'text-slate-400'} />
                <div>
                  <h3 className="font-bold">Step 2: License Verification</h3>
                  <p className="text-xs text-on-surface-variant">Issuing state, license number, and document upload.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className={completedSteps.total === 2 ? 'text-emerald-600' : 'text-slate-400'} />
                <div>
                  <h3 className="font-bold">Step 3: Review Status</h3>
                  <p className="text-xs text-on-surface-variant">Our team will review submitted details in 24–48 business hours.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary-container/5 p-6 rounded-xl border border-primary-container/10">
              <div className="flex items-center gap-3 text-primary mb-2">
                <ShieldCheck size={18} />
                <h4 className="font-bold font-headline">Privacy Guaranteed</h4>
              </div>
              <p className="text-sm text-on-secondary-container leading-relaxed">Your verification data is encrypted and used only for provider credentialing and trust controls.</p>
            </div>
          </aside>

          <div className="lg:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border-l-4 border-primary-container">
              <h2 className="text-2xl font-extrabold tracking-tight font-headline mb-6">Professional Profile</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Legal Full Name</label>
                  <input
                    type="text"
                    value={form.legalName}
                    onChange={(event) => handleChange('legalName', event.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container"
                    placeholder="Dr. Julianne Mercer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) => handleChange('email', event.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container"
                    placeholder="j.mercer@dentalhub.com"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Clinic / Institution</label>
                  <input
                    type="text"
                    value={form.clinic}
                    onChange={(event) => handleChange('clinic', event.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container"
                    placeholder="St. Apollonia Dental Center"
                  />
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-8 rounded-xl">
                <h3 className="text-xl font-bold font-headline mb-4">License Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Issuing State</label>
                    <select
                      value={form.issuingState}
                      onChange={(event) => handleChange('issuingState', event.target.value)}
                      className="w-full bg-surface-container-lowest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container"
                    >
                      {STATE_OPTIONS.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">License Number</label>
                    <input
                      type="text"
                      value={form.licenseNumber}
                      onChange={(event) => handleChange('licenseNumber', event.target.value)}
                      className="w-full bg-surface-container-lowest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary-container"
                      placeholder="DDS-123456"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-highest/40 border-2 border-dashed border-outline-variant p-8 rounded-xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary-container/10 flex items-center justify-center mb-4">
                  <Upload size={28} className="text-primary-container" />
                </div>
                <h4 className="font-bold text-on-surface font-headline">Upload License Document</h4>
                <p className="text-xs text-on-surface-variant mt-2 px-4 leading-relaxed">PDF, JPG, or PNG. Ensure all text is clear and document edges are visible.</p>
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
                  className="mt-6 text-sm font-bold text-primary underline decoration-2 underline-offset-4"
                >
                  Browse Files
                </button>
                {form.documentName && (
                  <p className="mt-3 text-xs text-emerald-700 font-semibold">Selected: {form.documentName}</p>
                )}
              </div>
            </section>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                <CircleAlert size={16} className="mt-0.5" />
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-start gap-2">
                <CheckCircle2 size={16} className="mt-0.5" />
                {success}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant font-bold hover:text-on-surface transition-colors">
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary-container/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Verification'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 w-full z-50 rounded-t-3xl bg-white/80 backdrop-blur-xl shadow-[0px_-12px_32px_rgba(25,28,30,0.06)] border-t border-slate-100/10">
        <div className="flex justify-around items-center px-4 h-20 w-full pb-safe">
          <Link to="/dashboard" className="flex flex-col items-center justify-center text-slate-400">
            <LayoutDashboard size={18} />
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Dashboard</span>
          </Link>
          <Link to="/opportunities" className="flex flex-col items-center justify-center text-slate-400">
            <Briefcase size={18} />
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Gigs</span>
          </Link>
          <Link to="/wallet" className="flex flex-col items-center justify-center text-slate-400">
            <Wallet size={18} />
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Wallet</span>
          </Link>
          <Link to="/verification" className="flex flex-col items-center justify-center bg-[#0077B6]/10 text-[#0077B6] rounded-xl px-4 py-1">
            <User size={18} />
            <span className="font-inter text-[11px] font-semibold tracking-wide uppercase mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
