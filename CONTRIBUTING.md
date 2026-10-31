# Contributing

Dziękujemy za wkład w Best_editor_4-in_one.

## Zgłaszanie błędów
- Otwórz GitHub Issue z wersją aplikacji, urządzeniem/Androidem, krokami reprodukcji oraz oczekiwanym i faktycznym wynikiem.
- Przy błędach parsera podaj rozszerzenie (.sv/.hsv), tryb SP/MP i nazwę moda.
- Nie publikuj prywatnych zapisów ani danych osobowych. Udostępniaj wyłącznie pliki, do których masz prawa.

## Pull requesty
1. Utwórz gałąź od aktualnego main, np. fix/parser-bounds lub feat/home-screen.
2. Ogranicz PR do jednego tematu. Opisz powód, zachowanie przed/po i ryzyka kompatybilności.
3. Dodaj/zmień testy. Dla JNI opisz kompilację NDK oraz weryfikację poprawnych i błędnych plików.
4. Uruchom ./gradlew test i ./gradlew assembleDebug; jeśli możliwe, sprawdź NDK i działanie na urządzeniu.
5. Nie commituj tokenów, kluczy, plików lokalnych, prywatnych save'ów ani APK.

## Konwencje
- Kotlin: klasy UpperCamelCase, funkcje i pola lowerCamelCase, preferuj val, data class i niezmienne modele.
- Compose: hoistuj współdzielony stan do ViewModelu; przyjmuj Modifier i callbacki; side-effecty obsługuj API Compose.
- JNI/C++: waliduj argumenty/rozmiary/zakresy; nie przenoś wyjątków C++ przez JNI; zachowuj nieznane bajty.
- PR: krótki tytuł, podsumowanie, testy (także niewykonane) i zrzuty ekranu dla UI.
