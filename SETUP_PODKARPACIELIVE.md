# PodkarpacieLIVE → Firestore

Pakiet synchronizuje mecze z PodkarpacieLIVE z bazą Firestore używaną przez Strefę Gola.

## Co robi synchronizator

- sprawdza wyniki cyklicznie,
- importuje najbliższą kolejkę zamiast wszystkich przyszłych kolejek,
- dopasowuje istniejące mecze zamiast kasować i tworzyć je ponownie,
- aktualizuje wynik/status istniejącego meczu po publikacji wyniku,
- respektuje `manualOverride`, aby automatyzacja nie nadpisywała ręcznej zmiany administratora,
- obsługuje główny projekt Firebase oraz opcjonalny drugi projekt przez `FIREBASE2_SERVICE_ACCOUNT`.

## 1. Przygotowanie repozytorium

Wgraj do repozytorium:

- `podkarpacielive-sync.mjs`
- `package.json`
- `.github/workflows/podkarpacielive-sync.yml`
- `SETUP_PODKARPACIELIVE.md`

## 2. Secret Firebase

W GitHub wejdź w:

`Settings → Secrets and variables → Actions → New repository secret`

Dodaj:

`FIREBASE_SERVICE_ACCOUNT`

Wartość musi być pełnym JSON-em konta usługi Firebase Admin dla głównego projektu.

Jeżeli mecze części lig są w drugim projekcie Firebase, dodaj również:

`FIREBASE2_SERVICE_ACCOUNT`

z pełnym JSON-em konta usługi tego drugiego projektu.

Nie wkładaj klucza service account do HTML ani do publicznego repozytorium.

## 3. Instalacja lokalna

```bash
npm install
```

PowerShell:

```powershell
$env:FIREBASE_SERVICE_ACCOUNT = Get-Content .\service-account.json -Raw
npm run sync
```

Linux/macOS:

```bash
export FIREBASE_SERVICE_ACCOUNT="$(cat service-account.json)"
npm run sync
```

## 4. GitHub Actions

Workflow uruchamia synchronizację wyników co 5 minut. Dodatkowo w poniedziałek wykonuje import najbliższej kolejki.

Można uruchomić go ręcznie w:

`Actions → PodkarpacieLIVE → Run workflow`

## 5. Ważne pola w Firestore

Dla automatycznie znalezionych/importowanych meczów używane są m.in.:

- `source: "podkarpacielive"`
- `manualOverride: false`

Po ręcznej edycji meczu przez panel Strefy Gola powinno zostać ustawione:

- `manualOverride: true`

Synchronizator nie powinien wtedy nadpisywać ręcznie zmienionego spotkania.

## 6. Uwagi

Scraper zależy od aktualnej struktury HTML PodkarpacieLIVE. Jeżeli serwis zmieni strukturę strony, parser może wymagać aktualizacji.

Synchronizator nie usuwa całej kolekcji `matches` i nie tworzy od nowa istniejących spotkań.
