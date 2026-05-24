import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { apiRequest, getDashboardPathForRole, type Role, type UserProfile } from '../lib/api';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import {
  authConfigured,
  resendPhoneOtp,
  signInWithEmail,
  signInWithGoogle,
  signInWithPhoneOtp,
  signUpWithEmail,
  type AuthUser,
  verifyPhoneOtp,
} from '../lib/auth-client';
import { normalizeKenyanPhoneNumber } from '../lib/phone';

type AuthStep = 'login' | 'phone_verification' | 'role_selection';
type AuthMode = 'signin' | 'signup';
type AuthView = 'phone' | 'email';
type AuthMethod = NonNullable<UserProfile['authMethod']>;

type EmailAuthForm = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type PhoneAuthForm = {
  displayName: string;
  phone: string;
  otp: string;
};

const inferAuthMethod = (authUser: AuthUser | null): AuthMethod | undefined => {
  if (!authUser) {
    return undefined;
  }

  const providerIds = authUser.providerIds.filter(Boolean);
  if (providerIds.includes('google') || providerIds.includes('google.com')) {
    return 'google';
  }
  if (providerIds.includes('phone') || authUser.phoneNumber) {
    return 'phone';
  }
  if (providerIds.includes('email') || providerIds.includes('password')) {
    return 'email';
  }

  return authUser.email ? 'email' : authUser.phoneNumber ? 'phone' : undefined;
};

const formatAuthError = (error: unknown) => {
  const code =
    typeof error === 'object' && error && 'code' in error && typeof error.code === 'string'
      ? error.code
      : '';
  const message = error instanceof Error ? error.message : '';

  switch (code) {
    case 'auth/email-already-in-use':
      return 'That email address already has an account. Try signing in instead.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password you entered is incorrect.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was closed before it finished.';
    case 'auth/too-many-requests':
      return 'Too many sign-in attempts. Please wait a moment and try again.';
    case 'auth/weak-password':
      return 'Use a stronger password with at least 6 characters.';
    default:
      if (/already has an account|email rate limit exceeded/i.test(message)) {
        return 'That email address already has an account. Try signing in instead.';
      }
      if (/invalid login credentials|invalid email or password/i.test(message)) {
        return 'The email or password you entered is incorrect.';
      }
      if (/password should be at least/i.test(message)) {
        return 'Use a stronger password with at least 6 characters.';
      }
      if (/email not confirmed/i.test(message)) {
        return 'Check your inbox and confirm your email address before signing in.';
      }
      if (/token has expired|otp.*expired/i.test(message)) {
        return 'That code has expired. Request a new OTP and try again.';
      }
      if (/token.*invalid|otp.*invalid|verification code/i.test(message)) {
        return 'Enter the 6-digit code exactly as it appears in your SMS.';
      }
      if (/phone/i.test(message) && /invalid/i.test(message)) {
        return 'Enter a valid Kenyan mobile number in the 07XXXXXXXX format.';
      }
      return message || 'Authentication failed. Please try again.';
  }
};

export default function Login() {
  const navigate = useNavigate();
  const {
    user,
    profile,
    loading: authLoading,
    profileLoading,
    needsProfileSetup,
    refreshProfile,
    logout,
  } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authView, setAuthView] = useState<AuthView>('phone');
  const [step, setStep] = useState<AuthStep>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
  const [emailForm, setEmailForm] = useState<EmailAuthForm>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [phoneForm, setPhoneForm] = useState<PhoneAuthForm>({
    displayName: '',
    phone: '',
    otp: '',
  });

  useEffect(() => {
    if (authLoading || profileLoading) return;
    if (profile) {
      navigate(getDashboardPathForRole(profile.role), { replace: true });
      return;
    }
    setStep(user && needsProfileSetup ? 'role_selection' : pendingPhoneNumber ? 'phone_verification' : 'login');
  }, [
    authLoading,
    navigate,
    needsProfileSetup,
    pendingPhoneNumber,
    profile,
    profileLoading,
    user,
  ]);

  useEffect(() => {
    if (!user) return;
    setEmailForm((current) => ({
      ...current,
      displayName: current.displayName || user.displayName || '',
      email: current.email || user.email || '',
    }));
    setPhoneForm((current) => ({
      ...current,
      displayName: current.displayName || user.displayName || '',
      phone: current.phone || user.phoneNumber || '',
    }));
  }, [user]);

  const isBusy = isSubmitting || authLoading || profileLoading;

  const updateEmailField = (key: keyof EmailAuthForm, value: string) => {
    setEmailForm((current) => ({ ...current, [key]: value }));
    setError('');
    setStatusMessage('');
  };

  const updatePhoneField = (key: keyof PhoneAuthForm, value: string) => {
    setPhoneForm((current) => ({ ...current, [key]: value }));
    setError('');
    setStatusMessage('');
  };

  const createProfile = async (role: Exclude<Role, 'admin'>) => {
    if (!user) return;

    const displayName =
      user.displayName?.trim() ||
      emailForm.displayName.trim() ||
      phoneForm.displayName.trim() ||
      undefined;
    const authMethod = inferAuthMethod(user);

    await apiRequest('/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify({ role, displayName, authMethod }),
    });
    await refreshProfile();
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');
    if (!authConfigured) {
      setError('Authentication is not configured.');
      setIsSubmitting(false);
      return;
    }
    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(formatAuthError(signInError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');

    if (!authConfigured) {
      setError('Authentication is not configured.');
      setIsSubmitting(false);
      return;
    }

    const email = emailForm.email.trim();
    const password = emailForm.password;
    const displayName = emailForm.displayName.trim();

    if (!email || !password) {
      setError('Enter your email and password.');
      setIsSubmitting(false);
      return;
    }

    if (authMode === 'signup') {
      if (displayName.length < 2) {
        setError('Add your full name.');
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError('Use at least 6 characters.');
        setIsSubmitting(false);
        return;
      }
      if (password !== emailForm.confirmPassword) {
        setError('Passwords do not match.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (authMode === 'signup') {
        await signUpWithEmail({ email, password, displayName });
        setStatusMessage(
          'Account created. If your Supabase project requires email confirmation, check your inbox before signing in.',
        );
      } else {
        await signInWithEmail(email, password);
      }
    } catch (authError) {
      setError(formatAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneOtpRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');

    if (!authConfigured) {
      setError('Authentication is not configured.');
      setIsSubmitting(false);
      return;
    }

    const normalizedPhone = normalizeKenyanPhoneNumber(phoneForm.phone);
    if (!normalizedPhone) {
      setError('Enter a valid Kenyan mobile number in the 07XXXXXXXX format.');
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithPhoneOtp({
        phone: normalizedPhone,
        displayName: phoneForm.displayName.trim() || undefined,
      });
      setPendingPhoneNumber(normalizedPhone);
      setStep('phone_verification');
      setStatusMessage(`We sent a 6-digit code to ${normalizedPhone}.`);
    } catch (authError) {
      setError(formatAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneOtpVerification = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');

    const token = phoneForm.otp.trim();
    if (!pendingPhoneNumber) {
      setError('Request a code before verifying your phone number.');
      setIsSubmitting(false);
      return;
    }
    if (!/^\d{6}$/.test(token)) {
      setError('Enter the 6-digit code from your SMS.');
      setIsSubmitting(false);
      return;
    }

    try {
      await verifyPhoneOtp({
        phone: pendingPhoneNumber,
        token,
      });
      setStatusMessage('Phone number verified. Finalizing your secure session...');
      setPendingPhoneNumber('');
      setPhoneForm((current) => ({ ...current, otp: '' }));
    } catch (authError) {
      setError(formatAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingPhoneNumber) {
      setError('Enter your mobile number to request a new code.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setStatusMessage('');

    try {
      await resendPhoneOtp({
        phone: pendingPhoneNumber,
        displayName: phoneForm.displayName.trim() || undefined,
      });
      setStatusMessage(`A fresh code is on the way to ${pendingPhoneNumber}.`);
    } catch (authError) {
      setError(formatAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelection = async (role: Exclude<Role, 'admin'>) => {
    if (!user) return;
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      await createProfile(role);
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : 'Failed to create profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDifferentAccount = async () => {
    setIsSubmitting(true);
    setError('');
    setStatusMessage('');
    try {
      await logout();
      setPendingPhoneNumber('');
      setStep('login');
      setPhoneForm((current) => ({ ...current, otp: '' }));
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to sign out.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToPhoneEntry = () => {
    setStep('login');
    setPendingPhoneNumber('');
    setStatusMessage('');
    setError('');
    setPhoneForm((current) => ({ ...current, otp: '' }));
  };

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface flex flex-col lg:flex-row">
      <div className="relative hidden lg:flex flex-col justify-between w-[48%] bg-inverse-surface px-12 xl:px-16 py-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
        <BrandMark size={40} className="relative z-10" />

        <div className="relative z-10">
          <span className="text-primary-fixed-dim font-bold tracking-widest text-xs uppercase mb-6 block">
            The Precision Network
          </span>
          <h1 className="font-headline text-6xl font-black text-white tracking-tighter leading-tight mb-8">
            Every gig, <br />
            <span className="text-primary italic">one precision hub.</span>
          </h1>
          <p className="text-xl text-white/70 font-medium max-w-md leading-relaxed">
            Teledentistry, claims review, and consulting roles built for the modern dental pioneer.
          </p>
        </div>

        <div className="relative z-10 grid gap-4 sm:grid-cols-3">
          {['HIPAA Compliant', 'Verified', 'Global Payouts'].map((badge) => (
            <div
              key={badge}
              className="bg-white/10 px-4 py-2 rounded-2xl text-[10px] font-bold text-white/80 uppercase tracking-widest border border-white/10 text-center"
            >
              {badge}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 bg-surface">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-surface border border-surface-variant/20 rounded-[2rem] shadow-[0_30px_80px_rgba(15,23,42,0.08)] p-8 sm:p-10">
            <div className="mb-10 text-center md:text-left">
              <BrandMark size={32} className="md:hidden mb-12 flex justify-center" />
              <span className="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">
                Identity & Access
              </span>
              <h2 className="font-headline text-4xl font-black text-on-surface tracking-tight mb-4">
                {step === 'role_selection'
                  ? 'Almost there'
                  : step === 'phone_verification'
                    ? 'Verify your number'
                    : authView === 'phone'
                      ? 'Phone-first access'
                      : authMode === 'signin'
                        ? 'Welcome back'
                        : 'Join the network'}
              </h2>
              <p className="text-on-surface-variant font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
                {step === 'role_selection'
                  ? 'Tell us how you plan to use DentSide Remote.'
                  : step === 'phone_verification'
                    ? 'Confirm the 6-digit OTP from your SMS to continue securely.'
                    : 'Secure clinical access for verified practitioners and healthcare partners.'}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-error-container text-on-error-container p-4 rounded-2xl flex items-center gap-3 mb-6 border border-error/10"
                >
                  <span className="material-symbols-outlined text-lg">error</span>
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {statusMessage ? (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-primary-container/10 text-primary p-4 rounded-2xl flex items-center gap-3 mb-6 border border-primary/10"
                >
                  <span className="material-symbols-outlined text-lg">sms</span>
                  <p className="text-sm font-bold">{statusMessage}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>

            {step === 'login' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 bg-surface-container-low p-1.5 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setAuthView('phone')}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                      authView === 'phone'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    Phone OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthView('email')}
                    className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                      authView === 'email'
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-outline hover:text-on-surface'
                    }`}
                  >
                    Email
                  </button>
                </div>

                {authView === 'email' ? (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 bg-surface-container-low p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                          authMode === 'signin'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-outline hover:text-on-surface'
                        }`}
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthMode('signup')}
                        className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                          authMode === 'signup'
                            ? 'bg-white text-primary shadow-sm'
                            : 'text-outline hover:text-on-surface'
                        }`}
                      >
                        Create Account
                      </button>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-5">
                      {authMode === 'signup' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            placeholder="Dr. Julian Dent"
                            className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                            value={emailForm.displayName}
                            onChange={(event) => updateEmailField('displayName', event.target.value)}
                          />
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                          Clinical Email
                        </label>
                        <input
                          type="email"
                          placeholder="practitioner@clinic.com"
                          className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                          value={emailForm.email}
                          onChange={(event) => updateEmailField('email', event.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                          Password
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                          value={emailForm.password}
                          onChange={(event) => updateEmailField('password', event.target.value)}
                        />
                      </div>

                      {authMode === 'signup' ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                            value={emailForm.confirmPassword}
                            onChange={(event) =>
                              updateEmailField('confirmPassword', event.target.value)
                            }
                          />
                        </div>
                      ) : null}

                      <button
                        type="submit"
                        disabled={isBusy}
                        className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:scale-100"
                      >
                        {isBusy ? (
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                        ) : authMode === 'signin' ? (
                          'Enter Vault'
                        ) : (
                          'Register Profile'
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handlePhoneOtpRequest} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        placeholder="Optional before onboarding"
                        className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                        value={phoneForm.displayName}
                        onChange={(event) => updatePhoneField('displayName', event.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                        Kenya Mobile Number
                      </label>
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="07XXXXXXXX"
                        className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium transition-all outline-none"
                        value={phoneForm.phone}
                        onChange={(event) => updatePhoneField('phone', event.target.value)}
                      />
                      <p className="text-[11px] text-outline font-medium pl-2">
                        Accepts `07...`, `254...`, or `+254...`.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isBusy}
                      className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50 disabled:scale-100"
                    >
                      {isBusy ? (
                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      ) : (
                        'Send Verification Code'
                      )}
                    </button>
                  </form>
                )}

                <div className="relative py-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/20"></div>
                  </div>
                  <span className="relative bg-surface px-4 text-[10px] font-black text-outline uppercase tracking-[0.2em]">
                    or authorize with
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isBusy}
                  className="w-full bg-surface-container-highest text-on-surface font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-outline-variant/10 hover:bg-surface-container-high transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google SSO
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-outline hover:text-primary transition-colors py-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Return to Home
                </button>
              </div>
            ) : null}

            {step === 'phone_verification' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <form onSubmit={handlePhoneOtpVerification} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={pendingPhoneNumber}
                      className="w-full bg-surface-container-low border-outline-variant/20 rounded-2xl py-3.5 px-5 font-medium outline-none text-on-surface-variant"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-outline uppercase tracking-widest pl-2">
                      6-Digit OTP
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="123456"
                      className="w-full bg-surface-container-lowest border-outline-variant/30 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl py-3.5 px-5 font-medium tracking-[0.35em] text-center transition-all outline-none"
                      value={phoneForm.otp}
                      onChange={(event) =>
                        updatePhoneField('otp', event.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="w-full bg-primary text-on-primary font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                  >
                    {isBusy ? (
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>
                </form>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isBusy}
                    className="py-3 rounded-2xl border border-outline-variant/20 font-bold text-sm hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToPhoneEntry}
                    disabled={isBusy}
                    className="py-3 rounded-2xl border border-outline-variant/20 font-bold text-sm hover:border-primary/30 hover:text-primary transition-colors"
                  >
                    Edit Number
                  </button>
                </div>
              </motion.div>
            ) : null}

            {step === 'role_selection' ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                {[
                  {
                    id: 'dentist',
                    title: "I'm a Dentist",
                    desc: 'Find remote consults, insurance gigs, and clinical roles.',
                    icon: 'medical_services',
                    color: 'bg-primary-fixed text-primary',
                  },
                  {
                    id: 'client',
                    title: "I'm a Healthcare Partner",
                    desc: 'Hire verified clinicians for teledentistry or case review.',
                    icon: 'groups',
                    color: 'bg-tertiary-fixed text-tertiary',
                  },
                ].map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelection(role.id as Exclude<Role, 'admin'>)}
                    disabled={isBusy}
                    className="w-full text-left p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-[2rem] hover:border-primary/40 hover:shadow-xl transition-all group flex items-center gap-6"
                  >
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${role.color}`}
                    >
                      <span className="material-symbols-outlined text-2xl">{role.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-headline text-lg font-bold text-on-surface mb-1 group-hover:text-primary">
                        {role.title}
                      </h3>
                      <p className="text-sm text-on-surface-variant font-medium leading-snug">
                        {role.desc}
                      </p>
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleUseDifferentAccount}
                  disabled={isBusy}
                  className="w-full py-4 text-sm font-bold text-outline hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  Use a Different Account
                </button>
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
