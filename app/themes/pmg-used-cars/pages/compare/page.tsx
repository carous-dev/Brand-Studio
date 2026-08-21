import type { Metadata } from "next";
import { SavedVehiclesView } from "@/app/themes/pmg-used-cars/lib/vendor/garage";
import "@/app/themes/pmg-used-cars/lib/vendor/garage/styles.css";
import "../saved.css";

export const metadata: Metadata = {
  title: { absolute: "Compare Vehicles | PMG Used Car Sales" },
  description:
    "Compare the used cars you've shortlisted at PMG Used Car Sales side by side. Your list is stored on this device.",
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return (
    <div className="pmg-saved">
      <div className="pmg-shell">
        <SavedVehiclesView mode="compare" />
      </div>
    </div>
  );
}
