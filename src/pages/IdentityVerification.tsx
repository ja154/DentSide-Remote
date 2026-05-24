import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  ApiError,
  apiRequest,
  type VerificationRecord,
  type VerificationStatusResponse,
} from '../lib/api';
import {
  storageConfigured as runtimeStorageConfigured,
  uploadProtectedFile,
} from '../lib/storage-client';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import DentistLayout from '../components/DentistLayout';

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

type UploadedDocument = {
  name: string;
  path?: string;
  contentType?: string;
  sizeBytes?: number;
};

const STATE_OPTIONS = ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Kenya'];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export default function IdentityVerification() {
  const { profile, refreshProfile } = useAuth();
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
  const [verification, setVerification] = useState<VerificationRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [storageConfigured, setStorageConfigured] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const profileStrength = useMemo(() => {
    const points = [
      profile?.displayName,
      profile?.email || profile?.phoneNumber,
      profile?.photoURL,
    ].filter(Boolean).length;
    return Math.round((points / 3) * 100);
  }, [profile]);

  useEffect(() => {
    let cancelled = false;

    const loadVerificationStatus = async () => {
      setIsLoadingStatus(true);

      try {
        const response = await apiRequest<VerificationStatusResponse>('/api/verify/status');

        if (cancelled) return;

        setVerification(response.verification);
        setStorageConfigured(response.storageConfigured);

        setForm((current) => ({
          ...current,
          legalName: response.verification?.legalName || profile?.displayName || current.legalName,
          email: response.verification?.email || profile?.email || current.email,
          clinic: response.verification?.clinic || current.clinic,
          issuingState: response.verification?.issuingState || current.issuingState,
          licenseNumber: response.verification?.licenseNumber || current.licenseNumber,
          documentName: response.verification?.documentName || current.documentName,
          hasSelfieCheck: current.hasSelfieCheck || Boolean(response.verification),
          hasDisclosureConsent: current.hasDisclosureConsent || Boolean(response.verification),
        }));
      } catch (loadError) {
        if (cancelled) return;

        if (loadError instanceof ApiError && loadError.status === 404) {
          setStorageConfigured(runtimeStorageConfigured);
        } else {
          const message = loadError instanceof Error ? loadError.message : 'Unable to load verification status.';
          setError(message);
        }
      } finally {
        if (!cancelled) setIsLoadingStatus(false);
      }
    };

    loadVerificationStatus();

    return () => { cancelled = true; };
  }, [profile?.displayName, profile?.email]);

  const handleChange = (key: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
    setSuccess('');
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setError('');
    setSuccess('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Upload a PDF, JPG, or PNG verification document.');
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setError('Verification documents must be 10 MB or smaller.');
      return;
    }

    setSelectedFile(file);
    setForm((current) => ({ ...current, documentName: file.name }));
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!form.legalName || !form.clinic || !form.licenseNumber) {
      setError('Please complete all required fields.');
      return;
    }
    if (!form.hasSelfieCheck || !form.hasDisclosureConsent) {
      setError('Please provide consent before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedDocument: UploadedDocument = { name: form.documentName };
      if (selectedFile && storageConfigured && profile?.uid) {
        const path = `verification-documents/${profile.uid}/${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`;
        const uploaded = await uploadProtectedFile({ path, file: selectedFile });
        uploadedDocument = {
          name: selectedFile.name,
          path: uploaded.path,
          contentType: uploaded.contentType,
          sizeBytes: uploaded.sizeBytes,
        };
      }

      const response = await apiRequest<{ verification: VerificationRecord; storageConfigured: boolean; message?: string }>('/api/verify', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          documentPath: uploadedDocument.path,
          documentContentType: uploadedDocument.contentType,
          documentSizeBytes: uploadedDocument.sizeBytes,
        }),
      });

      setVerification(response.verification);
      setSelectedFile(null);
      await refreshProfile();
      setSuccess(response.message || 'Verification submitted for review.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Unable to save verification.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DentistLayout title="DentSide Profile">
      {/* Hero Header Section */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-surface-container-low flex items-center justify-center border-4 border-surface-container-lowest shadow-xl overflow-hidden shrink-0">
            <img
              alt="Profile"
              className="w-full h-full object-cover"
              src={profile?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.displayName || 'D'}`}
            />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline leading-tight">
              {profile?.displayName || 'Dr. Practitioner'}
            </h1>
            <p className="text-secondary font-medium">{profile?.experience || 'Dental Specialist'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 rounded-xl border border-outline/20 font-semibold text-sm hover:bg-surface-container-low transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold text-sm shadow-lg hover:shadow-xl transition-all uppercase tracking-widest flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <span className="material-symbols-outlined text-sm">verified</span>}
            Save Profile
          </button>
        </div>
      </section>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-xl bg-surface-container-lowest shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight font-headline">Professional Details</h2>
              <span className="material-symbols-outlined text-outline">history_edu</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Legal Name</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  value={form.legalName}
                  onChange={(e) => handleChange('legalName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Clinical Institution</label>
                <input
                  type="text"
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="e.g. City Dental Hub"
                  value={form.clinic}
                  onChange={(e) => handleChange('clinic', e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-4">
              {profile?.interests?.map(interest => (
                <span key={interest} className="px-4 py-1.5 rounded-full bg-tertiary-container/10 text-tertiary font-bold text-xs tracking-wider uppercase">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-xl bg-surface-container-lowest shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight font-headline">Verified Credentials</h2>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                verification?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {verification?.status || 'unverified'}
              </span>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">Issuing State</label>
                  <select
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                    value={form.issuingState}
                    onChange={(e) => handleChange('issuingState', e.target.value)}
                  >
                    {STATE_OPTIONS.map(state => <option key={state} value={state}>{state}</option>)}
                  </select>
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] font-bold text-outline uppercase tracking-wider">License Number</label>
                  <input
                    type="text"
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 font-medium outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="DDS-XXXXX-2024"
                    value={form.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  />
                </div>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-surface-container-low transition-all"
              >
                <span className="material-symbols-outlined text-4xl text-primary mb-4">upload_file</span>
                <p className="font-bold text-on-surface mb-1">{selectedFile?.name || form.documentName || 'Upload License Documentation'}</p>
                <p className="text-xs text-on-surface-variant max-w-xs">PDF, JPG, or PNG up to 10 MB. Files are stored securely for verification review.</p>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-surface-container-lowest shadow-sm space-y-6">
            <h2 className="text-xl font-bold tracking-tight font-headline">Review & Consent</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={form.hasSelfieCheck}
                  onChange={(e) => handleChange('hasSelfieCheck', e.target.checked)}
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">I confirm that all provided information is accurate and matches my legal documentation.</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary"
                  checked={form.hasDisclosureConsent}
                  onChange={(e) => handleChange('hasDisclosureConsent', e.target.checked)}
                />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">I consent to the processing of my credentials for professional identity verification.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="p-8 rounded-xl bg-surface-container-lowest shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight font-headline">Profile Integrity</h2>
              <span className="material-symbols-outlined text-primary">analytics</span>
            </div>
            <div className="relative pt-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Verification Progress</span>
                <span className="text-sm font-bold text-primary">{profileStrength}%</span>
              </div>
              <div className="overflow-hidden h-2 rounded-full bg-surface-container-high">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${profileStrength}%` }}></div>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary-container/10 border border-primary/20">
              <p className="text-xs text-primary font-bold mb-2 uppercase tracking-wider">Next Step</p>
              <p className="text-sm text-on-primary-fixed-variant">
                {profileStrength < 100 ? 'Complete your licensure details to reach 100% visibility.' : 'Your profile is fully optimized for clinical matches.'}
              </p>
            </div>
          </div>

          <div className="p-8 rounded-xl bg-inverse-surface text-white shadow-xl space-y-6">
            <h2 className="text-lg font-bold tracking-tight opacity-90 font-headline">Global Access</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">public</span>
                </div>
                <div>
                  <p className="text-2xl font-bold font-headline">Remote</p>
                  <p className="text-xs opacity-60">Full Teledentistry Access</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="material-symbols-outlined">verified_user</span>
                </div>
                <div>
                  <p className="text-2xl font-bold font-headline">Secured</p>
                  <p className="text-xs opacity-60">Identity Shield Active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="mt-8 p-4 bg-error-container text-on-error-container rounded-xl text-sm font-bold flex items-center gap-2"><span className="material-symbols-outlined">error</span> {error}</div>}
      {success && <div className="mt-8 p-4 bg-primary-container/10 text-primary rounded-xl text-sm font-bold flex items-center gap-2 border border-primary/20"><span className="material-symbols-outlined">check_circle</span> {success}</div>}
    </DentistLayout>
  );
}
