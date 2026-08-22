/**
 * Vendored subset of `@carous/dealer-shell` for the pmg-used-cars theme.
 *
 * Only the self-contained pieces the theme actually consumes are vendored:
 *  - vehicle payload normaliser (normalizeVehiclePayload / extractVideoUrl)
 *  - shared TypeScript contracts (types.ts, incl. NormalizedVehicle)
 *  - CDN external-widget client helpers (external-widgets.ts)
 *
 * The heavier shell components (DealerLayoutShell, DealerWidgetScripts,
 * VehicleDetailsShell) and the @carous/intent-capture re-exports from the
 * upstream barrel are intentionally NOT vendored.
 */

export * from "./types";
export { normalizeVehiclePayload, extractVideoUrl } from "./vehicle-data";
export {
  openExternalReservation,
  openExternalVehicleEnquiry,
  useExternalVehicleGallery,
  useExternalWhatsAppEnquiryScope,
  WIDGETS_BASE_URL,
  VEHICLE_GALLERY_WIDGET_SRC,
  VEHICLE_ENQUIRY_WIDGET_SRC,
  RESERVE_WIDGET_SRC,
  type ExternalVehicleEnquirySummary,
  type ExternalWhatsAppEnquirySubject,
} from "./external-widgets";
