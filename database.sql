-- ===================================================================
-- JobFins Production Database Setup Script
-- Database: jobfins_db
-- Relational Entity Architecture:
-- 1. roles
-- 2. users (Recruiters & Candidates)
-- 3. companies
-- 4. jobs
-- 5. applications (Includes ATS Matching & Embedded Digital Offer Letter)
-- 6. offer_letters
-- 7. career_tips
-- ===================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `jobfins_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `jobfins_db`;

-- 2. Drop existing tables (in reverse foreign-key order)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `offer_letters`;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `career_tips`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `companies`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------
-- Table 1: roles (System Roles & Permissions)
-- -------------------------------------------------------------------
CREATE TABLE `roles` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`role_name`, `description`) VALUES 
('ROLE_RECRUITER', 'Employer authority with job posting and offer issuance privileges'),
('ROLE_SEEKER', 'Job seeker / candidate with application and profile privileges');

-- -------------------------------------------------------------------
-- Table 2: users (Recruiters & Candidates with BCrypt Authentication)
-- -------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'ROLE_RECRUITER or ROLE_SEEKER',
  `role_id` INT DEFAULT NULL,
  `contact_number` VARCHAR(50) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  -- Recruiter Profile Attributes
  `company_name` VARCHAR(255) DEFAULT NULL,
  `company_website` VARCHAR(255) DEFAULT NULL,
  `company_description` TEXT DEFAULT NULL,
  `hiring_preferences` TEXT DEFAULT NULL,
  -- Candidate Profile Attributes
  `bio_or_skills` TEXT DEFAULT NULL,
  `experience_level` VARCHAR(100) DEFAULT NULL,
  `experience_details` TEXT DEFAULT NULL,
  `portfolio_url` VARCHAR(2048) DEFAULT NULL,
  `resume_url` VARCHAR(2048) DEFAULT NULL,
  `resume_file_name` VARCHAR(255) DEFAULT NULL,
  `resume_file_size` BIGINT DEFAULT NULL,
  `resume_upload_date` VARCHAR(100) DEFAULT NULL,
  `resume_base64` LONGTEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 3: companies (Registered Organizations & Employer Partners)
-- -------------------------------------------------------------------
CREATE TABLE `companies` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `company_name` VARCHAR(255) NOT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `headquarters` VARCHAR(255) DEFAULT NULL,
  `rating` DOUBLE DEFAULT 4.8,
  `open_positions` INT DEFAULT 5,
  `is_verified` BOOLEAN DEFAULT TRUE,
  `response_sla` VARCHAR(100) DEFAULT 'Within 48 Hours',
  `hiring_preferences` TEXT DEFAULT NULL,
  `recruiter_id` BIGINT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_companies_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_company_name` (`company_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 4: jobs (Vacancies Posted by Recruiters)
-- -------------------------------------------------------------------
CREATE TABLE `jobs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `company_id` BIGINT DEFAULT NULL,
  `location` VARCHAR(255) NOT NULL,
  `job_type` VARCHAR(50) NOT NULL COMMENT 'Full-time, Part-time, Remote, Internship',
  `salary` VARCHAR(100) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT DEFAULT NULL,
  `recruiter_id` BIGINT NOT NULL,
  `posted_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jobs_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_jobs_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`id`) ON DELETE SET NULL,
  INDEX `idx_jobs_recruiter` (`recruiter_id`),
  INDEX `idx_jobs_type` (`job_type`),
  INDEX `idx_jobs_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 5: applications (Candidate Applications with ATS & Offer Letter)
-- -------------------------------------------------------------------
CREATE TABLE `applications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `job_id` BIGINT NOT NULL,
  `seeker_id` BIGINT NOT NULL,
  `cover_letter` LONGTEXT DEFAULT NULL,
  `resume_link` LONGTEXT DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, SHORTLISTED, ACCEPTED, REJECTED',
  `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  -- ATS Screening Attributes
  `ats_score` INT DEFAULT NULL,
  `ats_status` VARCHAR(50) DEFAULT NULL,
  `ats_keywords_matched` VARCHAR(255) DEFAULT NULL,
  -- Integrated Digital Offer Letter Attributes
  `base_salary` VARCHAR(100) DEFAULT NULL,
  `performance_bonus` VARCHAR(100) DEFAULT NULL,
  `stock_options` VARCHAR(100) DEFAULT NULL,
  `joining_date` VARCHAR(100) DEFAULT NULL,
  `reporting_manager` VARCHAR(100) DEFAULT NULL,
  `acceptance_deadline` VARCHAR(100) DEFAULT NULL,
  `offer_details` LONGTEXT DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_app_job` (`job_id`),
  INDEX `idx_app_seeker` (`seeker_id`),
  INDEX `idx_app_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 6: offer_letters (Formal Standalone Offer Documents)
-- -------------------------------------------------------------------
CREATE TABLE `offer_letters` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `application_id` BIGINT NOT NULL UNIQUE,
  `base_salary` VARCHAR(100) DEFAULT NULL,
  `performance_bonus` VARCHAR(100) DEFAULT NULL,
  `stock_options` VARCHAR(100) DEFAULT NULL,
  `joining_date` VARCHAR(100) DEFAULT NULL,
  `reporting_manager` VARCHAR(100) DEFAULT NULL,
  `acceptance_sla` VARCHAR(100) DEFAULT NULL,
  `terms_and_conditions` LONGTEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'ISSUED',
  `issued_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_offer_application` FOREIGN KEY (`application_id`) REFERENCES `applications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 7: career_tips (Career Guidance Articles)
-- -------------------------------------------------------------------
CREATE TABLE `career_tips` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `summary` TEXT DEFAULT NULL,
  `content` TEXT NOT NULL,
  `author` VARCHAR(100) NOT NULL,
  `author_role` VARCHAR(50) DEFAULT NULL,
  `company_name` VARCHAR(255) DEFAULT NULL,
  `author_email` VARCHAR(255) DEFAULT NULL,
  `author_id` BIGINT DEFAULT NULL,
  `read_time` VARCHAR(50) DEFAULT '4 min read',
  `tag` VARCHAR(50) DEFAULT 'Career',
  `likes_count` INT DEFAULT 0,
  `published_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_tips_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `idx_tips_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
