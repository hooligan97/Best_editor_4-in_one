# DevilutionX Editor (React)

Character and save game editor for **DevilutionX**, **Diablo 1 (Classic)**, **Hellfire**, **VKDMod**, and **Middle Earth Mod**, rewritten as a React + TypeScript + Tailwind CSS web application.

## Features

- **Hero Overview**: Edit character name, class (Warrior, Rogue, Sorcerer, Monk, Bard, Barbarian), Game Mod mode, Level & XP progression, Gold, Difficulty, and Dungeon Floor.
- **Multiplayer Character Settings**: Toggle Single Player (`single_*.sv`) vs Multiplayer (`multi_*.sv` / `.hsv`), slot selection (`#0`–`#3`), and Nightmare/Hell difficulty unlock overrides.
- **Attributes & Orbs**: Interactive Life & Mana orbs, Mana Shield toggle, Max Life/Mana sliders, Core Attributes (`Strength`, `Magic`, `Dexterity`, `Vitality`, `Stat Points`) with class caps, and live Combat Ratings & Elemental Resistances.
- **Spellbook**: Search, school filter, and level `0–15` sliders for all 32 Diablo & Hellfire spells with one-click Max All (`15`).
- **Inventory & Paperdoll**: 7-slot equipped gear paperdoll, 8-slot Belt / Speed Bar, 40-slot Backpack, Item Inspector modal, and class-recommended gear sets.
- **Armory**: Searchable and filterable catalog of 75+ unique, magic, and consumable items across Vanilla Diablo, Hellfire, Middle Earth Mod, and VKDMod.
- **Saves & MPQ Tools**: Import and export DevilutionX `.sv`/`.hsv` MPQ archives, inspect MPQ headers and binary hex dumps, copy/paste/export/import **Noctonic DEADitor JSON**, and manage character snapshots in the local Backup Vault.

## Development

```bash
npm install
npm run dev
```

The development server runs on `http://0.0.0.0:3000`.
