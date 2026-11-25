# Native save bridge

## Architecture

The `NativeSaveBridge` JNI layer uses the upstream `d1edit` C++ core from [hooligan97/diablo_character_editor_build](https://github.com/hooligan97/diablo_character_editor_build), pinned as a Git submodule at:

`app/src/main/cpp/vendor/diablo_character_editor_build`

It calls reusable APIs, not the CLI `main()`:
- `MpqArchive::Open` and `ReadArchive(*archive, "hero", ...)` for MPQ open, internal hero extraction, and codec decode.
- `codec_encode` and `MpqWriter::WriteFile("hero", ...)` for updating the hero payload while preserving other archive entries.
- `offsetof(PlayerPack, field)` for patch offsets from the upstream packed structure.

## Raw-data guarantee

`readHero` returns decoded bytes of packed `PlayerPack` as a `ByteArray`. This is the editing session's raw baseline. `patchField` copies it and changes only a supported field's bytes; all remaining bytes, including reserved and unknown data, are retained. The UI should keep this raw snapshot and patch it rather than rebuild a struct from defaults.

Supported field names: `level`, `class`, `baseStrength`, `baseMagic`, `baseDexterity`, `baseVitality`, `statPoints`, `experience`, `gold`, `hpBase`, `maxHpBase`, `manaBase`, `maxManaBase`.

## Build and test notes

The Gradle module invokes CMake and the upstream repo is pinned as a submodule. Initialize it after checkout:

```bash
git submodule update --init --recursive
```

The upstream CMake defines a desktop CLI executable in addition to `d1edit`. The Android wrapper excludes the CLI target from the default build and links the library.

This integration has not yet been built with Android NDK or verified against a real `.sv`/`.hsv` in Android runtime. Before release, build supported ABIs and test read → patch → write → reread for single-player, multiplayer, Spawn, and Hellfire saves. Compare untouched raw bytes and write to a backup/copy first.

The C++ code is derived from DevilutionX and has license obligations. Retain upstream notices and review distribution compatibility.

## Inventory and Hellfire Multiplayer limitations

- The native `PlayerPack` inventory buffer always reserves 40 `InvList` entries. Only the first `_pNumInv` entries are live; remaining entries can contain stale bytes and must not be presented as backpack items. The Kotlin reader uses the packed `_pNumInv` field at offset `0x421`.
- Native item `idx` values are not positions in the Kotlin display catalog. Until an authoritative ID map is available, the UI labels unmatched native IDs instead of assigning a misleading catalog item by modulo.
- Equipment/backpack changes are not serialized yet. Export is stopped when those collections differ from the imported snapshot, rather than silently dropping the changes.
- Legacy Hellfire Multiplayer uses a computer-name-derived codec key. The current bridge does not have the original host name/key and must not write it with the fixed Diablo Multiplayer password. Hellfire MP export is therefore rejected until the correct key source is implemented and tested.
