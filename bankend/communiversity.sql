-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.4.3 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for communiversity
CREATE DATABASE IF NOT EXISTS `communiversity` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `communiversity`;

-- Dumping structure for table communiversity.affiliates
CREATE TABLE IF NOT EXISTS `affiliates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `code` varchar(20) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `motivation` text,
  `promotion_channels` json DEFAULT NULL,
  `application_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `approval_date` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `total_referrals` int DEFAULT '0',
  `approved_referrals` int DEFAULT '0',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `pending_earnings` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  UNIQUE KEY `code` (`code`),
  CONSTRAINT `affiliates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.affiliates: ~0 rows (approximately)

-- Dumping structure for table communiversity.articles
CREATE TABLE IF NOT EXISTS `articles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `excerpt` text,
  `author` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `views` int DEFAULT '0',
  `read_time` int DEFAULT '5',
  `status` enum('draft','published') DEFAULT 'draft',
  `featured` tinyint(1) DEFAULT '0',
  `tags` json DEFAULT NULL,
  `published_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dewey_decimal` varchar(20) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.articles: ~6 rows (approximately)
REPLACE INTO `articles` (`id`, `title`, `content`, `excerpt`, `author`, `category`, `image_url`, `views`, `read_time`, `status`, `featured`, `tags`, `published_date`, `created_at`, `updated_at`, `dewey_decimal`, `file_url`, `file_name`, `file_size`, `file_type`, `amount`) VALUES
	(17, 'q36fniaer uizq346tyw4tr', '53rtuw4aeg', '3vbgh2', 'madscientist', 'Education', NULL, 4, 5, 'published', 0, '["tech"]', '2025-11-09', '2025-11-07 10:25:33', '2025-11-09 18:40:00', 'null', NULL, NULL, NULL, NULL, 12.00),
	(18, 'q36fniaer uizq346tyw4tr', '53rtuw4aeg', '3vbgh2', 'madscientist', 'Education', NULL, 2, 5, 'published', 0, '["1"]', NULL, '2025-11-07 10:26:18', '2025-11-10 11:07:23', 'null', NULL, NULL, NULL, NULL, 12.00),
	(19, 'new', 'rererytdyyf', 'wrwewrtygfgjhjhjhjjhj', 'madscientist', 'Science', NULL, 0, 5, 'draft', 0, '["1"]', NULL, '2025-11-07 11:22:20', '2025-11-09 18:10:53', '006', NULL, NULL, NULL, NULL, 12.00),
	(20, 'mischeck kombe and gloria', 'gloria gloria', 'gloria loves you', 'madscientist', 'Technology', NULL, 0, 5, 'draft', 0, '["1"]', NULL, '2025-11-09 17:27:26', '2025-11-09 17:27:26', '009', NULL, NULL, NULL, NULL, 12.00),
	(21, 'JORDAN\'S GENERAL DEALERS', 'moving africa forward ', 'Come and meet and learn from the best economist in our country', 'madscientist', 'Business', NULL, 12, 5, 'published', 1, '["1"]', '2025-11-09', '2025-11-09 18:43:36', '2025-11-12 10:47:37', '099', NULL, NULL, NULL, NULL, 25.00),
	(22, 'IMAGES NOT WORKING', 'I AM NOT HERE TO EXPLAIN', 'WHY DOES IMAGES FAIL?', 'MADSCIENTIST', 'Technology', NULL, 4, 5, 'published', 0, '["1"]', '2025-11-11', '2025-11-11 14:59:06', '2025-11-12 10:31:32', '009', NULL, NULL, NULL, NULL, 12.00);

-- Dumping structure for table communiversity.books
CREATE TABLE IF NOT EXISTS `books` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(500) NOT NULL,
  `author` varchar(255) NOT NULL,
  `description` text,
  `isbn` varchar(50) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `dewey_number` varchar(50) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `format` enum('PDF','EPUB','BOTH','physical') DEFAULT 'PDF',
  `cover_image` varchar(500) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_size` varchar(50) DEFAULT NULL,
  `pages` int DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `published_date` date DEFAULT NULL,
  `language` varchar(50) DEFAULT 'English',
  `tags` json DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT '0.00',
  `total_ratings` int DEFAULT '0',
  `downloads` int DEFAULT '0',
  `status` enum('available','unavailable') DEFAULT 'available',
  `total_copies` int DEFAULT '1',
  `available_copies` int DEFAULT '1',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `isbn` (`isbn`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.books: ~3 rows (approximately)
REPLACE INTO `books` (`id`, `title`, `author`, `description`, `isbn`, `category`, `dewey_number`, `price`, `format`, `cover_image`, `file_url`, `file_size`, `pages`, `publisher`, `published_date`, `language`, `tags`, `rating`, `total_ratings`, `downloads`, `status`, `total_copies`, `available_copies`, `featured`, `created_at`, `updated_at`) VALUES
	(15, 'general works ', 'madscientist', 'oeyfyefudgiofusdpfoksokjsdmkjfo', '12343546645', 'General Works', '000-099', 12.00, 'physical', NULL, NULL, NULL, 12, 'made', '2025-01-01', 'English', NULL, 0.00, 0, 0, 'available', 1, 1, 0, '2025-11-07 10:24:00', '2025-11-07 10:24:00'),
	(17, 'MADSCIENTIST\'S LIFE', 'madscie', 'qwwewrerweetretrytrytrtruyuyutyutywerwrwrer', '12343546646', 'Language', '400-499', 0.00, 'physical', NULL, NULL, NULL, 12, 'MADED', '2025-01-01', 'English', NULL, 0.00, 0, 0, 'available', 1, 1, 0, '2025-11-07 12:45:38', '2025-11-07 12:45:38'),
	(19, 'ARTIFICAL INTEL', 'OSCAR', 'NEW BOOK MATANDA', '12343546649', 'General Works', '000-099', 12.00, 'physical', NULL, NULL, NULL, 12, 'MADE', '2025-01-01', 'English', NULL, 0.00, 0, 0, 'available', 1, 1, 0, '2025-11-09 17:00:58', '2025-11-09 17:00:58');

-- Dumping structure for table communiversity.payments
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `currency` varchar(10) DEFAULT 'USD',
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_id` (`transaction_id`),
  KEY `user_id` (`user_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.payments: ~0 rows (approximately)

-- Dumping structure for table communiversity.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','premium','admin') DEFAULT 'user',
  `affiliate_status` enum('not_applied','pending','approved','rejected') DEFAULT 'not_applied',
  `affiliate_code` varchar(50) DEFAULT NULL,
  `total_referrals` int DEFAULT '0',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `pending_earnings` decimal(10,2) DEFAULT '0.00',
  `join_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login` timestamp NULL DEFAULT NULL,
  `bio` text,
  `profile_image` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `affiliate_code` (`affiliate_code`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.users: ~0 rows (approximately)

-- Dumping structure for table communiversity.user_library
CREATE TABLE IF NOT EXISTS `user_library` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `book_id` int DEFAULT NULL,
  `purchase_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `purchase_amount` decimal(10,2) DEFAULT NULL,
  `format` varchar(20) DEFAULT 'PDF',
  `download_count` int DEFAULT '0',
  `last_download` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_book` (`user_id`,`book_id`),
  KEY `book_id` (`book_id`),
  CONSTRAINT `user_library_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `user_library_ibfk_2` FOREIGN KEY (`book_id`) REFERENCES `books` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.user_library: ~0 rows (approximately)

-- Dumping structure for table communiversity.webinars
CREATE TABLE IF NOT EXISTS `webinars` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `speaker` varchar(100) DEFAULT NULL,
  `speaker_bio` text,
  `date` datetime DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `max_attendees` int DEFAULT NULL,
  `current_attendees` int DEFAULT '0',
  `join_link` varchar(500) DEFAULT NULL,
  `recording_link` varchar(500) DEFAULT NULL,
  `status` enum('scheduled','completed','cancelled') DEFAULT 'scheduled',
  `image_url` varchar(500) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT '0.00',
  `is_premium` tinyint(1) DEFAULT '0',
  `category` varchar(50) DEFAULT 'Education',
  `tags` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.webinars: ~4 rows (approximately)
REPLACE INTO `webinars` (`id`, `title`, `description`, `speaker`, `speaker_bio`, `date`, `duration`, `max_attendees`, `current_attendees`, `join_link`, `recording_link`, `status`, `image_url`, `price`, `is_premium`, `category`, `tags`, `created_at`, `updated_at`) VALUES
	(9, 'mad webinar', 'scientist here we caome', 'PASTOR MADSCIENTIST', 'the best villain of all times', '2025-11-07 14:00:00', 60, 50, 0, 'https://meet.google.com', 'https://youtube.com', 'scheduled', NULL, 12.00, 0, 'Education', '[]', '2025-11-07 10:29:57', '2025-11-07 10:29:57'),
	(10, 'mad webinar', 'scientist here we caome', 'PASTOR MADSCIENTIST', 'the best villain of all times', '2025-11-07 14:00:00', 60, 50, 0, 'https://meet.google.com', 'https://youtube.com', 'scheduled', NULL, 12.00, 0, 'Education', '[]', '2025-11-07 11:16:38', '2025-11-07 11:16:38'),
	(11, 'ertuuuhhhh', 'awsdfghjkwsedrfghjawsedrfgwedrtfghwedrfghjwsedrtfghjkwsedrfghjkwefgjksdfghjnsedrfghj', 'aw3sedrtfgyaw3serdtfgywasedrtfgasdfgawesrdfgwsedfger', '3awwsesredrdxdfcgfccgvvvcvv    v vvgcccffcfccfffghgh', '2025-11-07 14:00:00', 60, 50, 0, 'https://meet.google.com', 'https://youtube.com', 'scheduled', NULL, 12.00, 0, 'Education', '[]', '2025-11-07 11:18:31', '2025-11-07 11:18:31'),
	(12, 'ertuuuhhhh', 'awsdfghjkwsedrfghjawsedrfgwedrtfghwedrfghjwsedrtfghjkwsedrfghjkwefgjksdfghjnsedrfghj', 'aw3sedrtfgyaw3serdtfgywasedrtfgasdfgawesrdfgwsedfger', '3awwsesredrdxdfcgfccgvvvcvv    v vvgcccffcfccfffghgh', '2025-11-07 14:00:00', 60, 50, 0, 'https://meet.google.com', 'https://youtube.com', 'scheduled', NULL, 12.00, 0, 'Education', '["1"]', '2025-11-07 11:18:37', '2025-11-07 11:18:37'),
	(13, 'mischeclk', 'mischeck is boy', 'PASTOR MADSCIENTIST', 'abene ba people', '2025-11-18 12:00:00', 60, 50, 0, 'https://meet.google.com', 'https://youtube.com', 'scheduled', NULL, 12.00, 0, 'Education', '["1"]', '2025-11-09 17:17:38', '2025-11-12 10:51:20');

-- Dumping structure for table communiversity.webinar_registrations
CREATE TABLE IF NOT EXISTS `webinar_registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `webinar_id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `company` varchar(100) DEFAULT NULL,
  `registered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`webinar_id`,`email`),
  CONSTRAINT `webinar_registrations_ibfk_1` FOREIGN KEY (`webinar_id`) REFERENCES `webinars` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table communiversity.webinar_registrations: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
