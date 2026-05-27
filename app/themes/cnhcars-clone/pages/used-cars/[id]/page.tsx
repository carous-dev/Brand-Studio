// Vehicle detail page — brandstudio's runtime calls themed pages with
// ThemePageProps `{ brand, vehicleSlug, vehicle, images, similarList }`
// (see app/themes/page-runtime.server.tsx). The runtime PRE-FETCHES the
// vehicle from /api/vehicle and passes the normalized payload as a prop —
// we use that directly rather than re-fetching via the source app's
// `renderVehicleDetailPage` lib helper (which targeted an external Carous
// API that brandstudio doesn't host).
import VehicleDetailsView from '../../../components/VehicleDetailsView'
import { normalizeVehiclePayload } from '../../../components/vehicle-data'

type Props = {
  brand?: unknown
  vehicleSlug?: string
  vehicle?: any
  images?: string[]
  similarList?: any[]
}

export default async function VehicleDetailPage({ vehicleSlug, vehicle, images }: Props) {
  const slug = vehicleSlug || vehicle?.slug || vehicle?.reg || ''

  // brandstudio's runtime passes vehicle in its "compact" shape from
  // toCompactVehicle(). Normalize into the source app's VehicleDetailsData
  // shape so VehicleDetailsView renders without re-fetching. The normalizer
  // builds `images` ONLY from the `gallery` field (not `images`), so we
  // mirror brandstudio's images array into a `gallery` array of url objects
  // — that's the shape gallerySource expects.
  let initialVehicle: any = null
  if (vehicle) {
    const imgs: string[] = Array.isArray(images) && images.length
      ? images
      : Array.isArray(vehicle.images) && vehicle.images.length
        ? vehicle.images
        : vehicle.image
          ? [String(vehicle.image)]
          : []
    const composite = {
      ...vehicle,
      slug: vehicle.slug || slug,
      images: imgs,
      // normalizer reads from `gallery`; provide as array of {url} objects
      // (matches the source app's shape) so images flow through to the
      // rendered gallery.
      gallery: imgs.map((url, index) => ({ url, label: `Vehicle image ${index + 1}` })),
    }
    initialVehicle = normalizeVehiclePayload(composite) || composite
  }

  return <VehicleDetailsView vehicleSlug={slug} initialVehicle={initialVehicle} />
}
