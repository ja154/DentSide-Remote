import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { apiRequest, getDashboardPathForRole } from '../lib/api';
import { auth, googleProvider } from '../lib/firebase';
import BrandMark from '../components/BrandMark';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, Users, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [pendingRoleSelection, setPendingRoleSelection] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'role_selection'>('login');

  useEffect(() => {
    if (!authLoading && user) {
      if (profile) {
        navigate(getDashboardPathForRole(profile.role));
      } else if (!isSigningIn && !pendingRoleSelection) {
        setStep('role_selection');
      }
    }
  }, [user, profile, authLoading, isSigningIn, pendingRoleSelection, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    if (!auth) {
      setError('Firebase keys are missing. Please configure your .env variables to log in.');
      setIsSigningIn(false);
      return;
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setPendingRoleSelection(true);
      if (result.user) {
        setStep('role_selection');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
      setPendingRoleSelection(false);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRoleSelection = async (role: 'dentist' | 'client') => {
    if (!user) return;
    setIsSigningIn(true);
    setError('');
    try {
      await apiRequest('/api/auth/profile', {
        method: 'POST',
        body: JSON.stringify({ role }),
      });
      navigate(role === 'dentist' ? '/dashboard' : '/client-dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="ds-auth-page">
      {/* Left Panel – brand side */}
      <div className="ds-auth-left">
        {/* background texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 40%, rgba(13,122,107,0.18) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(13,122,107,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {/* Logo */}
          <BrandMark size={34} textColor="#fff" subTextColor="rgba(255,255,255,0.85)" />

          {/* Hero text */}
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-teal-mid)', fontWeight: 600, marginBottom: 16 }}>
              The Remote Dental Platform
            </p>
            <h1 className="font-display" style={{ fontSize: 'clamp(36px, 4vw, 56px)', color: 'var(--color-white)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 20 }}>
              Every<br />opportunity,<br /><em style={{ color: 'var(--color-teal-mid)' }}>one login.</em>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--color-fog-4)', lineHeight: 1.65, maxWidth: 360, fontWeight: 300 }}>
              Teledentistry, claims review, freelance gigs, and corporate roles — all in one platform built for dental professionals.
            </p>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: 20 }}>
            {['HIPAA Compliant', 'Identity Verified', 'Stripe Payouts'].map(b => (
              <div key={b} className="ds-badge ds-badge-teal" style={{ fontSize: 10 }}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel – form */}
      <div className="ds-auth-right">
        <div className="ds-auth-panel">
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <p className="ds-page-eyebrow">Authentication</p>
            <h2 className="font-display" style={{ fontSize: 28, letterSpacing: '-0.03em', color: 'var(--color-ink)', lineHeight: 1.1 }}>
              {step === 'login' ? 'Sign in to your account' : 'Choose your account type'}
            </h2>
          </div>

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--color-ruby-light)', border: '1px solid var(--color-ruby)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: 'var(--color-ruby)', fontSize: 13 }}>
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {step === 'login' && (
            <div>
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || authLoading}
                className="ds-btn ds-btn-ghost"
                style={{ width: '100%', justifyContent: 'center', padding: '13px 20px', fontSize: 14, opacity: (isSigningIn || authLoading) ? 0.6 : 1 }}
              >
                {(isSigningIn || authLoading) ? (
                  <Loader2 size={16} className="spin" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                )}
                Continue with Google
              </button>

              <hr className="ds-divider" style={{ margin: '24px 0' }} />

              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--color-ink-4)', fontFamily: 'var(--font-sans)' }}>
                <ArrowLeft size={14} /> Back to home
              </button>
            </div>
          )}

          {step === 'role_selection' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ fontSize: 13, color: 'var(--color-ink-4)', marginBottom: 8 }}>
                Welcome! Please tell us how you'll use DentSide Remote.
              </p>

              {/* Dentist */}
              <button
                id="role-dentist-btn"
                onClick={() => handleRoleSelection('dentist')}
                disabled={isSigningIn}
                className="ds-card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, cursor: 'pointer', border: '1px solid var(--color-fog-2)', textAlign: 'left', width: '100%', background: 'var(--color-white)', transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-teal)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-fog-2)')}
              >
                <div className="ds-feature-icon" style={{ marginBottom: 0, flexShrink: 0 }}>
                  <Stethoscope size={18} color="var(--color-teal)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 15, marginBottom: 4 }}>I'm a Dentist</p>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>I want to find remote gigs and consults.</p>
                </div>
              </button>

              {/* Client */}
              <button
                id="role-client-btn"
                onClick={() => handleRoleSelection('client')}
                disabled={isSigningIn}
                className="ds-card"
                style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20, cursor: 'pointer', border: '1px solid var(--color-fog-2)', textAlign: 'left', width: '100%', background: 'var(--color-white)', transition: 'border-color 0.15s', fontFamily: 'var(--font-sans)' }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--color-teal)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--color-fog-2)')}
              >
                <div className="ds-feature-icon" style={{ marginBottom: 0, flexShrink: 0, background: 'var(--color-amber-light)' }}>
                  <Users size={18} color="var(--color-amber)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 15, marginBottom: 4 }}>I'm a Client / Patient</p>
                  <p style={{ fontSize: 13, color: 'var(--color-ink-4)' }}>I need dental advice or want to hire a dentist.</p>
                </div>
              </button>

              {isSigningIn && (
                <div style={{ textAlign: 'center', paddingTop: 8 }}>
                  <Loader2 size={20} className="spin" color="var(--color-teal)" />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
