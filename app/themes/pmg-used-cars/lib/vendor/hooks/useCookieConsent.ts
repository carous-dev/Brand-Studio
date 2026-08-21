"use client";

import { useCallback, useEffect, useState } from "react";

export type CookiePrefs = {
  version?: number;
  accepted?: boolean;
  analytics?: boolean;
  marketing?: boolean;
};

export type CookieConsentOptions = {
  storageKey?: string;
  version?: number;
};

function safeGet(storageKey: string): CookiePrefs | null {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    return null;
  }
}

function safeSet(storageKey: string, value: CookiePrefs) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch {
    // Ignore localStorage write failures.
  }
}

export function useCookieConsent(options: CookieConsentOptions = {}) {
  const storageKey = options.storageKey ?? process.env.NEXT_PUBLIC_COOKIE_CONSENT_KEY ?? "kain_cookies";
  const version = options.version ?? 1;

  const [prefs, setPrefs] = useState<CookiePrefs | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = safeGet(storageKey);
    setPrefs(existing);
    if (!existing || typeof existing.accepted === "undefined") {
      setVisible(true);
    }
  }, [storageKey]);

  const acceptAll = useCallback(() => {
    const next: CookiePrefs = { version, accepted: true, analytics: true, marketing: true };
    safeSet(storageKey, next);
    setPrefs(next);
    setVisible(false);
  }, [storageKey, version]);

  const declineAll = useCallback(() => {
    const next: CookiePrefs = { version, accepted: false, analytics: false, marketing: false };
    safeSet(storageKey, next);
    setPrefs(next);
    setVisible(false);
  }, [storageKey, version]);

  const savePreferences = useCallback(
    (values: Partial<CookiePrefs>) => {
      const current = safeGet(storageKey) || {};
      const next: CookiePrefs = { ...current, ...values, version, accepted: true };
      safeSet(storageKey, next);
      setPrefs(next);
      setVisible(false);
    },
    [storageKey, version],
  );

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

export default useCookieConsent;
