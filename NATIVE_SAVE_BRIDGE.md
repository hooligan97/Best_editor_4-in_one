# Native save bridge integration

## Current boundary

`NativeSaveBridge` exposes the decoded `PlayerPack` payload as raw bytes to Kotlin. This avoids a JSON conversion round-trip. The native read/write implementation uses the upstream APIs:

- `MpqArchive::Open` and `ReadArchive(archive, "hero", ...)`
- `codec_decode` / `codec_encode` through `ReadArchive` and the upstream save codec
- `MpqWriter::WriteFile("hero", ...)` to replace the hero entry without rebuilding the archive by hand

The bridge validates that the decoded hero length matches `sizeof(PlayerPack)`. The multiplayer/spawn flags select the password through `pfile_get_password()`; Hellfire is retained as an explicit game-mode flag.

## Raw-data edit policy

1. Load a save to a raw decoded byte array.
2. Keep that array as the authoritative source of truth for the editing session.
3. Decode only supported fields for the Compose view model.
4. When a field is edited, patch its corresponding bytes in a copy of the original array; do not instantiate a zero-filled PlayerPack and serialize every field.
5. Save the patched raw bytes to a copy of the original archive first.
6. Re-open the output and compare every untouched byte/field, as well as the edited fields.

Unknown fields and reserved bytes are therefore preserved. The Kotlin model should carry this raw snapshot (or an opaque session identifier) alongside its display values.

## Upstream source and build status

The native bridge source expects the upstream C++ project to be vendored at:

`app/src/main/cpp/vendor/diablo_character_editor_build`

The CMake file intentionally fails with an explanatory error until that source and its third-party dependencies are present. Do not enable a release build with a stub/no-op parser. The upstream CLI's `main()` is not called; JNI directly uses the archive/codec APIs.

The upstream implementation is derived from DevilutionX and carries its own license obligations. Preserve its license notices and review distribution compatibility before shipping the app.
