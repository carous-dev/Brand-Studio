-- Migration: add derivative_slug to vehicle for fast permalink lookup
-- Run this against your MySQL 8+ database

ALTER TABLE `vehicle`
  ADD COLUMN `derivative_slug` VARCHAR(255) NULL;

-- Populate existing rows by normalizing the derivative into a slug-like token
UPDATE `vehicle`
SET derivative_slug = TRIM(BOTH '-' FROM LOWER(REGEXP_REPLACE(COALESCE(derivative, ''), '[^a-z0-9]+', '-')))
WHERE derivative IS NOT NULL AND derivative <> '';

-- Add an index to make lookups by slug fast
CREATE INDEX `idx_vehicle_derivative_slug` ON `vehicle` (`derivative_slug`);
