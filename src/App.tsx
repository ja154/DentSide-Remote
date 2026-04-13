/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './components/Landing';
import Dashboard from './components/Dashboard';
import ClientDashboard from './pages/ClientDashboard';
import IdentityVerification from './pages/IdentityVerification';
import OpportunityEngine from './pages/OpportunityEngine';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, allowedRole }: { children: React.ReactNode, allowedRole?: 'dentist' | 'client' }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile && profile.role !== allowedRole) {
    // Redirect to correct dashboard if wrong role
    return <Navigate to={profile.role === 'dentist' ? '/dashboard' : '/client-dashboard'} replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        user && profile ? (
          <Navigate to={profile.role === 'dentist' ? '/dashboard' : '/client-dashboard'} replace />
        ) : (
          <Landing onGetStarted={() => navigate('/login')} />
        )
      } />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="dentist">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/verification" 
        element={
          <ProtectedRoute allowedRole="dentist">
            <IdentityVerification />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/opportunities" 
        element={
          <ProtectedRoute allowedRole="dentist">
            <OpportunityEngine />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/wallet" 
        element={
          <ProtectedRoute allowedRole="dentist">
            <Wallet />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/client-dashboard" 
        element={
          <ProtectedRoute allowedRole="client">
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
