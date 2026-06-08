"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./Combobox.module.css";

export type ComboboxOption = {
  value: string;
  label: string;
};

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChange: (next: string) => void;
  options: ComboboxOption[];
  disabled?: boolean;
  /** Compact variant — hides the stacked label/value inside the button and
   * renders a single-line pill. The `label` prop is still used for a11y. */
  compact?: boolean;
};

export function Combobox({ label, placeholder, value, onChange, options, disabled, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const reactId = useId();
  const listboxId = `aw-cmb-list-${reactId}`;

  const allOptions: ComboboxOption[] = [{ value: "", label: placeholder }, ...options];

  // Close on outside click + Escape; sync activeIdx to current value on open.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = allOptions.findIndex((o) => o.value === value);
      setActiveIdx(idx >= 0 ? idx : 0);
    }
  }, [open, value, allOptions]);

  const select = useCallback(
    (idx: number) => {
      const opt = allOptions[idx];
      if (!opt) return;
      onChange(opt.value);
      setOpen(false);
      buttonRef.current?.focus();
    },
    [allOptions, onChange],
  );

  const handleButtonKey = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }, []);

  const handleListKey = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIdx((prev) => Math.min(allOptions.length - 1, prev + 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIdx((prev) => Math.max(0, prev - 1));
      } else if (event.key === "Enter") {
        event.preventDefault();
        select(activeIdx);
      } else if (event.key === "Home") {
        event.preventDefault();
        setActiveIdx(0);
      } else if (event.key === "End") {
        event.preventDefault();
        setActiveIdx(allOptions.length - 1);
      }
    },
    [activeIdx, allOptions.length, select],
  );

  // Keep the active option scrolled into view as the user arrow-keys through.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [activeIdx, open]);

  const currentLabel = options.find((o) => o.value === value)?.label;
  const isEmpty = !currentLabel;

  const rootClass = [
    styles.root,
    disabled ? styles.disabled : "",
    compact ? styles.compact : "",
  ]
    .filter(Boolean)
    .join(" ");

  const buttonClass = [styles.button, isEmpty ? styles.empty : ""].filter(Boolean).join(" ");

  return (
    <div ref={rootRef} className={rootClass}>
      <button
        ref={buttonRef}
        type="button"
        className={buttonClass}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-label={compact ? label : undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleButtonKey}
      >
        <span className={styles.label} aria-hidden={compact || undefined}>
          {label}
        </span>
        <span className={styles.value}>{currentLabel || placeholder}</span>
        <svg viewBox="0 0 12 8" width="12" height="8" className={styles.chev} aria-hidden="true">
          <path
            d="M1 1.5 6 6l5-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          className={styles.menu}
          tabIndex={-1}
          onKeyDown={handleListKey}
        >
          {allOptions.map((opt, idx) => {
            const selected = opt.value === value;
            const active = idx === activeIdx;
            const optionClass = [
              styles.option,
              selected ? styles.selected : "",
              active ? styles.active : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={opt.value || "__placeholder__"}
                type="button"
                role="option"
                aria-selected={selected}
                data-idx={idx}
                className={optionClass}
                onMouseEnter={() => setActiveIdx(idx)}
                onClick={() => select(idx)}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
