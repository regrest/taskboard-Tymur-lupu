# TaskBoard

TaskBoard to aplikacja webowa do zarządzania zadaniami zespołu w stylu tablicy kanban. Użytkownik tworzy tablice, dodaje zadania z priorytetem, terminem i przypisaną osobą oraz przenosi je między kolumnami „Do zrobienia”, „W trakcie” i „Gotowe”.

Krótki opis aplikacji (2–3 zdania): czym jest TaskBoard i co można w nim zrobić.

## Technologie

Frontend: HTML, CSS, JavaScript, Bootstrap.
Backend: Node.js, Express 5, mysql2, dotenv.
Baza danych: MariaDB 10.11 (zgodna z MySQL).
Narzędzia: Git, GitHub Actions, Postman, VS Code.

## Wymagane środowisko

Node.js 20 lub nowszy, MariaDB 10.11 lub MySQL 8 (np. XAMPP) i Git. 

## Uruchomienie

Odtwórz bazę danych (sekcja „Baza danych”).
Skopiuj .env.example jako .env w głównym folderze i wpisz hasło do bazy.
W folderze backend/ wykonaj npm install, a potem npm start.

## Struktura projektu

Folder	Za co odpowiada
frontend/	Interfejs użytkownika: widoki, style i skrypty.
backend/	Serwer Express i REST API (boards, tasks, users).
database/	Skrypty bazy: struktura, dane testowe, zapytania, konta, kopie.
docs/	Dokumentacja, opisy zadań i kolekcja Postman.

## Materiały

Pliki potrzebne podczas praktyk są w folderze [materialy](materialy/README.md).

## Autor

Tymur lupu, klasa.
