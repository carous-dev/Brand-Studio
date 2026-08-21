"use client";

/**
 * Garage price-drop / stock alerts — the email-capture layer over the wishlist.
 *
 * The wishlist itself stays anonymous and instant (localStorage only). This
 * component is the *opt-in* that turns those saved cars into a reachable lead:
 * once a buyer has ≥1 saved vehicle and hasn't subscribed, a lean modal asks
 * for an email so the dealer can nudge them on price drops / "selling soon".
 * It auto-opens once per session; declining (✕ / backdrop / Esc) leaves the
 * wishlist untouched but keeps a slim inline trigger so opting in later is one
 * tap away.
 *
 * The form is deliberately minimal — one field, one button. Clicking "Notify
 * me" is the affirmative opt-in (the form's only purpose is alerts), so consent
 * lives in a fine-print line rather than a separate checkbox. Alert prefs
 * default to price-drop + selling-soon.
 *
 * The subscription posts through the same `useLeadsForm` → `/leads` pipeline as
 * every other Carous widget (dealer lead owner, honeypot, rate-limit, and the
 * `vp-lead-captured` conversion bus). We send the watched slugs *with their
 * price-at-subscribe* — the snapshot the api-side matcher diffs against future
 * inventory to detect a genuine drop.
 *
 * The modal is light — themed on the dealer's own `--cg-*` tokens (white
 * surface over a dark backdrop), with `--cg-accent` on the button. SSR-safe:
 * renders nothing until mounted.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";
import { BellRing, Check, Mail, X } from "lucide-react";
import { useLeadsForm } from "../hooks/useLeadsForm";
import { readSaved, subscribeSaved, type SavedVehicle } from "./saved-vehicles";

/** localStorage key for the buyer's garage-alert subscription (fleet `vp-` standard). */
export const GARAGE_ALERT_KEY = "vp-garage-alert";
/** Fired when the subscription is created or cleared (same-tab sync). */
export const GARAGE_ALERT_EVENT = "vp:garage-alert-updated";
/** sessionStorage flag so the modal only auto-opens once per visit. */
const GARAGE_ALERT_DISMISSED_KEY = "vp-garage-alert-dismissed";

export type GarageAlertPref = "price-drop" | "selling-soon" | "similar";

/** What we subscribe buyers to by default (no UI — kept lean). */
const DEFAULT_PREFS: GarageAlertPref[] = ["price-drop", "selling-soon"];

type GarageAlertRecord = {
  email: string;
  prefs: GarageAlertPref[];
  ts: number;
};

/** Pull the numeric price out of a display string like "£16,995" (null if none). */
function priceToNumber(price: string): number | null {
  const digits = String(price || "").replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = Number(digits);
  return Number.isFinite(n) ? n : null;
}

function readSubscription(): GarageAlertRecord | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GARAGE_ALERT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GarageAlertRecord;
    return parsed && typeof parsed.email === "string" && parsed.email ? parsed : null;
  } catch {
    return null;
  }
}

function writeSubscription(record: GarageAlertRecord): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GARAGE_ALERT_KEY, JSON.stringify(record));
  } catch {
    /* storage may be unavailable (private mode / quota) — non-fatal */
  }
  window.dispatchEvent(new CustomEvent(GARAGE_ALERT_EVENT));
}

function clearSubscription(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(GARAGE_ALERT_KEY);
  window.dispatchEvent(new CustomEvent(GARAGE_ALERT_EVENT));
}

function wasDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(GARAGE_ALERT_DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function markDismissed(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(GARAGE_ALERT_DISMISSED_KEY, "1");
  } catch {
    /* non-fatal */
  }
}

type GarageAlertFormValues = {
  email: string;
};

type Props = {
  /**
   * The currently-saved wishlist vehicles. Pass this when the host already
   * tracks the saved list (e.g. the shared `SavedVehiclesView`) so we don't
   * double-subscribe. Omit it for a standalone drop-in and the component
   * sources the wishlist from the `@carous/garage` store itself.
   */
  vehicles?: SavedVehicle[];
  /** Dealer name used in the alert copy. Optional. */
  brandName?: string;
  /** Override the leads endpoint / api resolver (matches the other widgets). */
  endpoint?: string;
  resolveApiUrl?: (path: string) => string;
  /** Explicit dealer id when NEXT_PUBLIC_CLIENT_ID isn't available at build time. */
  leadOwner?: string;
  /**
   * Auto-open the modal once per session when there are saved cars (default
   * true). Set false to make it trigger-only (slim inline button).
   */
  autoOpen?: boolean;
};

export function GarageAlerts({
  vehicles,
  brandName,
  endpoint,
  resolveApiUrl,
  leadOwner,
  autoOpen = true,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [subscription, setSubscription] = useState<GarageAlertRecord | null>(null);
  const [open, setOpen] = useState(false);
  const [storeVehicles, setStoreVehicles] = useState<SavedVehicle[]>([]);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);

  // Use the caller's list when given; otherwise source it from the store.
  const savedVehicles = vehicles ?? storeVehicles;
  const savedCount = savedVehicles.length;

  useEffect(() => {
    const sync = () => setSubscription(readSubscription());
    sync();
    setMounted(true);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === GARAGE_ALERT_KEY) sync();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(GARAGE_ALERT_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GARAGE_ALERT_EVENT, sync as EventListener);
    };
  }, []);

  // Standalone drop-in (no `vehicles` prop) → track the wishlist store directly.
  useEffect(() => {
    if (vehicles !== undefined) return;
    const sync = () => setStoreVehicles(readSaved("wishlist"));
    sync();
    return subscribeSaved("wishlist", sync);
  }, [vehicles]);

  const form = useLeadsForm<GarageAlertFormValues>({
    initialValues: { email: "" },
    widget: "garage-alerts",
    endpoint,
    resolveApiUrl,
    leadOwner,
    leadType: "garage-alert",
    leadSource: "garage-alerts",
    honeypotField: "website",
    fieldConfig: {
      email: {
        required: true,
        validate: (value) => {
          const trimmed = String(value || "").trim();
          if (!trimmed) return "Enter your email so we can send alerts.";
          return /\S+@\S+\.\S+/.test(trimmed) ? null : "Please enter a valid email.";
        },
      },
    },
    buildPayload: (values, meta) => {
      const watching = savedVehicles.map((v) => ({
        slug: v.slug,
        title: v.title,
        href: v.href,
        priceAtSave: priceToNumber(v.price),
        priceLabel: v.price,
      }));
      const summary = watching.map((w) => `• ${w.title} — ${w.priceLabel}`).join("\n");
      return {
        email: values.email,
        subject: `Garage alerts: ${watching.length} saved ${watching.length === 1 ? "vehicle" : "vehicles"}`,
        message: `Please send me price-drop / selling-soon alerts on my saved vehicles:\n${summary}`,
        // Clicking "Notify me" on this single-purpose form is the affirmative opt-in.
        consent: "Yes",
        prefs: DEFAULT_PREFS,
        watching,
        leadType: meta.leadType,
        leadSource: meta.leadSource,
        leadOwner: meta.leadOwner,
        formTs: meta.formTs,
        recaptchaToken: meta.recaptchaToken,
        [meta.honeypotField]: meta.honeypotValue,
        leadData: {
          channel: "email",
          prefs: DEFAULT_PREFS,
          watching,
          consent: "Yes",
        },
      };
    },
  });

  const openModal = useCallback(() => {
    lastFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    markDismissed();
    const last = lastFocusRef.current;
    if (last && typeof last.focus === "function") {
      window.setTimeout(() => last.focus(), 0);
    }
  }, []);

  // Auto-open once per session when there's something to alert on.
  useEffect(() => {
    if (!mounted || !autoOpen) return;
    if (subscription || savedCount === 0) return;
    if (wasDismissed()) return;
    const t = window.setTimeout(() => setOpen(true), 600);
    return () => window.clearTimeout(t);
  }, [mounted, autoOpen, subscription, savedCount]);

  // Esc to close + lock body scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    window.setTimeout(() => (subscription ? closeRef.current : emailRef.current)?.focus(), 60);
    return () => {
      document.removeEventListener("keydown", onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open, closeModal, subscription]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await form.submit();
    if (result.success) {
      writeSubscription({
        email: String(form.values.email || "").trim().toLowerCase(),
        prefs: DEFAULT_PREFS,
        ts: Date.now(),
      });
      setSubscription(readSubscription());
      // Keep the modal open showing the success panel; the buyer closes it.
    }
  };

  const emailError = form.errors.email as string | undefined;

  const savedLabel = useMemo(
    () => `${savedCount} ${savedCount === 1 ? "car" : "cars"}`,
    [savedCount],
  );

  // SSR-safe: nothing to show until we know the saved list + subscription state.
  if (!mounted) return null;

  const modal =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            className="cg-alerts-backdrop"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              className="cg-alerts-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="cg-alerts-modal-title"
            >
              <button
                type="button"
                ref={closeRef}
                className="cg-alerts-modal-close"
                aria-label="Close"
                onClick={closeModal}
              >
                <X size={18} aria-hidden="true" />
              </button>

              {subscription ? (
                <div className="cg-alerts-modal-success">
                  <span className="cg-alerts-success-icon" aria-hidden="true">
                    <Check size={24} />
                  </span>
                  <h2 id="cg-alerts-modal-title" className="cg-alerts-modal-title">
                    Alerts are on
                  </h2>
                  <p className="cg-alerts-modal-blurb">
                    We'll email <strong>{subscription.email}</strong> the moment a saved car's price drops.
                  </p>
                  <button type="button" className="cg-alerts-submit cg-alerts-modal-cta" onClick={closeModal}>
                    Done
                  </button>
                  <button
                    type="button"
                    className="cg-alerts-fine cg-alerts-turnoff"
                    onClick={() => {
                      clearSubscription();
                      setSubscription(null);
                      form.reset();
                    }}
                  >
                    Turn off alerts
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h2 id="cg-alerts-modal-title" className="cg-alerts-modal-title">
                    Don't miss a price drop
                  </h2>
                  <p className="cg-alerts-modal-blurb">
                    We'll email you the moment the price drops on {savedLabel} you've saved
                    {brandName ? <> at {brandName}</> : null}.
                  </p>

                  <label className="cg-alerts-field">
                    <Mail size={16} aria-hidden="true" />
                    <input
                      ref={emailRef}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="you@email.com"
                      aria-label="Your email"
                      aria-invalid={emailError ? true : undefined}
                      {...form.getFieldProps("email")}
                    />
                  </label>
                  {emailError ? <p className="cg-alerts-error">{emailError}</p> : null}

                  {/* Honeypot — hidden from real users, catches bots. */}
                  <input {...form.honeypotProps} />

                  <button
                    type="submit"
                    className="cg-alerts-submit cg-alerts-modal-cta"
                    disabled={form.status === "submitting"}
                  >
                    {form.status === "submitting" ? "Setting up…" : "Notify me"}
                  </button>

                  <p className="cg-alerts-fine">
                    Only about your saved cars. Unsubscribe any time.
                  </p>

                  {form.status === "error" && form.errorMessage && !emailError ? (
                    <p className="cg-alerts-error" role="alert">{form.errorMessage}</p>
                  ) : null}
                  {form.status === "rate-limited" ? (
                    <p className="cg-alerts-error" role="alert">Too many attempts — please try again shortly.</p>
                  ) : null}
                </form>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  // Compact bell button — lives in the wishlist header actions (next to
  // "Clear all"). Off = outline bell + "Get alerts"; on = accent-filled bell +
  // "Alerts on". Either way it opens the modal (capture ↔ manage). Nothing to
  // show when there's no saved car and no subscription.
  const showBell = savedCount > 0 || Boolean(subscription);

  return (
    <>
      {showBell ? (
        <button
          type="button"
          className={`cg-alerts-bell-btn${subscription ? " is-on" : ""}`}
          onClick={openModal}
          aria-label={subscription ? "Manage price-drop alerts" : "Get price-drop alerts on your saved cars"}
        >
          <BellRing size={15} aria-hidden="true" fill={subscription ? "currentColor" : "none"} />
          <span>{subscription ? "Alerts on" : "Get alerts"}</span>
        </button>
      ) : null}
      {modal}
    </>
  );
}
