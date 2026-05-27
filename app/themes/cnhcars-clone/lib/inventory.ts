import { apiUrl } from '../lib/api';

// brandstudio routes inventory at `/api/inventory?brand=<slug>` on the
// SAME origin as the theme. The source app's `apiUrl()` helper was wired to
// an external Carous API; for brandstudio we always hit /api/<path> with the
// active brand slug. Callers thread the slug from `useBrand().slug`
// (client-side) or `getBrandSlugFromRequest()` (server-side).
function buildBrandstudioInventoryUrl(params: URLSearchParams, brandSlug?: string | null): string {
  if (brandSlug) params.set('brand', brandSlug);
  const qs = params.toString();
  const path = qs ? `/api/inventory?${qs}` : '/api/inventory';
  // Same-origin in the browser; absolute on the server.
  if (typeof window !== 'undefined') return path;
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${origin.replace(/\/+$/, '')}${path}`;
}

// Re-export apiUrl in case downstream consumers grab it from this module too.
export { apiUrl };

export interface InventoryFilters {
  make: string;
  model: string;
  year: string;
  price: string;
  transmission: string;
}

export interface InventoryPagination {
  page: number;
  per_page: number;
}

export interface InventoryData {
  items: any[];
  meta: {
    total: number;
    page: number;
    per_page: number;
    totalPages: number;
    stats: any;
    filters: any;
    available: {
      makes: string[];
      body_types: string[];
    };
  };
}

export const DEFAULT_INVENTORY_FILTERS: InventoryFilters = {
  make: '',
  model: '',
  year: '',
  price: '',
  transmission: '',
};

export const DEFAULT_INVENTORY_PAGINATION: InventoryPagination = {
  page: 1,
  per_page: 12,
};

const normalizeNumber = (value: unknown, fallback: number) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
};

export function buildInventorySearchParams(
  filters: Partial<InventoryFilters> = DEFAULT_INVENTORY_FILTERS,
  pagination: Partial<InventoryPagination> = DEFAULT_INVENTORY_PAGINATION,
): URLSearchParams {
  const params = new URLSearchParams();

  const page = normalizeNumber(pagination.page, DEFAULT_INVENTORY_PAGINATION.page);
  const perPage = normalizeNumber(pagination.per_page, DEFAULT_INVENTORY_PAGINATION.per_page);

  params.set('page', String(page));
  params.set('per_page', String(perPage));
  params.set('light', '1');

  if (filters.make) params.set('make', filters.make);
  if (filters.model) params.set('model', filters.model);
  if (filters.year) {
    params.set('min_year', filters.year);
    params.set('max_year', filters.year);
  }

  if (filters.price) {
    const [min, max] = filters.price
      .split('-')
      .map((part) => part.replace(/[£,+]/g, '').replace(/,/g, '').trim());

    if (min) params.set('min_price', min);
    if (max) params.set('max_price', max);
  }

  if (filters.transmission) params.set('transmission', filters.transmission);

  return params;
}

function normalizeInventoryData(payload: any, fallbackPagination: InventoryPagination): InventoryData {
  if (!payload || !Array.isArray(payload.items)) {
    throw new Error('Invalid inventory payload');
  }

  const meta = payload.meta ?? {};
  const available = meta.available ?? {};
  const total = normalizeNumber(meta.total, payload.items.length);
  const page = normalizeNumber(meta.page, fallbackPagination.page);
  const perPage = normalizeNumber(meta.per_page, fallbackPagination.per_page);
  const totalPages = normalizeNumber(
    meta.totalPages ?? meta.total_pages,
    Math.max(1, Math.ceil(total / Math.max(1, perPage))),
  );

  return {
    items: payload.items,
    meta: {
      total,
      page,
      per_page: perPage,
      totalPages,
      stats: meta.stats ?? null,
      filters: meta.filters ?? null,
      available: {
        makes: normalizeStringArray(available.makes),
        body_types: normalizeStringArray(available.body_types ?? available.bodyTypes),
      },
    },
  };
}

export async function fetchInventoryData(options: {
  filters?: Partial<InventoryFilters>;
  pagination?: Partial<InventoryPagination>;
  signal?: AbortSignal;
  cache?: RequestCache;
  brandSlug?: string | null;
} = {}): Promise<InventoryData> {
  const {
    filters = DEFAULT_INVENTORY_FILTERS,
    pagination = DEFAULT_INVENTORY_PAGINATION,
    signal,
    cache = 'no-store',
    brandSlug,
  } = options;

  const normalizedPagination: InventoryPagination = {
    page: normalizeNumber(pagination.page, DEFAULT_INVENTORY_PAGINATION.page),
    per_page: normalizeNumber(pagination.per_page, DEFAULT_INVENTORY_PAGINATION.per_page),
  };

  const params = buildInventorySearchParams(filters, normalizedPagination);
  const response = await fetch(buildBrandstudioInventoryUrl(params, brandSlug), {
    cache,
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch inventory (${response.status})`);
  }

  const payload = await response.json();
  return normalizeInventoryData(payload, normalizedPagination);
}

let inventoryPromise: Promise<any[]> | null = null;

export function getInventory(opts: { force?: boolean; page?: number; per_page?: number } = {}): Promise<any[]> {
  const { force = false, page = 1, per_page = 100 } = opts;

  if (!inventoryPromise || force) {
    inventoryPromise = fetchInventoryData({
      pagination: { page, per_page },
      cache: 'no-store',
    })
      .then((payload) => payload.items)
      .catch((error) => {
        inventoryPromise = null;
        throw error;
      });
  }

  return inventoryPromise;
}
