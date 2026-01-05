import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, mapSupabaseUser, User } from '@/lib/api';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthEnabled: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Mode "Zero Backend" : On simule un utilisateur admin connecté en permanence pour l'usage local.
  const user: User = {
    id: 'local-admin',
    name: 'Administrateur Local',
    email: 'admin@local.host',
    role: 'admin',
    isAdmin: true,
  };

  const login = async () => { console.log('Login ignored in static mode'); };
  const signup = async () => { console.log('Signup ignored in static mode'); };
  const logout = () => { console.log('Logout ignored in static mode'); };
  const refreshUser = async () => { console.log('Refresh ignored in static mode'); };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true,
        isAdmin: true,
        isLoading: false,
        isAuthEnabled: false,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

