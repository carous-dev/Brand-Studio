"use client"

import { useEffect, useState, useCallback } from 'react';

type CookiePrefs = {
  version?: number;
  accepted?: boolean;
  analytics?: boolean;
  marketing?: boolean;
};

const KEY = 'am_cars_cookies';

function safeGet(): CookiePrefs | null {
  try {
    return JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch (e) {
    return null;
  }
}

function safeSet(obj: CookiePrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch (e) {
    // ignore
  }
}

export default function useCookieConsent() {
  const [prefs, setPrefs] = useState<CookiePrefs | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // run only in client
    const existing = safeGet();
    setPrefs(existing);
    // show banner only when no existing prefs
    if (!existing || typeof existing.accepted === 'undefined') {
      setVisible(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const next: CookiePrefs = { version: 1, accepted: true, analytics: true, marketing: true };
    safeSet(next);
    setPrefs(next);
    setVisible(false);
  }, []);

  const declineAll = useCallback(() => {
    const next: CookiePrefs = { version: 1, accepted: false, analytics: false, marketing: false };
    safeSet(next);
    setPrefs(next);
    setVisible(false);
  }, []);

  const savePreferences = useCallback((values: Partial<CookiePrefs>) => {
    const current = safeGet() || {};
    const next: CookiePrefs = { ...current, ...values, version: 1, accepted: true };
    safeSet(next);
    setPrefs(next);
    setVisible(false);
  }, []);

  const openBanner = useCallback(() => setVisible(true), []);
  const dismiss = useCallback(() => setVisible(false), []);

  return {
    prefs,
    visible,
    acceptAll,
    declineAll,
    savePreferences,
    openBanner,
    dismiss,
  } as const;
}
