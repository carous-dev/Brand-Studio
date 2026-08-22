"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  GitCompareArrows,
  Heart,
  LayoutGrid,
  Rows3,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useVehicleFilters,
  VehicleFiltersDrawer,
  type SortOption,
  type VehicleFiltersField,
  type VehicleFiltersOptions,
} from "@/app/themes/pmg-used-cars/lib/vendor/vehicle-filters";
import "@/app/themes/pmg-used-cars/lib/vendor/vehicle-filters/styles.css";
import {
  countSaved,
  isSaved,
  MAX_COMPARE,
  RecentlyViewed,
  subscribeSaved,
  toggleSaved,
  type SavedVehicle,
} from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import { InventoryCard } from "./InventoryCard";
import { buildVehiclePermalink } from "../../lib/vehicle-links";
import { fetchInventoryClient } from "./_lib/inventory-client";
import { PER_PAGE, type ClientFilters, type FilterMeta, type InventoryVehicle } from "./_lib/types";
import { useBrand } from "../../context/BrandClientWrapper";
import { resolveText } from "../../lib/brand-text";

type ViewMode = "grid" | "list";
type PaginationItem = number | "ellipsis";

const VIEW_MODE_STORAGE_KEY = "pmg-inventory-view-mode";
const COMPACT_QUERY = "(max-width: 900px)";
const SEARCH_DEBOUNCE_MS = 350;

const SORT_OPTIONS: SortOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "mileage_asc", label: "Mileage: lowest" },
  { value: "year_desc", label: "Year: newest" },
  { value: "year_asc", label: "Year: oldest" },
];

const PRICE_BANDS: SortOption[] = [
  { value: "5000", label: "Up to £5,000" },
  { value: "8000", label: "Up to £8,000" },
  { value: "10000", label: "Up to £10,000" },
  { value: "15000", label: "Up to £15,000" },
  { value: "20000", label: "Up to £20,000" },
  { value: "30000", label: "Up to £30,000" },
];

const MILEAGE_BANDS: SortOption[] = [
  { value: "25000", label: "Up to 25,000 miles" },
  { value: "50000", label: "Up to 50,000 miles" },
  { value: "75000", label: "Up to 75,000 miles" },
  { value: "100000", label: "Up to 100,000 miles" },
];

const FILTER_FIELDS: VehicleFiltersField[] = ["make", "model", "body", "fuel", "transmission", "maxPrice", "maxMileage"];

function toText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null && "name" in value) {
    const n = (value as { name?: unknown }).name;
    return typeof n === "string" ? n.trim() : "";
  }
  return "";
}

function vehicleSlug(vehicle: InventoryVehicle): string {
  return String(vehicle.slug || vehicle.advert_id || vehicle.id || vehicle.reg || "");
}

function firstImage(vehicle: InventoryVehicle): string {
  if (Array.isArray(vehicle.gallery) && vehicle.gallery.length) {
    const g = vehicle.gallery[0];
    if (typeof g === "string") return g;
    if (g && typeof g === "object") return String(g.url || g.href || g.src || g.file || g.path || g.image || "");
  }
  if (Array.isArray(vehicle.images) && vehicle.images.length) return String(vehicle.images[0]);
  if (vehicle.image) return String(vehicle.image);
  return "";
}

function formatPrice(value: InventoryVehicle["price"]): string {
  if (value == null) return "POA";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "POA";
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(n);
}

function formatMileage(value: InventoryVehicle["mileage"]): string {
  if (value == null) return "";
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.-]+/g, ""));
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${new Intl.NumberFormat("en-GB").format(n)} miles`;
}

/** Snapshot a raw inventory item into the @/app/themes/pmg-used-cars/lib/vendor/garage saved-vehicle shape. */
function toSavedSnapshot(vehicle: InventoryVehicle, href: string): SavedVehicle {
  const trim = toText(vehicle.derivative) || toText(vehicle.variant) || toText(vehicle.trim);
  const title = [toText(vehicle.make), toText(vehicle.model), trim].filter(Boolean).join(" ").trim();
  return {
    slug: vehicleSlug(vehicle),
    href,
    title: title || "Vehicle",
    price: formatPrice(vehicle.price),
    image: firstImage(vehicle),
    year: toText(vehicle.year),
    mileage: formatMileage(vehicle.mileage),
    transmission: toText(vehicle.transmission) || toText(vehicle.trans),
    fuel: toText(vehicle.fuel),
  };
}

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pageSet = new Set<number>([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  if (currentPage <= 3) [2, 3, 4].forEach((p) => pageSet.add(p));
  if (currentPage >= totalPages - 2) [totalPages - 1, totalPages - 2, totalPages - 3].forEach((p) => pageSet.add(p));
  const pages = Array.from(pageSet)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const items: PaginationItem[] = [];
  let prev: number | null = null;
  for (const p of pages) {
    if (prev !== null) {
      const gap = p - prev;
      if (gap === 2) items.push(prev + 1);
      else if (gap > 2) items.push("ellipsis");
    }
    items.push(p);
    prev = p;
  }
  return items;
}

function SkeletonCard() {
  return (
    <div className="pmg-inv-skeleton" aria-hidden="true">
      <div className="pmg-inv-skeleton-media" />
      <div className="pmg-inv-skeleton-body">
        <div className="pmg-inv-skeleton-line pmg-inv-skeleton-title" />
        <div className="pmg-inv-skeleton-specs">
          <span />
          <span />
          <span />
        </div>
        <div className="pmg-inv-skeleton-line pmg-inv-skeleton-price" />
      </div>
    </div>
  );
}

type Props = {
  initialItems: InventoryVehicle[];
  initialTotal: number;
  meta: FilterMeta;
};

export function InventoryClient({ initialItems, initialTotal, meta }: Props) {
  const brand = useBrand() as any;
  const brandSlug: string | null = brand?.slug ?? null;
  const [vehicles, setVehicles] = useState<InventoryVehicle[]>(initialItems);
  const [total, setTotal] = useState<number>(initialTotal);
  const [page, setPage] = useState<number>(1);
  const [sort, setSort] = useState<string>("newest");
  const [q, setQ] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isCompact, setIsCompact] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchedOnce, setFetchedOnce] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [savedTick, setSavedTick] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [compareCount, setCompareCount] = useState<number>(0);

  const skipInitialFetchRef = useRef<boolean>(true);
  const skipFirstUrlSyncRef = useRef<boolean>(true);

  const filters = useVehicleFilters({
    options: { makes: [], models: [], bodyTypes: [], fuels: [], transmissions: [] },
    onApply: () => setPage(1),
    onClear: () => setPage(1),
  });
  const { make, model, body, fuel, transmission, maxPrice, minPrice, maxMileage } = filters.applied;

  const makes = useMemo(
    () => Object.keys(meta.makesToModels).sort((a, b) => a.localeCompare(b)),
    [meta.makesToModels],
  );
  const modelOptions = useMemo(() => {
    if (make && meta.makesToModels[make]) return meta.makesToModels[make];
    return Array.from(new Set(Object.values(meta.makesToModels).flat())).sort((a, b) => a.localeCompare(b));
  }, [make, meta.makesToModels]);

  const filtersOptions: VehicleFiltersOptions = {
    makes,
    models: modelOptions,
    bodyTypes: meta.bodies,
    fuels: meta.fuels,
    transmissions: meta.transmissions,
    priceBands: PRICE_BANDS,
    mileageBands: MILEAGE_BANDS,
  };

  const filtersConfig = {
    fields: FILTER_FIELDS,
    heading: "Filter stock",
    subheading: "Narrow the search to the right car.",
    applyLabel: "Show results",
    clearLabel: "Clear all",
  };

  // ─── Hydrate state from the URL on mount ─────────────────────────────────
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const nextPage = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
      const nextSort = params.get("sort") || "newest";
      const nextQ = params.get("q") || "";
      const hydrated = {
        make: params.get("make") || "",
        model: params.get("model") || "",
        body: params.get("body") || "",
        fuel: params.get("fuel") || "",
        transmission: params.get("transmission") || "",
        maxPrice: params.get("max_price") || "",
        maxMileage: params.get("max_mileage") || "",
      };

      const isPlainDefault =
        nextPage === 1 &&
        nextSort === "newest" &&
        !nextQ &&
        !hydrated.make &&
        !hydrated.model &&
        !hydrated.body &&
        !hydrated.fuel &&
        !hydrated.transmission &&
        !hydrated.maxPrice &&
        !hydrated.maxMileage;

      skipInitialFetchRef.current = isPlainDefault;

      setPage(nextPage);
      setSort(nextSort);
      setQ(nextQ);
      setSearchInput(nextQ);
      filters.setApplied(hydrated);
      filters.setDraft(hydrated);

      const storedView = window.localStorage.getItem(VIEW_MODE_STORAGE_KEY);
      if (storedView === "list" || storedView === "grid") setViewMode(storedView);
    } catch {
      skipInitialFetchRef.current = true;
    } finally {
      setHasInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Track compact viewport (list view is desktop-only) ──────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia(COMPACT_QUERY);
    const sync = () => setIsCompact(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
    } catch {
      /* ignore */
    }
  }, [viewMode]);

  // ─── Garage (wishlist / compare) subscription ────────────────────────────
  useEffect(() => {
    const sync = () => {
      setWishlistCount(countSaved("wishlist"));
      setCompareCount(countSaved("compare"));
      setSavedTick((t) => t + 1);
    };
    sync();
    const offWish = subscribeSaved("wishlist", sync);
    const offComp = subscribeSaved("compare", sync);
    return () => {
      offWish();
      offComp();
    };
  }, []);

  // ─── Debounce the search box into the `q` filter ─────────────────────────
  useEffect(() => {
    if (!hasInitialized) return;
    const handle = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      setQ((current) => {
        if (current === trimmed) return current;
        setPage(1);
        return trimmed;
      });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(handle);
  }, [searchInput, hasInitialized]);

  // ─── Fetch on filter / sort / search / page change ───────────────────────
  useEffect(() => {
    if (!hasInitialized) return;
    if (skipInitialFetchRef.current) {
      skipInitialFetchRef.current = false;
      setFetchedOnce(true);
      return;
    }

    const controller = new AbortController();
    let aborted = false;

    (async () => {
      setLoading(true);
      const clientFilters: ClientFilters = {
        q,
        make,
        model,
        body,
        fuel,
        transmission,
        minPrice,
        maxPrice,
        maxMileage,
        sort,
        page,
      };
      const result = await fetchInventoryClient(clientFilters, controller.signal, brandSlug);
      if (aborted) return;
      setVehicles(result.items);
      setTotal(result.total);
      setLoading(false);
      setFetchedOnce(true);
    })();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [make, model, body, fuel, transmission, minPrice, maxPrice, maxMileage, sort, q, page, hasInitialized, brandSlug]);

  // ─── Keep the URL in sync (shareable / back-button friendly) ─────────────
  const buildQuery = useCallback(
    (pageNumber: number) => {
      const params = new URLSearchParams();
      if (make) params.set("make", make);
      if (model) params.set("model", model);
      if (body) params.set("body", body);
      if (fuel) params.set("fuel", fuel);
      if (transmission) params.set("transmission", transmission);
      if (maxPrice) params.set("max_price", maxPrice);
      if (maxMileage) params.set("max_mileage", maxMileage);
      if (q) params.set("q", q);
      if (sort && sort !== "newest") params.set("sort", sort);
      if (pageNumber > 1) params.set("page", String(pageNumber));
      return params.toString();
    },
    [make, model, body, fuel, transmission, maxPrice, maxMileage, q, sort],
  );

  useEffect(() => {
    if (!hasInitialized) return;
    if (skipFirstUrlSyncRef.current) {
      skipFirstUrlSyncRef.current = false;
      return;
    }
    try {
      const qs = buildQuery(page);
      const nextUrl = qs ? `/used-cars?${qs}` : "/used-cars";
      const currentUrl = window.location.pathname + window.location.search;
      if (nextUrl !== currentUrl) window.history.replaceState(window.history.state, "", nextUrl);
    } catch {
      /* ignore */
    }
  }, [buildQuery, page, hasInitialized]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const effectiveViewMode: ViewMode = isCompact ? "grid" : viewMode;
  const showEmpty = fetchedOnce && !loading && vehicles.length === 0;
  const shownCount = Math.min(total, (currentPage - 1) * PER_PAGE + vehicles.length);

  // Per-card saved flags — recomputed whenever the garage store changes.
  const { wishSet, compSet } = useMemo(() => {
    const wish = new Set<string>();
    const comp = new Set<string>();
    for (const vehicle of vehicles) {
      const slug = vehicleSlug(vehicle);
      if (!slug) continue;
      if (isSaved("wishlist", slug)) wish.add(slug);
      if (isSaved("compare", slug)) comp.add(slug);
    }
    return { wishSet: wish, compSet: comp };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicles, savedTick]);

  const goToPage = useCallback((next: number) => {
    setPage(Math.max(1, next));
    try {
      document.getElementById("pmg-inv-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      /* ignore */
    }
  }, []);

  const buildPageHref = useCallback(
    (pageNumber: number) => {
      const qs = buildQuery(pageNumber);
      return qs ? `/used-cars?${qs}` : "/used-cars";
    },
    [buildQuery],
  );

  const handlePageClick = useCallback(
    (event: React.MouseEvent, pageNumber: number) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      goToPage(pageNumber);
    },
    [goToPage],
  );

  const toggleWishlist = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => {
      event.preventDefault();
      event.stopPropagation();
      const href = buildVehiclePermalink(vehicle, "/used-cars");
      toggleSaved("wishlist", toSavedSnapshot(vehicle, href));
    },
    [],
  );

  const toggleCompare = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, vehicle: InventoryVehicle) => {
      event.preventDefault();
      event.stopPropagation();
      const href = buildVehiclePermalink(vehicle, "/used-cars");
      toggleSaved("compare", toSavedSnapshot(vehicle, href));
    },
    [],
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setQ("");
    setPage(1);
  }, []);

  return (
    <section className="pmg-inv" aria-label={resolveText(brand, "invSectionLabel")}>
      <div className="pmg-inv-shell">
        <div className="pmg-inv-toolbar">
          <div className="pmg-inv-toolbar-lead">
            <button
              type="button"
              className="pmg-inv-filter-btn"
              onClick={() => setIsFilterOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isFilterOpen}
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              <span>Filters</span>
              {filters.activeCount > 0 ? <span className="pmg-inv-filter-badge">{filters.activeCount}</span> : null}
            </button>

            <div className="pmg-inv-search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={resolveText(brand, "invSearchPlaceholder")}
                aria-label={resolveText(brand, "invSearchLabel")}
                enterKeyHint="search"
              />
              {searchInput ? (
                <button type="button" className="pmg-inv-search-clear" onClick={clearSearch} aria-label="Clear search" /* text-static-ok */>
                  <X size={15} aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="pmg-inv-toolbar-controls">
            {!isCompact ? (
              <div className="pmg-inv-view" role="group" aria-label={resolveText(brand, "invViewModeLabel")}>
                <button
                  type="button"
                  className={effectiveViewMode === "grid" ? "pmg-inv-view-btn is-active" : "pmg-inv-view-btn"}
                  aria-pressed={effectiveViewMode === "grid"}
                  onClick={() => setViewMode("grid")}
                >
                  <LayoutGrid size={15} aria-hidden="true" />
                  <span className="pmg-inv-view-label">Grid</span>
                </button>
                <button
                  type="button"
                  className={effectiveViewMode === "list" ? "pmg-inv-view-btn is-active" : "pmg-inv-view-btn"}
                  aria-pressed={effectiveViewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  <Rows3 size={15} aria-hidden="true" />
                  <span className="pmg-inv-view-label">List</span>
                </button>
              </div>
            ) : null}

            <div className="pmg-inv-counters" aria-label={resolveText(brand, "invSavedLabel")}>
              <Link href="/wishlist" className="pmg-inv-counter" title={`Wishlist: ${wishlistCount}`}>
                <Heart size={15} aria-hidden="true" />
                <strong>{wishlistCount}</strong>
              </Link>
              <Link href="/compare" className="pmg-inv-counter" title={`Compare: ${compareCount}`}>
                <GitCompareArrows size={15} aria-hidden="true" />
                <strong>{compareCount}</strong>
              </Link>
            </div>

            <label className="pmg-inv-sort">
              <span>Sort</span>
              <select
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value);
                  setPage(1);
                }}
                aria-label={resolveText(brand, "invSortLabel")}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <p className="pmg-inv-count" aria-live="polite">
          {loading && vehicles.length === 0 ? (
            "Loading stock…"
          ) : (
            <>
              Showing <strong>{shownCount}</strong> of <strong>{total}</strong> {total === 1 ? "vehicle" : "vehicles"}
            </>
          )}
        </p>

        {showEmpty ? (
          <div className="pmg-inv-empty" role="status">
            <div className="pmg-inv-empty-icon" aria-hidden="true">
              <Search size={28} strokeWidth={1.5} />
            </div>
            <h3>{resolveText(brand, "invEmptyTitle")}</h3>
            <p>{resolveText(brand, "invEmptyBody")}</p>
            <div className="pmg-inv-empty-actions">
              <button
                type="button"
                className="pmg-btn pmg-btn-outline-dark"
                onClick={() => {
                  filters.clear();
                  clearSearch();
                }}
              >
                Clear all filters
              </button>
              <Link href="/contact" className="pmg-btn pmg-btn-primary">
                Contact the team
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div
              id="pmg-inv-grid"
              className={effectiveViewMode === "list" ? "pmg-inv-grid is-list" : "pmg-inv-grid"}
              aria-busy={loading}
            >
              {loading && vehicles.length === 0
                ? Array.from({ length: PER_PAGE }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
                : vehicles.map((vehicle, index) => {
                    const slug = vehicleSlug(vehicle);
                    const href = buildVehiclePermalink(vehicle, "/used-cars");
                    const compared = compSet.has(slug);
                    return (
                      <InventoryCard
                        key={slug || index}
                        vehicle={vehicle}
                        href={href}
                        wishlisted={wishSet.has(slug)}
                        compared={compared}
                        compareDisabled={!compared && compareCount >= MAX_COMPARE}
                        onToggleWishlist={toggleWishlist}
                        onToggleCompare={toggleCompare}
                        showDescription={effectiveViewMode === "list"}
                        priority={index < 3}
                      />
                    );
                  })}
            </div>

            {loading && vehicles.length > 0 ? <div className="pmg-inv-loading-bar" aria-hidden="true" /> : null}

            {totalPages > 1 ? (
              <nav className="pmg-inv-pagination" aria-label={resolveText(brand, "invPaginationLabel")}>
                {currentPage === 1 ? (
                  <span className="pmg-inv-pager pmg-inv-pager-nav is-disabled" aria-disabled="true">
                    <ChevronLeft size={15} aria-hidden="true" />
                    <span>Prev</span>
                  </span>
                ) : (
                  <a
                    className="pmg-inv-pager pmg-inv-pager-nav"
                    href={buildPageHref(currentPage - 1)}
                    rel="prev"
                    onClick={(e) => handlePageClick(e, currentPage - 1)}
                  >
                    <ChevronLeft size={15} aria-hidden="true" />
                    <span>Prev</span>
                  </a>
                )}

                {paginationItems.map((item, index) =>
                  item === "ellipsis" ? (
                    <span key={`e-${index}`} className="pmg-inv-pager-ellipsis" aria-hidden="true">
                      …
                    </span>
                  ) : (
                    <a
                      key={item}
                      className={item === currentPage ? "pmg-inv-pager is-active" : "pmg-inv-pager"}
                      href={buildPageHref(item)}
                      aria-current={item === currentPage ? "page" : undefined}
                      onClick={(e) => handlePageClick(e, item)}
                    >
                      {item}
                    </a>
                  ),
                )}

                {currentPage === totalPages ? (
                  <span className="pmg-inv-pager pmg-inv-pager-nav is-disabled" aria-disabled="true">
                    <span>Next</span>
                    <ChevronRight size={15} aria-hidden="true" />
                  </span>
                ) : (
                  <a
                    className="pmg-inv-pager pmg-inv-pager-nav"
                    href={buildPageHref(currentPage + 1)}
                    rel="next"
                    onClick={(e) => handlePageClick(e, currentPage + 1)}
                  >
                    <span>Next</span>
                    <ChevronRight size={15} aria-hidden="true" />
                  </a>
                )}
              </nav>
            ) : null}
          </>
        )}

        <RecentlyViewed />
      </div>

      <VehicleFiltersDrawer
        filters={filters}
        options={filtersOptions}
        config={filtersConfig}
        open={isFilterOpen}
        onClose={() => {
          filters.cancel();
          setIsFilterOpen(false);
        }}
      />
    </section>
  );
}
