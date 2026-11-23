import {
  ALL_EQUIP_SLOTS,
  ALL_HERO_CLASSES,
  createDiabloItem,
  DIABLO_SPELLS_CATALOG,
  DiabloItem,
  EquipSlot,
  GameMod,
  getInferredSlot,
  HERO_CLASS_META,
  HeroCharacter,
  HeroClass,
  ItemQuality,
  xpForLevel,
} from './models';

export const FULL_ITEM_LIBRARY: DiabloItem[] = [
  // ==========================================
  // WEAPONS: SWORDS (One-handed & Two-handed)
  // ==========================================
  createDiabloItem({
    name: 'The Grandfather',
    itemId: 1,
    baseType: 'Great Sword',
    quality: ItemQuality.UNIQUE,
    minDamage: 13,
    maxDamage: 26,
    damageBonus: 70,
    toHitBonus: 20,
    allAttributesBonus: 5,
    hitPointsBonus: 20,
    armorClass: 0,
    isIndestructible: true,
    extraDescription: 'Legendary one-handed sword of ancient Khanduras barbarian kings',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Arkaine's Valor",
    itemId: 2,
    baseType: 'Splint Mail',
    quality: ItemQuality.UNIQUE,
    armorClass: 25,
    hitPointsBonus: 10,
    strengthReq: 30,
    extraDescription: 'Fastest hit recovery, reduces damage taken by 3 from all sources',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARD],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Lightsabre',
    itemId: 3,
    baseType: 'Bastard Sword',
    quality: ItemQuality.UNIQUE,
    minDamage: 6,
    maxDamage: 14,
    damageBonus: 150,
    lightningResist: 50,
    extraDescription: 'Pure crackling energy; absorbs lightning',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARD, HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "King's Bastard Sword",
    itemId: 500,
    baseType: 'Bastard Sword',
    quality: ItemQuality.MAGIC,
    prefix: "King's",
    damageBonus: 175,
    toHitBonus: 100,
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARD, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),

  // ==========================================
  // WEAPONS: BOWS
  // ==========================================
  createDiabloItem({
    name: 'Windforce',
    baseType: 'Long War Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 1,
    maxDamage: 14,
    damageBonus: 200,
    durability: 45,
    maxDurability: 45,
    strengthReq: 45,
    dexterityReq: 80,
    extraDescription: 'Knocks target back with gale force; the ultimate bow of the Sightless Eye',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Eaglehorn',
    baseType: 'Composite Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 4,
    maxDamage: 10,
    damageBonus: 100,
    toHitBonus: 50,
    dexterityReq: 55,
    isIndestructible: true,
    extraDescription: 'Always hits target with piercing sight; indestructible elven composite bow',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Deadlier Hunter',
    baseType: 'Short Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 3,
    maxDamage: 7,
    damageBonus: 140,
    toHitBonus: 40,
    extraDescription: 'Blinding attack speed with guaranteed precision',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Blackoak Bow',
    baseType: 'Long Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 2,
    maxDamage: 12,
    damageBonus: 50,
    dexterityReq: 40,
    extraDescription: 'Carved from dark weeping oaks of Khanduras; steals life force',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'The Needler',
    baseType: 'Short Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 1,
    maxDamage: 4,
    damageBonus: 50,
    toHitBonus: 50,
    extraDescription: 'Rapid needle fire pinning demons in place',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),

  // ==========================================
  // WEAPONS: STAVES
  // ==========================================
  createDiabloItem({
    name: "Arch-Angel's Staff of Apocalypse",
    baseType: 'War Staff',
    quality: ItemQuality.MAGIC,
    prefix: "Arch-Angel's",
    suffix: 'of Apocalypse',
    minDamage: 8,
    maxDamage: 16,
    charges: 12,
    maxCharges: 12,
    magicReq: 105,
    extraDescription: '+2 to all spell levels, casts screen-clearing Apocalypse charges',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Naj's Puzzler",
    baseType: 'Long Staff',
    quality: ItemQuality.UNIQUE,
    charges: 57,
    maxCharges: 57,
    allAttributesBonus: 10,
    manaBonus: 20,
    extraDescription: 'Instant teleportation charges with unmatched mobility across dungeon floors',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK, HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Staff of Shadows',
    baseType: 'Quarterstaff',
    quality: ItemQuality.UNIQUE,
    minDamage: 6,
    maxDamage: 14,
    damageBonus: 60,
    toHitBonus: 30,
    extraDescription: 'Favorite weapon of monks; blinds enemies on strike with rapid sweep motions',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: [HeroClass.MONK],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Gleamsong',
    baseType: 'Short Staff',
    quality: ItemQuality.UNIQUE,
    charges: 30,
    maxCharges: 30,
    manaBonus: 25,
    extraDescription: 'Resonates with musical spells; favored by Bards and mystic casters',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: [HeroClass.BARD, HeroClass.SORCERER],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Mindcry',
    baseType: 'Long Staff',
    quality: ItemQuality.UNIQUE,
    minDamage: 4,
    maxDamage: 8,
    charges: 69,
    maxCharges: 69,
    allAttributesBonus: 15,
    extraDescription: 'Inflicts mass psychic confusion on hostile monster packs',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Thundercall',
    baseType: 'Composite Staff',
    quality: ItemQuality.UNIQUE,
    charges: 25,
    maxCharges: 25,
    lightningResist: 35,
    extraDescription: 'Calls down cascading chain lightning across Cathedral halls',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),

  // ==========================================
  // WEAPONS: AXES & MACES
  // ==========================================
  createDiabloItem({
    name: "Messerschmidt's Reaver",
    baseType: 'Great Axe',
    quality: ItemQuality.UNIQUE,
    minDamage: 12,
    maxDamage: 30,
    damageBonus: 200,
    toHitBonus: 15,
    allAttributesBonus: 5,
    durability: 50,
    maxDurability: 50,
    extraDescription: 'Brutal two-handed war cleaver dealing tremendous damage per swing',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.BARBARIAN, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "The Butcher's Cleaver",
    baseType: 'Cleaver',
    quality: ItemQuality.UNIQUE,
    minDamage: 4,
    maxDamage: 24,
    strengthReq: 25,
    durability: 10,
    maxDurability: 10,
    extraDescription: "Trophy from the Butcher: 'Ah, fresh meat!' High early cleaving damage",
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Hellslayer',
    baseType: 'Battle Axe',
    quality: ItemQuality.UNIQUE,
    minDamage: 10,
    maxDamage: 25,
    damageBonus: 100,
    hitPointsBonus: 25,
    fireResist: 20,
    extraDescription: 'Engulfs targets in eternal hellfire',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.BARBARIAN, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Schaefer's Hammer",
    baseType: 'War Hammer',
    quality: ItemQuality.UNIQUE,
    minDamage: 9,
    maxDamage: 22,
    toHitBonus: 50,
    lightningResist: 50,
    hitPointsBonus: 50,
    extraDescription: 'Casts static field bursts on impact; indestructible artisan hammer',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'The Dreamflange',
    baseType: 'Mace',
    quality: ItemQuality.UNIQUE,
    minDamage: 3,
    maxDamage: 8,
    manaBonus: 50,
    magicResist: 50,
    allAttributesBonus: 10,
    extraDescription: '+1 to all spell levels, top 1-handed choice for Battle-Mages',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Civerb's Cudgel",
    baseType: 'Club',
    quality: ItemQuality.UNIQUE,
    minDamage: 1,
    maxDamage: 6,
    damageBonus: 200,
    extraDescription: 'Devastating triple damage against demons and demonic lords',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.MONK],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 2,
  }),

  // ==========================================
  // BODY ARMOR
  // ==========================================
  createDiabloItem({
    name: 'Godly Plate of the Whale',
    baseType: 'Full Plate Mail',
    quality: ItemQuality.MAGIC,
    prefix: 'Godly',
    suffix: 'of the Whale',
    armorClass: 175,
    hitPointsBonus: 100,
    durability: 90,
    maxDurability: 90,
    strengthReq: 90,
    extraDescription: 'The Holy Grail of armor: +200% Armor Class & +100 Max Hit Points',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN, HeroClass.MONK],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Demonspike Coat',
    baseType: 'Full Plate Mail',
    quality: ItemQuality.UNIQUE,
    armorClass: 100,
    fireResist: 50,
    isIndestructible: true,
    extraDescription: 'Reduces damage by 6, indestructible spike shell against physical assault',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.ROGUE, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Naj's Light Plate",
    baseType: 'Light Plate',
    quality: ItemQuality.UNIQUE,
    armorClass: 45,
    allAttributesBonus: 5,
    manaBonus: 20,
    magicResist: 20,
    extraDescription: 'Zero movement speed penalty and spell casting hindrance for high casters',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.ROGUE, HeroClass.BARD, HeroClass.MONK],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'The Rainbow Cloak',
    baseType: 'Cloak',
    quality: ItemQuality.UNIQUE,
    armorClass: 12,
    fireResist: 25,
    lightningResist: 25,
    magicResist: 25,
    hitPointsBonus: 15,
    extraDescription: '+25% to all resistances in a featherweight garment',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.ROGUE],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Leather of Aut',
    baseType: 'Hard Leather Armor',
    quality: ItemQuality.UNIQUE,
    armorClass: 15,
    toHitBonus: 20,
    allAttributesBonus: 5,
    extraDescription: 'High flexibility leather tailored for agile Monks and stealth archers',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: [HeroClass.MONK, HeroClass.ROGUE],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Bovine Plate',
    baseType: 'Cow Hide Mail',
    quality: ItemQuality.UNIQUE,
    armorClass: 150,
    hitPointsBonus: 50,
    strengthReq: 50,
    extraDescription: 'Secret cow armor granting bovine constitution and raw vitality',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: [HeroClass.BARBARIAN, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "The Gladiator's Bane",
    baseType: 'Studded Leather',
    quality: ItemQuality.UNIQUE,
    armorClass: 25,
    hitPointsBonus: 20,
    damageBonus: 20,
    extraDescription: 'Empowers melee criticals and absorbs crushing blows',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.BARD, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),

  // ==========================================
  // HELMS & HEADGEAR
  // ==========================================
  createDiabloItem({
    name: 'The Thinking Cap',
    baseType: 'Skull Cap',
    quality: ItemQuality.UNIQUE,
    armorClass: 2,
    manaBonus: 30,
    fireResist: 20,
    lightningResist: 20,
    magicResist: 20,
    extraDescription: '+2 to all spell levels, alters mana absorption for Sorcerers and Monks',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Veil of Steel',
    baseType: 'Great Helm',
    quality: ItemQuality.UNIQUE,
    armorClass: 18,
    fireResist: 50,
    lightningResist: 50,
    magicResist: 50,
    allAttributesBonus: 15,
    extraDescription: '+50% to all elemental and magic resistances; premier protection',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.ROGUE, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Gotterdamerung',
    baseType: 'Great Helm',
    quality: ItemQuality.UNIQUE,
    armorClass: 60,
    allAttributesBonus: 20,
    extraDescription: '+20 to All Attributes, massive 60 AC, zero light radius (Night Vision)',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Royal Crest of Alton',
    baseType: 'Crown',
    quality: ItemQuality.UNIQUE,
    armorClass: 12,
    allAttributesBonus: 10,
    manaBonus: 40,
    durability: 40,
    maxDurability: 40,
    extraDescription: '+10 to All Attributes, +40 Mana, fast hit recovery, royal lineage',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.SORCERER, HeroClass.BARD, HeroClass.MONK],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Harlequin Crest',
    baseType: 'Cap',
    quality: ItemQuality.UNIQUE,
    armorClass: 2,
    allAttributesBonus: 2,
    hitPointsBonus: 15,
    manaBonus: 15,
    extraDescription: '+2 to all attributes, +15 Life & Mana, reduces damage taken',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE, HeroClass.BARD, HeroClass.SORCERER],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: "Overlord's Helm",
    baseType: 'Great Helm',
    quality: ItemQuality.UNIQUE,
    armorClass: 15,
    strengthReq: 50,
    damageBonus: 20,
    hitPointsBonus: 20,
    extraDescription: 'Infuses the wearer with unrestrained berserker fury',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.BARBARIAN, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Helm of Spirits',
    baseType: 'Helm',
    quality: ItemQuality.UNIQUE,
    armorClass: 8,
    hitPointsBonus: 10,
    extraDescription: 'Steals life from foes with each successful melee hit',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),

  // ==========================================
  // SHIELDS
  // ==========================================
  createDiabloItem({
    name: 'Stormshield',
    baseType: 'Gothic Shield',
    quality: ItemQuality.UNIQUE,
    armorClass: 40,
    isIndestructible: true,
    extraDescription: 'Fastest block speed in game, absorbs melee shockwaves, indestructible',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.SORCERER, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Holy Defender',
    baseType: 'Large Shield',
    quality: ItemQuality.UNIQUE,
    armorClass: 15,
    fireResist: 20,
    extraDescription: 'Fast block recovery rate, +20% fire protection against Magma Demons',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARD],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "The Dragon's Breach",
    baseType: 'Kite Shield',
    quality: ItemQuality.UNIQUE,
    armorClass: 18,
    fireResist: 50,
    extraDescription: "Completely neutralizes fire attacks from spitters and Diablo's breath",
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.SORCERER],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Blackoak Shield',
    baseType: 'Small Shield',
    quality: ItemQuality.UNIQUE,
    armorClass: 18,
    hitPointsBonus: 20,
    dexterityReq: 25,
    extraDescription: 'Ebon wood absorbs negative spell energy',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE, HeroClass.BARD],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Deflector',
    baseType: 'Buckler',
    quality: ItemQuality.UNIQUE,
    armorClass: 10,
    extraDescription: 'Reflects incoming arrows and missile spells back at attackers',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.ROGUE],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 2,
  }),

  // ==========================================
  // JEWELRY: RINGS & AMULETS
  // ==========================================
  createDiabloItem({
    name: 'Obsidian Ring of the Zodiac',
    itemId: 600,
    baseType: 'Ring',
    quality: ItemQuality.MAGIC,
    prefix: 'Obsidian',
    suffix: 'of the Zodiac',
    allAttributesBonus: 20,
    fireResist: 40,
    lightningResist: 40,
    magicResist: 40,
    extraDescription: 'The Holy Grail of rings: +20 to All Stats, +40% to All Resistances',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    defaultSlot: EquipSlot.LEFT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: "Dragon's Ring of the Zodiac",
    baseType: 'Ring',
    quality: ItemQuality.MAGIC,
    prefix: "Dragon's",
    suffix: 'of the Zodiac',
    allAttributesBonus: 20,
    manaBonus: 60,
    extraDescription: '+20 to All Stats, +60 Mana Pool; indispensable for high casters',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.ROGUE, HeroClass.MONK, HeroClass.BARD],
    defaultSlot: EquipSlot.RIGHT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Obsidian Amulet of the Zodiac',
    baseType: 'Amulet',
    quality: ItemQuality.MAGIC,
    prefix: 'Obsidian',
    suffix: 'of the Zodiac',
    allAttributesBonus: 20,
    fireResist: 40,
    lightningResist: 40,
    magicResist: 40,
    extraDescription: 'Legendary amulet: +20 to All Attributes, +40% All Resists',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    defaultSlot: EquipSlot.NECK,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: "Dragon's Amulet of the Zodiac",
    baseType: 'Amulet',
    quality: ItemQuality.MAGIC,
    prefix: "Dragon's",
    suffix: 'of the Zodiac',
    allAttributesBonus: 20,
    manaBonus: 60,
    extraDescription: '+20 to All Attributes, +60 to Maximum Mana Pool',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK, HeroClass.BARD],
    defaultSlot: EquipSlot.NECK,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Optic Amulet',
    baseType: 'Amulet',
    quality: ItemQuality.UNIQUE,
    allAttributesBonus: 5,
    lightningResist: 20,
    extraDescription: '+20% Lightning resist, enhanced light radius for dark cathedral depths',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.ROGUE, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.NECK,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Ring of Engagement',
    baseType: 'Ring',
    quality: ItemQuality.UNIQUE,
    armorClass: 5,
    extraDescription: 'Thorns enchantment: damages attackers when they strike you',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.RIGHT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Ring of Regha',
    baseType: 'Ring',
    quality: ItemQuality.UNIQUE,
    magicResist: 25,
    manaBonus: 20,
    extraDescription: 'Ancient sorcerer seal of the Horadrim',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK],
    defaultSlot: EquipSlot.RIGHT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),

  // ==========================================
  // CONSUMABLES, POTIONS, RUNES & OILS
  // ==========================================
  createDiabloItem({
    name: 'Full Rejuvenation Potion',
    baseType: 'Potion',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Instantly restores 100% of both Life and Mana pools',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Elixir of Strength',
    baseType: 'Potion',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Permanently increases Strength by 1 attribute point',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Elixir of Magic',
    baseType: 'Potion',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Permanently increases Magic by 1 attribute point',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Elixir of Dexterity',
    baseType: 'Potion',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Permanently increases Dexterity by 1 attribute point',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Elixir of Vitality',
    baseType: 'Potion',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Permanently increases Vitality by 1 attribute point',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Oil of Fortitude',
    baseType: 'Oil',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Hellfire oil: permanently increases max durability of equipped armor',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Oil of Sharpness',
    baseType: 'Oil',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Hellfire oil: permanently buffs max damage of a weapon',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Oil of Imperviousness',
    baseType: 'Oil',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Hellfire oil: renders equipped weapon or armor Indestructible',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Scroll of Apocalypse',
    baseType: 'Scroll',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Unleashes ancient apocalyptic hellfire upon screen',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Scroll of Town Portal',
    baseType: 'Scroll',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Opens a gateway back to the safety of Tristram',
    modOrigin: GameMod.VANILLA_DIABLO,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Rune of Fire',
    baseType: 'Rune',
    quality: ItemQuality.NORMAL,
    extraDescription: 'Inscribes a fiery explosive trap on the stone floor',
    modOrigin: GameMod.HELLFIRE,
    recommendedClasses: ALL_HERO_CLASSES,
    gridWidth: 1,
    gridHeight: 1,
  }),

  // ==========================================
  // MIDDLE EARTH MOD (LOTR) EXCLUSIVE ITEMS
  // ==========================================
  createDiabloItem({
    name: 'The One Ring',
    baseType: 'Ring of Power',
    quality: ItemQuality.UNIQUE,
    allAttributesBonus: 30,
    fireResist: 50,
    lightningResist: 50,
    magicResist: 50,
    hitPointsBonus: 50,
    manaBonus: 50,
    isIndestructible: true,
    extraDescription:
      'One Ring to rule them all. Forged by Sauron; grants total invisibility and supreme attributes',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: ALL_HERO_CLASSES,
    defaultSlot: EquipSlot.LEFT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Narsil (Sword of Elendil)',
    baseType: 'Two-Handed Blade',
    quality: ItemQuality.UNIQUE,
    minDamage: 25,
    maxDamage: 45,
    damageBonus: 220,
    toHitBonus: 50,
    allAttributesBonus: 15,
    isIndestructible: true,
    extraDescription:
      "The blade that cut the Ring from Sauron's hand. Shatters dark sorcery and slays orcs",
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Andúril (Flame of the West)',
    baseType: 'Great Sword',
    quality: ItemQuality.UNIQUE,
    minDamage: 30,
    maxDamage: 55,
    damageBonus: 280,
    toHitBonus: 60,
    allAttributesBonus: 20,
    fireResist: 50,
    isIndestructible: true,
    extraDescription:
      'Reforged from the shards of Narsil for King Elessar; bursts with brilliant white flame',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN, HeroClass.BARD],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Glamdring (Foe-Hammer)',
    baseType: 'Elven Longsword',
    quality: ItemQuality.UNIQUE,
    minDamage: 18,
    maxDamage: 36,
    damageBonus: 180,
    lightningResist: 40,
    manaBonus: 60,
    extraDescription:
      'The sword of Gandalf the Grey. Glows blue in the presence of orcs and goblins',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.WARRIOR, HeroClass.BARD],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Sting',
    baseType: 'Elven Dagger',
    quality: ItemQuality.UNIQUE,
    minDamage: 8,
    maxDamage: 20,
    damageBonus: 140,
    toHitBonus: 80,
    extraDescription:
      'Gondolin blade carried by Bilbo & Frodo; fastest thrust speed and warns of impending ambush',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.ROGUE, HeroClass.BARD],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Mithril Mail of Erebor',
    baseType: 'Mithril Coat',
    quality: ItemQuality.UNIQUE,
    armorClass: 180,
    fireResist: 60,
    lightningResist: 60,
    magicResist: 60,
    hitPointsBonus: 80,
    isIndestructible: true,
    extraDescription:
      'As light as a feather and as hard as dragon-scales. Worth more than the entire Shire',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: ALL_HERO_CLASSES,
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Helm of the Witch-King',
    baseType: 'Iron Crown of Angmar',
    quality: ItemQuality.UNIQUE,
    armorClass: 45,
    strengthReq: 60,
    damageBonus: 35,
    allAttributesBonus: 15,
    extraDescription: 'Radiates terror aura across the dungeon; strikes dread into enemy hearts',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.HEAD,
    gridWidth: 2,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Bow of the Galadhrim',
    baseType: 'Lothlórien Bow',
    quality: ItemQuality.UNIQUE,
    minDamage: 12,
    maxDamage: 28,
    damageBonus: 240,
    toHitBonus: 70,
    dexterityReq: 60,
    extraDescription:
      'Gifted by Lady Galadriel; strung with elf-hair, shoots piercing silver gale arrows',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.ROGUE],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Phial of Galadriel',
    baseType: 'Crystal Phial',
    quality: ItemQuality.UNIQUE,
    allAttributesBonus: 15,
    manaBonus: 80,
    magicResist: 40,
    extraDescription:
      "Light of Eärendil's star: 'A light to you in dark places, when all other lights go out'",
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK],
    defaultSlot: EquipSlot.NECK,
    gridWidth: 1,
    gridHeight: 1,
  }),
  createDiabloItem({
    name: 'Grond (Hammer of Underworld)',
    baseType: 'War Maul',
    quality: ItemQuality.UNIQUE,
    minDamage: 35,
    maxDamage: 70,
    damageBonus: 250,
    strengthReq: 120,
    extraDescription:
      'Named after the ancient Hammer of Morgoth; shatters castle gates and stone gargoyles',
    modOrigin: GameMod.MIDDLE_EARTH,
    recommendedClasses: [HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),

  // ==========================================
  // VKDMOD EXCLUSIVE ITEMS
  // ==========================================
  createDiabloItem({
    name: 'VKD Ancient Crusher',
    baseType: 'Titan Maul',
    quality: ItemQuality.UNIQUE,
    minDamage: 28,
    maxDamage: 62,
    damageBonus: 240,
    strengthReq: 100,
    hitPointsBonus: 50,
    extraDescription: 'VKDMod endgame boss weapon; pulverizes Hell tier demon armors',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.BARBARIAN, HeroClass.WARRIOR],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Titan's Grip Warhammer",
    baseType: 'War Hammer',
    quality: ItemQuality.UNIQUE,
    minDamage: 20,
    maxDamage: 45,
    damageBonus: 180,
    toHitBonus: 50,
    allAttributesBonus: 15,
    extraDescription: 'Can be wielded single-handedly with catastrophic kinetic force',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Aegis of the Colossus',
    baseType: 'Tower Shield',
    quality: ItemQuality.UNIQUE,
    armorClass: 65,
    fireResist: 50,
    lightningResist: 50,
    isIndestructible: true,
    extraDescription: 'VKD heavy wall shield; complete kinetic deflection and immovable poise',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.RIGHT_HAND,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: "Shadowlord's Robe",
    baseType: 'Archmage Robe',
    quality: ItemQuality.UNIQUE,
    armorClass: 55,
    manaBonus: 120,
    magicResist: 45,
    allAttributesBonus: 12,
    extraDescription: 'VKDMod high-tier caster garb with 25% spell cast recovery acceleration',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.SORCERER, HeroClass.MONK],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Chaos Plate of the Abyss',
    baseType: 'Chaos Plate',
    quality: ItemQuality.UNIQUE,
    armorClass: 210,
    fireResist: 45,
    lightningResist: 45,
    hitPointsBonus: 120,
    extraDescription: 'Forged in the deepest infernal rifts; highest armor class rating in VKDMod',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.WARRIOR, HeroClass.BARBARIAN],
    defaultSlot: EquipSlot.TORSO,
    gridWidth: 2,
    gridHeight: 3,
  }),
  createDiabloItem({
    name: 'Bloodweaver Dagger',
    baseType: 'Kris Dagger',
    quality: ItemQuality.UNIQUE,
    minDamage: 10,
    maxDamage: 22,
    damageBonus: 160,
    toHitBonus: 60,
    extraDescription: 'Leeches 15% life on each strike; rapid bleeding affliction',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: [HeroClass.ROGUE, HeroClass.BARD],
    defaultSlot: EquipSlot.LEFT_HAND,
    gridWidth: 1,
    gridHeight: 2,
  }),
  createDiabloItem({
    name: 'Netherstone Ring',
    baseType: 'Void Ring',
    quality: ItemQuality.UNIQUE,
    allAttributesBonus: 25,
    manaBonus: 40,
    hitPointsBonus: 40,
    extraDescription: 'VKD dimensional artifact: +25 to All Attributes, void warding',
    modOrigin: GameMod.VKD_MOD,
    recommendedClasses: ALL_HERO_CLASSES,
    defaultSlot: EquipSlot.LEFT_RING,
    gridWidth: 1,
    gridHeight: 1,
  }),
];

export function getProposedItemsForClassBySlot(
  heroClass: HeroClass,
  mod: GameMod = GameMod.HELLFIRE
): Partial<Record<EquipSlot, DiabloItem[]>> {
  const result: Partial<Record<EquipSlot, DiabloItem[]>> = {};

  const eligible = FULL_ITEM_LIBRARY.filter((item) => {
    switch (item.modOrigin) {
      case GameMod.VANILLA_DIABLO:
        return true;
      case GameMod.HELLFIRE:
        return mod !== GameMod.VANILLA_DIABLO;
      case GameMod.MIDDLE_EARTH:
        return mod === GameMod.MIDDLE_EARTH;
      case GameMod.VKD_MOD:
        return mod === GameMod.VKD_MOD;
    }
  });

  for (const slot of ALL_EQUIP_SLOTS) {
    const slotItems = eligible.filter((item) => {
      const inferred = getInferredSlot(item);
      const matchesSlot = inferred === slot || item.defaultSlot === slot;
      const isRecommended =
        item.recommendedClasses.includes(heroClass) || item.recommendedClasses.length === 0;
      return matchesSlot && isRecommended;
    });
    result[slot] = slotItems.slice(0, 3);
  }

  return result;
}

export function getFullRecommendedLoadout(
  heroClass: HeroClass,
  mod: GameMod = GameMod.HELLFIRE
): Partial<Record<EquipSlot, DiabloItem>> {
  const bySlot = getProposedItemsForClassBySlot(heroClass, mod);
  const equipment: Partial<Record<EquipSlot, DiabloItem>> = {};

  const head = bySlot[EquipSlot.HEAD]?.[0];
  if (head) equipment[EquipSlot.HEAD] = head;

  const torso = bySlot[EquipSlot.TORSO]?.[0];
  if (torso) equipment[EquipSlot.TORSO] = torso;

  const leftHand = bySlot[EquipSlot.LEFT_HAND]?.[0];
  if (leftHand) equipment[EquipSlot.LEFT_HAND] = leftHand;

  const rightHand = bySlot[EquipSlot.RIGHT_HAND]?.[0];
  if (rightHand) equipment[EquipSlot.RIGHT_HAND] = rightHand;

  const neck = bySlot[EquipSlot.NECK]?.[0];
  if (neck) equipment[EquipSlot.NECK] = neck;

  const leftRing = bySlot[EquipSlot.LEFT_RING]?.[0];
  if (leftRing) equipment[EquipSlot.LEFT_RING] = leftRing;

  const rightRings = bySlot[EquipSlot.RIGHT_RING];
  const ring2 = rightRings?.[1] ?? rightRings?.[0];
  if (ring2) equipment[EquipSlot.RIGHT_RING] = ring2;

  return equipment;
}

function findCatalogItem(query: string): DiabloItem | undefined {
  const q = query.toLowerCase();
  return FULL_ITEM_LIBRARY.find((item) => item.name.toLowerCase().includes(q));
}

export function createStarterHero(heroClass: HeroClass, name = 'Hero'): HeroCharacter {
  const meta = HERO_CLASS_META[heroClass];
  const starterSpells: Record<string, number> =
    heroClass === HeroClass.SORCERER
      ? { firebolt: 1, charged_bolt: 1 }
      : heroClass === HeroClass.ROGUE
        ? { identify: 1 }
        : heroClass === HeroClass.WARRIOR
          ? { healing: 1 }
          : {};

  return {
    name,
    heroClass,
    level: 1,
    experience: 0,
    gold: 250,
    difficulty: 'Normal',
    dungeonLevel: 0,
    isMultiplayer: false,
    multiplayerSlot: 0,
    gameMod: GameMod.HELLFIRE,
    unlockedNightmare: true,
    unlockedHell: true,
    pvpKills: 0,
    deaths: 0,
    strength: meta.baseStrength,
    baseStrength: meta.baseStrength,
    magic: meta.baseMagic,
    baseMagic: meta.baseMagic,
    dexterity: meta.baseDexterity,
    baseDexterity: meta.baseDexterity,
    vitality: meta.baseVitality,
    baseVitality: meta.baseVitality,
    statPoints: 0,
    life: meta.baseHp,
    maxLife: meta.baseHp,
    baseLife: meta.baseHp,
    mana: meta.baseMana,
    maxMana: meta.baseMana,
    baseMana: meta.baseMana,
    manaShieldActive: false,
    spellLevels: starterSpells,
    equipment: {},
    inventory: [],
    belt: Array(8).fill(null),
    questsCompleted: 0,
  };
}

export function createGodlyHero(heroClass: HeroClass, name = 'Archon'): HeroCharacter {
  const meta = HERO_CLASS_META[heroClass];
  const allSpellsMax: Record<string, number> = {};
  for (const spell of DIABLO_SPELLS_CATALOG) {
    allSpellsMax[spell.id] = 15;
  }

  const godlyItems: Partial<Record<EquipSlot, DiabloItem>> = {};
  if (heroClass === HeroClass.WARRIOR) {
    const head = findCatalogItem('Royal Crest');
    const torso = findCatalogItem('Godly Plate');
    const leftHand = findCatalogItem('Grandfather');
    const rightHand = findCatalogItem('Stormshield');
    const neck = findCatalogItem('Obsidian Amulet');
    const leftRing = findCatalogItem('Obsidian Ring');
    const rightRing = findCatalogItem("Dragon's Ring");
    if (head) godlyItems[EquipSlot.HEAD] = head;
    if (torso) godlyItems[EquipSlot.TORSO] = torso;
    if (leftHand) godlyItems[EquipSlot.LEFT_HAND] = leftHand;
    if (rightHand) godlyItems[EquipSlot.RIGHT_HAND] = rightHand;
    if (neck) godlyItems[EquipSlot.NECK] = neck;
    if (leftRing) godlyItems[EquipSlot.LEFT_RING] = leftRing;
    if (rightRing) godlyItems[EquipSlot.RIGHT_RING] = rightRing;
  } else if (heroClass === HeroClass.ROGUE) {
    const head = findCatalogItem('Veil of Steel');
    const torso = findCatalogItem('Demonspike');
    const leftHand = findCatalogItem('Windforce');
    const neck = findCatalogItem('Obsidian Amulet');
    const leftRing = findCatalogItem('Obsidian Ring');
    const rightRing = findCatalogItem('Obsidian Ring');
    if (head) godlyItems[EquipSlot.HEAD] = head;
    if (torso) godlyItems[EquipSlot.TORSO] = torso;
    if (leftHand) godlyItems[EquipSlot.LEFT_HAND] = leftHand;
    if (neck) godlyItems[EquipSlot.NECK] = neck;
    if (leftRing) godlyItems[EquipSlot.LEFT_RING] = leftRing;
    if (rightRing) godlyItems[EquipSlot.RIGHT_RING] = rightRing;
  } else if (heroClass === HeroClass.SORCERER) {
    const head = findCatalogItem('Thinking Cap');
    const torso = findCatalogItem("Naj's Light Plate");
    const leftHand = findCatalogItem("Arch-Angel's");
    const neck = findCatalogItem('Obsidian Amulet');
    const leftRing = findCatalogItem("Dragon's Ring");
    const rightRing = findCatalogItem('Obsidian Ring');
    if (head) godlyItems[EquipSlot.HEAD] = head;
    if (torso) godlyItems[EquipSlot.TORSO] = torso;
    if (leftHand) godlyItems[EquipSlot.LEFT_HAND] = leftHand;
    if (neck) godlyItems[EquipSlot.NECK] = neck;
    if (leftRing) godlyItems[EquipSlot.LEFT_RING] = leftRing;
    if (rightRing) godlyItems[EquipSlot.RIGHT_RING] = rightRing;
  } else {
    Object.assign(godlyItems, getFullRecommendedLoadout(heroClass, GameMod.HELLFIRE));
  }

  const invItems: DiabloItem[] = [
    findCatalogItem("King's") ?? createDiabloItem({ name: "King's", baseType: 'Bastard Sword', defaultSlot: EquipSlot.LEFT_HAND }),
    findCatalogItem("Naj's Puzzler") ?? createDiabloItem({ name: "Naj's Puzzler", baseType: 'Long Staff', defaultSlot: EquipSlot.LEFT_HAND }),
    findCatalogItem('Full Rejuvenation') ?? createDiabloItem({ name: 'Full Rejuvenation Potion', baseType: 'Potion' }),
  ];

  const potion = findCatalogItem('Full Rejuvenation');

  return {
    name,
    heroClass,
    level: 50,
    experience: xpForLevel(50),
    gold: 999999,
    difficulty: 'Hell',
    dungeonLevel: 16,
    isMultiplayer: false,
    multiplayerSlot: 0,
    gameMod: GameMod.HELLFIRE,
    unlockedNightmare: true,
    unlockedHell: true,
    pvpKills: 0,
    deaths: 0,
    strength: meta.maxStrength,
    baseStrength: meta.maxStrength,
    magic: meta.maxMagic,
    baseMagic: meta.maxMagic,
    dexterity: meta.maxDexterity,
    baseDexterity: meta.maxDexterity,
    vitality: meta.maxVitality,
    baseVitality: meta.maxVitality,
    statPoints: 50,
    life: 650,
    maxLife: 650,
    baseLife: 450,
    mana: 700,
    maxMana: 700,
    baseMana: 500,
    manaShieldActive: true,
    spellLevels: allSpellsMax,
    equipment: godlyItems,
    inventory: invItems,
    belt: [potion ?? null, potion ?? null, null, null, null, null, null, null],
    questsCompleted: 16,
  };
}
