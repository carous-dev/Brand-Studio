-- Migration: Add status column to previews table
-- Date: 2025-12-02
-- Description: Adds status column to track online/offline status for preview records

USE dealers_previews;

-- Add status column to previews table
ALTER TABLE `previews`
  ADD COLUMN `status` enum('online','offline') NOT NULL DEFAULT 'offline';

-- Add index for fast filtering by status
CREATE INDEX `idx_previews_status` ON `previews` (`status`);

/*
Notes:
- `status` uses an ENUM with values: 'online', 'offline'
- Default value is 'offline' for new records
- Index is added for efficient filtering and querying by status
- Existing records will be set to 'offline' by default
- Use 'online' for active/live previews
- Use 'offline' for inactive/disabled previews
*/
