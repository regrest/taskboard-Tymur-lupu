# Dokumentacja REST API — TaskBoard

Adres bazowy: `http://localhost:3000` (port z `process.env.PORT || 3000`).  
Format danych: `application/json`. Uwierzytelnianie oparte jest na sesjach (`express-session` + ciasteczko sesyjne). Endpointy `/api/users`, `/api/boards` oraz `/api/tasks` wymagają aktywnej sesji (`401`, jeśli użytkownik nie jest zalogowany)[cite: 38, 43].

---

## 1. Status aplikacji

### `GET /api/health`

Sprawdza dostępność serwera API (nie wymaga logowania).

* **Odpowiedź `200 OK`:** `{ "ok": true }`[cite: 38].

---

## 2. Uwierzytelnianie (`/api/auth`)

### `POST /api/auth/register`

Rejestruje nowego użytkownika i ustawia `req.session.userId`[cite: 39].

* **Body:** `{ "login": "jan.kowalski", "firstName": "Jan", "lastName": "Kowalski", "password": "Password123!" }`[cite: 39].
* **Walidacja:** wymagane `login`, `firstName`, `lastName`, `password` (min. 8 znaków); `login` musi być unikalny w tabeli `users`[cite: 39].
* **Odpowiedzi:** `201 Created` (`{ id, login, firstName, lastName }`), `400 Bad Request` (błąd walidacji), `409 Conflict` (login już zajęty)[cite: 39].

### `POST /api/auth/login`

Loguje użytkownika i zapisuje identyfikator w sesji[cite: 39].

* **Body:** `{ "login": "anna.nowak", "password": "Test1234!" }`[cite: 32, 39].
* **Odpowiedzi:** `200 OK` (`{ id, login, firstName, lastName }`), `400 Bad Request` (brak loginu lub hasła), `401 Unauthorized` (błędny login lub hasło)[cite: 39].

### `GET /api/auth/me`

Zwraca dane aktualnie zalogowanego użytkownika[cite: 39].

* **Odpowiedzi:** `200 OK` (`{ id, login, firstName, lastName }`), `401 Unauthorized` (`Nie zalogowano`)[cite: 39].

### `POST /api/auth/logout`

Niszczy sesję użytkownika i czyści ciasteczko `connect.sid`[cite: 39].

* **Odpowiedź:** `204 No Content`[cite: 39].

---

## 3. Użytkownicy (`/api/users`)

### `GET /api/users`

Zwraca listę użytkowników (bez pola `passwordHash`)[cite: 25, 28, 42].

* **Odpowiedź `200 OK`:** tablica obiektów `{ id, login, firstName, lastName }`[cite: 28, 42].

---

## 4. Tablice (`/api/boards`)

### `GET /api/boards`

Zwraca aktywne tablice (`isDeleted = 0`)[cite: 40].

* **Odpowiedź `200 OK`:** tablica obiektów `{ id, name, description, ownerId, createdAt }`[cite: 40].

### `POST /api/boards`

Tworzy nową tablicę[cite: 40].

* **Body:** `{ "name": "Aplikacja TaskBoard", "description": "Zadania zespołu" }`[cite: 32, 40].
* **Walidacja:** `name` po przycięciu spacji musi mieć od 1 do 80 znaków[cite: 40].
* **Odpowiedzi:** `201 Created` (`{ id, name }`), `400 Bad Request`[cite: 40].

### `PUT /api/boards/:id`

Edytuje nazwę i opis istniejącej tablicy (`isDeleted = 0`)[cite: 40].

* **Body:** `{ "name": "Nowa nazwa", "description": "Nowy opis" }`[cite: 40].
* **Odpowiedzi:** `200 OK`, `400 Bad Request`, `404 Not Found`[cite: 40].

### `DELETE /api/boards/:id`

Wykonuje miękkie usunięcie tablicy (`isDeleted = 1, deletedAt = NOW()`)[cite: 40].

* **Odpowiedzi:** `204 No Content`, `404 Not Found`[cite: 40].

### `GET /api/boards/:boardId/tasks`

Zwraca aktywne zadania (`isDeleted = 0`) należące do tablicy o identyfikatorze `boardId`[cite: 40].

* **Odpowiedzi:** `200 OK` (lista zadań), `404 Not Found` (tablica nie istnieje lub została usunięta)[cite: 28, 40].

---

## 5. Zadania (`/api/tasks`)

### `GET /api/tasks/:id`

Zwraca szczegóły aktywnego zadania (`isDeleted = 0`).

* **Odpowiedzi:** `200 OK`, `404 Not Found`[cite: 28, 41].

### `POST /api/tasks`

Dodaje nowe zadanie do wskazanej tablicy.

* **Body:**

```json
{
  "title": "Przykładowe zadanie backendu",
  "description": "Opis testowego zadania",
  "status": "todo",
  "priority": "medium",
  "deadline": "2026-12-31",
  "boardId": 1,
  "assigneeId": null
}
