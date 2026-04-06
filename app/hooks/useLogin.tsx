"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(email: string, password: string) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'same-origin',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError((data && data.error) || 'Login failed');
        setLoading(false);
        return false;
      }

      // success — server sets HttpOnly cookie
      router.push('/dashboard');
      return true;
    } catch (e) {
      setError('Network error — please try again');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { login, loading, error, setError } as const;
}
