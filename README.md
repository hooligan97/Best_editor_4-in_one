# Best_editor_4-in_one

Androidowy edytor postaci i zapisów Diablo/DevilutionX, oparty na Kotlinie, Jetpack Compose i natywnym JNI.

## Ekran główny

HomeScreen pokazuje imię, klasę, poziom i szybkie atrybuty. Po imporcie prawidłowego MPQ przycisk zapisu korzysta z NativeSaveBridge: archiwum jest kopiowane do pliku roboczego, przed zmianą tworzona jest kopia .bak w prywatnym katalogu aplikacji, a writeHero() zapisuje zmodyfikowany PlayerPack do kopii. Bez załadowanego MPQ zachowany jest dotychczasowy eksport SaveFileService.

Natywny zapis aktualizuje wyłącznie pola obsługiwane przez patchField (poziom, klasę, bazowe atrybuty, stat points, XP, złoto oraz bazowe i maksymalne HP/MP). Imię, ekwipunek, czary i pozostałe pola nie są jeszcze mapowane do PlayerPack i pozostają bez zmian w oryginalnym wpisie. Kopia .bak jest przechowywana w prywatnym katalogu cache aplikacji; nie jest automatycznie widoczna w katalogu zapisów gry.

## Architektura

- Kotlin + Jetpack Compose / Material 3: UI.
- CharacterViewModel: stan postaci w StateFlow oraz akcje edycji.
- Warstwa danych: modele, parsery i usługi plików.
- JNI/C++: NativeSaveBridge udostępnia readHero, patchField i writeHero.
- CMake + Android NDK: budują bibliotekę natywną opartą na diablo_character_editor_build. Mostek aktualizuje wpis MPQ „hero”; nie uruchamia programu CLI.

## Format plików

- .sv — zapisy Diablo/DevilutionX w trybie single-player lub multiplayer, zależnie od wariantu.
- .hsv — zapisy Hellfire. Rozszerzenie nie określa samo z siebie trybu multiplayer.
- Nie wszystkie mody i warianty archiwów są potwierdzone.

## Budowanie

1. Zainstaluj Android Studio, JDK 17, Android SDK i Android NDK.
2. Otwórz projekt w Android Studio i zaakceptuj wymagane SDK/NDK.
3. Jeśli źródło natywne jest submodulem: `git submodule update --init --recursive`.
4. Uruchom `./gradlew assembleDebug` (Windows: `gradlew.bat assembleDebug`).

GitHub Actions buduje APK na push do main oraz pull request do main. Po pushu do main workflow publikuje APK w GitHub Release. NDK/CMake są używane przez externalNativeBuild.

## Dodawanie pola do edytora

1. Dodaj pole do modelu postaci z określeniem typu i dopuszczalnego zakresu.
2. Dodaj metodę aktualizacji w CharacterViewModel, używając niezmiennego copy(...) i StateFlow.
3. Dodaj kontrolkę Compose i callback do właściwego ekranu.
4. Jeśli pole jest serializowane: zweryfikuj strukturę i offset PlayerPack; dodaj obsługę NativeSaveBridge.patchField z offsetof oraz walidacją zakresu.
5. Zaktualizuj parser/serializer, dokumentację i testy jednostkowe.
6. Zachowuj nieznane/zarezerwowane bajty. Nie modyfikuj oryginalnego pliku bez kopii.

## Znane problemy

- Brakuje pełnego zestawu testów round-trip na reprezentatywnych prawdziwych plikach .sv i .hsv z różnymi wersjami/modami.
- Zapis natywny wymaga walidacji na prawdziwych plikach i w grze; obecne mapowanie obejmuje tylko wymienione wyżej pola.
- Nie wszystkie alternatywne parsery Kotlinowe obsługują pełne struktury MPQ.
- Zmiany zapisów są ryzykowne; testuj kopie i sprawdź możliwość ponownego wczytania w grze.

## Licencje

Przed dystrybucją sprawdź licencje projektu oraz dołączonych komponentów natywnych.
