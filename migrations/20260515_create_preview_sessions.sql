-- Migration: Create preview_sessions table for dealer preview view-time gating
-- Date: 2026-05-15

USE dealers_previews;

CREATE TABLE IF NOT EXISTS `preview_sessions` (
  `id` varchar(36) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `started_at` datetime NOT NULL,
  `last_heartbeat_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `elapsed_seconds` int NOT NULL DEFAULT 0,
  `status` enum('active','locked','ended') NOT NULL DEFAULT 'active',
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(512) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_preview_sessions_slug` (`slug`),
  KEY `idx_preview_sessions_status` (`status`),
  KEY `idx_preview_sessions_last_heartbeat` (`last_heartbeat_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
