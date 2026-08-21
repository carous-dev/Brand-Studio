"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Clock, GitCompareArrows, Heart } from "lucide-react";
import { countSaved, subscribeSaved } from "./saved-vehicles";
import { readRecent, subscribeRecent } from "./recently-viewed";

type Props = {
  /** Show the "recently viewed" shortcut. Default true. */
  showRecent?: boolean;
};

/**
 * Recently-viewed + wishlist + compare shortcut icons for the inventory top
 * bar. Shows live counts (hydrated in a mount effect, kept in sync via the
 * shared store events) and links to the /recently-viewed, /wishlist and
 * /compare pages.
 */
export function InventorySaveLinks({ showRecent = true }: Props) {
  const [wishlistCount, setWishlistCount] = useState(0);
  const [compareCount, setCompareCount] = useState(0);
  const [recentCount, setRecentCount] = useState(0);

  useEffect(() => {
    setWishlistCount(countSaved("wishlist"));
    setCompareCount(countSaved("compare"));
    setRecentCount(readRecent().length);
    const unWishlist = subscribeSaved("wishlist", () => setWishlistCount(countSaved("wishlist")));
    const unCompare = subscribeSaved("compare", () => setCompareCount(countSaved("compare")));
    const unRecent = subscribeRecent(() => setRecentCount(readRecent().length));
    return () => {
      unWishlist();
      unCompare();
      unRecent();
    };
  }, []);

  return (
    <div className="cg-savelinks">
      {showRecent ? (
        <Link
          href="/recently-viewed"
          className={`cg-savelink${recentCount > 0 ? " has-count" : ""}`}
          aria-label={`Recently viewed (${recentCount})`}
          title="Recently viewed"
        >
          <Clock size={16} aria-hidden="true" />
          <span className="cg-savelink-count">{recentCount}</span>
        </Link>
      ) : null}
      <Link
        href="/wishlist"
        className={`cg-savelink${wishlistCount > 0 ? " has-count" : ""}`}
        aria-label={`Wishlist (${wishlistCount} saved)`}
        title="Wishlist"
      >
        <Heart size={16} aria-hidden="true" />
        <span className="cg-savelink-count">{wishlistCount}</span>
      </Link>
      <Link
        href="/compare"
        className={`cg-savelink${compareCount > 0 ? " has-count" : ""}`}
        aria-label={`Compare (${compareCount} selected)`}
        title="Compare"
      >
        <GitCompareArrows size={16} aria-hidden="true" />
        <span className="cg-savelink-count">{compareCount}</span>
      </Link>
    </div>
  );
}
