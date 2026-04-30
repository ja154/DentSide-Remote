import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { ApiError, apiRequest, type UserProfile } from '../lib/api';
import { auth } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const needsProfileSetup = Boolean(user && !profile && !loading && !profileLoading);

  const refreshProfile = async () => {
    if (!auth?.currentUser) {
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
    if (!auth) {
      console.warn("Firebase is not initialized. Check your environment variables.");
      setLoading(false);
      setProfileLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
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
    if (auth) {
      await signOut(auth);
    }
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
