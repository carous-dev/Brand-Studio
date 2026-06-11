import Script from 'next/script'
import type { ThemePageProps } from '../../../../types'
import Vehicle from '../../../components/Vehicle'
import {
  RESERVE_WIDGET_SRC,
  VEHICLE_ENQUIRY_WIDGET_SRC,
} from '../../../lib/external-widgets'

export function FbmVehicleDetailPage({ vehicle, images, similarList }: ThemePageProps) {
  if (!vehicle) {
    return <div>Vehicle not found</div>
  }

  return (
    <>
      <Script
        id="carous-vehicle-enquiry-widget"
        src={VEHICLE_ENQUIRY_WIDGET_SRC}
        strategy="afterInteractive"
      />
      <Script
        id="carous-reserve-a-car-widget"
        src={RESERVE_WIDGET_SRC}
        strategy="afterInteractive"
      />
      <Vehicle
        vehicle={vehicle}
        images={Array.isArray(images) ? images : []}
        similarList={Array.isArray(similarList) ? similarList : []}
      />
    </>
  )
}

export default FbmVehicleDetailPage
