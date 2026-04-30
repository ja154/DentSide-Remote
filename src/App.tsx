/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getDashboardPathForRole, type Role } from './lib/api';
import LandingPage from './pages/LandingPage';
import DentistDashboard from './pages/DentistDashboard';
import ClientDashboard from './pages/ClientDashboard';
import ClientNetwork from './pages/ClientNetwork';
import ClientAppointments from './pages/ClientAppointments';
import GigStudio from './pages/GigStudio';
import AdminDashboard from './pages/AdminDashboard';
import IdentityVerification from './pages/IdentityVerification';
import OpportunityEngine from './pages/OpportunityEngine';
import Wallet from './pages/Wallet';
import Login from './pages/Login';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: React.ReactNode;
  allowedRole?: Role | Role[];
}) {
  const { user, profile, loading, profileLoading } = useAuth();

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile) {
    const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to={getDashboardPathForRole(profile.role)} replace />;
    }
  }

  if (allowedRole && !profile) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { user, profile, loading, profileLoading, needsProfileSetup } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={
        loading || profileLoading ? (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : user && profile ? (
          <Navigate to={getDashboardPathForRole(profile.role)} replace />
        ) : user && needsProfileSetup ? (
          <Navigate to="/login" replace />
        ) : (
          <LandingPage onGetStarted={() => navigate('/login')} />
        )
      } />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute allowedRole="dentist">
            <DentistDashboard />
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
        path="/admin" 
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
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
      <Route
        path="/client/network"
        element={
          <ProtectedRoute allowedRole="client">
            <ClientNetwork />
          </ProtectedRoute>
        }
      />
      <Route
        path="/client/appointments"
        element={
          <ProtectedRoute allowedRole="client">
            <ClientAppointments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gig-studio"
        element={
          <ProtectedRoute allowedRole={['client', 'admin']}>
            <GigStudio />
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
