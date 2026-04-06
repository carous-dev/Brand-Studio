-- Migration: Add stock_status column to advert table
-- Date: 2025-12-13
-- Description: Adds stock_status enum column to track vehicle availability (in_stock, sold, reserved, pending, withdrawn)

USE kain_motors;

-- Add stock_status column to advert table
ALTER TABLE `advert`
  ADD COLUMN `stock_status` enum('in_stock','sold','reserved','pending','withdrawn') NOT NULL DEFAULT 'in_stock' AFTER `status`;

-- Add index for fast filtering by stock status
CREATE INDEX `idx_advert_stock_status` ON `advert` (`stock_status`);

/*
Notes:
- `stock_status` uses an ENUM with values: 'in_stock', 'sold', 'reserved', 'pending', 'withdrawn'
- Default value is 'in_stock' for new records
- Index is added for efficient filtering and querying
- Existing records will be set to 'in_stock' by default
*/