-- 1. Zadania o priorytecie high według terminu
SELECT * FROM tasks 
WHERE priority = 'high' AND isDeleted = 0 
ORDER BY deadline ASC;

-- 2. Zadania po terminie i niezakończone (przyjmując bieżącą datę: 2026-11-10)
SELECT * FROM tasks 
WHERE deadline < '2026-11-10' AND status != 'done' AND isDeleted = 0;

-- 3. Zadanie z nazwą tablicy i loginem osoby (JOIN trzech tabel)
SELECT t.id, t.title, b.name AS boardName, u.login AS assigneeLogin 
FROM tasks t
JOIN boards b ON t.boardId = b.id
LEFT JOIN users u ON t.assigneeId = u.id
WHERE t.isDeleted = 0;

-- 4. Liczba zadań w każdym statusie dla wybranej tablicy o id = 1 (GROUP BY)
SELECT status, COUNT(*) AS totalTasks 
FROM tasks 
WHERE boardId = 1 AND isDeleted = 0
GROUP BY status;

-- 5. Usunięte zadania z loginem osoby, która je usunęła
SELECT t.id, t.title, t.deletedAt, u.login AS deletedByLogin 
FROM tasks t
JOIN users u ON t.deletedById = u.id
WHERE t.isDeleted = 1;

-- 6. Użytkownicy bez żadnego zadania (LEFT JOIN)
SELECT u.id, u.login, u.firstName, u.lastName 
FROM users u
LEFT JOIN tasks t ON u.id = t.assigneeId AND t.isDeleted = 0
WHERE t.id IS NULL;

-- 7. Zadania z tytułem zawierającym słowo 'bazy' (LIKE)
SELECT * FROM tasks 
WHERE title LIKE '%bazy%' AND isDeleted = 0;

-- 8. Zmiana statusu zadania o id = 3 (UPDATE)
UPDATE tasks 
SET status = 'done' 
WHERE id = 3;

-- 9. Soft delete zadania o id = 4 (użytkownik o id = 3 usuwa zadanie)
UPDATE tasks 
SET isDeleted = 1, deletedAt = NOW(), deletedById = 3 
WHERE id = 4;

-- 10. Trwałe usunięcie zadań usuniętych miękko ponad 30 dni temu (DELETE)
DELETE FROM tasks 
WHERE isDeleted = 1 AND deletedAt < DATE_SUB('2026-11-10', INTERVAL 30 DAY);