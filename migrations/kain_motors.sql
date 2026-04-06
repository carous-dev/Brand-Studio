-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 09, 2025 at 09:54 PM
-- Server version: 8.4.3
-- PHP Version: 8.4.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `am_car_sales`
--

-- --------------------------------------------------------

--
-- Table structure for table `advert`
--

CREATE TABLE `advert` (
  `advert_id` varchar(50) NOT NULL,
  `vin` varchar(17) NOT NULL,
  `advertiser_id` varchar(50) NOT NULL,
  `forecourt_price_gbp` decimal(10,2) DEFAULT NULL,
  `supplied_price_gbp` decimal(10,2) DEFAULT NULL,
  `attention_grabber` varchar(255) DEFAULT NULL,
  `price_indicator_rating` varchar(50) DEFAULT NULL,
  `manufacturer_approved` tinyint(1) DEFAULT NULL,
  `twelve_months_mot` tinyint(1) DEFAULT NULL,
  `lifecycle_state` varchar(50) DEFAULT NULL,
  `date_on_forecourt` date DEFAULT NULL,
  `last_updated` datetime DEFAULT NULL,
  `featured` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('draft','publish') NOT NULL DEFAULT 'draft',
  `stock_status` enum('in_stock','sold','reserved','pending','withdrawn') NOT NULL DEFAULT 'in_stock'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `advertiser`
--

CREATE TABLE `advertiser` (
  `advertiser_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `segment` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address_line_one` varchar(100) DEFAULT NULL,
  `town` varchar(100) DEFAULT NULL,
  `region` varchar(100) DEFAULT NULL,
  `post_code` varchar(20) DEFAULT NULL,
  `latitude` decimal(9,6) DEFAULT NULL,
  `longitude` decimal(9,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feature`
--

CREATE TABLE `feature` (
  `feature_id` int UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `make`
--

CREATE TABLE `make` (
  `make_id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_tag`
--

CREATE TABLE `media_tag` (
  `tag_id` int UNSIGNED NOT NULL,
  `label` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `media_to_tag`
--

CREATE TABLE `media_to_tag` (
  `media_id` varchar(50) NOT NULL,
  `tag_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `model`
--

CREATE TABLE `model` (
  `model_id` int UNSIGNED NOT NULL,
  `make_id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_event`
--

CREATE TABLE `stock_event` (
  `event_id` varchar(50) NOT NULL,
  `advert_id` varchar(50) NOT NULL,
  `time` datetime NOT NULL,
  `type` varchar(50) NOT NULL,
  `client_id` varchar(50) DEFAULT NULL,
  `stock_event_source` varchar(50) DEFAULT NULL,
  `version_number` int UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle`
--

CREATE TABLE `vehicle` (
  `vin` varchar(17) NOT NULL,
  `registration` varchar(20) NOT NULL,
  `engine_number` varchar(50) DEFAULT NULL,
  `make_id` int UNSIGNED DEFAULT NULL,
  `model_id` int UNSIGNED DEFAULT NULL,
  `generation` varchar(100) DEFAULT NULL,
  `derivative` varchar(255) DEFAULT NULL,
  `trim` varchar(50) DEFAULT NULL,
  `body_type` varchar(50) DEFAULT NULL,
  `fuel_type` varchar(50) DEFAULT NULL,
  `transmission_type` varchar(50) DEFAULT NULL,
  `drivetrain` varchar(50) DEFAULT NULL,
  `emission_class` varchar(50) DEFAULT NULL,
  `colour` varchar(50) DEFAULT NULL,
  `ownership_condition` varchar(10) DEFAULT NULL,
  `seats` tinyint UNSIGNED DEFAULT NULL,
  `doors` tinyint UNSIGNED DEFAULT NULL,
  `cylinders` tinyint UNSIGNED DEFAULT NULL,
  `engine_capacity_cc` smallint UNSIGNED DEFAULT NULL,
  `engine_power_bhp` smallint UNSIGNED DEFAULT NULL,
  `co2_emission_gpkm` smallint UNSIGNED DEFAULT NULL,
  `odometer_reading_miles` int UNSIGNED DEFAULT NULL,
  `first_registration_date` date DEFAULT NULL,
  `year_of_manufacture` year DEFAULT NULL,
  `vehicle_excise_duty_gbp` decimal(6,2) DEFAULT NULL,
  `length_mm` smallint UNSIGNED DEFAULT NULL,
  `height_mm` smallint UNSIGNED DEFAULT NULL,
  `width_mm` smallint UNSIGNED DEFAULT NULL,
  `boot_space_seats_up_litres` smallint UNSIGNED DEFAULT NULL,
  `boot_space_seats_down_litres` smallint UNSIGNED DEFAULT NULL,
  `fuel_economy_nedc_combined_mpg` decimal(5,2) DEFAULT NULL,
  `description` text,
  `derivative_slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_check`
--

CREATE TABLE `vehicle_check` (
  `vin` varchar(17) NOT NULL,
  `insurance_writeoff_category` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_feature`
--

CREATE TABLE `vehicle_feature` (
  `vin` varchar(17) NOT NULL,
  `feature_id` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_history`
--

CREATE TABLE `vehicle_history` (
  `vin` varchar(17) NOT NULL,
  `scrapped` tinyint(1) NOT NULL DEFAULT '0',
  `stolen` tinyint(1) NOT NULL DEFAULT '0',
  `imported` tinyint(1) NOT NULL DEFAULT '0',
  `exported` tinyint(1) NOT NULL DEFAULT '0',
  `previous_owners_count` tinyint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_media`
--

CREATE TABLE `vehicle_media` (
  `media_id` varchar(50) NOT NULL,
  `vin` varchar(17) NOT NULL,
  `href` varchar(512) NOT NULL,
  `source` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
--
-- Chat persistence tables (conversations and messages)
--

CREATE TABLE `chat_conversation` (
  `conversation_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `visitor_id` varchar(128) NOT NULL,
  `agent_id` varchar(128) DEFAULT NULL,
  `status` enum('open','closed','pending') NOT NULL DEFAULT 'open',
  `last_active` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`),
  KEY `idx_chat_visitor` (`visitor_id`),
  KEY `idx_chat_last_active` (`last_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `chat_message` (
  `message_id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `conversation_id` bigint UNSIGNED NOT NULL,
  `sender` enum('visitor','agent','system') NOT NULL,
  `sender_id` varchar(128) DEFAULT NULL,
  `client_message_id` varchar(128) DEFAULT NULL,
  `text` text,
  `attachment_url` varchar(1024) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `content_type` varchar(100) DEFAULT NULL,
  `delivered` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`),
  KEY `idx_chat_conv` (`conversation_id`),
  KEY `idx_chat_sender` (`sender`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Foreign key: messages -> conversations
ALTER TABLE `chat_message`
  ADD CONSTRAINT `fk_chat_message_conv` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversation` (`conversation_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `advert`
--
ALTER TABLE `advert`
  ADD PRIMARY KEY (`advert_id`),
  ADD UNIQUE KEY `uq_advert_vin` (`vin`),
  ADD KEY `idx_advert_advertiser` (`advertiser_id`),
  ADD KEY `idx_advert_featured` (`featured`),
  ADD KEY `idx_advert_status` (`status`);

--
-- Indexes for table `advertiser`
--
ALTER TABLE `advertiser`
  ADD PRIMARY KEY (`advertiser_id`);

--
-- Indexes for table `feature`
--
ALTER TABLE `feature`
  ADD PRIMARY KEY (`feature_id`),
  ADD UNIQUE KEY `uq_feature_name` (`name`);

--
-- Indexes for table `make`
--
ALTER TABLE `make`
  ADD PRIMARY KEY (`make_id`),
  ADD UNIQUE KEY `uq_make_name` (`name`);

--
-- Indexes for table `media_tag`
--
ALTER TABLE `media_tag`
  ADD PRIMARY KEY (`tag_id`),
  ADD UNIQUE KEY `uq_mt_label` (`label`);

--
-- Indexes for table `media_to_tag`
--
ALTER TABLE `media_to_tag`
  ADD PRIMARY KEY (`media_id`,`tag_id`),
  ADD KEY `idx_mtt_tag` (`tag_id`);

--
-- Indexes for table `model`
--
ALTER TABLE `model`
  ADD PRIMARY KEY (`model_id`),
  ADD UNIQUE KEY `uq_model_make_name` (`make_id`,`name`);

--
-- Indexes for table `stock_event`
--
ALTER TABLE `stock_event`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `idx_stock_event_advert` (`advert_id`);

--
-- Indexes for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD PRIMARY KEY (`vin`),
  ADD UNIQUE KEY `uq_vehicle_registration` (`registration`),
  ADD UNIQUE KEY `uq_vehicle_engine_number` (`engine_number`),
  ADD KEY `idx_vehicle_make_model` (`make_id`,`model_id`),
  ADD KEY `fk_vehicle_model` (`model_id`),
  ADD KEY `idx_vehicle_derivative_slug` (`derivative_slug`);

--
-- Indexes for table `vehicle_check`
--
ALTER TABLE `vehicle_check`
  ADD PRIMARY KEY (`vin`);

--
-- Indexes for table `vehicle_feature`
--
ALTER TABLE `vehicle_feature`
  ADD PRIMARY KEY (`vin`,`feature_id`),
  ADD KEY `idx_vehicle_feature_feature` (`feature_id`);

--
-- Indexes for table `vehicle_history`
--
ALTER TABLE `vehicle_history`
  ADD PRIMARY KEY (`vin`);

--
-- Indexes for table `vehicle_media`
--
ALTER TABLE `vehicle_media`
  ADD PRIMARY KEY (`media_id`),
  ADD KEY `idx_vm_vin` (`vin`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feature`
--
ALTER TABLE `feature`
  MODIFY `feature_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `make`
--
ALTER TABLE `make`
  MODIFY `make_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media_tag`
--
ALTER TABLE `media_tag`
  MODIFY `tag_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `model`
--
ALTER TABLE `model`
  MODIFY `model_id` int UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advert`
--
ALTER TABLE `advert`
  ADD CONSTRAINT `fk_advert_advertiser` FOREIGN KEY (`advertiser_id`) REFERENCES `advertiser` (`advertiser_id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_advert_vehicle` FOREIGN KEY (`vin`) REFERENCES `vehicle` (`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `media_to_tag`
--
ALTER TABLE `media_to_tag`
  ADD CONSTRAINT `fk_mtt_media` FOREIGN KEY (`media_id`) REFERENCES `vehicle_media` (`media_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_mtt_tag` FOREIGN KEY (`tag_id`) REFERENCES `media_tag` (`tag_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `model`
--
ALTER TABLE `model`
  ADD CONSTRAINT `fk_model_make` FOREIGN KEY (`make_id`) REFERENCES `make` (`make_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `stock_event`
--
ALTER TABLE `stock_event`
  ADD CONSTRAINT `fk_stock_event_advert` FOREIGN KEY (`advert_id`) REFERENCES `advert` (`advert_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vehicle`
--
ALTER TABLE `vehicle`
  ADD CONSTRAINT `fk_vehicle_make` FOREIGN KEY (`make_id`) REFERENCES `make` (`make_id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vehicle_model` FOREIGN KEY (`model_id`) REFERENCES `model` (`model_id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_check`
--
ALTER TABLE `vehicle_check`
  ADD CONSTRAINT `fk_vc_vehicle` FOREIGN KEY (`vin`) REFERENCES `vehicle` (`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_feature`
--
ALTER TABLE `vehicle_feature`
  ADD CONSTRAINT `fk_vf_feature` FOREIGN KEY (`feature_id`) REFERENCES `feature` (`feature_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vf_vehicle` FOREIGN KEY (`vin`) REFERENCES `vehicle` (`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_history`
--
ALTER TABLE `vehicle_history`
  ADD CONSTRAINT `fk_vh_vehicle` FOREIGN KEY (`vin`) REFERENCES `vehicle` (`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `vehicle_media`
--
ALTER TABLE `vehicle_media`
  ADD CONSTRAINT `fk_vm_vehicle` FOREIGN KEY (`vin`) REFERENCES `vehicle` (`vin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Add stock_status column to advert table
--
ALTER TABLE `advert`
  ADD COLUMN `stock_status` enum('in_stock','sold','reserved','pending','withdrawn') NOT NULL DEFAULT 'in_stock' AFTER `status`;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
