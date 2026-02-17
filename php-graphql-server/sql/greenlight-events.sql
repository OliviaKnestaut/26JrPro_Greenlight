-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 17, 2026 at 07:42 PM
-- Server version: 10.6.23-MariaDB-0ubuntu0.22.04.1
-- PHP Version: 8.1.2-1ubuntu2.23

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ojk25_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `greenlight-events`
--

CREATE TABLE `greenlight-events` (
  `id` int(11) NOT NULL,
  `organization` varchar(30) NOT NULL,
  `created_by` varchar(12) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `setup_time` time DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `location_type` enum('virtual','on_campus','off_campus') DEFAULT NULL,
  `event_level` tinyint(4) DEFAULT NULL,
  `event_img` varchar(255) DEFAULT NULL,
  `event_status` varchar(255) NOT NULL,
  `form_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `greenlight-events`
--

INSERT INTO `greenlight-events` (`id`, `organization`, `created_by`, `title`, `description`, `event_date`, `setup_time`, `start_time`, `end_time`, `location`, `location_type`, `event_level`, `event_img`, `event_status`, `form_data`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, 'dwib', 'ojk25', 'Resume Workshop', 'Come hang out with the club for a professional resume review as we prepare for CO-OP.', '2026-11-20', NULL, NULL, '16:00:00', 'Lebow 111', NULL, NULL, 'resume-workshop.jpg', 'DRAFT', '', NULL, '2025-11-30 22:04:31', '2026-02-17 18:25:04'),
(2, 'dwib', 'mba58', 'Coffee with DWIB', 'A social activity for the club members to hangout and meet newer members. ', '2026-12-10', NULL, '11:00:00', '12:00:00', 'Lebow 314', NULL, NULL, 'coffee-with-dwib.jpg', 'DRAFT', '', NULL, '2025-11-30 22:09:42', '2026-02-17 18:24:53'),
(3, 'dwib', 'hd434', 'Alumni Networking', 'Join DWIB and their alumni in a city-wide networking event. ', '2026-01-10', NULL, '19:00:00', '20:00:00', 'MacAlister Hall', NULL, NULL, 'alumni-networking.jpg', 'DRAFT', '', NULL, '2025-11-30 22:11:58', '2026-02-17 18:25:34'),
(4, 'dwib', 'aa4644', '20th Anniversary Celebration ', 'Celebrate 20 years on campus with DWIB, join us for snacks, alumni and connections over an organization of lifelong bonds.', '2025-11-15', '16:00:00', '17:00:00', '18:00:00', 'Drexel Main Building', NULL, NULL, '20th-anniversary.jpg', 'APPROVED', '', NULL, '2026-01-06 16:18:30', '2026-02-17 18:37:50'),
(5, 'dwib', 'hd434', 'Community Cleanup ', 'All proceeds from this event, featuring baked goods, will benefit the Willow Creek Animal Shelter.', '2026-03-19', '11:30:00', '12:00:00', '13:30:00', 'Drexel 30th Station', NULL, NULL, 'community-cleanup.jpg', 'APPROVED', '', NULL, '2026-01-06 16:20:31', '2026-02-17 18:38:27'),
(6, 'dwib', 'ojk25', 'Bakesale Fundraiser ', 'All proceeds from this event, featuring baked goods, will benefit the Willow Creek Animal Shelter.', '2026-02-17', '10:30:00', '11:00:00', '12:00:00', 'Lebow 121', NULL, NULL, 'bakesale-fundraiser.jpg', 'APPROVED', '', NULL, '2026-01-06 16:22:03', '2026-02-17 18:39:19'),
(7, 'dwib', 'mba58', 'Pitch & Paint Night ', 'Members pair up to create a mini business pitch inspired by a random painting prompt, then present it while showcasing their artwork. A fun, creative way to blend entrepreneurship with artistic expression.', '2026-04-16', NULL, '19:00:00', '20:00:00', 'Lebow 311', NULL, NULL, 'pitch-and-paint-night.jpg', 'DRAFT', '', NULL, '2026-01-06 16:24:41', '2026-02-17 18:26:20'),
(8, 'dwib', 'mt3454', 'AKPsi Charity 5K: Run for Resources', 'A campus-wide 5K where all proceeds support local youth entrepreneurship programs. Brothers volunteer, run, and connect with community partners for a high-impact service initiative.', '2025-12-15', '18:00:00', '20:00:00', '22:00:00', 'Drexel Main Building', NULL, NULL, 'akpsi-charity-5k-run-for-resources.jpg', 'CANCELLED', '', NULL, '2026-01-06 16:27:35', '2026-02-17 18:39:45'),
(9, 'dwib', 'aa4644', 'Global Market Mixer', 'Guests rotate through “country stations,” highlighting food, traditions, and key industries from that region. Members learn about global business norms while socializing in a fun cultural environment.', '2026-02-23', '13:00:00', '14:00:00', '15:30:00', 'Lebow 108', NULL, NULL, 'global-market-mixer.jpg', 'APPROVED', '', NULL, '2026-01-06 16:30:09', '2026-02-17 18:40:07'),
(10, 'dwib', 'hd434', 'Career Branding Workshop ', 'A hands-on session where members refine their LinkedIn profiles, personal branding, and resume strategy with guidance from WIB mentors. Perfect for anyone preparing for co-op or full-time applications.', '2026-02-12', NULL, '18:00:00', '17:00:00', 'Lebow 240', NULL, NULL, 'career-branding-workshop.webp', 'DRAFT', '', NULL, '2026-01-06 16:31:42', '2026-02-17 18:27:24'),
(11, 'dwib', 'mba58', 'Coffee Chat With Women in Tech', 'An informal networking event connecting WIB members with female professionals working in UX, engineering, and data science across Philadelphia. Enjoy conversation, guidance, and community over coffee.', '2026-03-03', '10:00:00', '10:30:00', '11:30:00', 'Zoom', 'virtual', NULL, 'coffee-chat.jpg', 'REVIEW', '', '2025-11-18 22:04:31', '2026-01-06 16:33:22', '2026-02-17 18:41:30'),
(12, 'dwib', 'mt3454', 'Financial Wellness 101', 'A practical session covering budgeting, credit building, and early investing strategies tailored for college women entering the workforce. Led by a guest speaker from Vanguard.', '2025-03-24', NULL, '17:30:00', '18:30:00', 'Papadakis Hall 108', NULL, NULL, 'financial-wellness-101.png', 'DRAFT', '', NULL, '2026-01-06 16:34:54', '2026-02-17 18:27:54'),
(13, 'dwib', 'ojk25', 'Women in Leadership Panel', 'A moderated panel featuring women leaders from consulting, entrepreneurship, and corporate management discussing how they navigated career growth and advocacy in the workplace.', '2026-02-14', '18:00:00', '19:00:00', '20:00:00', 'URBN Annex Screening Room', NULL, NULL, 'women-in-leadership-panel.jpg', 'REVIEW', '', '2025-11-30 22:04:31', '2026-01-06 16:36:19', '2026-02-17 18:44:11'),
(14, 'dwib', 'mba58', 'Public Speaking Workshop', 'A workshop teaching students how to speak convincingly during presentations, pitches, and interviews.', '2025-12-30', '15:00:00', '16:00:00', '17:30:00', 'Lebow 111', NULL, NULL, 'public-speaking.jpg', 'REVIEW', '', '2025-12-10 22:04:31', '2026-01-06 16:37:39', '2026-02-17 18:44:57'),
(15, 'dwib', 'ojk25', 'Annual Women In Business Gala', 'A semi-formal celebration recognizing student leaders, alumni achievemnets, and community partners.', '2026-06-18', NULL, '19:00:00', '22:00:00', 'McAllister Hall', NULL, NULL, 'women-in-business-gala.webp', 'DRAFT', '', NULL, '2026-01-06 16:39:49', '2026-02-17 18:29:12'),
(16, 'dwib', 'ojk25', 'Walk & Talk Wellness Meetup', 'A casual campus walk where members chat about school, internships, and life. Great for new connections!', '2026-03-17', '15:00:00', '16:00:00', '17:00:00', 'Dragon Statue', NULL, NULL, 'walk-and-talk.jpg', 'APPROVED', '', NULL, '2026-01-06 16:41:10', '2026-02-17 18:45:12');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `greenlight-events`
--
ALTER TABLE `greenlight-events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_org_date` (`event_date`),
  ADD KEY `idx_event_date` (`event_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `greenlight-events`
--
ALTER TABLE `greenlight-events`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
