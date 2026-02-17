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
-- Table structure for table `greenlight-purchases`
--

CREATE TABLE `greenlight-purchases` (
  `id` int(11) NOT NULL,
  `organization` varchar(30) NOT NULL,
  `date_submitted` datetime NOT NULL,
  `item_title` varchar(255) NOT NULL,
  `item_category` varchar(255) NOT NULL,
  `event_id` int(11) NOT NULL,
  `order_status` varchar(255) NOT NULL,
  `item_cost` decimal(10,0) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `greenlight-purchases`
--

INSERT INTO `greenlight-purchases` (`id`, `organization`, `date_submitted`, `item_title`, `item_category`, `event_id`, `order_status`, `item_cost`) VALUES
(1, 'dwib', '2026-01-31 22:11:05', 'Trash Pickup Supplies', 'Equipment', 5, 'approved', '60'),
(2, 'dwib', '2026-01-31 22:13:28', 'Dustpans', 'Equipment', 5, 'in-review', '30'),
(3, 'dwib', '2026-01-31 22:14:03', 'Recycling bags', 'Equipment', 5, 'in-draft', '20'),
(4, 'dwib', '2026-01-31 22:14:35', 'Coffee Supplies', 'Food & Drinks', 2, 'in-draft', '30'),
(5, 'dwib', '2026-01-31 22:15:19', 'Pastries', 'Food & Drinks', 2, 'in-draft', '50'),
(6, 'dwib', '2026-01-31 22:17:26', 'Paper Towels', 'Equipment', 2, 'in-draft', '20'),
(7, 'dwib', '2026-01-31 22:17:45', 'Country Flags', 'Equipment', 9, 'approved', '20'),
(8, 'dwib', '2026-01-31 22:18:25', 'Paper Towels', 'Equipment', 6, 'approved', '20'),
(9, 'dwib', '2026-01-31 22:21:13', 'Water bottles', 'Equipment', 8, 'denied', '30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `greenlight-purchases`
--
ALTER TABLE `greenlight-purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `greenlight-purchases`
--
ALTER TABLE `greenlight-purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
