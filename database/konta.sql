-- database/konta.sql
-- Trzy konta bazy `taskboard` z minimalnymi uprawnieniami.
-- Każde konto tworzymy dla 'localhost' i dla '127.0.0.1'
-- (aplikacja łączy się przez DB_HOST=127.0.0.1).
-- Uruchomienie (po taskboard.sql): mysql -u root -p < database/konta.sql

-- 1. taskboard_app: konto aplikacji (API).
--    SELECT, INSERT, UPDATE. Bez DELETE, bo aplikacja usuwa tylko miękko.
CREATE USER IF NOT EXISTS 'taskboard_app'@'localhost' IDENTIFIED BY 'TaskBoardApp1!';
CREATE USER IF NOT EXISTS 'taskboard_app'@'127.0.0.1' IDENTIFIED BY 'TaskBoardApp1!';
GRANT SELECT, INSERT, UPDATE ON taskboard.* TO 'taskboard_app'@'localhost';
GRANT SELECT, INSERT, UPDATE ON taskboard.* TO 'taskboard_app'@'127.0.0.1';

-- 2. taskboard_admin: także DELETE (czyszczenie starych wpisów).
CREATE USER IF NOT EXISTS 'taskboard_admin'@'localhost' IDENTIFIED BY 'TaskBoardAdmin1!';
CREATE USER IF NOT EXISTS 'taskboard_admin'@'127.0.0.1' IDENTIFIED BY 'TaskBoardAdmin1!';
GRANT SELECT, INSERT, UPDATE, DELETE ON taskboard.* TO 'taskboard_admin'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE ON taskboard.* TO 'taskboard_admin'@'127.0.0.1';

-- 3. taskboard_report: tylko SELECT (raporty i podgląd).
CREATE USER IF NOT EXISTS 'taskboard_report'@'localhost' IDENTIFIED BY 'TaskBoardReport1!';
CREATE USER IF NOT EXISTS 'taskboard_report'@'127.0.0.1' IDENTIFIED BY 'TaskBoardReport1!';
GRANT SELECT ON taskboard.* TO 'taskboard_report'@'localhost';
GRANT SELECT ON taskboard.* TO 'taskboard_report'@'127.0.0.1';

FLUSH PRIVILEGES;