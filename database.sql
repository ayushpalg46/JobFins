-- ===================================================================
-- JobFins Database Setup Script (Experiment 5: MySQL & Spring Data JPA)
-- Database: jobfins_db
-- ===================================================================

-- 1. Create Database if not exists
CREATE DATABASE IF NOT EXISTS `jobfins_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `jobfins_db`;

-- 2. Drop existing tables (in reverse foreign-key order)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `applications`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------------------
-- Table 1: users (Recruiters & Job Seekers with JWT Authentication)
-- -------------------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL COMMENT 'ROLE_RECRUITER or ROLE_SEEKER',
  `company_name` VARCHAR(255) DEFAULT NULL COMMENT 'For Recruiters',
  `contact_number` VARCHAR(50) DEFAULT NULL,
  `bio_or_skills` TEXT DEFAULT NULL COMMENT 'For Job Seekers',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 2: jobs (Job Vacancies & Compensation Specs)
-- -------------------------------------------------------------------
CREATE TABLE `jobs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `company` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `job_type` VARCHAR(50) NOT NULL COMMENT 'Full-time, Part-time, Remote, Internship',
  `salary` VARCHAR(100) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT DEFAULT NULL,
  `recruiter_id` BIGINT NOT NULL,
  `posted_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_jobs_recruiter` FOREIGN KEY (`recruiter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_jobs_recruiter` (`recruiter_id`),
  INDEX `idx_jobs_type` (`job_type`),
  INDEX `idx_jobs_location` (`location`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------------------
-- Table 3: applications (Candidate Job Applications & Tracking Status)
-- -------------------------------------------------------------------
CREATE TABLE `applications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `job_id` BIGINT NOT NULL,
  `seeker_id` BIGINT NOT NULL,
  `cover_letter` TEXT DEFAULT NULL,
  `resume_link` VARCHAR(2048) DEFAULT NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING, SHORTLISTED, ACCEPTED, REJECTED',
  `applied_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_app_job` FOREIGN KEY (`job_id`) REFERENCES `jobs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_app_seeker` FOREIGN KEY (`seeker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_app_job` (`job_id`),
  INDEX `idx_app_seeker` (`seeker_id`),
  INDEX `idx_app_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


