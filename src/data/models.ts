export enum GameMod {
  VANILLA_DIABLO = 'VANILLA_DIABLO',
  HELLFIRE = 'HELLFIRE',
  VKD_MOD = 'VKD_MOD',
  MIDDLE_EARTH = 'MIDDLE_EARTH',
}

export interface GameModMeta {
  id: string;
  enumValue: GameMod;
  ordinal: number;
  displayName: string;
  shortName: string;
  subtitle: string;
  description: string;
  defaultSaveExtension: string;
  maxLevel: number;
  isMod: boolean;
}

export const GAME_MOD_META: Record<GameMod, GameModMeta> = {
  [GameMod.VANILLA_DIABLO]: {
    id: 'vanilla',
    enumValue: GameMod.VANILLA_DIABLO,
    ordinal: 0,
    displayName: 'Diablo 1 (Vanilla)',
    shortName: 'Diablo 1',
    subtitle: 'Classic 1996 Tristram',
    description:
      'Original Diablo 1 game with Warrior, Rogue, and Sorcerer. Single and multiplayer hero support.',
    defaultSaveExtension: 'sv',
    maxLevel: 50,
    isMod: false,
  },
  [GameMod.HELLFIRE]: {
    id: 'hellfire',
    enumValue: GameMod.HELLFIRE,
    ordinal: 1,
    displayName: 'Hellfire Expansion',
    shortName: 'Hellfire',
    subtitle: 'Sierra 1997 Expansion',
    description:
      'Adds Monk, Bard, Barbarian, Hive & Crypt dungeon depths, Hellfire spells, runes, and oils.',
    defaultSaveExtension: 'hsv',
    maxLevel: 50,
    isMod: false,
  },
  [GameMod.VKD_MOD]: {
    id: 'vkd',
    enumValue: GameMod.VKD_MOD,
    ordinal: 2,
    displayName: 'VKDMod Overhaul',
    shortName: 'VKDMod',
    subtitle: 'DevilutionX Rebalance',
    description:
      'Enhanced DevilutionX balance mod with high-tier boss drop affixes, level 60 cap, and custom unique armaments.',
    defaultSaveExtension: 'sv',
    maxLevel: 60,
    isMod: true,
  },
  [GameMod.MIDDLE_EARTH]: {
    id: 'middle_earth',
    enumValue: GameMod.MIDDLE_EARTH,
    ordinal: 3,
    displayName: 'Middle Earth Mod',
    shortName: 'Middle Earth',
    subtitle: 'Lord of the Rings Mod',
    description:
      'Total conversion mod for DevilutionX featuring LOTR lore, The One Ring, Narsil, Mithril Mail, and Moria depths.',
    defaultSaveExtension: 'sv',
    maxLevel: 50,
    isMod: true,
  },
};

export const ALL_GAME_MODS: GameMod[] = [
  GameMod.VANILLA_DIABLO,
  GameMod.HELLFIRE,
  GameMod.VKD_MOD,
  GameMod.MIDDLE_EARTH,
];

export function getGameModFromId(id: string): GameMod {
  const normalized = id.trim().toLowerCase();
  for (const mod of ALL_GAME_MODS) {
    const meta = GAME_MOD_META[mod];
    if (
      meta.id.toLowerCase() === normalized ||
      mod.toLowerCase() === normalized ||
      meta.shortName.toLowerCase() === normalized
    ) {
      return mod;
    }
  }
  return GameMod.HELLFIRE;
}

export function getGameModFromOrdinal(ordinal: number): GameMod {
  return ALL_GAME_MODS[ordinal] ?? GameMod.HELLFIRE;
}

export enum HeroClass {
  WARRIOR = 'WARRIOR',
  ROGUE = 'ROGUE',
  SORCERER = 'SORCERER',
  MONK = 'MONK',
  BARD = 'BARD',
  BARBARIAN = 'BARBARIAN',
}

export interface HeroClassMeta {
  enumValue: HeroClass;
  ordinal: number;
  displayName: string;
  title: string;
  maxStrength: number;
  maxMagic: number;
  maxDexterity: number;
  maxVitality: number;
  baseStrength: number;
  baseMagic: number;
  baseDexterity: number;
  baseVitality: number;
  baseHp: number;
  baseMana: number;
  isHellfire: boolean;
}

export const HERO_CLASS_META: Record<HeroClass, HeroClassMeta> = {
  [HeroClass.WARRIOR]: {
    enumValue: HeroClass.WARRIOR,
    ordinal: 0,
    displayName: 'Warrior',
    title: 'Knight of Khanduras',
    maxStrength: 250,
    maxMagic: 50,
    maxDexterity: 60,
    maxVitality: 100,
    baseStrength: 30,
    baseMagic: 10,
    baseDexterity: 20,
    baseVitality: 25,
    baseHp: 70,
    baseMana: 10,
    isHellfire: false,
  },
  [HeroClass.ROGUE]: {
    enumValue: HeroClass.ROGUE,
    ordinal: 1,
    displayName: 'Rogue',
    title: 'Sightless Eye Archer',
    maxStrength: 55,
    maxMagic: 70,
    maxDexterity: 250,
    maxVitality: 80,
    baseStrength: 20,
    baseMagic: 15,
    baseDexterity: 30,
    baseVitality: 20,
    baseHp: 45,
    baseMana: 22,
    isHellfire: false,
  },
  [HeroClass.SORCERER]: {
    enumValue: HeroClass.SORCERER,
    ordinal: 2,
    displayName: 'Sorcerer',
    title: 'Vizjerei Mage',
    maxStrength: 45,
    maxMagic: 250,
    maxDexterity: 85,
    maxVitality: 80,
    baseStrength: 15,
    baseMagic: 35,
    baseDexterity: 15,
    baseVitality: 20,
    baseHp: 30,
    baseMana: 70,
    isHellfire: false,
  },
  [HeroClass.MONK]: {
    enumValue: HeroClass.MONK,
    ordinal: 3,
    displayName: 'Monk',
    title: 'Staff Master',
    maxStrength: 150,
    maxMagic: 80,
    maxDexterity: 150,
    maxVitality: 80,
    baseStrength: 25,
    baseMagic: 15,
    baseDexterity: 25,
    baseVitality: 20,
    baseHp: 50,
    baseMana: 30,
    isHellfire: true,
  },
  [HeroClass.BARD]: {
    enumValue: HeroClass.BARD,
    ordinal: 4,
    displayName: 'Bard',
    title: 'Dual Wield Jack-of-all-trades',
    maxStrength: 120,
    maxMagic: 120,
    maxDexterity: 120,
    maxVitality: 100,
    baseStrength: 20,
    baseMagic: 20,
    baseDexterity: 20,
    baseVitality: 20,
    baseHp: 45,
    baseMana: 35,
    isHellfire: true,
  },
  [HeroClass.BARBARIAN]: {
    enumValue: HeroClass.BARBARIAN,
    ordinal: 5,
    displayName: 'Barbarian',
    title: 'Northern Berserker',
    maxStrength: 270,
    maxMagic: 0,
    maxDexterity: 40,
    maxVitality: 150,
    baseStrength: 40,
    baseMagic: 0,
    baseDexterity: 15,
    baseVitality: 30,
    baseHp: 80,
    baseMana: 0,
    isHellfire: true,
  },
};

export const ALL_HERO_CLASSES: HeroClass[] = [
  HeroClass.WARRIOR,
  HeroClass.ROGUE,
  HeroClass.SORCERER,
  HeroClass.MONK,
  HeroClass.BARD,
  HeroClass.BARBARIAN,
];

export function heroClassFromString(name: string): HeroClass {
  const normalized = name.trim().toLowerCase();
  for (const cls of ALL_HERO_CLASSES) {
    if (
      cls.toLowerCase() === normalized ||
      HERO_CLASS_META[cls].displayName.toLowerCase() === normalized
    ) {
      return cls;
    }
  }
  return HeroClass.WARRIOR;
}

export function heroClassFromIndex(index: number): HeroClass {
  return ALL_HERO_CLASSES[index] ?? HeroClass.WARRIOR;
}

export function getRoleTitle(heroClass: HeroClass, mod: GameMod): string {
  if (mod === GameMod.MIDDLE_EARTH) {
    switch (heroClass) {
      case HeroClass.WARRIOR:
        return 'Knight of Gondor';
      case HeroClass.ROGUE:
        return 'Dúnedain Ranger / Elven Archer';
      case HeroClass.SORCERER:
        return 'Istari Wizard';
      case HeroClass.MONK:
        return 'Elven Lore-master';
      case HeroClass.BARD:
        return 'Minstrel of Rivendell';
      case HeroClass.BARBARIAN:
        return 'Dwarf Warrior of Erebor';
    }
  }
  if (mod === GameMod.VKD_MOD) {
    switch (heroClass) {
      case HeroClass.WARRIOR:
        return 'VKD Champion Knight';
      case HeroClass.ROGUE:
        return 'VKD Shadow Stalker';
      case HeroClass.SORCERER:
        return 'VKD Archon Mage';
      case HeroClass.MONK:
        return 'VKD Martial Master';
      case HeroClass.BARD:
        return 'VKD Blade Dancer';
      case HeroClass.BARBARIAN:
        return 'VKD Juggernaut Berserker';
    }
  }
  return HERO_CLASS_META[heroClass].title;
}

export enum ItemQuality {
  NORMAL = 'NORMAL',
  MAGIC = 'MAGIC',
  UNIQUE = 'UNIQUE',
}

export const ITEM_QUALITY_LABELS: Record<ItemQuality, string> = {
  [ItemQuality.NORMAL]: 'Normal',
  [ItemQuality.MAGIC]: 'Magic',
  [ItemQuality.UNIQUE]: 'Unique',
};

export function getItemQualityColor(quality: ItemQuality): string {
  switch (quality) {
    case ItemQuality.UNIQUE:
      return '#FFCC33';
    case ItemQuality.MAGIC:
      return '#4C8CFF';
    case ItemQuality.NORMAL:
      return '#E8E0D5';
  }
}

export enum EquipSlot {
  HEAD = 'HEAD',
  NECK = 'NECK',
  TORSO = 'TORSO',
  LEFT_HAND = 'LEFT_HAND',
  RIGHT_HAND = 'RIGHT_HAND',
  LEFT_RING = 'LEFT_RING',
  RIGHT_RING = 'RIGHT_RING',
}

export const EQUIP_SLOT_META: Record<EquipSlot, { displayName: string; shortLabel: string }> = {
  [EquipSlot.HEAD]: { displayName: 'Head', shortLabel: 'Helm' },
  [EquipSlot.NECK]: { displayName: 'Neck', shortLabel: 'Amulet' },
  [EquipSlot.TORSO]: { displayName: 'Torso', shortLabel: 'Armor' },
  [EquipSlot.LEFT_HAND]: { displayName: 'Left Hand', shortLabel: 'Main Hand' },
  [EquipSlot.RIGHT_HAND]: { displayName: 'Right Hand', shortLabel: 'Off Hand / Shield' },
  [EquipSlot.LEFT_RING]: { displayName: 'Left Finger', shortLabel: 'Ring 1' },
  [EquipSlot.RIGHT_RING]: { displayName: 'Right Finger', shortLabel: 'Ring 2' },
};

export const ALL_EQUIP_SLOTS: EquipSlot[] = [
  EquipSlot.HEAD,
  EquipSlot.NECK,
  EquipSlot.TORSO,
  EquipSlot.LEFT_HAND,
  EquipSlot.RIGHT_HAND,
  EquipSlot.LEFT_RING,
  EquipSlot.RIGHT_RING,
];

export interface DiabloItem {
  id: string;
  itemId: number;
  name: string;
  baseType: string;
  quality: ItemQuality;
  prefix: string;
  suffix: string;
  durability: number;
  maxDurability: number;
  isIndestructible: boolean;
  charges: number;
  maxCharges: number;
  armorClass: number;
  minDamage: number;
  maxDamage: number;
  toHitBonus: number;
  damageBonus: number;
  strengthReq: number;
  magicReq: number;
  dexterityReq: number;
  fireResist: number;
  lightningResist: number;
  magicResist: number;
  allAttributesBonus: number;
  hitPointsBonus: number;
  manaBonus: number;
  extraDescription: string;
  gridWidth: number;
  gridHeight: number;
  gridX: number;
  gridY: number;
  modOrigin: GameMod;
  recommendedClasses: HeroClass[];
  defaultSlot?: EquipSlot;
}

export function generateItemUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'item-' + Math.random().toString(36).slice(2, 11) + '-' + Date.now().toString(36);
}

export function createDiabloItem(partial: Partial<DiabloItem> & Pick<DiabloItem, 'name' | 'baseType'>): DiabloItem {
  return {
    id: generateItemUuid(),
    itemId: 0,
    quality: ItemQuality.NORMAL,
    prefix: '',
    suffix: '',
    durability: 50,
    maxDurability: 50,
    isIndestructible: false,
    charges: 0,
    maxCharges: 0,
    armorClass: 0,
    minDamage: 0,
    maxDamage: 0,
    toHitBonus: 0,
    damageBonus: 0,
    strengthReq: 0,
    magicReq: 0,
    dexterityReq: 0,
    fireResist: 0,
    lightningResist: 0,
    magicResist: 0,
    allAttributesBonus: 0,
    hitPointsBonus: 0,
    manaBonus: 0,
    extraDescription: '',
    gridWidth: 1,
    gridHeight: 1,
    gridX: -1,
    gridY: -1,
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [],
    ...partial,
  };
}

export function getItemFullTitle(item: DiabloItem): string {
  if (item.quality === ItemQuality.UNIQUE) {
    return item.name;
  }
  if (item.quality === ItemQuality.MAGIC) {
    const pre = item.prefix.trim() ? `${item.prefix} ` : '';
    const suf = item.suffix.trim() ? ` ${item.suffix}` : '';
    const combined = `${pre}${item.baseType}${suf}`.trim();
    return combined || item.name;
  }
  return item.baseType || item.name;
}

export function getInferredSlot(item: DiabloItem): EquipSlot | undefined {
  if (item.defaultSlot) return item.defaultSlot;
  const bt = item.baseType.toLowerCase();
  if (bt.includes('potion') || bt.includes('scroll') || bt.includes('oil') || bt.includes('rune')) {
    return undefined;
  }
  if (bt.includes('helm') || bt.includes('cap') || bt.includes('crown') || bt.includes('hood')) {
    return EquipSlot.HEAD;
  }
  if (bt.includes('mail') || bt.includes('plate') || bt.includes('armor') || bt.includes('robe') || bt.includes('cloak')) {
    return EquipSlot.TORSO;
  }
  if (bt.includes('shield') || bt.includes('buckler')) {
    return EquipSlot.RIGHT_HAND;
  }
  if (bt.includes('amulet') || bt.includes('phial')) {
    return EquipSlot.NECK;
  }
  if (bt.includes('ring')) {
    return EquipSlot.LEFT_RING;
  }
  return EquipSlot.LEFT_HAND;
}

export enum SpellSchool {
  FIRE = 'FIRE',
  LIGHTNING = 'LIGHTNING',
  ARCANE = 'ARCANE',
  FORBIDDEN = 'FORBIDDEN',
  HELLFIRE = 'HELLFIRE',
}

export const SPELL_SCHOOL_LABELS: Record<SpellSchool, string> = {
  [SpellSchool.FIRE]: 'Fire Magic',
  [SpellSchool.LIGHTNING]: 'Lightning Magic',
  [SpellSchool.ARCANE]: 'Arcane & Utility',
  [SpellSchool.FORBIDDEN]: 'Forbidden Arts',
  [SpellSchool.HELLFIRE]: 'Hellfire Spells',
};

export const ALL_SPELL_SCHOOLS: SpellSchool[] = [
  SpellSchool.FIRE,
  SpellSchool.LIGHTNING,
  SpellSchool.ARCANE,
  SpellSchool.FORBIDDEN,
  SpellSchool.HELLFIRE,
];

export interface DiabloSpell {
  id: string;
  binaryIndex: number;
  name: string;
  school: SpellSchool;
  minLevel: number;
  maxLevel: number;
  manaCost: string;
  description: string;
}

export const DIABLO_SPELLS_CATALOG: DiabloSpell[] = [
  // Fire
  { id: 'firebolt', binaryIndex: 1, name: 'Firebolt', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '6', description: 'Fires a concentrated bolt of flame at target.' },
  { id: 'fireball', binaryIndex: 12, name: 'Fireball', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '16', description: 'Explodes into a fiery blast dealing heavy splash damage.' },
  { id: 'firewall', binaryIndex: 6, name: 'Fire Wall', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '28', description: 'Creates an incinerating barrier that consumes all who pass.' },
  { id: 'inferno', binaryIndex: 20, name: 'Inferno', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '19', description: 'Streams continuous gouts of devastating flame.' },
  { id: 'flame_wave', binaryIndex: 15, name: 'Flame Wave', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '35', description: 'Sends a sweeping wall of fire across the battlefield.' },
  { id: 'guardian', binaryIndex: 13, name: 'Guardian', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '50', description: 'Summons a three-headed dragon from the nether realms.' },
  { id: 'apocalypse', binaryIndex: 23, name: 'Apocalypse', school: SpellSchool.FIRE, minLevel: 1, maxLevel: 15, manaCost: '60', description: 'Calls celestial fire raining destruction upon all enemies.' },

  // Lightning
  { id: 'charged_bolt', binaryIndex: 29, name: 'Charged Bolt', school: SpellSchool.LIGHTNING, minLevel: 1, maxLevel: 15, manaCost: '6', description: 'Releases erratically dancing electric sparks.' },
  { id: 'lightning', binaryIndex: 3, name: 'Lightning', school: SpellSchool.LIGHTNING, minLevel: 1, maxLevel: 15, manaCost: '19', description: 'Strikes enemies with a straight discharge of high-voltage lightning.' },
  { id: 'chain_lightning', binaryIndex: 14, name: 'Chain Lightning', school: SpellSchool.LIGHTNING, minLevel: 1, maxLevel: 15, manaCost: '30', description: 'Arcs multiple lethal electrical branches jumping between foes.' },
  { id: 'nova', binaryIndex: 18, name: 'Nova', school: SpellSchool.LIGHTNING, minLevel: 1, maxLevel: 15, manaCost: '60', description: 'Expands a deadly 360-degree shockwave ring of electrical destruction.' },
  { id: 'flash', binaryIndex: 4, name: 'Flash', school: SpellSchool.LIGHTNING, minLevel: 1, maxLevel: 15, manaCost: '30', description: 'Emits an instantaneous close-quarters burst of blinding shock.' },

  // Arcane & Utility
  { id: 'healing', binaryIndex: 2, name: 'Healing', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '8', description: "Channels divine energy to restore the caster's lost hit points." },
  { id: 'heal_other', binaryIndex: 33, name: 'Heal Other', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '8', description: 'Directs restorative holy energy to mend wounded companions.' },
  { id: 'town_portal', binaryIndex: 7, name: 'Town Portal', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '35', description: 'Opens a mystical rift directly back to the town of Tristram.' },
  { id: 'teleport', binaryIndex: 22, name: 'Teleport', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '35', description: 'Bends space to instantaneously relocate to target destination.' },
  { id: 'mana_shield', binaryIndex: 11, name: 'Mana Shield', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '33', description: 'Envelops caster in an arcane aegis, redirecting physical damage to mana.' },
  { id: 'phasing', binaryIndex: 10, name: 'Phasing', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '25', description: 'Temporarily blinks through the veil to an unpredictable nearby location.' },
  { id: 'stone_curse', binaryIndex: 8, name: 'Stone Curse', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '40', description: 'Transmutes demonic flesh into motionless, brittle solid stone.' },
  { id: 'identify', binaryIndex: 5, name: 'Identify', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '1', description: 'Deciphers ancient runic enchantments on mysterious magical items.' },
  { id: 'infravision', binaryIndex: 9, name: 'Infravision', school: SpellSchool.ARCANE, minLevel: 1, maxLevel: 15, manaCost: '41', description: 'Allows supernatural perception through dark dungeon corridors.' },

  // Forbidden
  { id: 'holy_bolt', binaryIndex: 30, name: 'Holy Bolt', school: SpellSchool.FORBIDDEN, minLevel: 1, maxLevel: 15, manaCost: '7', description: 'Dispatches searing sanctified bolts that obliterate undead fiends.' },
  { id: 'blood_star', binaryIndex: 37, name: 'Blood Star', school: SpellSchool.FORBIDDEN, minLevel: 1, maxLevel: 15, manaCost: '14', description: 'Launches orbs of distilled vitality that penetrate demonic armor.' },
  { id: 'bone_spirit', binaryIndex: 35, name: 'Bone Spirit', school: SpellSchool.FORBIDDEN, minLevel: 1, maxLevel: 15, manaCost: '24', description: 'Unleashes a hungry vengeful spectre that drains 1/3 of enemy life.' },
  { id: 'golem', binaryIndex: 38, name: 'Golem', school: SpellSchool.FORBIDDEN, minLevel: 1, maxLevel: 15, manaCost: '100', description: 'Forges an enduring animated clay monstrosity to crush adversaries.' },

  // Hellfire
  { id: 'ring_of_fire', binaryIndex: 46, name: 'Ring of Fire', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '40', description: 'Erects a protective concentric ring of intense demonic flame.' },
  { id: 'lightning_wall', binaryIndex: 42, name: 'Lightning Wall', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '45', description: 'Forms a shimmering barrier of continuous high-voltage crackle.' },
  { id: 'warp', binaryIndex: 43, name: 'Warp', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '25', description: 'Warps through the ethereal labyrinth to a random nearby room.' },
  { id: 'reflect', binaryIndex: 44, name: 'Reflect', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '45', description: 'Rebounds incoming ranged enemy missiles back toward attackers.' },
  { id: 'berserk', binaryIndex: 45, name: 'Berserk', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '50', description: 'Drives lesser monsters into blind homicidal fury against each other.' },
  { id: 'search', binaryIndex: 47, name: 'Search', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '5', description: 'Illuminates hidden treasures and items dropped on dungeon floors.' },
  { id: 'jester', binaryIndex: 52, name: 'Jester', school: SpellSchool.HELLFIRE, minLevel: 1, maxLevel: 15, manaCost: '30', description: 'Casts a chaotic random spell effect with unpredictable consequences.' },
];

export interface HeroCharacter {
  name: string;
  heroClass: HeroClass;
  level: number;
  experience: number;
  gold: number;
  difficulty: string;
  dungeonLevel: number;

  // Game Mod & Multiplayer
  isMultiplayer: boolean;
  multiplayerSlot: number;
  gameMod: GameMod;
  unlockedNightmare: boolean;
  unlockedHell: boolean;
  pvpKills: number;
  deaths: number;

  // Stats
  strength: number;
  baseStrength: number;
  magic: number;
  baseMagic: number;
  dexterity: number;
  baseDexterity: number;
  vitality: number;
  baseVitality: number;
  statPoints: number;

  // Life & Mana
  life: number;
  maxLife: number;
  baseLife: number;
  mana: number;
  maxMana: number;
  baseMana: number;
  manaShieldActive: boolean;

  // Spells: spellId -> level (0..15)
  spellLevels: Record<string, number>;

  // Equipment: Slot -> Item
  equipment: Partial<Record<EquipSlot, DiabloItem>>;

  // Backpack inventory (up to 40 slots)
  inventory: DiabloItem[];

  // Belt / Speed Bar (8 slots)
  belt: Array<DiabloItem | null>;

  // Quests completed
  questsCompleted: number;
}

export const LEVEL_XP_TABLE: number[] = [
  0, 0, 2000, 4620, 8040, 12489, 18258, 25712, 35309, 47622, // 1-9
  63364, 83419, 108879, 141086, 181683, 231075, 313656, 424067, 571190, 766569, // 10-19
  1025156, 1366227, 1814568, 2401895, 3168651, 4166271, 5459523, 7130496, 9281874, 12042092, // 20-29
  15571031, 20066900, 25774405, 32994399, 42095202, 53525811, 67831218, 85683411, 107909214, 135517105, // 30-39
  169726868, 211996515, 264104272, 328221808, 406963404, 503417531, 621376848, 765419981, 940802380, 1154091557, // 40-49
  1413867624, // 50
];

export function xpForLevel(lvl: number): number {
  const clamped = Math.max(1, Math.min(50, lvl));
  return LEVEL_XP_TABLE[clamped] ?? 0;
}

export function levelForXp(xp: number): number {
  for (let i = 50; i >= 1; i--) {
    if (xp >= LEVEL_XP_TABLE[i]) return i;
  }
  return 1;
}
