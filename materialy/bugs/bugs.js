// Ćwiczenie z debuggerem (poniedziałek 3).
// Ten skrypt miał 5 błędów. Przy każdej poprawce jest komentarz, co było nie tak.

const zadania = [
  { tytul: 'Struktura repozytorium', status: 'done' },
  { tytul: 'Skrypt bazy danych', status: 'done' },
  { tytul: 'API tablic', status: 'in_progress' },
  { tytul: 'Widok tablicy', status: 'todo' },
  { tytul: 'Raport testów', status: 'todo' }
];

function policzWykonane(lista) {
  let licznik = 0;
  // Błąd 1: było i <= lista.length – pętla wychodziła poza tablicę,
  // lista[5] to undefined, więc odczyt .status rzucał TypeError.
  for (let i = 0; i < lista.length; i++) {
    // Błąd 2: było = (przypisanie) zamiast === (porównanie),
    // przez co warunek był zawsze prawdziwy, a status nadpisywany.
    if (lista[i].status === 'done') {
      licznik++;
    }
  }
  // Błąd 3: brakowało return – funkcja zwracała undefined, wynik to NaN.
  return licznik;
}

function pokazPodsumowanie() {
  // Błąd 4: było policzWykonane(zadanie) – literówka w nazwie zmiennej,
  // poprawna nazwa to zadania (ReferenceError).
  const wykonane = policzWykonane(zadania);
  const procent = Math.round((wykonane / zadania.length) * 100);
  document.getElementById('wynik').textContent = `Wykonane: ${wykonane} z ${zadania.length} (${procent}%)`;
}

// Błąd 5: było 'clik' – literówka w nazwie zdarzenia, przycisk nic nie robił.
document.getElementById('policz').addEventListener('click', pokazPodsumowanie);