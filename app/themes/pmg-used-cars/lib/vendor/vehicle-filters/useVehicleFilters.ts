"use client"

import { useCallback, useMemo, useState } from "react"
import type {
  UseVehicleFiltersOptions,
  UseVehicleFiltersReturn,
  VehicleFiltersValue,
} from "./types"

const EMPTY_VALUE: VehicleFiltersValue = {
  q: "",
  make: "",
  model: "",
  body: "",
  fuel: "",
  transmission: "",
  maxPrice: "",
  minPrice: "",
  maxMileage: "",
  minYear: "",
  maxYear: "",
  sort: "",
}

const ACTIVE_COUNT_FIELDS: Array<keyof VehicleFiltersValue> = [
  "make",
  "model",
  "body",
  "fuel",
  "transmission",
  "maxPrice",
  "minPrice",
  "maxMileage",
  "minYear",
  "maxYear",
]

function fillValue(partial?: Partial<VehicleFiltersValue>): VehicleFiltersValue {
  return { ...EMPTY_VALUE, ...(partial ?? {}) }
}

/**
 * Vehicle-filters state hook. Maintains a `draft` (what the user is editing)
 * separate from `applied` (what the API request should reflect), with apply()
 * to commit and clear() / cancel() to back out.
 *
 * The hook does not own the URL or the API call — host apps wire `onApply`
 * to their existing fetch + URL-sync pipeline so we don't break per-app
 * routing conventions.
 */
export function useVehicleFilters(options: UseVehicleFiltersOptions): UseVehicleFiltersReturn {
  const initial = useMemo(() => fillValue(options.initial), [options.initial])
  const [applied, setAppliedState] = useState<VehicleFiltersValue>(initial)
  const [draft, setDraftState] = useState<VehicleFiltersValue>(initial)

  const setField = useCallback(
    <K extends keyof VehicleFiltersValue>(field: K, value: VehicleFiltersValue[K]) => {
      setDraftState((prev) => ({ ...prev, [field]: value }))
    },
    [],
  )

  const setDraft = useCallback((next: Partial<VehicleFiltersValue>) => {
    setDraftState((prev) => ({ ...prev, ...next }))
  }, [])

  const setApplied = useCallback((next: Partial<VehicleFiltersValue>) => {
    setAppliedState((prev) => ({ ...prev, ...next }))
  }, [])

  const apply = useCallback(() => {
    setDraftState((currentDraft) => {
      setAppliedState(currentDraft)
      options.onApply?.(currentDraft)
      return currentDraft
    })
  }, [options])

  const clear = useCallback(() => {
    setDraftState(EMPTY_VALUE)
    setAppliedState(EMPTY_VALUE)
    options.onApply?.(EMPTY_VALUE)
    options.onClear?.()
  }, [options])

  const cancel = useCallback(() => {
    setDraftState(applied)
  }, [applied])

  const activeCount = useMemo(
    () => ACTIVE_COUNT_FIELDS.reduce((sum, field) => (applied[field] ? sum + 1 : sum), 0),
    [applied],
  )

  return {
    applied,
    draft,
    activeCount,
    setField,
    setDraft,
    setApplied,
    apply,
    clear,
    cancel,
  }
}
