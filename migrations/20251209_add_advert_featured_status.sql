-- Migration: add featured and status to advert table
-- Run this against your MySQL 8+ database

ALTER TABLE `advert`
  ADD COLUMN `featured` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN `status` ENUM('draft','publish') NOT NULL DEFAULT 'draft';

-- Optional: mark adverts with a price and an active VIN as published (simple heuristic)
-- Avoid comparing numeric DECIMAL to an empty string which can raise
-- "Truncated incorrect DECIMAL value: ''". Cast the price to CHAR
-- when checking for an empty string, and also accept non-zero numeric values.
UPDATE `advert`
SET `status` = 'publish'
WHERE (`vin` IS NOT NULL AND `vin` <> '')
  AND (
    (forecourt_price_gbp IS NOT NULL AND forecourt_price_gbp <> 0)
    OR (CAST(forecourt_price_gbp AS CHAR) <> '')
  );

-- Add indexes for fast filtering
CREATE INDEX `idx_advert_featured` ON `advert` (`featured`);
CREATE INDEX `idx_advert_status` ON `advert` (`status`);

/*
Notes:
- `featured` is a small boolean flag (TINYINT(1)). Default is 0 (not featured).
- `status` uses an ENUM with values 'draft' and 'publish' and defaults to 'draft'.
- The UPDATE above is a conservative heuristic to mark adverts with a price and VIN as published; remove or adjust if undesired.
*/
