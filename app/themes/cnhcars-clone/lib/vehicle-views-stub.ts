// No-op stub for `@carous/vehicle-views` `VehicleViewTracker`. The source
// package posts a "vehicle view" analytics ping to a carous-platform endpoint
// (DEFAULT_ANALYTICS_ENDPOINT = `/api/vehicle-views`). brandstudio doesn't
// host that endpoint, so we stub the tracker to a no-op rather than fire
// 404s into the network panel on every detail-page mount. If brandstudio
// ever ships its own analytics endpoint, replace this with a real client.
//
// The original component returns null — no DOM, no children — so the stub
// preserves the same render output.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function VehicleViewTracker(_props: any): null {
  return null
}

export default VehicleViewTracker
