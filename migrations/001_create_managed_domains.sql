-- Migration: 001_create_managed_domains.sql
-- Description: Create managed_domains table for domain settings

-- Create managed_domains table
CREATE TABLE IF NOT EXISTS `managed_domains` (
    `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `domain` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uniq_managed_domains_domain` (`domain`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
-- Check if index exists before creating
SET @dbname = DATABASE();
SET @tablename = 'managed_domains';
SET @indexname_status = 'idx_managed_domains_status';
SET @indexname_created = 'idx_managed_domains_created_at';

-- Create status index if it doesn't exist
SET @sql = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE 
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname_status)
  ) > 0,
  'SELECT "Status index already exists"',
  CONCAT('CREATE INDEX ', @indexname_status, ' ON ', @tablename, '(`status`)')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create created_at index if it doesn't exist
SET @sql = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE 
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (index_name = @indexname_created)
  ) > 0,
  'SELECT "Created_at index already exists"',
  CONCAT('CREATE INDEX ', @indexname_created, ' ON ', @tablename, '(`created_at`)')
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add updated_at column if it doesn't exist (for backward compatibility)
-- This handles cases where the table was created without the updated_at column
SET @dbname = DATABASE();
SET @tablename = 'managed_domains';
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE 
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
));
SET @sql = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE 
      (table_schema = @dbname)
      AND (table_name = @tablename)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT "Column already exists"',
  @preparedStatement
));
PREPARE alterIfNotExists FROM @sql;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Insert sample data (optional - uncomment if needed)
-- INSERT INTO `managed_domains` (`domain`, `description`, `status`) VALUES 
-- ('example.com', 'Example domain for testing', 'active'),
-- ('test.domain', 'Test domain for development', 'inactive');

-- Migration complete
SELECT 'Migration 001_create_managed_domains completed successfully' as message;
