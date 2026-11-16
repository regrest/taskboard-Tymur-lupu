// Ćwiczenie z debuggerem (poniedziałek 3).
// Ten skrypt ma 5 błędów. Otwórz index.html w przeglądarce (np. przez Live Server),
// włącz DevTools (F12) i znajdź błędy: zakładka Console pokazuje komunikaty,
// a w zakładce Sources ustawisz breakpoint i podejrzysz wartości zmiennych.
// Przy każdej poprawce dopisz komentarz, co było nie tak.

const zadania = [
  { tytul: 'Struktura repozytorium', status: 'done' },
  { tytul: 'Skrypt bazy danych', status: 'done' },
  { tytul: 'API tablic', status: 'in_progress' },
  { tytul: 'Widok tablicy', status: 'todo' },
  { tytul: 'Raport testów', status: 'todo' }
];

function policzWykonane(lista) {
  let licznik = 0;
  // POPRAWKA 1: Pętla wychodziła za tablicę przez <=, zmieniłem na zwykłe <
  for (let i = 0; i < lista.length; i++) {
    // POPRAWKA 2: Było jedno = zamiast === przez co nadpisywało status
    if (lista[i].status === 'done') {
      licznik++;
    }
  }
  // POPRAWKA 3: Funkcja nic nie zwracała, dodałem return licznik
  return licznik;
}

function pokazPodsumowanie() {
  // POPRAWKA 4: Literówka w nazwie zmiennej, było zadanie zamiast zadania
  const wykonane = policzWykonane(zadania);
  const procent = Math.round((wykonane / zadania.length) * 100);
  document.getElementById('wynik').textContent = `Wykonane: ${wykonane} z ${zadania.length} (${procent}%)`;
}

// POPRAPWKA 5: Błąd w nazwie zdarzenia, było 'clik' zamiast 'click'
document.getElementById('policz').addEventListener('click', pokazPodsumowanie);