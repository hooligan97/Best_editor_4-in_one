# Best_editor_4-in_one

Androidowy edytor postaci i zapisów Diablo/DevilutionX, oparty na Kotlinie, Jetpack Compose i natywnym JNI.

## Ekran główny\n\nHomeScreen prezentuje imię, klasę, poziom oraz szybkie atrybuty (Siła, Zręczność, Witalność). Przycisk zapisu otwiera systemowy picker dokumentów i eksportuje dane przez SaveFileService. NativeSaveBridge udostępnia osobny interfejs JNI do read/patch/write PlayerPack; nie jest jeszcze używany przez ten ekran, ponieważ wymaga transferu oryginalnego archiwum przez SAF i zachowania danych MPQ.\n\n## Architektura
- Kotlin + Jetpack Compose / Material 3: UI.
- CharacterViewModel: stan postaci w StateFlow oraz akcje edycji.
- Warstwa danych: modele, parsery i usługi plików.
- JNI/C++: NativeSaveBridge udostępnia readHero, patchField i writeHero.
- CMake + Android NDK: budują bibliotekę natywną opartą o diablo_character_editor_build. Mostek pracuje na wpisie MPQ „hero”; nie uruchamia programu CLI.

## Format plików
- .sv — zapisy Diablo/DevilutionX w trybie single-player lub multiplayer, zależnie od wariantu.
- .hsv — zapisy Hellfire. Rozszerzenie nie określa samo z siebie trybu multiplayer.
Nie wszystkie mody i warianty archiwów są potwierdzone.

## Budowanie
1. Zainstaluj Android Studio, JDK 17, Android SDK i Android NDK.
2. Otwórz projekt w Android Studio i zaakceptuj wymagane SDK/NDK.
3. Jeśli źródło natywne jest submodulem: git submodule update --init --recursive.
4. Uruchom ./gradlew assembleDebug (Windows: gradlew.bat assembleDebug).

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
- Kompilacja NDK i testy na urządzeniu muszą być potwierdzone w CI przed uznaniem zmian JNI za gotowe.
- Nie wszystkie alternatywne parsery Kotlinowe obsługują pełne struktury MPQ.
- Zmiany zapisów są ryzykowne; testuj kopie i sprawdź możliwość ponownego wczytania w grze.

## Licencje
Przed dystrybucją sprawdź licencje projektu oraz dołączonych komponentów natywnych.
