"use client";

import { useCallback, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { apiUrl } from "./shims";
import { logLeadError } from "./shims";

export type LeadFormStatus = "idle" | "submitting" | "success" | "error" | "rate-limited";

export type LeadFormErrors<T> = Partial<Record<keyof T | string, string>>;

export type LeadFieldConfig<T> = {
  required?: boolean;
  normalize?: (value: any, values: T) => any;
  validate?: (value: any, values: T) => string | null;
};

export type LeadRateLimit = {
  windowMs: number;
  max: number;
  storageKey?: string;
};

export type LeadRecaptcha = {
  getToken?: () => Promise<string | undefined>;
};

export type LeadFormMeta = {
  leadType?: string;
  leadSource?: string;
  leadOwner?: string;
  formTs: number;
  honeypotField: string;
  honeypotValue: string;
  recaptchaToken?: string;
};

export type LeadFormOptions<T extends Record<string, any>> = {
  initialValues: T;
  endpoint?: string;
  leadType?: string;
  leadSource?: string;
  /**
   * Dealer the lead belongs to. Falls back to `NEXT_PUBLIC_CLIENT_ID` when
   * omitted. Pass explicitly from environments where that build-time var is
   * unavailable (e.g. the standalone CDN widgets, which source it from a
   * `data-lead-owner` attribute).
   */
  leadOwner?: string;
  fieldConfig?: Partial<Record<keyof T, LeadFieldConfig<T>>>;
  validate?: (values: T) => LeadFormErrors<T>;
  buildPayload?: (values: T, meta: LeadFormMeta) => Record<string, any>;
  honeypotField?: string;
  rateLimit?: LeadRateLimit;
  recaptcha?: LeadRecaptcha;
  resolveApiUrl?: (path: string) => string;
  /** Optional widget label used by the shared lead-error logger (DevTools + CarousLeadsDebug). */
  widget?: string;
};

export type LeadSubmitResult = {
  success: boolean;
  status: LeadFormStatus;
  error?: string;
  response?: unknown;
  payload?: Record<string, any>;
};

function isEmptyValue(value: unknown) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim().length === 0;
  if (typeof value === "boolean") return value === false;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function normalizeString(name: string, value: string) {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (/email/i.test(name)) return trimmed.toLowerCase();
  if (/phone|tel/i.test(name)) return trimmed.replace(/[^\d+()\-\s.]/g, "");
  return trimmed;
}

function attachLeadOwner(payload: Record<string, any>, leadOwner: string) {
  if (!leadOwner) return payload;

  const nextPayload = { ...payload };

  if (!("leadOwner" in nextPayload) && !(
    "dealerId" in nextPayload
  ) && !("lead_owner" in nextPayload) && !("leadowner" in nextPayload)) {
    nextPayload.leadOwner = leadOwner;
  }

  const leadData = nextPayload.leadData;
  if (leadData && typeof leadData === "object" && !Array.isArray(leadData)) {
    const nestedLeadData = leadData as Record<string, any>;
    if (!("leadOwner" in nestedLeadData) && !("dealerId" in nestedLeadData) && !("lead_owner" in nestedLeadData) && !("leadowner" in nestedLeadData)) {
      nextPayload.leadData = { ...nestedLeadData, leadOwner };
    }
  }

  return nextPayload;
}

export function useLeadsForm<T extends Record<string, any>>(options: LeadFormOptions<T>) {
  const {
    initialValues,
    fieldConfig,
    validate,
    buildPayload,
    leadType,
    leadSource,
    recaptcha,
    widget,
  } = options;

  // NEXT_PUBLIC_* vars MUST be referenced as the literal `process.env.X` so the
  // bundler (Next.js DefinePlugin) inlines the value at build time. Reading them
  // through an alias (`const env = process.env; env.NEXT_PUBLIC_CLIENT_ID`) is NOT
  // statically replaced, so it resolves to `undefined` in the browser — which is
  // exactly what silently dropped the lead owner and made the API reject every
  // in-app lead with "Please provide a lead owner". The `typeof process` guard
  // keeps this safe in non-Next bundles (the standalone CDN widgets) where
  // `process` is undefined at runtime.
  const hasProcessEnv = typeof process !== "undefined" && !!process.env;
  const publicLeadsApiUrl = hasProcessEnv ? process.env.NEXT_PUBLIC_LEADS_API_URL : undefined;
  const publicClientId = hasProcessEnv ? process.env.NEXT_PUBLIC_CLIENT_ID : undefined;

  const endpointRaw = options.endpoint ?? publicLeadsApiUrl ?? '/leads';
  const resolveApiUrl = options.resolveApiUrl ?? apiUrl;
  const endpoint = endpointRaw ? resolveApiUrl(endpointRaw) : "";
  const honeypotField = options.honeypotField ?? "website";
  const rateLimit = options.rateLimit ?? { windowMs: 60_000, max: 8 };
  const leadOwner = options.leadOwner ?? publicClientId ?? "";

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<LeadFormErrors<T>>({});
  const [status, setStatus] = useState<LeadFormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [honeypotValue, setHoneypotValue] = useState("");
  const formTsRef = useRef<number>(Date.now());

  const normalizeValues = useCallback((raw: T) => {
    const next = { ...raw } as Record<keyof T, any>;
    (Object.keys(raw) as (keyof T)[]).forEach((key) => {
      const cfg = fieldConfig?.[key];
      const current = raw[key];
      if (cfg?.normalize) {
        next[key] = cfg.normalize(current, raw) as T[keyof T];
        return;
      }
      if (typeof current === "string") {
        next[key] = normalizeString(String(key), current) as T[keyof T];
      } else {
        next[key] = current;
      }
    });
    return next as T;
  }, [fieldConfig]);

  const validateValues = useCallback((nextValues: T) => {
    const nextErrors: LeadFormErrors<T> = {};

    (Object.keys(nextValues) as (keyof T)[]).forEach((key) => {
      const cfg = fieldConfig?.[key];
      if (cfg?.required && isEmptyValue(nextValues[key])) {
        nextErrors[key] = "This field is required.";
        return;
      }
      if (cfg?.validate) {
        const message = cfg.validate(nextValues[key], nextValues);
        if (message) nextErrors[key] = message;
      }
    });

    if (validate) {
      Object.assign(nextErrors, validate(nextValues));
    }

    return nextErrors;
  }, [fieldConfig, validate]);

  const checkRateLimit = useCallback(() => {
    if (typeof window === "undefined") return false;
    if (!rateLimit?.windowMs || !rateLimit?.max) return false;
    const storageKey = rateLimit.storageKey ?? `leads-rate:${leadType ?? "generic"}:${endpoint}`;
    const now = Date.now();
    try {
      const stored = localStorage.getItem(storageKey);
      const parsed = stored ? JSON.parse(stored) : { count: 0, reset: now + rateLimit.windowMs };
      if (now > parsed.reset) {
        localStorage.setItem(storageKey, JSON.stringify({ count: 1, reset: now + rateLimit.windowMs }));
        return false;
      }
      if (parsed.count >= rateLimit.max) return true;
      localStorage.setItem(storageKey, JSON.stringify({ count: parsed.count + 1, reset: parsed.reset }));
      return false;
    } catch {
      return false;
    }
  }, [endpoint, leadType, rateLimit]);

  const setFieldValue = useCallback((name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = event.target;
    const name = target.name as keyof T;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFieldValue(name, value);
  }, [setFieldValue]);

  const getFieldProps = useCallback((name: keyof T) => {
    const value = values[name];
    return {
      name: String(name),
      value: (typeof value === "undefined" || value === null ? "" : value) as any,
      onChange: handleChange,
    };
  }, [handleChange, values]);

  const honeypotProps = useMemo(() => ({
    name: honeypotField,
    value: honeypotValue,
    onChange: (event: ChangeEvent<HTMLInputElement>) => setHoneypotValue(event.target.value),
    tabIndex: -1,
    autoComplete: "new-password",
    "aria-hidden": true,
    style: { position: "absolute" as const, left: "-9999px", opacity: 0 },
  }), [honeypotField, honeypotValue]);

  const reset = useCallback((next?: Partial<T>) => {
    setValues({ ...initialValues, ...(next || {}) });
    setErrors({});
    setStatus("idle");
    setErrorMessage(null);
    setSuccessMessage(null);
    setHoneypotValue("");
    formTsRef.current = Date.now();
  }, [initialValues]);

  const submitInternal = useCallback(async (overrideValues?: T): Promise<LeadSubmitResult> => {
    setStatus("submitting");
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!endpoint) {
      const message = "Missing leads API endpoint. Set NEXT_PUBLIC_LEADS_API_URL in .env.";
      setStatus("error");
      setErrorMessage(message);
      return { success: false, status: "error", error: message };
    }

    const currentValues = overrideValues ?? values;
    const normalized = normalizeValues(currentValues);
    setValues(normalized);

    const validationErrors = validateValues(normalized);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setStatus("error");
      return { success: false, status: "error", error: "Validation failed." };
    }
    setErrors({});

    if (checkRateLimit()) {
      const message = "Too many submissions. Please try again later.";
      setStatus("rate-limited");
      setErrorMessage(message);
      return { success: false, status: "rate-limited", error: message };
    }

    const recaptchaToken = recaptcha?.getToken ? await recaptcha.getToken() : undefined;
    const meta: LeadFormMeta = {
      leadType,
      leadSource,
      leadOwner,
      formTs: formTsRef.current,
      honeypotField,
      honeypotValue,
      recaptchaToken,
    };

    const basePayload = buildPayload
      ? buildPayload(normalized, meta)
      : {
          ...normalized,
          leadType,
          leadSource,
          leadOwner,
          formTs: meta.formTs,
          recaptchaToken: meta.recaptchaToken,
          [honeypotField]: honeypotValue,
        };

    let payload = basePayload;

    if (leadOwner && typeof payload === "object" && payload !== null) {
      payload = attachLeadOwner(payload as Record<string, any>, leadOwner);
    }

    const widgetLabel = widget || leadSource || leadType || "lead-form";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const responseBody = await response.json().catch(() => ({}));

      if (!response.ok || (responseBody && responseBody.success === false)) {
        const message = (responseBody as any)?.error || "Lead submission failed.";
        logLeadError({
          widget: widgetLabel,
          endpoint,
          phase: "http-error",
          status: response.status,
          statusText: response.statusText,
          responseBody,
          errorMessage: message,
          payload,
          leadOwner,
          leadType,
        });
        setStatus("error");
        setErrorMessage(message);
        return { success: false, status: "error", error: message, response: responseBody, payload };
      }

      setStatus("success");
      setSuccessMessage("Submitted successfully.");
      // Broadcast a fleet-wide conversion signal so passive widgets (e.g.
      // @carous/intent-capture's exit-intent concierge) can suppress themselves
      // the moment ANY lead is captured. Keep the key/event names in sync with
      // packages/intent-capture/src/conversion.ts.
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            "vp-lead-captured",
            JSON.stringify({ ts: Date.now(), leadType: leadType ?? null, leadSource: leadSource ?? null }),
          );
        } catch {
          /* storage may be unavailable (private mode / quota) — non-fatal */
        }
        window.dispatchEvent(
          new CustomEvent("carous:lead-captured", { detail: { leadType, leadSource } }),
        );
      }
      return { success: true, status: "success", response: responseBody, payload };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Network error.";
      logLeadError({
        widget: widgetLabel,
        endpoint,
        phase: "network-error",
        errorMessage: message,
        payload,
        leadOwner,
        leadType,
      });
      setStatus("error");
      setErrorMessage(message);
      return { success: false, status: "error", error: message, payload };
    }
  }, [
    buildPayload,
    checkRateLimit,
    endpoint,
    honeypotField,
    honeypotValue,
    leadSource,
    leadType,
    normalizeValues,
    recaptcha,
    validateValues,
    values,
    leadOwner,
    widget,
  ]);

  const submit = useCallback(async (): Promise<LeadSubmitResult> => submitInternal(), [submitInternal]);

  const submitValues = useCallback(async (nextValues: T): Promise<LeadSubmitResult> => {
    return submitInternal(nextValues);
  }, [submitInternal]);

  const handleSubmit = useCallback(async (event?: FormEvent<HTMLFormElement>) => {
    if (event?.preventDefault) event.preventDefault();
    return submit();
  }, [submit]);

  return {
    values,
    setValues,
    setFieldValue,
    errors,
    status,
    errorMessage,
    successMessage,
    handleChange,
    getFieldProps,
    honeypotProps,
    handleSubmit,
    reset,
    submit,
    submitValues,
  };
}
