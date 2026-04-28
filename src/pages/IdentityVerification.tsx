import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  ArrowLeft, Upload, Clock, BadgeCheck, HelpCircle, Lock, CheckCircle2, CircleAlert
} from 'lucide-react';
import DentistSidebar from '../components/DentistSidebar';
import NotificationMenu from '../components/NotificationMenu';


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

const STATE_OPTIONS = ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Kenya'];

const STEPS = [
  { num: 1, label: 'Personal Information', sub: 'Basic contact & dental residency details.', active: true },
  { num: 2, label: 'License Verification', sub: 'Official state licensure documentation.', active: true },
  { num: 3, label: 'Verification Status', sub: 'Review and final confirmation.', active: false },
];

export default function IdentityVerification() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      const response = await apiRequest<{ message?: string }>('/api/verify', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      await refreshProfile();
      setSuccess(response.message || 'Verification submitted. Review typically completes within 24–48 business hours.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save verification details right now.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ds-layout">
      {isSidebarOpen && (
        <button
          type="button"
          className="ds-sidebar-backdrop md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <DentistSidebar
        pathname={location.pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Top Bar */}
      <header className="ds-topbar">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="ds-sidebar-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={16} />
          </button>
          <p style={{ fontSize: 13, color: 'var(--color-ink-4)', fontWeight: 500 }}>Identity Verification</p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationMenu />
          <div className="ds-avatar ds-avatar-md">
            <img src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="ds-main">
        <div className="ds-page-header">
          <p className="ds-page-eyebrow">Verification</p>
          <h1 className="ds-page-title">Identity Verification</h1>
          <p className="ds-page-subtitle">As a premier platform for dental professionals, we require a standard verification process to ensure clinical integrity.</p>
        </div>

        <div className="grid items-start gap-7 xl:grid-cols-[260px_minmax(0,1fr)]">
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
                    <input type="text" className="ds-input" value={form.legalName} onChange={(e) => handleChange('legalName', e.target.value)} placeholder="Dr. Julianne Mercer" />
                  </div>
                  <div className="ds-form-group">
                    <label className="ds-label">Email Address</label>
                    <input type="email" className="ds-input" value={form.email} onChange={(e) => handleChange('email', e.target.value)} placeholder="j.mercer@dental.com" />
                  </div>
                  <div className="ds-form-group" style={{ gridColumn: 'span 2', marginBottom: 0 }}>
                    <label className="ds-label">Current Clinic / Institution</label>
                    <input type="text" className="ds-input" value={form.clinic} onChange={(e) => handleChange('clinic', e.target.value)} placeholder="St. Apollonia Dental Center" />
                  </div>
                </div>
              </div>
            </div>

            {/* License Section */}
            <div className="ds-grid-2">
              {/* State Licensure */}
              <div className="ds-card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 20 }}>State Licensure</h3>
                <div className="ds-form-group">
                  <label className="ds-label">Issuing State</label>
                  <select className="ds-select" value={form.issuingState} onChange={(e) => handleChange('issuingState', e.target.value)}>
                    {STATE_OPTIONS.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div className="ds-form-group" style={{ marginBottom: 0 }}>
                  <label className="ds-label">License Number</label>
                  <input type="text" className="ds-input" value={form.licenseNumber} onChange={(e) => handleChange('licenseNumber', e.target.value)} placeholder="DDS-XXXXXX-2024" />
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
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="ds-feature-icon" style={{ marginBottom: 12 }}>
                  <Upload size={18} color="var(--color-teal)" />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink)', marginBottom: 6 }}>Upload License Photo</p>
                <p style={{ fontSize: 12, color: 'var(--color-ink-4)', lineHeight: 1.55, marginBottom: 16 }}>
                  PDF, JPG, or PNG. Ensure all text is legible and edges are visible.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(event) => handleChange('documentName', event.target.files?.[0]?.name || '')}
                  style={{ display: 'none' }}
                />
                <button className="ds-btn ds-btn-ghost ds-btn-sm">
                  {form.documentName ? form.documentName : 'Browse Files'}
                </button>
              </div>
            </div>

            {/* Final Review */}
            <div className="ds-card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-ink)', marginBottom: 16 }}>Final Review</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.hasSelfieCheck} onChange={(e) => handleChange('hasSelfieCheck', e.target.checked)} />
                  <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>I confirm the uploaded license belongs to me and matches my legal name.</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.hasDisclosureConsent} onChange={(e) => handleChange('hasDisclosureConsent', e.target.checked)} />
                  <span style={{ fontSize: 13, color: 'var(--color-ink)' }}>I consent to DentSide reviewing this information for verification and trust controls.</span>
                </label>
              </div>
            </div>
            
            {error && (
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-ruby)', color: '#fff', fontSize: 13, display: 'flex', gap: 8 }}>
                <CircleAlert size={16} /> {error}
              </div>
            )}
            {success && (
              <div style={{ padding: 12, borderRadius: 8, background: 'var(--color-sage)', color: '#fff', fontSize: 13, display: 'flex', gap: 8 }}>
                <CheckCircle2 size={16} /> {success}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => navigate(-1)} className="ds-btn ds-btn-ghost ds-btn-sm">
                <ArrowLeft size={14} /> Back
              </button>
              <button className="ds-btn ds-btn-primary ds-btn-lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Verification'} <BadgeCheck size={16} />
              </button>
            </div>
          </div>
        </div>

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
    </div>
  );
}
