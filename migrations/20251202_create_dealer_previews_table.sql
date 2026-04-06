-- Migration: Create dealer_previews table with status column
-- Date: 2025-12-02
-- Description: Creates the dealer_previews table to track dealer preview records with status tracking

USE dealers_previews;

-- Create dealer_previews table
CREATE TABLE IF NOT EXISTS `dealer_previews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dealer_id` varchar(50) NOT NULL,
  `dealer_name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `domain` varchar(255) DEFAULT NULL,
  `brand_config` json DEFAULT NULL,
  `logo` varchar(500) DEFAULT NULL,
  `favicon` varchar(500) DEFAULT NULL,
  `hero_image` varchar(500) DEFAULT NULL,
  `inventory` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','pending','suspended') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_dealer_id` (`dealer_id`),
  UNIQUE KEY `unique_slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Add foreign key constraint to auth_users if it exists
ALTER TABLE `dealer_previews` 
  ADD CONSTRAINT `fk_dealer_previews_created_by` 
  FOREIGN KEY (`created_by`) 
  REFERENCES `auth_users` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

/*
Notes:
- `status` uses an ENUM with values: 'active', 'inactive', 'pending', 'suspended'
- Default status is 'pending' for new dealer preview records
- Added indexes for efficient filtering by status and creation date
- Foreign key constraint links to auth_users table for tracking who created the record
- JSON field `brand_config` stores the complete brand configuration
- File paths (logo, favicon, hero_image, inventory) store relative paths to assets
- Both dealer_id and slug are unique to prevent duplicates
- updated_at automatically updates on record modification
*/
