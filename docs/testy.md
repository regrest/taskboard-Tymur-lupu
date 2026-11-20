# Przypadki testowe — TaskBoard

Dokument opisuje przypadki testowe aplikacji **TaskBoard** (interfejs WWW w `frontend/`, REST API w `backend/` oraz baza MySQL w `database/`)[cite: 12, 13, 14, 32, 37].

## Zestawienie przypadków testowych

| ID | Obszar | Nazwa przypadku testowego | Oczekiwany rezultat |
| --- | --- | --- | --- |
| TC-01 | Autoryzacja | Dostęp do chronionego endpointu (`/api/boards`) lub `/boards.html` bez sesji | `401 Unauthorized` (`Wymagane logowanie`) i przekierowanie na `/login.html`[cite: 17, 38, 43] |
| TC-02 | Rejestracja | Rejestracja nowego użytkownika poprawnymi danymi | `201 Created`, hash `bcrypt` w tabeli `users`, utworzenie sesji i przejście na `/boards.html`[cite: 18, 39] |
| TC-03 | Rejestracja | Walidacja formularza i duplikat loginu (`POST /api/auth/register`) | `400` przy brakach/hasłach < 8 znaków; `409 Conflict` przy zajętym loginie; `is-invalid` w UI[cite: 14, 18, 39] |
| TC-04 | Logowanie | Logowanie poprawnym loginem i hasłem (`POST /api/auth/login`) | `200 OK`, ustawienie sesji (`req.session.userId`), przekierowanie na `/boards.html`[cite: 18, 39] |
| TC-05 | Logowanie | Logowanie z błędnym hasłem lub nieistniejącym loginem | `400` (brak danych) lub `401 Unauthorized` (`Nieprawidłowy login lub hasło`)[cite: 39] |
| TC-06 | Wylogowanie | Wylogowanie użytkownika (`POST /api/auth/logout`) | `204 No Content`, zniszczenie sesji i przekierowanie na `/login.html`[cite: 17, 39] |
| TC-07 | Użytkownicy | Pobranie listy użytkowników (`GET /api/users`) | `200 OK`, pola `id`, `login`, `firstName`, `lastName` bez `passwordHash`[cite: 25, 28, 42] |
| TC-08 | Tablice | Utworzenie, edycja i miękkie usunięcie tablicy (`/api/boards`) | `201` (POST), `200` (PUT), `204` (DELETE); usunięta tablica znika z listy (`isDeleted = 1`)[cite: 40] |
| TC-09 | Zadania — lista | Pobranie aktywnych zadań tablicy (`GET /api/boards/:boardId/tasks`) | `200 OK` dla aktywnej tablicy (bez `isDeleted = 1`); `404 Not Found` dla nieistniejącej tablicy[cite: 25, 28, 40] |
| TC-10 | Zadania — tworzenie | Dodanie poprawnego zadania (`POST /api/tasks`) | `201 Created` oraz zwrócenie obiektu z nowym `id` zadania[cite: 25, 28, 41] |
| TC-11 | Zadania — walidacja | Niepoprawne dane w `POST /api/tasks` (pusty/za krótki tytuł, zły status/priorytet, zła data, brak tablicy/osoby) | `400 Bad Request` oraz pole `error` w odpowiedzi[cite: 25, 28, 41] |
| TC-12 | Zadania — szczegóły | Pobranie szczegółów zadania (`GET /api/tasks/:id`) | `200 OK` dla aktywnego zadania; `404 Not Found` dla braku rekordu lub `isDeleted = 1`[cite: 25, 28, 41] |
| TC-13 | Zadania — edycja i status | Przenoszenie między kolumnami (`todo`, `in_progress`, `done`) i edycja (`PUT /api/tasks/:id`) | `200 OK` przy poprawnych danych; `400` przy błędnych; `404` gdy zadanie nie istnieje[cite: 19, 25, 28, 41] |
| TC-14 | Zadania — soft delete i filtry | Usunięcie zadania (`DELETE /api/tasks/:id`), ponowny `GET` oraz filtry widoku tablicy | `204` przy `DELETE`, potem `404` przy `GET`; wiersz zostaje w `tasks` z `isDeleted = 1`; filtry działają w UI[cite: 12, 19, 25, 28, 41] |

---

## Szczegóły wybranych przypadków testowych

### TC-04: Logowanie poprawnym loginem i hasłem

* **Warunki wstępne:** Zaimportowana baza `database/taskboard.sql`, uruchomiony serwer `node backend/server.js`[cite: 32, 38].
* **Kroki:**
  1. Otwórz `http://localhost:3000/login.html`[cite: 14, 38].
  2. Wpisz `login` (np. `anna.nowak`) oraz `password` (np. `Test1234!`) i kliknij **Zaloguj się**[cite: 10, 14, 32].
* **Oczekiwany rezultat:** Endpoint `POST /api/auth/login` zwraca `200 OK` (z danymi użytkownika bez `passwordHash`), zapisuje `req.session.userId`, a przeglądarka przechodzi na `/boards.html`[cite: 18, 39].

### TC-11: Walidacja danych zadania (`POST /api/tasks`)

* **Warunki wstępne:** Użytkownik jest zalogowany[cite: 38, 43].
* **Kroki:**
  1. Wyślij `POST /api/tasks` z `title` o długości `< 3` lub `> 100` znaków (po `trim()`).
  2. Wyślij `POST /api/tasks` z `status` spoza `['todo', 'in_progress', 'done']` lub `priority` spoza `['low', 'medium', 'high']`.
  3. Wyślij `POST /api/tasks` z niepoprawną datą `deadline` (np. `31-12-2026` lub `2026-02-31`) albo z nieistniejącym `boardId` / `assigneeId`.
* **Oczekiwany rezultat:** Serwer zwraca kod `400 Bad Request` oraz komunikat błędu w polu `error`.

### TC-14: Soft delete zadania oraz filtrowanie kart

* **Warunki wstępne:** Użytkownik jest zalogowany i otworzył tablicę `/board.html?id=1`[cite: 12, 19, 38, 43].
* **Kroki:**
  1. Kliknij **Usuń** na wybranym zadaniu i potwierdź w oknie modalnym (`DELETE /api/tasks/:id`)[cite: 12, 19, 41].
  2. Wyślij `GET /api/tasks/:id` dla usuniętego identyfikatora.
  3. Skorzystaj z filtrów priorytetu, osoby, wyszukiwarki tytułów oraz przycisku **Wyczyść filtry**[cite: 12, 19].
* **Oczekiwany rezultat:** `DELETE` zwraca `204`, kolejny `GET` zwraca `404`, rekord w bazie ma `isDeleted = 1` i wypełnione `deletedAt`, a kolumny Kanban poprawnie aktualizują karty i liczniki[cite: 12, 19, 28, 41].
