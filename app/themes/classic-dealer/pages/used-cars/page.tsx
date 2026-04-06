import { cookies } from 'next/headers'
import type { ThemePageProps } from '../../../types'
import InventoryHero from '../../components/InventoryHero'
import Inventory from '../../components/Inventory'

const INVENTORY_VIEW_MODE_COOKIE_KEY = 'vp_inventory_view_mode'

export async function ClassicUsedCarsPage(props: ThemePageProps) {
  const cookieStore = await cookies()
  const initialViewMode = cookieStore.get(INVENTORY_VIEW_MODE_COOKIE_KEY)?.value === 'list' ? 'list' : 'grid'

  return (
    <main className="used-page">
      <InventoryHero />
      <Inventory items={Array.isArray(props.initialInventory) ? props.initialInventory : []} initialViewMode={initialViewMode} />
    </main>
  )
}

export default ClassicUsedCarsPage
