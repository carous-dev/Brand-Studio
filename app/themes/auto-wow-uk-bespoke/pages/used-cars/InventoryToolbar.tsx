"use client";

import { useEffect, useRef, useState } from "react";
import { Combobox, type ComboboxOption } from "../../components/Combobox";
import styles from "./page.module.css";

type Props = {
  total: number;
  search: string;
  onSearchChange: (next: string) => void;
  sort: string;
  onSortChange: (next: string) => void;
};

const SORT_OPTIONS: ComboboxOption[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: lowest" },
  { value: "price-desc", label: "Price: highest" },
  { value: "mileage", label: "Mileage: lowest" },
];

const SEARCH_DEBOUNCE_MS = 450;

export function InventoryToolbar({ total, search, onSearchChange, sort, onSortChange }: Props) {
  const [localSearch, setLocalSearch] = useState(search);
  const initialMount = useRef(true);

  // Sync local state with external changes (e.g. after Clear all from drawer).
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce — only push the value up after the user pauses typing.
  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (localSearch === search) return;
    const t = window.setTimeout(() => onSearchChange(localSearch.trim()), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [localSearch, search, onSearchChange]);

  // The Combobox treats "" as the placeholder slot — surface "newest" there
  // so the default sort renders as the muted placeholder, matching firstbuymotors.
  const sortComboValue = sort === "price-desc" ? "" : sort;

  return (
    <div className={styles.invToolbar}>
      <div className={styles.invCount}>
        <span className={styles.invCountBadge}>{total.toLocaleString("en-GB")}</span>
        <span className={styles.invCountLabel}>
          {total === 1 ? "vehicle" : "vehicles"} available
        </span>
      </div>

      <form
        className={styles.invSearch}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          onSearchChange(localSearch.trim());
        }}
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
          className={styles.invSearchIcon}
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          aria-label="Search inventory"
          placeholder="Search make, model, reg…"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch ? (
          <button
            type="button"
            className={styles.invSearchClear}
            onClick={() => setLocalSearch("")}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : null}
      </form>

      <div className={styles.invSort}>
        <Combobox
          compact
          label="Sort by"
          placeholder="Newest first"
          value={sortComboValue}
          onChange={(next) => onSortChange(next || "price-desc")}
          options={SORT_OPTIONS}
        />
      </div>
    </div>
  );
}
