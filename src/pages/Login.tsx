import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CircleAlert,
  LoaderCircle,
  Mail,
  RefreshCcw,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  UserRound,
} from 'lucide-react';
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

const HERO_POINTS = [
  {
    icon: ShieldCheck,
    title: 'Credential-aware access',
    description: 'Sign in once to reach consults, claims review, and partner workspaces.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first verification',
    description: 'Use OTP or email sign-in without leaving the clinical workflow behind.',
  },
  {
    icon: BadgeCheck,
    title: 'Built for trust',
    description: 'Verified identity keeps clinics and practitioners aligned from the first session.',
  },
];

const ROLE_OPTIONS = [
  {
    id: 'dentist' as const,
    title: "I'm a Dentist",
    description: 'Find remote consults, insurance gigs, and clinical roles.',
    icon: Stethoscope,
    iconBackground: 'var(--color-blue-light)',
    iconColor: 'var(--color-blue-dark)',
  },
  {
    id: 'client' as const,
    title: "I'm a Healthcare Partner",
    description: 'Hire verified clinicians for teledentistry, second opinions, and case review.',
    icon: Building2,
    iconBackground: 'var(--color-fog)',
    iconColor: 'var(--color-ink)',
  },
];

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

const getToggleButtonClassName = (isActive: boolean) =>
  [
    'flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-all duration-150',
    isActive
      ? 'bg-white text-[var(--color-ink)] shadow-[0_12px_28px_rgba(15,23,42,0.08)]'
      : 'text-[var(--color-ink-4)] hover:text-[var(--color-ink)]',
  ].join(' ');

const inputClassName =
  'ds-input rounded-xl border-[var(--color-fog-2)] px-4 py-3 text-[15px] shadow-none';

const primaryButtonClassName =
  'ds-btn ds-btn-primary ds-btn-lg w-full justify-center rounded-xl shadow-[0_18px_40px_rgba(37,99,235,0.22)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 disabled:shadow-none';

const secondaryButtonClassName =
  'ds-btn ds-btn-ghost w-full justify-center rounded-xl border-[var(--color-fog-2)] disabled:pointer-events-none disabled:opacity-60';

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

  const authHeading =
    step === 'role_selection'
      ? 'Choose your workspace'
      : step === 'phone_verification'
        ? 'Verify your number'
        : authView === 'phone'
          ? 'Secure mobile access'
          : authMode === 'signin'
            ? 'Welcome back'
            : 'Create your account';

  const authDescription =
    step === 'role_selection'
      ? 'Tell us how you plan to use DentSide Remote so we can open the right dashboard.'
      : step === 'phone_verification'
        ? 'Enter the 6-digit code from your SMS to finish setting up your secure session.'
        : 'Secure clinical access for verified practitioners and healthcare partners.';

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
    <div className="ds-auth-page" style={{ fontFamily: 'var(--font-sans)' }}>
      <aside className="ds-auth-left bg-[var(--color-ink)] text-[var(--color-white)]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at top left, rgba(59,130,246,0.28), transparent 34%), radial-gradient(circle at bottom right, rgba(14,165,233,0.16), transparent 30%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col">
          <BrandMark
            size={34}
            textColor="#ffffff"
            subTextColor="rgba(255,255,255,0.72)"
          />

          <div className="my-auto max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-fog-4)]">
              Identity & Access
            </p>
            <h1
              className="mt-5 text-[clamp(3rem,5vw,4.9rem)] leading-[0.95] tracking-[-0.05em] text-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              One secure login for every remote dental opportunity.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[var(--color-fog-3)]">
              DentSide Remote keeps teledentistry, claims review, and clinical partnerships inside one verified access point.
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            {HERO_POINTS.map((point) => {
              const Icon = point.icon;

              return (
                <div
                  key={point.title}
                  className="rounded-[22px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                  <h2 className="text-base font-semibold text-white">{point.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-fog-3)]">
                    {point.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      <main
        className="ds-auth-right"
        style={{
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 46%, #f8fafc 100%)',
        }}
      >
        <div className="w-full max-w-[460px]">
          <BrandMark size={30} className="mb-8 lg:hidden" />

          <div className="overflow-hidden rounded-[30px] border border-[var(--color-fog-2)] bg-[var(--color-white)] shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
            <div
              className="h-1.5"
              style={{
                background:
                  'linear-gradient(90deg, var(--color-blue) 0%, var(--color-accent) 100%)',
              }}
            />

            <div className="p-7 sm:p-9">
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-blue)]">
                  Identity & Access
                </p>
                <h2
                  className="mt-3 text-[clamp(2rem,4vw,2.85rem)] leading-none tracking-[-0.04em] text-[var(--color-ink)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {authHeading}
                </h2>
                <p className="mt-3 text-[15px] leading-7 text-[var(--color-ink-4)]">
                  {authDescription}
                </p>
              </div>

              <AnimatePresence initial={false}>
                {error ? (
                  <motion.div
                    key="auth-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-[rgba(220,38,38,0.12)] bg-[var(--color-error-light)] px-4 py-3 text-[var(--color-error)]"
                  >
                    <CircleAlert size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium leading-6">{error}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {statusMessage ? (
                  <motion.div
                    key="auth-status"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-start gap-3 rounded-2xl border border-[rgba(37,99,235,0.12)] bg-[var(--color-blue-light)] px-4 py-3 text-[var(--color-blue-dark)]"
                  >
                    <BadgeCheck size={18} className="mt-0.5 shrink-0" />
                    <p className="text-sm font-medium leading-6">{statusMessage}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {step === 'login' ? (
                <motion.div
                  key="login-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 gap-2 rounded-full bg-[var(--color-fog)] p-1">
                    <button
                      type="button"
                      onClick={() => setAuthView('phone')}
                      className={getToggleButtonClassName(authView === 'phone')}
                    >
                      <Smartphone size={16} />
                      Phone OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthView('email')}
                      className={getToggleButtonClassName(authView === 'email')}
                    >
                      <Mail size={16} />
                      Email
                    </button>
                  </div>

                  {authView === 'email' ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-2 rounded-full bg-[var(--color-fog)] p-1">
                        <button
                          type="button"
                          onClick={() => setAuthMode('signin')}
                          className={getToggleButtonClassName(authMode === 'signin')}
                        >
                          Sign In
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode('signup')}
                          className={getToggleButtonClassName(authMode === 'signup')}
                        >
                          Create Account
                        </button>
                      </div>

                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        {authMode === 'signup' ? (
                          <div className="ds-form-group mb-0">
                            <label className="ds-label" htmlFor="displayName">
                              Full Name
                            </label>
                            <input
                              id="displayName"
                              type="text"
                              placeholder="Dr. Julian Dent"
                              className={inputClassName}
                              value={emailForm.displayName}
                              onChange={(event) =>
                                updateEmailField('displayName', event.target.value)
                              }
                            />
                          </div>
                        ) : null}

                        <div className="ds-form-group mb-0">
                          <label className="ds-label" htmlFor="email">
                            Clinical Email
                          </label>
                          <input
                            id="email"
                            type="email"
                            placeholder="practitioner@clinic.com"
                            className={inputClassName}
                            value={emailForm.email}
                            onChange={(event) => updateEmailField('email', event.target.value)}
                          />
                        </div>

                        <div className="ds-form-group mb-0">
                          <label className="ds-label" htmlFor="password">
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className={inputClassName}
                            value={emailForm.password}
                            onChange={(event) => updateEmailField('password', event.target.value)}
                          />
                        </div>

                        {authMode === 'signup' ? (
                          <div className="ds-form-group mb-0">
                            <label className="ds-label" htmlFor="confirmPassword">
                              Confirm Password
                            </label>
                            <input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              className={inputClassName}
                              value={emailForm.confirmPassword}
                              onChange={(event) =>
                                updateEmailField('confirmPassword', event.target.value)
                              }
                            />
                          </div>
                        ) : null}

                        <button type="submit" disabled={isBusy} className={primaryButtonClassName}>
                          {isBusy ? (
                            <>
                              <LoaderCircle size={18} className="animate-spin" />
                              Working...
                            </>
                          ) : authMode === 'signin' ? (
                            'Enter secure workspace'
                          ) : (
                            'Create profile'
                          )}
                        </button>
                      </form>
                    </div>
                  ) : (
                    <form onSubmit={handlePhoneOtpRequest} className="space-y-4">
                      <div className="ds-form-group mb-0">
                        <label className="ds-label" htmlFor="phoneDisplayName">
                          Full Name
                        </label>
                        <input
                          id="phoneDisplayName"
                          type="text"
                          placeholder="Optional before onboarding"
                          className={inputClassName}
                          value={phoneForm.displayName}
                          onChange={(event) => updatePhoneField('displayName', event.target.value)}
                        />
                      </div>

                      <div className="ds-form-group mb-0">
                        <label className="ds-label" htmlFor="phoneNumber">
                          Kenya Mobile Number
                        </label>
                        <input
                          id="phoneNumber"
                          type="tel"
                          inputMode="tel"
                          placeholder="07XXXXXXXX"
                          className={inputClassName}
                          value={phoneForm.phone}
                          onChange={(event) => updatePhoneField('phone', event.target.value)}
                        />
                        <p className="mt-2 text-sm text-[var(--color-ink-4)]">
                          Accepts `07...`, `254...`, or `+254...`.
                        </p>
                      </div>

                      <button type="submit" disabled={isBusy} className={primaryButtonClassName}>
                        {isBusy ? (
                          <>
                            <LoaderCircle size={18} className="animate-spin" />
                            Sending code...
                          </>
                        ) : (
                          'Send verification code'
                        )}
                      </button>
                    </form>
                  )}

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[var(--color-fog-2)]" />
                    </div>
                    <span className="relative mx-auto block w-fit bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-4)]">
                      Or continue with
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isBusy}
                    className={secondaryButtonClassName}
                  >
                    {isBusy ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={18} />
                        Continue with Google
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink-4)] transition-colors hover:text-[var(--color-blue)]"
                  >
                    <ArrowLeft size={16} />
                    Return to Home
                  </button>
                </motion.div>
              ) : null}

              {step === 'phone_verification' ? (
                <motion.div
                  key="verification-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-5"
                >
                  <form onSubmit={handlePhoneOtpVerification} className="space-y-4">
                    <div className="ds-form-group mb-0">
                      <label className="ds-label" htmlFor="verifiedPhone">
                        Mobile Number
                      </label>
                      <input
                        id="verifiedPhone"
                        type="text"
                        readOnly
                        value={pendingPhoneNumber}
                        className={`${inputClassName} bg-[var(--color-fog)] text-[var(--color-ink-4)]`}
                      />
                    </div>

                    <div className="ds-form-group mb-0">
                      <label className="ds-label" htmlFor="otp">
                        6-Digit OTP
                      </label>
                      <input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        placeholder="123456"
                        className={`${inputClassName} text-center tracking-[0.35em]`}
                        value={phoneForm.otp}
                        onChange={(event) =>
                          updatePhoneField('otp', event.target.value.replace(/\D/g, '').slice(0, 6))
                        }
                      />
                    </div>

                    <button type="submit" disabled={isBusy} className={primaryButtonClassName}>
                      {isBusy ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify and continue'
                      )}
                    </button>
                  </form>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isBusy}
                      className={secondaryButtonClassName}
                    >
                      <RefreshCcw size={16} />
                      Resend Code
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToPhoneEntry}
                      disabled={isBusy}
                      className={secondaryButtonClassName}
                    >
                      <ArrowLeft size={16} />
                      Edit Number
                    </button>
                  </div>
                </motion.div>
              ) : null}

              {step === 'role_selection' ? (
                <motion.div
                  key="role-step"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {ROLE_OPTIONS.map((role) => {
                    const Icon = role.icon;

                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => handleRoleSelection(role.id)}
                        disabled={isBusy}
                        className="w-full rounded-[24px] border border-[var(--color-fog-2)] bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-[rgba(37,99,235,0.28)] hover:shadow-[0_18px_48px_rgba(15,23,42,0.08)] disabled:pointer-events-none disabled:opacity-60"
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                            style={{
                              background: role.iconBackground,
                              color: role.iconColor,
                            }}
                          >
                            <Icon size={20} strokeWidth={1.9} />
                          </div>
                          <div>
                            <h3
                              className="text-xl leading-none tracking-[-0.02em] text-[var(--color-ink)]"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {role.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-4)]">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleUseDifferentAccount}
                    disabled={isBusy}
                    className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold text-[var(--color-ink-4)] transition-colors hover:text-[var(--color-blue)] disabled:pointer-events-none disabled:opacity-60"
                  >
                    <UserRound size={16} />
                    Use a Different Account
                  </button>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
