import { apiUrl } from '../lib/api'
import { normalizeInventoryItem, type InventoryVehicle } from '../lib/inventory'
import { getBrandSlugFromRequest } from '../lib/brand-slug.server'
import styles from './DirectorySection.module.css'

const INVENTORY_PAGE_SIZE = 200

type InventoryMeta = {
  totalPages?: number
  available?: {
    makes?: string[]
  }
}

type InventoryPayload = {
  items?: unknown[]
  meta?: InventoryMeta
}

function normalizeLabel(value: unknown) {
  return String(value || '').trim()
}

async function fetchInventoryPage(page: number) {
  const brand = await getBrandSlugFromRequest()
  const brandQuery = brand ? `&brand=${encodeURIComponent(brand)}` : ''
  const response = await fetch(
    apiUrl(`/inventory?page=${page}&per_page=${INVENTORY_PAGE_SIZE}&light=1&vehicle_type=car&stock_status=in_stock${brandQuery}`),
    { cache: 'no-store' }
  )

  if (!response.ok) {
    return { items: [] as unknown[], meta: {} as InventoryMeta }
  }

  const payload = (await response.json()) as InventoryPayload
  return {
    items: Array.isArray(payload?.items) ? payload.items : [],
    meta: payload?.meta ?? {},
  }
}

export async function fetchInventoryMakes(): Promise<string[]> {
  const firstPage = await fetchInventoryPage(1)
  const availableMakes = Array.isArray(firstPage.meta?.available?.makes)
    ? firstPage.meta.available.makes.map(normalizeLabel).filter(Boolean)
    : []

  if (availableMakes.length) {
    return Array.from(new Set(availableMakes)).sort((left, right) => left.localeCompare(right))
  }

  const totalPages = Math.max(1, Number(firstPage.meta?.totalPages || 1))
  const allItems = [...firstPage.items]

  for (let page = 2; page <= totalPages; page += 1) {
    const nextPage = await fetchInventoryPage(page)
    allItems.push(...nextPage.items)
  }

  const makes = allItems
    .map((item) => normalizeInventoryItem(item))
    .filter((vehicle): vehicle is InventoryVehicle => Boolean(vehicle))
    .map((vehicle) => normalizeLabel(vehicle.make))
    .filter(Boolean)

  return Array.from(new Set(makes)).sort((left, right) => left.localeCompare(right))
}

export default function DirectorySection({
  items = [],
  brandName,
  county,
}: {
  items?: string[]
  brandName?: string
  county?: string
}) {
  if (!items.length) {
    return null
  }

  const region = county || 'Berkshire'
  const dealershipName = brandName || 'Springalls Car Sales'

  return (
    <section className={styles.section} aria-labelledby="directory-title" data-aos="fade-up">
      <div className={styles.inner}>
        <h2 id="directory-title" className={styles.title}>Vehicles for Sale in {region}</h2>
        <p className={styles.subtitle}>
          Browse the makes currently in stock at {dealershipName}. Updated automatically from live inventory.
        </p>
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={item}>
              <a className={styles.link} href={`/used-cars?make=${encodeURIComponent(item)}`}>
                {item} for sale in {region}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
