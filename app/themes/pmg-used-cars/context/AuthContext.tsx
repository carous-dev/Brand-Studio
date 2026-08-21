'use client';

// Stub AuthProvider for app-clone themes — auth pages live outside theme
// boundaries; this stub satisfies the theme context-registry contract.
import { createContext, useContext, type ReactNode } from 'react';

interface User {
  id: number | string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (u: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value: AuthContextType = {
    user: null,
    loading: false,
    login: () => {},
    logout: () => {},
    isAuthenticated: false,
    isAdmin: false,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
