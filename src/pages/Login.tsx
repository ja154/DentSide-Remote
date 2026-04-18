import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Stethoscope, User as UserIcon, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'login' | 'role_selection'>('login');

  useEffect(() => {
    if (!authLoading && user) {
      if (profile) {
        navigate(profile.role === 'dentist' ? '/dashboard' : '/client-dashboard');
      } else if (!isSigningIn) {
        setStep('role_selection');
      }
    }
  }, [user, profile, authLoading, isSigningIn, navigate]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setError('');
    
    if (!auth || !db) {
      setError("Firebase keys are missing. Please configure your .env variables to log in.");
      setIsSigningIn(false);
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      // Wait for the auth listener in AuthContext to pick up the user & profile
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to sign in');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleRoleSelection = async (role: 'dentist' | 'client') => {
    if (!user) return;
    setIsSigningIn(true);
    setError('');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role,
        createdAt: serverTimestamp(),
        onboardingComplete: false
      });
      
      // The onAuthStateChanged listener will eventually trigger and see the profile,
      // but to avoid delay, we can force navigation here:
      navigate(role === 'dentist' ? '/dashboard' : '/client-dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create profile');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-6">
          <div className="bg-teal-600 p-2 rounded-lg">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold text-slate-900 tracking-tight">DentSide</span>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
          {step === 'login' ? 'Sign in to your account' : 'Choose your account type'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn || authLoading}
                className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors"
              >
                {(isSigningIn || authLoading) ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              
              <div className="mt-6 text-center">
                <button 
                  onClick={() => navigate('/')}
                  className="text-sm text-teal-600 hover:text-teal-500 font-medium inline-flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" /> Back to home
                </button>
              </div>
            </div>
          )}

          {step === 'role_selection' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-slate-500 text-center mb-6">
                Welcome! Please tell us how you'll be using DentSide Remote.
              </p>
              
              <button
                onClick={() => handleRoleSelection('dentist')}
                disabled={isSigningIn}
                className="w-full flex items-center p-4 border-2 border-slate-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
              >
                <div className="bg-teal-100 p-3 rounded-lg group-hover:bg-teal-200 transition-colors">
                  <Stethoscope className="w-6 h-6 text-teal-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">I'm a Dentist</h3>
                  <p className="text-sm text-slate-500">I want to find remote gigs and consults.</p>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelection('client')}
                disabled={isSigningIn}
                className="w-full flex items-center p-4 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <UserIcon className="w-6 h-6 text-blue-700" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-bold text-slate-900">I'm a Client / Patient</h3>
                  <p className="text-sm text-slate-500">I need dental advice or want to hire a dentist.</p>
                </div>
              </button>
              
              {isSigningIn && (
                <div className="flex justify-center mt-4">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
