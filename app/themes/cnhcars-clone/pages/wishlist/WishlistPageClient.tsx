'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import VehicleCard from '../../components/VehicleCard';
import { useWishlist, type WishlistItem } from '../../context/WishlistContext';
import '../../styles/inventory.css';
import '../../styles/inventory-bg.css';
import '../../styles/vehicle-card.css';
import '../../styles/wishlist.css';

const toVehicleCardModel = (item: WishlistItem) => ({
  reg: item.reg || item.id,
  make: item.make,
  model: item.model,
  derivative: item.derivative,
  year: item.year || new Date().getFullYear(),
  price: item.price || 0,
  mileage: item.mileage || 0,
  trans: item.trans || 'N/A',
  fuel: item.fuel || 'N/A',
  image: item.image || '/images/placeholder.png',
  slug: item.slug
});

export default function WishlistPageClient() {
  const { items, count, clearWishlist } = useWishlist();

  return (
    <main className="inventory-page wishlist-page">
      <section className="inventory-container">
        <div className="inventory-content container">
          <div className="wishlist-header">
            <div>
              <h1>My Wishlist</h1>
              <p>{count} saved vehicle{count === 1 ? '' : 's'}.</p>
            </div>
            {count > 0 && (
              <button type="button" className="wishlist-clear-btn" onClick={clearWishlist}>
                Clear Wishlist
              </button>
            )}
          </div>

          {count === 0 ? (
            <div className="empty-state">
              <div className="empty-state-content">
                <div className="empty-state-icon">
                  <Heart size={24} />
                </div>
                <h3>Your wishlist is empty</h3>
                <p>Tap the heart icon on any vehicle to save it here.</p>
                <Link href="/used-cars/" className="wishlist-browse-btn">
                  Browse Inventory
                </Link>
              </div>
            </div>
          ) : (
            <div className="cars-grid" id="wishlist-grid">
              {items.map((item) => (
                <VehicleCard key={item.id} vehicle={toVehicleCardModel(item)} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
