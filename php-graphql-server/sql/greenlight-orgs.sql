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
-- Table structure for table `greenlight-orgs`
--

CREATE TABLE `greenlight-orgs` (
  `id` int(3) NOT NULL,
  `org_name` varchar(255) NOT NULL,
  `username` varchar(30) NOT NULL,
  `bio` text NOT NULL,
  `org_img` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `greenlight-orgs`
--

INSERT INTO `greenlight-orgs` (`id`, `org_name`, `username`, `bio`, `org_img`, `created_at`, `updated_at`) VALUES
(1, 'DU Women in Business', 'dwib', 'Drexel Women in Business is a joint student organization. Drexel Women in Business (DWIB) is a network of dynamic, like-minded women achieving their business goals through support, inclusion, inspiration, and mentoring. DWIB maintains a strong network of women in the business community by coordinating networking events, speaker series, workshops, and similar activities. These events are open to the entire Drexel University community in order to foster growth, relationships, and future opportunities. This organization emphasizes LeBow\'s ties to the alumni network and to the greater Philadelphia business community, and upholds LeBow\'s commitment to excellence.', 'drexel-wib-logo.png', '2025-11-30 21:33:09', '2026-02-17 18:11:41'),
(2, 'Campus Activities Board', 'drexelcab', 'The Campus Activities Board (CAB) is the largest student-run event programming organization at Drexel University. Our purpose is to plan and execute a variety of events reflective of the diverse interests and needs of the undergraduate student body. We strive to entertain, educate, and enrich the lives of students through our programming.', 'CAB_fullcolor+square.webp', '2025-11-30 21:34:36', '2026-02-17 18:12:12'),
(3, 'Drexel CHI User Experience Club', 'chiux', 'Drexel CHI User Experience Club is a campus chapter of ACM SIGCHI. We are dedicated to providing students with interest in user experience, computer-human interaction, and design a place to share ideas, collaborate and develop professionally.\r\nWe aim to show creative students how they can translate their passion into a sustainable career by offering specialized workshops to promote good practices in the field of user experience and providing students with a community of like-minded individuals.', 'drexelchiux.png', '2025-11-30 21:36:49', '2026-02-17 18:12:27');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `greenlight-orgs`
--
ALTER TABLE `greenlight-orgs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `greenlight-orgs`
--
ALTER TABLE `greenlight-orgs`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
