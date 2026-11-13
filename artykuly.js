/*
  STREFA GOLA – BAZA ARTYKUŁÓW
  --------------------------------
  Dodawaj artykuły, kopiując obiekt z przykładu i wklejając go do tablicy.
  Pola:
  id       – unikalny identyfikator
  title    – tytuł artykułu
  label    – kategoria (np. IV Liga, A Klasa, Transfery, Wywiad)
  date     – data w formacie RRRR-MM-DD
  excerpt  – krótki opis widoczny na kafelku
  author   – autor
  image    – główne zdjęcie (pełny adres https://...)
  images   – dodatkowe zdjęcia (tablica adresów https://...)
  featured – true, aby wyróżnić artykuł
  content  – pełna treść; nowe akapity oddzielaj pustą linią

  Zdjęcia mogą pochodzić z zewnętrznych serwisów, jeśli ich adresy pozwalają
  na osadzanie na innych stronach. Nie wklejaj linku do strony artykułu,
  tylko bezpośredni adres pliku zdjęcia (np. kończący się .jpg/.png/.webp).
*/

window.ARTYKULY = [
  /*
  {
    id: "przykladowy-artykul-01",
    title: "Przykładowy tytuł wiadomości z Podkarpacia",
    label: "IV Liga",
    date: "2026-11-13",
    excerpt: "Krótki opis, który będzie widoczny pod tytułem na stronie głównej.",
    author: "Redakcja Strefy Gola",
    image: "https://twoj-serwer.pl/zdjecia/glowne.jpg",
    images: [
      "https://twoj-serwer.pl/zdjecia/boisko-1.jpg",
      "https://twoj-serwer.pl/zdjecia/boisko-2.jpg"
    ],
    featured: true,
    content: `Pierwszy akapit artykułu.

Drugi akapit artykułu. Możesz tutaj opisać przebieg meczu, wypowiedzi i najważniejsze informacje.`
  }
  */
];
