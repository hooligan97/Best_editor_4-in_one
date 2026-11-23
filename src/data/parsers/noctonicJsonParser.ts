import {
  ALL_EQUIP_SLOTS,
  ALL_GAME_MODS,
  createDiabloItem,
  DiabloItem,
  EquipSlot,
  GameMod,
  generateItemUuid,
  HERO_CLASS_META,
  HeroCharacter,
  heroClassFromString,
  ItemQuality,
} from '../models';

function itemToJsonObject(item: DiabloItem): Record<string, unknown> {
  return {
    id: item.id,
    name: item.name,
    baseType: item.baseType,
    quality: item.quality,
    prefix: item.prefix,
    suffix: item.suffix,
    durability: item.durability,
    maxDurability: item.maxDurability,
    isIndestructible: item.isIndestructible,
    charges: item.charges,
    maxCharges: item.maxCharges,
    armorClass: item.armorClass,
    minDamage: item.minDamage,
    maxDamage: item.maxDamage,
    toHitBonus: item.toHitBonus,
    damageBonus: item.damageBonus,
    strengthReq: item.strengthReq,
    magicReq: item.magicReq,
    dexterityReq: item.dexterityReq,
    fireResist: item.fireResist,
    lightningResist: item.lightningResist,
    magicResist: item.magicResist,
    allAttributesBonus: item.allAttributesBonus,
    hitPointsBonus: item.hitPointsBonus,
    manaBonus: item.manaBonus,
    extraDescription: item.extraDescription,
    gridWidth: item.gridWidth,
    gridHeight: item.gridHeight,
    gridX: item.gridX,
    gridY: item.gridY,
  };
}

export function heroToNoctonicJson(hero: HeroCharacter): string {
  const equipObj: Record<string, unknown> = {};
  for (const slot of ALL_EQUIP_SLOTS) {
    const item = hero.equipment[slot];
    if (item) {
      equipObj[slot] = itemToJsonObject(item);
    }
  }

  const root = {
    name: hero.name,
    class: HERO_CLASS_META[hero.heroClass].displayName,
    level: hero.level,
    experience: hero.experience,
    gold: hero.gold,
    difficulty: hero.difficulty,
    dungeonLevel: hero.dungeonLevel,
    questsCompleted: hero.questsCompleted,
    isMultiplayer: hero.isMultiplayer,
    multiplayerSlot: hero.multiplayerSlot,
    gameMod: hero.gameMod,
    unlockedNightmare: hero.unlockedNightmare,
    unlockedHell: hero.unlockedHell,
    pvpKills: hero.pvpKills,
    deaths: hero.deaths,
    stats: {
      strength: hero.strength,
      baseStrength: hero.baseStrength,
      magic: hero.magic,
      baseMagic: hero.baseMagic,
      dexterity: hero.dexterity,
      baseDexterity: hero.baseDexterity,
      vitality: hero.vitality,
      baseVitality: hero.baseVitality,
      statPoints: hero.statPoints,
      life: hero.life,
      maxLife: hero.maxLife,
      baseLife: hero.baseLife,
      mana: hero.mana,
      maxMana: hero.maxMana,
      baseMana: hero.baseMana,
      manaShieldActive: hero.manaShieldActive,
    },
    spells: { ...hero.spellLevels },
    equipment: equipObj,
    inventory: hero.inventory.map(itemToJsonObject),
    belt: hero.belt.map((item) => (item ? itemToJsonObject(item) : null)),
  };

  return JSON.stringify(root, null, 2);
}

function parseItem(obj: Record<string, unknown>): DiabloItem {
  const qualityStr = typeof obj.quality === 'string' ? obj.quality : 'NORMAL';
  const quality = Object.values(ItemQuality).includes(qualityStr as ItemQuality)
    ? (qualityStr as ItemQuality)
    : ItemQuality.NORMAL;

  const num = (key: string, fallback = 0): number =>
    typeof obj[key] === 'number' && Number.isFinite(obj[key] as number)
      ? (obj[key] as number)
      : fallback;
  const str = (key: string, fallback = ''): string =>
    typeof obj[key] === 'string' ? (obj[key] as string) : fallback;
  const bool = (key: string, fallback = false): boolean =>
    typeof obj[key] === 'boolean' ? (obj[key] as boolean) : fallback;

  return createDiabloItem({
    id: str('id', generateItemUuid()),
    name: str('name', 'Unknown Item'),
    baseType: str('baseType', 'Item'),
    quality,
    prefix: str('prefix'),
    suffix: str('suffix'),
    durability: num('durability', 50),
    maxDurability: num('maxDurability', 50),
    isIndestructible: bool('isIndestructible', false),
    charges: num('charges', 0),
    maxCharges: num('maxCharges', 0),
    armorClass: num('armorClass', 0),
    minDamage: num('minDamage', 0),
    maxDamage: num('maxDamage', 0),
    toHitBonus: num('toHitBonus', 0),
    damageBonus: num('damageBonus', 0),
    strengthReq: num('strengthReq', 0),
    magicReq: num('magicReq', 0),
    dexterityReq: num('dexterityReq', 0),
    fireResist: num('fireResist', 0),
    lightningResist: num('lightningResist', 0),
    magicResist: num('magicResist', 0),
    allAttributesBonus: num('allAttributesBonus', 0),
    hitPointsBonus: num('hitPointsBonus', 0),
    manaBonus: num('manaBonus', 0),
    extraDescription: str('extraDescription'),
    gridWidth: num('gridWidth', 1),
    gridHeight: num('gridHeight', 1),
    gridX: num('gridX', -1),
    gridY: num('gridY', -1),
  });
}

export function heroFromNoctonicJson(jsonStr: string): HeroCharacter {
  const root = JSON.parse(jsonStr) as Record<string, unknown>;
  if (!root || typeof root !== 'object' || Array.isArray(root)) {
    throw new Error('Invalid Noctonic JSON structure.');
  }

  const name = typeof root.name === 'string' && root.name.trim() ? root.name : 'Hero';
  const className = typeof root.class === 'string' ? root.class : 'Warrior';
  const heroClass = heroClassFromString(className);
  const classMeta = HERO_CLASS_META[heroClass];

  const num = (obj: Record<string, unknown> | undefined, key: string, fallback: number): number =>
    obj && typeof obj[key] === 'number' && Number.isFinite(obj[key] as number)
      ? (obj[key] as number)
      : fallback;

  const level = num(root, 'level', 1);
  const experience = num(root, 'experience', 0);
  const gold = num(root, 'gold', 100);
  const difficulty = typeof root.difficulty === 'string' ? root.difficulty : 'Normal';
  const dungeonLevel = num(root, 'dungeonLevel', 0);
  const questsCompleted = num(root, 'questsCompleted', 0);

  const statsObj =
    root.stats && typeof root.stats === 'object' && !Array.isArray(root.stats)
      ? (root.stats as Record<string, unknown>)
      : undefined;

  const strength = num(statsObj, 'strength', classMeta.baseStrength);
  const baseStrength = num(statsObj, 'baseStrength', strength);
  const magic = num(statsObj, 'magic', classMeta.baseMagic);
  const baseMagic = num(statsObj, 'baseMagic', magic);
  const dexterity = num(statsObj, 'dexterity', classMeta.baseDexterity);
  const baseDexterity = num(statsObj, 'baseDexterity', dexterity);
  const vitality = num(statsObj, 'vitality', classMeta.baseVitality);
  const baseVitality = num(statsObj, 'baseVitality', vitality);
  const statPoints = num(statsObj, 'statPoints', 0);

  const life = num(statsObj, 'life', classMeta.baseHp);
  const maxLife = num(statsObj, 'maxLife', classMeta.baseHp);
  const baseLife = num(statsObj, 'baseLife', maxLife);
  const mana = num(statsObj, 'mana', classMeta.baseMana);
  const maxMana = num(statsObj, 'maxMana', classMeta.baseMana);
  const baseMana = num(statsObj, 'baseMana', maxMana);
  const manaShieldActive =
    statsObj && typeof statsObj.manaShieldActive === 'boolean' ? statsObj.manaShieldActive : false;

  const spellLevels: Record<string, number> = {};
  if (root.spells && typeof root.spells === 'object' && !Array.isArray(root.spells)) {
    for (const [k, v] of Object.entries(root.spells as Record<string, unknown>)) {
      if (typeof v === 'number' && Number.isFinite(v)) {
        spellLevels[k] = v;
      }
    }
  }

  const equipment: Partial<Record<EquipSlot, DiabloItem>> = {};
  if (root.equipment && typeof root.equipment === 'object' && !Array.isArray(root.equipment)) {
    for (const [slotKey, itemVal] of Object.entries(root.equipment as Record<string, unknown>)) {
      if (
        Object.values(EquipSlot).includes(slotKey as EquipSlot) &&
        itemVal &&
        typeof itemVal === 'object' &&
        !Array.isArray(itemVal)
      ) {
        equipment[slotKey as EquipSlot] = parseItem(itemVal as Record<string, unknown>);
      }
    }
  }

  const inventory: DiabloItem[] = [];
  if (Array.isArray(root.inventory)) {
    for (const entry of root.inventory) {
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        inventory.push(parseItem(entry as Record<string, unknown>));
      }
    }
  }

  const belt: Array<DiabloItem | null> = Array(8).fill(null);
  if (Array.isArray(root.belt)) {
    for (let i = 0; i < Math.min(8, root.belt.length); i++) {
      const entry = root.belt[i];
      if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
        belt[i] = parseItem(entry as Record<string, unknown>);
      }
    }
  }

  const isMultiplayer = typeof root.isMultiplayer === 'boolean' ? root.isMultiplayer : false;
  const multiplayerSlot = num(root, 'multiplayerSlot', 0);
  const gameModStr = typeof root.gameMod === 'string' ? root.gameMod : 'HELLFIRE';
  const gameMod = ALL_GAME_MODS.includes(gameModStr as GameMod)
    ? (gameModStr as GameMod)
    : GameMod.HELLFIRE;
  const unlockedNightmare =
    typeof root.unlockedNightmare === 'boolean' ? root.unlockedNightmare : true;
  const unlockedHell = typeof root.unlockedHell === 'boolean' ? root.unlockedHell : true;
  const pvpKills = num(root, 'pvpKills', 0);
  const deaths = num(root, 'deaths', 0);

  return {
    name,
    heroClass,
    level,
    experience,
    gold,
    difficulty,
    dungeonLevel,
    isMultiplayer,
    multiplayerSlot,
    gameMod,
    unlockedNightmare,
    unlockedHell,
    pvpKills,
    deaths,
    questsCompleted,
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
    manaShieldActive,
    spellLevels,
    equipment,
    inventory,
    belt,
  };
}
