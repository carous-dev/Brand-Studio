import { GitCompareArrows, Heart, LayoutGrid, Rows3, Search, SlidersHorizontal } from "lucide-react";
import { PER_PAGE } from "./_lib/types";
import "./inventory.css";

/** Card skeleton — identical markup/dimensions to the client SkeletonCard so the
 *  route fallback and the live grid occupy the same space (no layout shift). */
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

/**
 * Route-level fallback shown while the server fetches the first page. It mirrors
 * the real page's chrome 1:1 — same hero (incl. stat strip), same toolbar, same
 * count line, same grid wrappers — so when the data resolves the layout stays
 * put instead of shoving the grid down.
 */
export default function Loading() {
  return (
    <main className="pmg-inv-page" aria-busy="true">
      <section className="pmg-inv-hero">
        <div className="pmg-shell pmg-inv-hero-inner">
          <p className="pmg-inv-hero-eyebrow">Current stock</p>
          <h1 className="pmg-inv-hero-title">
            Quality used cars. <em>Zero pressure.</em>
          </h1>
          <p className="pmg-inv-hero-lead">
            Every car health-checked, valeted and prepared to a high standard — honest advice, no
            pressure. View it, drive it, sleep on it.
          </p>
          <div className="pmg-inv-hero-stats" aria-hidden="true">
            <span className="pmg-inv-hero-stat">
              <strong>&nbsp;</strong> in stock
            </span>
            <span className="pmg-inv-hero-divider" />
            <span className="pmg-inv-hero-stat">
              <strong>4.5</strong>
              <small>/5</small> Feefo
            </span>
            <span className="pmg-inv-hero-divider" />
            <span className="pmg-inv-hero-stat">
              <strong>30mi</strong> free delivery
            </span>
          </div>
        </div>
      </section>

      <div className="pmg-shell">
        <section className="pmg-inv" aria-label="Vehicle inventory">
          <div className="pmg-inv-shell">
            <div className="pmg-inv-toolbar" aria-hidden="true">
              <div className="pmg-inv-toolbar-lead">
                <span className="pmg-inv-filter-btn">
                  <SlidersHorizontal size={16} />
                  <span>Filters</span>
                </span>
                <div className="pmg-inv-search">
                  <Search size={16} />
                  <input type="search" placeholder="Search make, model or keyword" disabled />
                </div>
              </div>

              <div className="pmg-inv-toolbar-controls">
                <div className="pmg-inv-view">
                  <span className="pmg-inv-view-btn is-active">
                    <LayoutGrid size={15} />
                    <span className="pmg-inv-view-label">Grid</span>
                  </span>
                  <span className="pmg-inv-view-btn">
                    <Rows3 size={15} />
                    <span className="pmg-inv-view-label">List</span>
                  </span>
                </div>

                <div className="pmg-inv-counters">
                  <span className="pmg-inv-counter">
                    <Heart size={15} />
                    <strong>0</strong>
                  </span>
                  <span className="pmg-inv-counter">
                    <GitCompareArrows size={15} />
                    <strong>0</strong>
                  </span>
                </div>

                <label className="pmg-inv-sort">
                  <span>Sort</span>
                  <select disabled defaultValue="newest" aria-hidden="true">
                    <option value="newest">Newest first</option>
                  </select>
                </label>
              </div>
            </div>

            <p className="pmg-inv-count">Loading stock…</p>

            <div className="pmg-inv-grid" aria-hidden="true">
              {Array.from({ length: PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
