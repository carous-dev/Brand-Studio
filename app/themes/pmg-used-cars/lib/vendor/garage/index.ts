// Store logic (SSR-safe, localStorage-backed, fleet-standard `vp-` keys).
export {
  readSaved,
  countSaved,
  isSaved,
  toggleSaved,
  removeSaved,
  clearSaved,
  subscribeSaved,
  WISHLIST_PREFIX,
  COMPARE_PREFIX,
  WISHLIST_EVENT,
  COMPARE_EVENT,
  MAX_COMPARE,
  type SavedVehicle,
  type SavedKind,
} from "./saved-vehicles";

export {
  readRecent,
  recordRecent,
  clearRecent,
  subscribeRecent,
  RECENT_KEY,
  RECENT_EVENT,
  MAX_RECENT,
} from "./recently-viewed";

// Email-capture over the wishlist → price-drop / stock alerts.
export { GarageAlerts, GARAGE_ALERT_KEY, GARAGE_ALERT_EVENT, type GarageAlertPref } from "./GarageAlerts";

// Themeable presentation (brand via the `--cg-*` CSS variables in styles.css).
export { VehicleSaveButtons } from "./VehicleSaveButtons";
export { InventorySaveLinks } from "./InventorySaveLinks";
export { SavedVehiclesView } from "./SavedVehiclesView";
export { RecentlyViewed } from "./RecentlyViewed";
export { RecentlyViewedView } from "./RecentlyViewedView";
export { RecordRecentlyViewed } from "./RecordRecentlyViewed";
