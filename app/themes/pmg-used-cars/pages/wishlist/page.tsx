import type { Metadata } from "next";
import { SavedVehiclesView } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import "@/app/themes/pmg-used-cars/lib/vendor/garage/styles.css";
import "../saved.css";

export const metadata: Metadata = {
  title: { absolute: "Your Wishlist | PMG Used Car Sales" },
  description:
    "The vehicles you've saved at PMG Used Car Sales. Your wishlist is stored on this device.",
  robots: { index: false, follow: false },
};

export default function WishlistPage() {
  return (
    <div className="pmg-saved">
      <div className="pmg-shell">
        <SavedVehiclesView mode="wishlist" />
      </div>
    </div>
  );
}
