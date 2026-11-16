-- database/taskboard.sql
-- Odtwarza całą bazę `taskboard` od zera: baza, tabele, klucze, dane.
-- Uruchomienie: mysql -u root -p < database/taskboard.sql

DROP DATABASE IF EXISTS `taskboard`;

CREATE DATABASE `taskboard`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_polish_ci;

USE `taskboard`;

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- --------------------------------------------------------
-- Tabela `users`
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `login` varchar(30) NOT NULL,
  `passwordHash` char(60) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `login` (`login`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------
-- Tabela `boards`
-- --------------------------------------------------------

CREATE TABLE `boards` (
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
  KEY `deletedById` (`deletedById`),
  CONSTRAINT `boards_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`),
  CONSTRAINT `boards_ibfk_2` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------
-- Tabela `tasks`
-- --------------------------------------------------------

CREATE TABLE `tasks` (
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
  KEY `deletedById` (`deletedById`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`boardId`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigneeId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`deletedById`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_polish_ci;

-- --------------------------------------------------------
-- Dane: users (5 osób, hashe z users.csv)
-- --------------------------------------------------------

INSERT INTO `users` (`id`, `login`, `passwordHash`, `firstName`, `lastName`, `createdAt`) VALUES
(1, 'anna.nowak', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Anna', 'Nowak', '2026-11-10 17:24:55'),
(2, 'jan.kowalski', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Jan', 'Kowalski', '2026-11-10 17:24:55'),
(3, 'ola.wisniewska', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Ola', 'Wiśniewska', '2026-11-10 17:24:55'),
(4, 'piotr.zielinski', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Piotr', 'Zieliński', '2026-11-10 17:24:55'),
(5, 'kasia.lewandowska', '$2a$10$qCgFwKm4Qiu60z3cTqCvz.DZUvPNVnkJQjMagc4wtx24LiYjsF./y', 'Kasia', 'Lewandowska', '2026-11-10 17:24:55');

-- --------------------------------------------------------
-- Dane: boards (2 tablice)
-- --------------------------------------------------------

INSERT INTO `boards` (`id`, `name`, `description`, `ownerId`, `createdAt`, `isDeleted`, `deletedAt`, `deletedById`) VALUES
(1, 'Aplikacja TaskBoard', 'Zadania zespołu', 1, '2026-11-10 18:07:06', 0, NULL, NULL),
(2, 'Organizacja praktyk', NULL, 2, '2026-11-10 18:07:06', 0, NULL, NULL);

-- --------------------------------------------------------
-- Dane: tasks (10 zadań testowych, w tym 2 usunięte miękko)
-- --------------------------------------------------------

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