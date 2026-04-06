let inventoryPromise: Promise<any[]> | null = null;

export function getInventory(opts: { force?: boolean; page?: number; per_page?: number } = {}): Promise<any[]> {
  const { force = false, page = 1, per_page = 100 } = opts;
  // If caller explicitly asks to force a refresh, clear the cached promise
  if (!inventoryPromise || force) {
    const qp = `?page=${encodeURIComponent(page)}&per_page=${encodeURIComponent(per_page)}`;
    inventoryPromise = fetch('/api/inventory' + qp, { cache: 'no-cache' })
      .then(res => {
        if (!res.ok) throw new Error('inventory fetch failed');
        return res.json();
      })
      .then(payload => {
        // API returns { items, meta }
        if (!payload || !Array.isArray(payload.items)) throw new Error('invalid inventory payload');
        return payload.items;
      })
      .catch(err => {
        inventoryPromise = null;
        throw err;
      });
  }

  return inventoryPromise;
}
