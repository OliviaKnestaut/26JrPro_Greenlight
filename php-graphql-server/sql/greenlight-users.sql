-- phpMyAdmin SQL Dump
-- version 5.1.1deb5ubuntu1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Feb 17, 2026 at 07:41 PM
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
-- Table structure for table `greenlight-users`
--

CREATE TABLE `greenlight-users` (
  `id` int(3) NOT NULL,
  `first_name` varchar(250) DEFAULT NULL,
  `last_name` varchar(250) DEFAULT NULL,
  `username` varchar(12) NOT NULL,
  `password` varchar(30) NOT NULL,
  `profile_img` varchar(255) DEFAULT NULL,
  `role` varchar(250) DEFAULT NULL,
  `organization` varchar(30) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `greenlight-users`
--

INSERT INTO `greenlight-users` (`id`, `first_name`, `last_name`, `username`, `password`, `profile_img`, `role`, `organization`, `created_at`, `updated_at`) VALUES
(1, 'Olivia', 'Knestaut', 'ojk25', 'oliviapassword', 'olivia-headshot.png', 'Vice President', 'dwib', '2026-01-20 17:33:15', '2026-01-20 17:33:15'),
(2, 'Maple', 'Tieu', 'mt3454', 'maplepassword', 'maple-headshot.png', 'Event Coordinator', 'dwib', '2026-01-20 17:38:13', '2026-01-20 17:38:13'),
(3, 'Hannah', 'Desmond', 'hd434', 'hannahpassword', 'hannah-headshot.png', 'President', 'dwib', '2026-01-20 17:38:13', '2026-01-20 17:38:13'),
(4, 'Mack', 'Addison', 'mba58', 'mackpassword', 'mack-headshot.png', 'Secretary', 'dwib', '2026-01-20 17:39:16', '2026-01-20 17:39:16'),
(5, 'Amy', 'Au', 'aa4644', 'amypassword', 'amy-headshot.png', 'Treasurer', 'dwib', '2026-01-20 17:39:16', '2026-01-20 17:39:16'),
(6, 'Guest', 'Anonymous', 'guest123', 'guestpassword', 'default-profile.png', 'General Member', 'dwib', '2026-02-03 03:50:36', '2026-02-03 03:50:36'),
(7, 'Christina', 'Wang', 'cw762', 'christinapassword', 'christina-headshot.png', 'Communications', 'dwib', '2026-02-03 04:50:43', '2026-02-03 04:50:43'),
(8, 'Maya', 'Zarin', 'mz182', 'mayapassword', 'maya-headshot.png', 'Graphic Designer', 'dwib', '2026-02-03 04:54:11', '2026-02-03 04:54:11'),
(9, 'Vanessa', 'Garcia', 'vg192', 'vanessapassword', 'vanessa-headshot.png', 'Event Planning Lead', 'dwib', '2026-02-03 14:40:23', '2026-02-03 14:40:23'),
(10, 'Amaya', 'Brown', 'ab283', 'amayapassword', 'amaya-headshot.png', 'Volunteer Coordinator', 'dwib', '2026-02-03 14:49:08', '2026-02-03 14:49:08'),
(11, 'Iris', 'Miller', 'im284', 'irispassword', 'iris-headshot.png', 'Public Relations Officer', 'dwib', '2026-02-03 14:53:13', '2026-02-03 14:53:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `greenlight-users`
--
ALTER TABLE `greenlight-users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`) USING BTREE;

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `greenlight-users`
--
ALTER TABLE `greenlight-users`
  MODIFY `id` int(3) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
