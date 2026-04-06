"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface User {
  id: number | string;
  name: string;
  role: string;
  access_key?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const supportWsUrl = process.env.NEXT_PUBLIC_SUPPORT_WS_URL || 'ws://localhost:4001';

  const login = (userData: User) => {
    setUser(userData);
    // Mark admin as logged in so support widget hides
    try { (window as any).__ADMIN_LOGGED_IN = true; } catch (e) {}
    // Connect to support WS and identify as agent so visitors see us online
    try {
      if (typeof window !== 'undefined' && !wsRef.current) {
        const ws = new WebSocket(supportWsUrl);
        ws.onopen = () => {
          try { ws.send(JSON.stringify({ type: 'identify', role: 'agent', id: userData.id })); } catch (e) {}
        };
        ws.onclose = () => { wsRef.current = null; };
        ws.onerror = () => { /* ignore errors */ };
        wsRef.current = ws;
      }
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    try { (window as any).__ADMIN_LOGGED_IN = false; } catch (e) {}
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    // Only run on client and when pathname is known
    if (!pathname) return;

    const isLoginRoute = pathname === '/login';
    const isProtectedRoute = pathname.startsWith('/dashboard');

    // Public/theme routes should not trigger auth API checks.
    if (!isProtectedRoute || isLoginRoute) {
      setLoading(false);
      return;
    }

    // Check session via server-side cookie using our /api/auth/me proxy
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { method: 'GET', cache: 'no-store', credentials: 'same-origin' });
        if (!mounted) return;
        if (!res.ok) {
          router.replace('/login');
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!data || !data.user) {
          router.replace('/login');
          setLoading(false);
          return;
        }
        // Authenticated
        login(data.user);
        setLoading(false);
      } catch {
        router.replace('/login');
        setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [pathname, router]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
