import type { ThemePageProps } from '../../../types'
import InventoryHero from '../../components/InventoryHero'
import Inventory from '../../components/Inventory'
import '../../styles/used.css'

export async function GildedUsedCarsPage(props: ThemePageProps) {
  return (
    <main className="used-page">
      <InventoryHero />
      <Inventory items={Array.isArray(props.initialInventory) ? props.initialInventory : []} />
    </main>
  )
}

export default GildedUsedCarsPage
