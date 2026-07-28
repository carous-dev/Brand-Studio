'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildInventorySearchParams,
  DEFAULT_INVENTORY_PAGINATION,
  fetchInventoryData,
  type InventoryData,
  type InventoryFilters,
  type InventoryPagination,
} from '../lib/inventory';
import { useBrand } from '../context/BrandClientWrapper';

const INVENTORY_REQUEST_TIMEOUT_MS = 12000;

type UseInventoryOptions = {
  initialData?: InventoryData | null;
};

function getErrorMessage(error: unknown, didTimeout: boolean, hasFallbackData: boolean): string {
  if (didTimeout) {
    return hasFallbackData
      ? 'Inventory refresh timed out. Showing the latest available vehicles.'
      : 'Inventory request timed out. Please try again.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return hasFallbackData
    ? 'Inventory refresh failed. Showing the latest available vehicles.'
    : 'An error occurred while loading inventory.';
}

export function useInventory(
  filters: InventoryFilters,
  pagination: InventoryPagination = DEFAULT_INVENTORY_PAGINATION,
  options: UseInventoryOptions = {},
) {
  const { initialData = null } = options;
  const brand = useBrand();
  const brandSlug = (brand as any)?.slug || null;
  const [data, setData] = useState<InventoryData | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const dataRef = useRef<InventoryData | null>(initialData);
  const requestIdRef = useRef(0);
  const hydratedRequestKeyRef = useRef<string | null>(
    initialData ? buildInventorySearchParams(filters, pagination).toString() : null,
  );

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const requestKey = useMemo(
    () => buildInventorySearchParams(filters, pagination).toString(),
    [filters.make, filters.model, filters.year, filters.price, filters.transmission, filters.sort, pagination.page, pagination.per_page],
  );

  const refetch = useCallback(() => {
    setReloadKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (hydratedRequestKeyRef.current === requestKey && reloadKey === 0) {
      hydratedRequestKeyRef.current = null;
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    const controller = new AbortController();
    const hasExistingData = Boolean(dataRef.current);
    let didTimeout = false;

    setError(null);
    setLoading(!hasExistingData);
    setRefreshing(hasExistingData);

    const timeoutId = window.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, INVENTORY_REQUEST_TIMEOUT_MS);

    fetchInventoryData({
      filters,
      pagination,
      signal: controller.signal,
      cache: 'no-store',
      brandSlug,
    })
      .then((inventoryData) => {
        if (requestId !== requestIdRef.current) return;
        setData(inventoryData);
        setError(null);
      })
      .catch((fetchError) => {
        if (requestId !== requestIdRef.current) return;
        if (controller.signal.aborted && !didTimeout) return;

        const hasFallbackData = Boolean(dataRef.current);
        setError(getErrorMessage(fetchError, didTimeout, hasFallbackData));

        if (!hasFallbackData) {
          setData(null);
        }
      })
      .finally(() => {
        if (requestId !== requestIdRef.current) return;
        window.clearTimeout(timeoutId);
        setLoading(false);
        setRefreshing(false);
      });

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  // brandSlug intentionally included so a brand switch re-fetches the right inventory file.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination, reloadKey, requestKey, brandSlug]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
    vehicles: data?.items || [],
    totalCount: data?.meta?.total || 0,
    currentPage: data?.meta?.page || 1,
    totalPages: data?.meta?.totalPages || 1,
    perPage: data?.meta?.per_page || DEFAULT_INVENTORY_PAGINATION.per_page,
    availableMakes: data?.meta?.available?.makes || [],
    availableBodyTypes: data?.meta?.available?.body_types || [],
    stats: data?.meta?.stats || null,
  };
}
