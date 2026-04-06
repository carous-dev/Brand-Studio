import type { ThemePageProps } from '../../../../types'
import Vehicle from '../../../components/Vehicle'

export function GildedVehicleDetailPage({ vehicle, images, similarList }: ThemePageProps) {
  if (!vehicle) {
    return <div>Vehicle not found</div>
  }

  return (
    <Vehicle
      vehicle={vehicle}
      images={Array.isArray(images) ? images : []}
      similarList={Array.isArray(similarList) ? similarList : []}
    />
  )
}

export default GildedVehicleDetailPage
