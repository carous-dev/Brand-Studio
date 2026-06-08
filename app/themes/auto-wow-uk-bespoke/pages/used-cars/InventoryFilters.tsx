"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Combobox, type ComboboxOption } from "../../components/Combobox";
import styles from "./page.module.css";

const PRICE_BUCKETS = [
  500, 1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000, 100000,
];

const MILEAGE_BUCKETS = [
  5000, 10000, 20000, 30000, 50000, 75000, 100000, 125000, 150000, 200000,
];

function buildPriceOptions(): ComboboxOption[] {
  return PRICE_BUCKETS.map((v) => ({ value: String(v), label: `£${v.toLocaleString("en-GB")}` }));
}

function buildMileageOptions(): ComboboxOption[] {
  return MILEAGE_BUCKETS.map((v) => ({
    value: String(v),
    label: `${v.toLocaleString("en-GB")} miles`,
  }));
}

function buildYearOptions(yearMax?: number): ComboboxOption[] {
  const current = yearMax && yearMax > 0 ? yearMax : new Date().getFullYear();
  const years: ComboboxOption[] = [];
  for (let y = current; y >= current - 30; y -= 1) {
    years.push({ value: String(y), label: String(y) });
  }
  return years;
}

type Props = {
  // Active filter state (string-coerced) used by chip groups + combos.
  make: string;
  body: string;
  fuel: string;
  transmission: string;
  // Range state (numbers); empty/`bounds` value means "any".
  minPrice: number;
  maxPrice: number;
  minYear: number;
  maxYear: number;
  maxMileage: string;
  // Setters wired straight back to UsedCarsClient state.
  setMake: (v: string) => void;
  setBody: (v: string) => void;
  setFuel: (v: string) => void;
  setTransmission: (v: string) => void;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;
  setMinYear: (v: number) => void;
  setMaxYear: (v: number) => void;
  setMaxMileage: (v: string) => void;
  // Available options + bounds.
  availableMakes: string[];
  availableBodies: string[];
  availableFuels: string[];
  availableTransmissions: string[];
  priceBounds: { min: number; max: number };
  yearBounds: { min: number; max: number };
  // Reset action — UsedCarsClient already exposes this.
  onClearAll: () => void;
};

export function InventoryFilters({
  make,
  body,
  fuel,
  transmission,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
  maxMileage,
  setMake,
  setBody,
  setFuel,
  setTransmission,
  setMinPrice,
  setMaxPrice,
  setMinYear,
  setMaxYear,
  setMaxMileage,
  availableMakes,
  availableBodies,
  availableFuels,
  availableTransmissions,
  priceBounds,
  yearBounds,
  onClearAll,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const makeOptions = useMemo<ComboboxOption[]>(
    () => availableMakes.map((m) => ({ value: m, label: m })),
    [availableMakes],
  );
  const bodyOptions = useMemo<ComboboxOption[]>(
    () => availableBodies.map((b) => ({ value: b, label: b })),
    [availableBodies],
  );
  const priceOptions = useMemo(buildPriceOptions, []);
  const mileageOptions = useMemo(buildMileageOptions, []);
  const yearOptions = useMemo(() => buildYearOptions(yearBounds.max), [yearBounds.max]);

  // Active filter count — drives the trigger badge + "Clear (N)" CTA.
  const activeCount = useMemo(() => {
    let n = 0;
    if (make && make !== "All") n += 1;
    if (body && body !== "All") n += 1;
    if (fuel && fuel !== "All") n += 1;
    if (transmission && transmission !== "All") n += 1;
    if (priceBounds.max > 0) {
      if (minPrice > priceBounds.min) n += 1;
      if (maxPrice < priceBounds.max) n += 1;
    }
    if (yearBounds.max > 0) {
      if (minYear > yearBounds.min) n += 1;
      if (maxYear < yearBounds.max) n += 1;
    }
    if (maxMileage) n += 1;
    return n;
  }, [
    make,
    body,
    fuel,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxMileage,
    priceBounds,
    yearBounds,
  ]);

  // String-coerced setters for Combobox inputs that read/write strings only.
  const handleMinPrice = useCallback(
    (v: string) => setMinPrice(v ? Number(v) : priceBounds.min),
    [setMinPrice, priceBounds.min],
  );
  const handleMaxPrice = useCallback(
    (v: string) => setMaxPrice(v ? Number(v) : priceBounds.max),
    [setMaxPrice, priceBounds.max],
  );
  const handleMinYear = useCallback(
    (v: string) => setMinYear(v ? Number(v) : yearBounds.min),
    [setMinYear, yearBounds.min],
  );
  const handleMaxYear = useCallback(
    (v: string) => setMaxYear(v ? Number(v) : yearBounds.max),
    [setMaxYear, yearBounds.max],
  );
  const handleMaxMileage = useCallback((v: string) => setMaxMileage(v), [setMaxMileage]);

  // For combos, "All" maps to empty string (placeholder shown).
  const makeValue = make && make !== "All" ? make : "";
  const bodyValue = body && body !== "All" ? body : "";

  const minPriceValue = minPrice > priceBounds.min ? String(minPrice) : "";
  const maxPriceValue =
    priceBounds.max > 0 && maxPrice < priceBounds.max ? String(maxPrice) : "";
  const minYearValue = minYear > yearBounds.min ? String(minYear) : "";
  const maxYearValue = yearBounds.max > 0 && maxYear < yearBounds.max ? String(maxYear) : "";

  const transmissionChips: ChipOption[] = useMemo(
    () => [
      { value: "All", label: "Any" },
      ...availableTransmissions.map((t) => ({ value: t, label: t })),
    ],
    [availableTransmissions],
  );

  const fuelChips: ChipOption[] = useMemo(
    () => [{ value: "All", label: "Any" }, ...availableFuels.map((f) => ({ value: f, label: f }))],
    [availableFuels],
  );

  const handleClearAll = useCallback(() => {
    onClearAll();
  }, [onClearAll]);

  const body_ui = (
    <div className={styles.invFilterBody}>
      <div className={styles.invFilterHead}>
        {activeCount > 0 ? (
          <button type="button" className={styles.invFilterClear} onClick={handleClearAll}>
            Clear ({activeCount})
          </button>
        ) : (
          <span className={styles.invFilterTitle}>Filters</span>
        )}
        <button
          type="button"
          className={styles.invFilterClose}
          aria-label="Close filters"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
      </div>

      {transmissionChips.length > 1 ? (
        <fieldset className={styles.invGroup}>
          <legend className={styles.srOnly}>Transmission</legend>
          <ChipGroup
            name="transmission"
            value={transmission || "All"}
            onChange={setTransmission}
            options={transmissionChips}
          />
        </fieldset>
      ) : null}

      <div className={styles.invGroup}>
        {makeOptions.length > 0 ? (
          <Combobox
            compact
            label="Make"
            placeholder="Make"
            value={makeValue}
            onChange={(v) => setMake(v || "All")}
            options={makeOptions}
          />
        ) : null}
        {bodyOptions.length > 0 ? (
          <Combobox
            compact
            label="Body type"
            placeholder="Body type"
            value={bodyValue}
            onChange={(v) => setBody(v || "All")}
            options={bodyOptions}
          />
        ) : null}
      </div>

      <div className={styles.invGroup}>
        <SelectPair
          minLabel="Min price"
          minPlaceholder="Min £"
          minValue={minPriceValue}
          onMinChange={handleMinPrice}
          maxLabel="Max price"
          maxPlaceholder="Max £"
          maxValue={maxPriceValue}
          onMaxChange={handleMaxPrice}
          options={priceOptions}
        />
        <SelectPair
          minLabel="From year"
          minPlaceholder="From"
          minValue={minYearValue}
          onMinChange={handleMinYear}
          maxLabel="To year"
          maxPlaceholder="To"
          maxValue={maxYearValue}
          onMaxChange={handleMaxYear}
          options={yearOptions}
        />
        <Combobox
          compact
          label="Max mileage"
          placeholder="Max mileage"
          value={maxMileage}
          onChange={handleMaxMileage}
          options={mileageOptions}
        />
      </div>

      {fuelChips.length > 1 ? (
        <fieldset className={styles.invGroup}>
          <legend className={styles.srOnly}>Fuel type</legend>
          <ChipGroup name="fuel" value={fuel || "All"} onChange={setFuel} options={fuelChips} />
        </fieldset>
      ) : null}
    </div>
  );

  return (
    <>
      <button
        type="button"
        className={styles.invFilterTrigger}
        onClick={() => setOpen(true)}
        aria-label={`Open filters${activeCount > 0 ? ` (${activeCount} active)` : ""}`}
        aria-expanded={open}
        aria-controls="aw-inventory-filter-panel"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
        <span>Filters</span>
        {activeCount > 0 ? (
          <span className={styles.invFilterTriggerCount}>{activeCount}</span>
        ) : null}
      </button>

      <aside
        id="aw-inventory-filter-panel"
        className={`${styles.invFilter}${open ? ` ${styles.invFilterOpen}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter inventory"
        aria-hidden={!open}
      >
        {body_ui}
      </aside>
      {open ? (
        <div
          className={styles.invFilterScrim}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

type ChipOption = { value: string; label: string };

function ChipGroup({
  name,
  value,
  options,
  onChange,
}: {
  name: string;
  value: string;
  options: ChipOption[];
  onChange: (next: string) => void;
}) {
  return (
    <div className={styles.invChips} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value || "__any__"}
            type="button"
            role="radio"
            aria-checked={selected}
            className={`${styles.invChip}${selected ? ` ${styles.invChipSelected}` : ""}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type SelectPairProps = {
  minLabel: string;
  minPlaceholder: string;
  minValue: string;
  onMinChange: (next: string) => void;
  maxLabel: string;
  maxPlaceholder: string;
  maxValue: string;
  onMaxChange: (next: string) => void;
  options: ComboboxOption[];
};

function SelectPair({
  minLabel,
  minPlaceholder,
  minValue,
  onMinChange,
  maxLabel,
  maxPlaceholder,
  maxValue,
  onMaxChange,
  options,
}: SelectPairProps) {
  return (
    <div className={styles.invRange}>
      <div className={styles.invRangeCell}>
        <Combobox
          compact
          label={minLabel}
          placeholder={minPlaceholder}
          value={minValue}
          onChange={onMinChange}
          options={options}
        />
      </div>
      <span className={styles.invRangeSep} aria-hidden="true">
        —
      </span>
      <div className={styles.invRangeCell}>
        <Combobox
          compact
          label={maxLabel}
          placeholder={maxPlaceholder}
          value={maxValue}
          onChange={onMaxChange}
          options={options}
        />
      </div>
    </div>
  );
}
