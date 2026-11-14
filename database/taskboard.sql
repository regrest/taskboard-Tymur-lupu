-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Ноя 14 2026 г., 20:48
-- Версия сервера: 10.11.16-MariaDB
-- Версия PHP: 8.5.12

DROP DATABASE IF EXISTS `taskboard`;
CREATE DATABASE `taskboard` CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci;
USE `taskboard`;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `taskboard`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `boards`
--

DROP TABLE IF EXISTS `boards`;
CREATE TABLE IF NOT EXISTS `boards` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `ownerId` int(10) UNSIGNED NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `deletedAt` datetime DEFAULT NULL,
  `deletedById` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerId` (`ownerId`),
  KEY `deletedById` (`deletedById`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Zrzut danych tabeli `boards`
--

INSERT INTO `boards` (`id`, `name`, `description`, `ownerId`, `createdAt`, `isDeleted`, `deletedAt`, `deletedById`) VALUES
(1, 'Aplikacja TaskBoard', 'Zadania zespołu', 1, '2026-11-10 18:07:06', 0, NULL, NULL),
(2, 'Organizacja praktyk', NULL, 2, '2026-11-10 18:07:06', 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `deadline` date DEFAULT NULL,
  `boardId` int(10) UNSIGNED NOT NULL,
  `assigneeId` int(10) UNSIGNED DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isDeleted` tinyint(1) NOT NULL DEFAULT 0,
  `deletedAt` datetime DEFAULT NULL,
  `deletedById` int(10) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `boardId` (`boardId`),
  KEY `assigneeId` (`assigneeId`),
  KEY `deletedById` (`deletedById`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Zrzut danych tabeli `tasks`
--

INSERT INTO `tasks` (`id`, `title`, `description`, `status`, `priority`, `deadline`, `boardId`, `assigneeId`, `createdAt`, `isDeleted`, `deletedAt`, `deletedById`) VALUES
(1, 'Konfiguracja środowiska', 'Instalacja Node.js oraz MySQL', 'done', 'high', '2026-11-05', 1, 3, '2026-11-10 18:07:36', 0, NULL, NULL),
(2, 'Zaprojektowanie bazy danych', 'Stworzenie diagramu ERD dla tabeli tasks', 'done', 'high', '2026-11-09', 1, 3, '2026-11-10 18:07:36', 0, NULL, NULL),
(3, 'Utworzenie tabeli tasks', 'Dopisanie struktury tabeli do pliku sql', 'in_progress', 'medium', '2026-11-13', 1, 2, '2026-11-10 18:07:36', 0, NULL, NULL),
(4, 'Przygotowanie zapytań SQL', 'Napisanie 10 wymaganych zapytań w queries.sql', 'todo', 'medium', '2026-11-13', 1, 2, '2026-11-10 18:07:36', 0, NULL, NULL),
(5, 'Stworzenie kopii zapasowej', 'Wykonanie backupu bazy danych za pomocą mysqldump', 'todo', 'low', '2026-11-15', 1, NULL, '2026-11-10 18:07:36', 0, NULL, NULL),
(6, 'Debugowanie kodu bugs.js', 'Znalezienie 5 błędów w konsoli DevTools', 'in_progress', 'high', '2026-11-12', 2, 1, '2026-11-10 18:07:36', 0, NULL, NULL),
(7, 'Refaktoryzacja stylów CSS', 'Poprawa responsywności głównego widoku', 'todo', 'low', '2026-11-20', 2, NULL, '2026-11-10 18:07:36', 0, NULL, NULL),
(8, 'Testowanie integracyjne', 'Sprawdzenie połączenia między API a bazą danych', 'todo', 'medium', '2026-11-15', 2, 3, '2026-11-10 18:07:36', 0, NULL, NULL),
(9, 'Stary szkic interfejsu', 'Niepotrzebny plik makiety - usunięty soft', 'todo', 'low', '2026-10-01', 1, 1, '2026-11-10 18:07:36', 1, '2026-10-05 14:20:00', 3),
(10, 'Błędne zadanie testowe', 'Zadanie usunięte przez admina ponad 30 dni temu', 'todo', 'medium', '2026-09-01', 1, 2, '2026-11-10 18:07:36', 1, '2026-09-02 10:00:00', 4);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `login` varchar(30) NOT NULL,
  `passwordHash` char(60) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

--
-- Zrzut danych tabeli `users`
--

INSERT INTO `users` (`id`, `login`, `passwordHash`, `firstName`, `lastName`, `createdAt`) VALUES
(1, 'anna.nowak', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Anna', 'Nowak', '2026-11-10 17:24:55'),
(2, 'jan.kowalski', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Jan', 'Kowalski', '2026-11-10 17:24:55'),
(3, 'ola.wisniewska', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Ola', 'Wiśniewska', '2026-11-10 17:24:55'),
(4, 'piotr.zielinski', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Piotr', 'Zieliński', '2026-11-10 17:24:55'),
(5, 'kasia.lewandowska', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Kasia', 'Lewandowska', '2026-11-10 17:24:55');

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `boards`
--
ALTER TABLE `boards`
  ADD CONSTRAINT `boards_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `boards_ibfk_2` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`);

--
-- Ograniczenia dla tabeli `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigneeId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
