import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getDashboardPathForRole, type Role, type UserProfile } from '../lib/api';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import {
  authConfigured,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  type AuthUser,
} from '../lib/auth-client';
import {
  Stethoscope,
  Users,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
} from 'lucide-react';
import { motion } from 'motion/react';

type AuthStep = 'login' | 'role_selection';
type AuthMode = 'signin' | 'signup';
type AuthMethod = NonNullable<UserProfile['authMethod']>;

type EmailAuthForm = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const inferAuthMethod = (authUser: AuthUser | null): AuthMethod | undefined => {
  if (!authUser) {
    return undefined;
  }

  const providerIds = authUser.providerIds.filter(Boolean);

  if (providerIds.includes('google') || providerIds.includes('google.com')) {
    return 'google';
  }

  if (providerIds.includes('email') || providerIds.includes('password')) {
    return 'email';
  }

  return authUser.email ? 'email' : undefined;
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
  const [step, setStep] = useState<AuthStep>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<EmailAuthForm>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (authLoading || profileLoading) {
      return;
    }

    if (profile) {
      navigate(getDashboardPathForRole(profile.role), { replace: true });
      return;
    }

    setStep(user && needsProfileSetup ? 'role_selection' : 'login');
  }, [authLoading, navigate, needsProfileSetup, profile, profileLoading, user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setForm((current) => ({
      ...current,
      displayName: current.displayName || user.displayName || '',
      email: current.email || user.email || '',
    }));
  }, [user]);

  const isBusy = isSubmitting || authLoading || profileLoading;

  const updateField = (key: keyof EmailAuthForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  };

  const createProfile = async (role: Exclude<Role, 'admin'>) => {
    if (!user) {
      return;
    }

    const displayName = user.displayName?.trim() || form.displayName.trim() || undefined;
    const authMethod = inferAuthMethod(user);

    await apiRequest('/api/auth/profile', {
      method: 'POST',
      body: JSON.stringify({
        role,
        displayName,
        authMethod,
      }),
    });

    await refreshProfile();
    navigate(getDashboardPathForRole(role), { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError('');

    if (!authConfigured) {
      setError('Authentication is not configured. Add the required provider env variables first.');
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithGoogle();
    } catch (signInError) {
      console.error(signInError);
      setError(formatAuthError(signInError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!authConfigured) {
      setError('Authentication is not configured. Add the required provider env variables first.');
      setIsSubmitting(false);
      return;
    }

    const email = form.email.trim();
    const password = form.password;
    const displayName = form.displayName.trim();

    if (!email) {
      setError('Enter your email address.');
      setIsSubmitting(false);
      return;
    }

    if (!password) {
      setError('Enter your password.');
      setIsSubmitting(false);
      return;
    }

    if (authMode === 'signup') {
      if (displayName.length < 2) {
        setError('Add your full name so we can create your profile.');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setError('Use a password with at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      if (password !== form.confirmPassword) {
        setError('Your passwords do not match.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      if (authMode === 'signup') {
        await signUpWithEmail({
          email,
          password,
          displayName,
        });
      } else {
        await signInWithEmail(email, password);
      }
    } catch (authError) {
      console.error(authError);
      setError(formatAuthError(authError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleSelection = async (role: Exclude<Role, 'admin'>) => {
    if (!user) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await createProfile(role);
    } catch (profileError) {
      console.error(profileError);
      setError(profileError instanceof Error ? profileError.message : 'Failed to create profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseDifferentAccount = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      await logout();
      setStep('login');
    } catch (logoutError) {
      console.error(logoutError);
      setError(logoutError instanceof Error ? logoutError.message : 'Unable to sign out right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ds-auth-page">
      <div className="ds-auth-left">
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 30% 40%, rgba(13,122,107,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(13,122,107,0.08) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <BrandMark size={34} textColor="#fff" subTextColor="rgba(255,255,255,0.85)" />

          <div>
            <p
              style={{
                fontSize: 11,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-teal-mid)',
                fontWeight: 600,
                marginBottom: 16,
              }}
            >
              The Remote Dental Platform
            </p>
            <h1
              className="font-display"
              style={{
                fontSize: 'clamp(36px, 4vw, 56px)',
                color: 'var(--color-white)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                marginBottom: 20,
              }}
            >
              Every
              <br />
              opportunity,
              <br />
              <em style={{ color: 'var(--color-teal-mid)' }}>one login.</em>
            </h1>
            <p
              style={{
                fontSize: 15,
                color: 'var(--color-fog-4)',
                lineHeight: 1.65,
                maxWidth: 360,
                fontWeight: 300,
              }}
            >
              Teledentistry, claims review, freelance gigs, and corporate roles - all in one
              platform built for dental professionals.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20 }}>
            {['HIPAA Compliant', 'Identity Verified', 'Stripe Payouts'].map((badge) => (
              <div key={badge} className="ds-badge ds-badge-teal" style={{ fontSize: 10 }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ds-auth-right">
        <div className="ds-auth-panel">
          <div style={{ marginBottom: 36 }}>
            <p className="ds-page-eyebrow">Authentication</p>
            <h2
              className="font-display"
              style={{
                fontSize: 28,
                letterSpacing: '-0.03em',
                color: 'var(--color-ink)',
                lineHeight: 1.1,
                marginBottom: 10,
              }}
            >
              {step === 'role_selection'
                ? 'Choose your account type'
                : authMode === 'signin'
                  ? 'Sign in to your account'
                  : 'Create your account'}
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-ink-4)', lineHeight: 1.6 }}>
              {step === 'role_selection'
                ? `Signed in as ${user?.email || 'your account'}. Tell us how you plan to use DentSide Remote.`
                : 'Use your email address or continue with Google. We will connect the authenticated account to the right platform profile.'}
            </p>
          </div>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'var(--color-ruby-light)',
                border: '1px solid var(--color-ruby)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 20,
                color: 'var(--color-ruby)',
                fontSize: 13,
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {step === 'login' && (
            <div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                  marginBottom: 24,
                  padding: 6,
                  background: 'var(--color-fog)',
                  borderRadius: 12,
                }}
              >
                {[
                  { value: 'signin' as const, label: 'Sign in' },
                  { value: 'signup' as const, label: 'Sign up' },
                ].map((option) => {
                  const isActive = authMode === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setAuthMode(option.value);
                        setError('');
                      }}
                      disabled={isBusy}
                      style={{
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 14px',
                        cursor: isBusy ? 'not-allowed' : 'pointer',
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: 'var(--font-sans)',
                        background: isActive ? 'var(--color-white)' : 'transparent',
                        color: isActive ? 'var(--color-ink)' : 'var(--color-ink-4)',
                        boxShadow: isActive ? '0 10px 25px rgba(7, 22, 32, 0.08)' : 'none',
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleEmailAuth}>
                {authMode === 'signup' && (
                  <div className="ds-form-group">
                    <label htmlFor="display-name" className="ds-label">
                      Full Name
                    </label>
                    <input
                      id="display-name"
                      type="text"
                      value={form.displayName}
                      onChange={(event) => updateField('displayName', event.target.value)}
                      className="ds-input"
                      autoComplete="name"
                      placeholder="Dr. Jane Doe"
                      disabled={isBusy}
                    />
                  </div>
                )}

                <div className="ds-form-group">
                  <label htmlFor="email" className="ds-label" style={{ display: 'flex', gap: 6 }}>
                    <Mail size={12} />
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(event) => updateField('email', event.target.value)}
                    className="ds-input"
                    autoComplete="email"
                    placeholder="name@clinic.com"
                    disabled={isBusy}
                  />
                </div>

                <div className="ds-form-group">
                  <label
                    htmlFor="password"
                    className="ds-label"
                    style={{ display: 'flex', gap: 6 }}
                  >
                    <Lock size={12} />
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    className="ds-input"
                    autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                    placeholder={authMode === 'signin' ? 'Enter your password' : 'Choose a password'}
                    disabled={isBusy}
                  />
                </div>

                {authMode === 'signup' && (
                  <div className="ds-form-group">
                    <label htmlFor="confirm-password" className="ds-label">
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={form.confirmPassword}
                      onChange={(event) => updateField('confirmPassword', event.target.value)}
                      className="ds-input"
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      disabled={isBusy}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isBusy}
                  className="ds-btn ds-btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginBottom: 20 }}
                >
                  {isBusy ? (
                    <Loader2 size={16} className="spin" />
                  ) : authMode === 'signin' ? (
                    'Sign in with Email'
                  ) : (
                    'Create Account with Email'
                  )}
                </button>
              </form>

              <div style={{ position: 'relative', margin: '24px 0' }}>
                <hr className="ds-divider" style={{ margin: 0 }} />
                <span
                  style={{
                    position: 'absolute',
                    inset: '50% auto auto 50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--color-white)',
                    padding: '0 12px',
                    fontSize: 12,
                    color: 'var(--color-ink-4)',
                  }}
                >
                  or continue with
                </span>
              </div>

              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isBusy}
                className="ds-btn ds-btn-ghost"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '13px 20px',
                  fontSize: 14,
                  marginBottom: 24,
                }}
              >
                {isBusy ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
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
                )}
                Continue with Google
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                  color: 'var(--color-ink-4)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <ArrowLeft size={14} /> Back to home
              </button>
            </div>
          )}

          {step === 'role_selection' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)', marginBottom: 8 }}>
                We found your authenticated account, but you still need a platform profile before
                we can route you to the right dashboard.
              </p>

              <button
                id="role-dentist-btn"
                onClick={() => handleRoleSelection('dentist')}
                disabled={isBusy}
                className="ds-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--color-fog-2)',
                  textAlign: 'left',
                  width: '100%',
                  background: 'var(--color-white)',
                  transition: 'border-color 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseOver={(event) => {
                  if (!isBusy) {
                    event.currentTarget.style.borderColor = 'var(--color-teal)';
                  }
                }}
                onMouseOut={(event) => {
                  event.currentTarget.style.borderColor = 'var(--color-fog-2)';
                }}
              >
                <div className="ds-feature-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
                  <Stethoscope size={18} color="var(--color-teal)" />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    I'm a Dentist
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                    I want to find remote gigs and consults.
                  </p>
                </div>
              </button>

              <button
                id="role-client-btn"
                onClick={() => handleRoleSelection('client')}
                disabled={isBusy}
                className="ds-card"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 20,
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                  border: '1px solid var(--color-fog-2)',
                  textAlign: 'left',
                  width: '100%',
                  background: 'var(--color-white)',
                  transition: 'border-color 0.15s',
                  fontFamily: 'var(--font-sans)',
                }}
                onMouseOver={(event) => {
                  if (!isBusy) {
                    event.currentTarget.style.borderColor = 'var(--color-teal)';
                  }
                }}
                onMouseOut={(event) => {
                  event.currentTarget.style.borderColor = 'var(--color-fog-2)';
                }}
              >
                <div
                  className="ds-feature-icon"
                  style={{
                    marginBottom: 0,
                    flexShrink: 0,
                    background: 'var(--color-amber-light)',
                  }}
                >
                  <Users size={18} color="var(--color-amber)" />
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      fontSize: 15,
                      marginBottom: 4,
                    }}
                  >
                    I'm a Client / Patient
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>
                    I need dental advice or want to hire a dentist.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleUseDifferentAccount}
                disabled={isBusy}
                className="ds-btn ds-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              >
                {isBusy ? <Loader2 size={16} className="spin" /> : 'Use a Different Account'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
