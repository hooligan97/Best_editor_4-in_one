import {
  ALL_GAME_MODS,
  DIABLO_SPELLS_CATALOG,
  GameMod,
  GAME_MOD_META,
  getGameModFromOrdinal,
  HERO_CLASS_META,
  HeroCharacter,
  heroClassFromIndex,
} from '../models';
import { analyzeMpqHeader, MPQ_MAGIC, MpqHeaderInfo } from './mpqTool';

const DEVX_MAGIC = 0x58564544; // "DEVX"

function extractHeroFromMpq(bytes: Uint8Array, info: MpqHeaderInfo): Uint8Array {
  const headerSize = Math.max(32, info.headerSize);
  const heroCandidateOffset = headerSize;

  if (bytes.length > heroCandidateOffset + 128) {
    const candidateSlice = bytes.slice(heroCandidateOffset);
    const firstChar = String.fromCharCode(candidateSlice[0]);
    if (/^[a-zA-Z0-9]$/.test(firstChar)) {
      return candidateSlice;
    }
  }

  const limit = Math.min(bytes.length - 64, 1024);
  for (let offset = 32; offset < limit; offset += 4) {
    const c = String.fromCharCode(bytes[offset]);
    const cls = bytes[offset + 16] ?? -1;
    if (/^[a-zA-Z]$/.test(c) && cls >= 0 && cls <= 5) {
      return bytes.slice(offset);
    }
  }

  return bytes;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function parseHeroStruct(bytes: Uint8Array): HeroCharacter {
  if (bytes.length < 120) {
    throw new Error(`Hero struct too small (${bytes.length} bytes).`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // Offset 0x00: Name (16 bytes, ASCII null-terminated)
  let rawName = '';
  for (let i = 0; i < 16; i++) {
    const b = bytes[i];
    if (b === 0) break;
    rawName += String.fromCharCode(b);
  }
  const name = rawName.trim() || 'Hero';

  let pos = 16;
  const readInt32 = (): number => {
    const val = view.getInt32(pos, true);
    pos += 4;
    return val;
  };
  const readUint32 = (): number => {
    const val = view.getUint32(pos, true);
    pos += 4;
    return val;
  };

  // Offset 0x10: Class
  const classInt = readInt32();
  const heroClass = heroClassFromIndex(clamp(classInt, 0, 5));

  // Offset 0x14: Level
  const rawLevel = readInt32();
  const level = clamp(rawLevel > 0 ? rawLevel : 1, 1, 60);

  // Offset 0x18: Experience
  const experience = readUint32();

  // Offset 0x1C: Gold
  const gold = readUint32();

  // Stats
  const strength = clamp(readInt32(), 0, 300);
  const baseStrength = clamp(readInt32(), 0, 300);
  const magic = clamp(readInt32(), 0, 300);
  const baseMagic = clamp(readInt32(), 0, 300);
  const dexterity = clamp(readInt32(), 0, 300);
  const baseDexterity = clamp(readInt32(), 0, 300);
  const vitality = clamp(readInt32(), 0, 300);
  const baseVitality = clamp(readInt32(), 0, 300);
  const statPoints = clamp(readInt32(), 0, 500);

  // HP & Mana (64x internal representation in Diablo 1)
  const rawLife = readInt32();
  const rawMaxLife = readInt32();
  const rawBaseLife = readInt32();
  const rawMana = readInt32();
  const rawMaxMana = readInt32();
  const rawBaseMana = readInt32();

  const life = rawLife > 1000 ? Math.floor(rawLife / 64) : Math.max(1, rawLife);
  const maxLife = rawMaxLife > 1000 ? Math.floor(rawMaxLife / 64) : Math.max(1, rawMaxLife);
  const baseLife = rawBaseLife > 1000 ? Math.floor(rawBaseLife / 64) : Math.max(1, rawBaseLife);
  const mana = rawMana > 1000 ? Math.floor(rawMana / 64) : Math.max(0, rawMana);
  const maxMana = rawMaxMana > 1000 ? Math.floor(rawMaxMana / 64) : Math.max(0, rawMaxMana);
  const baseMana = rawBaseMana > 1000 ? Math.floor(rawBaseMana / 64) : Math.max(0, rawBaseMana);

  // Spell levels (64-element array in DevilutionX)
  const spellLevels: Record<string, number> = {};
  if (bytes.length - pos >= 64) {
    const allSpellBytes = bytes.slice(pos, pos + 64);
    for (const spell of DIABLO_SPELLS_CATALOG) {
      const lvl = allSpellBytes[spell.binaryIndex] & 0xff;
      if (lvl >= 1 && lvl <= 15) {
        spellLevels[spell.id] = lvl;
      }
    }
  } else {
    for (const spell of DIABLO_SPELLS_CATALOG) {
      if (pos < bytes.length) {
        const lvl = bytes[pos++] & 0xff;
        if (lvl >= 1 && lvl <= 15) {
          spellLevels[spell.id] = lvl;
        }
      }
    }
  }

  // Check for DEVX extension header at offset 0x200 (512 bytes)
  let isMultiplayer = false;
  let multiplayerSlot = 0;
  let gameMod = GameMod.HELLFIRE;
  let unlockedNightmare = true;
  let unlockedHell = true;
  let pvpKills = 0;
  let deaths = 0;

  if (bytes.length >= 540) {
    const magicHeader = view.getInt32(512, true);
    if (magicHeader === DEVX_MAGIC) {
      isMultiplayer = bytes[516] === 1;
      multiplayerSlot = clamp(bytes[517], 0, 3);
      const modOrd = bytes[518];
      if (modOrd >= 0 && modOrd < ALL_GAME_MODS.length) {
        gameMod = getGameModFromOrdinal(modOrd);
      }
      unlockedNightmare = bytes[519] === 1;
      unlockedHell = bytes[520] === 1;
      pvpKills = view.getInt32(521, true);
      deaths = view.getInt32(525, true);
    }
  }

  return {
    name,
    heroClass,
    level,
    experience,
    gold,
    difficulty: 'Normal',
    dungeonLevel: 0,
    isMultiplayer,
    multiplayerSlot,
    gameMod,
    unlockedNightmare,
    unlockedHell,
    pvpKills,
    deaths,
    strength,
    baseStrength,
    magic,
    baseMagic,
    dexterity,
    baseDexterity,
    vitality,
    baseVitality,
    statPoints,
    life,
    maxLife,
    baseLife,
    mana,
    maxMana,
    baseMana,
    manaShieldActive: false,
    spellLevels,
    equipment: {},
    inventory: [],
    belt: Array(8).fill(null),
    questsCompleted: 0,
  };
}

export function parseSaveBytes(bytes: Uint8Array, filename = ''): HeroCharacter {
  if (bytes.length < 64) {
    throw new Error(`File size is too small for a DevilutionX save file (${bytes.length} bytes).`);
  }

  const mpqInfo = analyzeMpqHeader(bytes);
  const heroBytes = mpqInfo.isValidMpq ? extractHeroFromMpq(bytes, mpqInfo) : bytes;

  const hero = parseHeroStruct(heroBytes);
  const lowerName = filename.toLowerCase();
  const isMpFromFilename = lowerName.includes('multi') || lowerName.includes('d1m');
  const isHfFromFilename = lowerName.endsWith('.hsv');

  return {
    ...hero,
    isMultiplayer: hero.isMultiplayer || isMpFromFilename,
    gameMod: isHfFromFilename ? GameMod.HELLFIRE : hero.gameMod,
  };
}

export function serializeToHeroStruct(hero: HeroCharacter): Uint8Array {
  const size = 1280;
  const bytes = new Uint8Array(size);
  const view = new DataView(bytes.buffer);

  // 0x00: Name (16 bytes, ASCII null-terminated)
  const truncatedName = hero.name.slice(0, 15);
  for (let i = 0; i < truncatedName.length; i++) {
    bytes[i] = truncatedName.charCodeAt(i) & 0x7f;
  }

  let pos = 16;
  const writeInt32 = (val: number) => {
    view.setInt32(pos, val | 0, true);
    pos += 4;
  };
  const writeUint32 = (val: number) => {
    view.setUint32(pos, val >>> 0, true);
    pos += 4;
  };

  // 0x10: Class
  writeInt32(HERO_CLASS_META[hero.heroClass].ordinal);

  // 0x14: Level
  writeInt32(hero.level);

  // 0x18: Experience
  writeUint32(hero.experience);

  // 0x1C: Gold
  writeUint32(hero.gold);

  // Stats
  writeInt32(hero.strength);
  writeInt32(hero.baseStrength);
  writeInt32(hero.magic);
  writeInt32(hero.baseMagic);
  writeInt32(hero.dexterity);
  writeInt32(hero.baseDexterity);
  writeInt32(hero.vitality);
  writeInt32(hero.baseVitality);
  writeInt32(hero.statPoints);

  // HP & Mana in 64x multiplier
  writeInt32(hero.life * 64);
  writeInt32(hero.maxLife * 64);
  writeInt32(hero.baseLife * 64);
  writeInt32(hero.mana * 64);
  writeInt32(hero.maxMana * 64);
  writeInt32(hero.baseMana * 64);

  // Spells (64 bytes)
  for (const spell of DIABLO_SPELLS_CATALOG) {
    const lvl = hero.spellLevels[spell.id] ?? 0;
    bytes[pos + spell.binaryIndex] = clamp(lvl, 0, 15);
  }

  // DEVX metadata block at offset 512 (0x200)
  view.setInt32(512, DEVX_MAGIC, true);
  bytes[516] = hero.isMultiplayer ? 1 : 0;
  bytes[517] = clamp(hero.multiplayerSlot, 0, 3);
  bytes[518] = GAME_MOD_META[hero.gameMod].ordinal;
  bytes[519] = hero.unlockedNightmare ? 1 : 0;
  bytes[520] = hero.unlockedHell ? 1 : 0;
  view.setInt32(521, hero.pvpKills, true);
  view.setInt32(525, hero.deaths, true);

  return bytes;
}

export function createSaveFileMpq(hero: HeroCharacter): Uint8Array {
  const heroData = serializeToHeroStruct(hero);
  const headerSize = 32;
  const archiveSize = headerSize + heroData.length;
  const result = new Uint8Array(archiveSize);
  const view = new DataView(result.buffer);

  view.setUint32(0, MPQ_MAGIC, true);
  view.setInt32(4, headerSize, true);
  view.setInt32(8, archiveSize, true);
  view.setInt16(12, 0, true);
  view.setInt16(14, 3, true); // 512 << 3 = 4096 sector size
  view.setInt32(16, headerSize, true);
  view.setInt32(20, headerSize, true);
  view.setInt32(24, 1, true);
  view.setInt32(28, 1, true);

  result.set(heroData, headerSize);
  return result;
}
