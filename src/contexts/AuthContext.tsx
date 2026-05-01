import React, { createContext, useContext, useEffect, useState } from 'react';
import { ApiError, apiRequest, type UserProfile } from '../lib/api';
import {
  getCurrentUser,
  onAuthStateChanged,
  signOut,
  type AuthUser,
} from '../lib/auth-client';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  needsProfileSetup: boolean;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  profileLoading: true,
  needsProfileSetup: false,
  logout: async () => {},
  updateProfile: async () => {},
  refreshProfile: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const needsProfileSetup = Boolean(user && !profile && !loading && !profileLoading);

  const refreshProfile = async () => {
    if (!getCurrentUser()) {
      setProfile(null);
      setProfileLoading(false);
      return null;
    }

    setProfileLoading(true);
    try {
      const nextProfile = await apiRequest<UserProfile | null>('/api/auth/profile');
      setProfile(nextProfile);
      return nextProfile;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        setProfile(null);
        return null;
      }

      throw error;
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (nextUser) => {
      setUser(nextUser);
      setLoading(false);

      if (nextUser) {
        try {
          await refreshProfile();
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setProfile(null);
          setProfileLoading(false);
        }
      } else {
        setProfile(null);
        setProfileLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const updatedProfile = await apiRequest<UserProfile>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        needsProfileSetup,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
