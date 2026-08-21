/**
 * Local shims for the vendored `useLeadsForm` hook.
 *
 * Vendored from carous-platform:
 *  - `apiUrl`      ← packages/api-client/src/index.ts (default client)
 *  - `logLeadError`← packages/utils/src/leadErrorLog.ts
 *
 * Both are inlined verbatim so this theme no longer depends on
 * `@carous/api-client` or `@carous/utils`. The env-based base-URL resolution
 * in `apiUrl` is preserved exactly (NEXT_PUBLIC_* literals so Next's
 * DefinePlugin inlines them into the client bundle).
 */

// ─── apiUrl (from @carous/api-client) ────────────────────────────────────────

export type ApiClientOptions = {
  baseUrl?: string;
  siteUrl?: string;
  proxyTarget?: string;
  leadsEndpoint?: string;
  lookupEndpoint?: string;
  matchLeadPath?: (path: string) => boolean;
  matchLookupPath?: (path: string) => boolean;
  matchSimilarVehiclePath?: (path: string) => boolean;
};

const defaultMatchLeadPath = (path: string) =>
  /^\/?(?:(?:api|v\d+)\/)*(?:leads|send-lead-email)\/?$/i.test(path.trim());

const defaultMatchLookupPath = (path: string) =>
  /^\/?(?:(?:api|v\d+)\/)*lookup\/?$/i.test(path.trim());

const defaultMatchSimilarVehiclePath = (path: string) => {
  const [pathname] = path.trim().split(/[?#]/);
  return /^\/?(?:api\/)?vehicle\/similar\/?$/i.test(pathname);
};

// NEXT_PUBLIC_* vars MUST be read as the literal `process.env.X` so the bundler
// (Next.js DefinePlugin) inlines the value into the client bundle at build time.
// A dynamic `process.env[key]` lookup is NOT statically replaced, so it returns
// `undefined` in the browser — which left `apiBase` empty and silently routed
// in-app lead/lookup requests to `/leads` (no `/api` prefix, no rewrite → 404)
// instead of `/api/leads`. Map the known keys to literal reads here. The
// `typeof process` guard keeps this safe in non-Next bundles where `process` is
// undefined at runtime.
const PUBLIC_ENV: Record<string, string | undefined> =
  typeof process !== "undefined" && process.env
    ? {
        NEXT_PUBLIC_CAROUS_API_BASE_URL: process.env.NEXT_PUBLIC_CAROUS_API_BASE_URL,
        NEXT_PUBLIC_CAROUS_API_PROXY_TARGET: process.env.NEXT_PUBLIC_CAROUS_API_PROXY_TARGET,
        CAROUS_API_PROXY_TARGET: process.env.CAROUS_API_PROXY_TARGET,
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
        NEXT_PUBLIC_LEADS_API_URL: process.env.NEXT_PUBLIC_LEADS_API_URL,
        NEXT_PUBLIC_LOOKUP_API_URL: process.env.NEXT_PUBLIC_LOOKUP_API_URL,
      }
    : {};

const readEnv = (key: string) => PUBLIC_ENV[key];

export function createApiClient(options: ApiClientOptions = {}) {
  const rawBase =
    options.baseUrl ??
    readEnv("NEXT_PUBLIC_CAROUS_API_BASE_URL") ??
    options.proxyTarget ??
    readEnv("NEXT_PUBLIC_CAROUS_API_PROXY_TARGET") ??
    readEnv("CAROUS_API_PROXY_TARGET") ??
    "";
  const siteOrigin = options.siteUrl ?? readEnv("NEXT_PUBLIC_SITE_URL") ?? "";
  const apiBase = rawBase.replace(/\/+$/, "");

  const leadsEndpoint =
    options.leadsEndpoint ?? readEnv("NEXT_PUBLIC_LEADS_API_URL") ?? undefined;
  const lookupEndpoint =
    options.lookupEndpoint ?? readEnv("NEXT_PUBLIC_LOOKUP_API_URL") ?? undefined;

  const matchLeadPath = options.matchLeadPath ?? defaultMatchLeadPath;
  const matchLookupPath = options.matchLookupPath ?? defaultMatchLookupPath;
  const matchSimilarVehiclePath =
    options.matchSimilarVehiclePath ?? defaultMatchSimilarVehiclePath;

  function resolveSameOriginApiPath(path: string): string {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    const apiPath = normalized.startsWith("/api/") ? normalized : `/api${normalized}`;

    if (typeof window !== "undefined") return apiPath;

    const origin = siteOrigin || "http://localhost:3000";
    return `${origin.replace(/\/+$/, "")}${apiPath}`;
  }

  function resolveSpecialPath(path: string): string {
    if (!path) return "";
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    if (!apiBase) return normalized;
    return `${apiBase}${normalized}`;
  }

  function apiUrl(path: string): string {
    if (!path) return apiBase || "";
    if (matchLeadPath(path) && leadsEndpoint) return resolveSpecialPath(leadsEndpoint);
    if (matchLookupPath(path) && lookupEndpoint) return resolveSpecialPath(lookupEndpoint);
    if (matchSimilarVehiclePath(path)) return resolveSameOriginApiPath(path);
    if (/^https?:\/\//i.test(path)) return path;

    let base = apiBase;
    if (base && siteOrigin && !/^https?:\/\//i.test(base) && base.startsWith("/") && typeof window === "undefined") {
      const origin = siteOrigin;
      base = origin.replace(/\/+$/, "") + base;
    }

    if (!base) return path;
    const normalizedBase = base.replace(/\/+$/, "");
    if (path === normalizedBase || path.startsWith(`${normalizedBase}/`)) return path;
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${suffix}`;
  }

  function getApiBase() {
    return apiBase;
  }

  return {
    apiUrl,
    getApiBase,
  };
}

const defaultClient = createApiClient();

export const apiUrl = defaultClient.apiUrl;
export const getApiBase = defaultClient.getApiBase;

// ─── logLeadError (from @carous/utils / leadErrorLog.ts) ─────────────────────

export type LeadErrorPhase = "http-error" | "network-error" | "validation";

export type KnownLeadWidget =
  | "contact-form"
  | "vehicle-enquiry"
  | "sell-your-car"
  | "whatsapp-enquiry";

export interface LeadErrorContext {
  /** Widget label — use one of KnownLeadWidget when possible, free-form otherwise. */
  widget: KnownLeadWidget | (string & {});
  endpoint: string;
  phase: LeadErrorPhase;
  status?: number;
  statusText?: string;
  responseBody?: unknown;
  errorMessage?: string;
  payload?: unknown;
  leadOwner?: string;
  leadType?: string;
}

interface StoredLeadError extends LeadErrorContext {
  ts: string;
  pageUrl: string;
  userAgent: string;
}

const STORAGE_KEY = "carous:lead-errors";
const MAX_ENTRIES = 50;
const GLOBAL_KEY = "CarousLeadsDebug";

function read(): StoredLeadError[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: StoredLeadError[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = entries.length > MAX_ENTRIES ? entries.slice(-MAX_ENTRIES) : entries;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    /* localStorage full or blocked — console.error has already happened */
  }
}

function installDebugApi(): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as Record<string, unknown>;
  if (w[GLOBAL_KEY]) return;
  w[GLOBAL_KEY] = {
    get: () => read(),
    clear: () => {
      try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
    },
    download: () => {
      const entries = read();
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `carous-lead-errors-${stamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5_000);
      return entries.length;
    },
  };
}

export function logLeadError(context: LeadErrorContext): void {
  const entry: StoredLeadError = {
    ts: new Date().toISOString(),
    pageUrl: typeof window !== "undefined" ? window.location.href : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    ...context,
  };

  try {
    // eslint-disable-next-line no-console
    console.error(`[carous:${context.widget}] lead submission failed`, entry);
  } catch { /* noop */ }

  const entries = read();
  entries.push(entry);
  write(entries);

  installDebugApi();
}
