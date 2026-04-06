"use client";

import { useCallback, useRef, useState } from 'react';

export default function useSupportWidget() {
  const [open, setOpen] = useState(false);
  const previousActiveRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const openWidget = useCallback(() => {
    try {
      previousActiveRef.current = (document && document.activeElement) as HTMLElement | null;
    } catch (e) {
      previousActiveRef.current = null;
    }
    setOpen(true);
  }, []);

  const closeWidget = useCallback(() => {
    setOpen(false);
    try {
      if (previousActiveRef.current) previousActiveRef.current.focus();
    } catch (e) {}
  }, []);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  return {
    open,
    openWidget,
    closeWidget,
    toggle,
    panelRef,
    previousActiveRef,
  } as const;
}
