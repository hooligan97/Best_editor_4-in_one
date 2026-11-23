import { useCallback, useEffect, useState } from 'react';
import {
  createGodlyHero,
  FULL_ITEM_LIBRARY,
  getFullRecommendedLoadout,
} from '../data/itemArmory';
import {
  DIABLO_SPELLS_CATALOG,
  DiabloItem,
  EquipSlot,
  GAME_MOD_META,
  GameMod,
  generateItemUuid,
  HERO_CLASS_META,
  HeroCharacter,
  HeroClass,
  levelForXp,
  xpForLevel,
} from '../data/models';
import {
  createSaveFileMpq,
  parseSaveBytes,
} from '../data/parsers/devilutionXSaveParser';
import {
  analyzeMpqHeader,
  formatHexDump,
  MpqHeaderInfo,
} from '../data/parsers/mpqTool';
import {
  heroFromNoctonicJson,
  heroToNoctonicJson,
} from '../data/parsers/noctonicJsonParser';

export enum EditorTab {
  HERO = 'HERO',
  STATS = 'STATS',
  SPELLS = 'SPELLS',
  INVENTORY = 'INVENTORY',
  ARMORY = 'ARMORY',
  SAVES = 'SAVES',
}

export const EDITOR_TAB_META: Record<
  EditorTab,
  { title: string; subtitle: string }
> = {
  [EditorTab.HERO]: { title: 'Hero', subtitle: 'Hero Identity' },
  [EditorTab.STATS]: { title: 'Stats', subtitle: 'Attributes & Orbs' },
  [EditorTab.SPELLS]: { title: 'Spells', subtitle: 'Spellbook' },
  [EditorTab.INVENTORY]: { title: 'Inventory', subtitle: 'Equipment & Grid' },
  [EditorTab.ARMORY]: { title: 'Armory', subtitle: 'Legendary Catalog' },
  [EditorTab.SAVES]: { title: 'Saves & MPQ', subtitle: 'Files & Tools' },
};

export const ALL_EDITOR_TABS: EditorTab[] = [
  EditorTab.HERO,
  EditorTab.STATS,
  EditorTab.SPELLS,
  EditorTab.INVENTORY,
  EditorTab.ARMORY,
  EditorTab.SAVES,
];

export interface SavedVaultHero {
  id: string;
  label: string;
  character: HeroCharacter;
  timestamp: string;
  isPreset?: boolean;
}

const VAULT_STORAGE_KEY = 'devilutionx_editor_custom_vault_v1';

const PRESET_VAULT_HEROES: SavedVaultHero[] = [
  {
    id: 'preset-mp-warrior',
    label: 'Godly MP Warrior Lv50 (multi_0.sv)',
    character: {
      ...createGodlyHero(HeroClass.WARRIOR, 'Sir Aidan'),
      isMultiplayer: true,
      multiplayerSlot: 0,
    },
    timestamp: 'Multiplayer Preset',
    isPreset: true,
  },
  {
    id: 'preset-aragorn-me',
    label: 'Aragorn (Middle Earth Mod)',
    character: {
      ...createGodlyHero(HeroClass.WARRIOR, 'Aragorn'),
      gameMod: GameMod.MIDDLE_EARTH,
      equipment: getFullRecommendedLoadout(HeroClass.WARRIOR, GameMod.MIDDLE_EARTH),
    },
    timestamp: 'Middle Earth Preset',
    isPreset: true,
  },
  {
    id: 'preset-vkd-berserker',
    label: 'VKD Berserker Lv60 (VKDMod)',
    character: {
      ...createGodlyHero(HeroClass.BARBARIAN, 'Kragor'),
      level: 60,
      gameMod: GameMod.VKD_MOD,
      equipment: getFullRecommendedLoadout(HeroClass.BARBARIAN, GameMod.VKD_MOD),
    },
    timestamp: 'VKDMod Preset',
    isPreset: true,
  },
  {
    id: 'preset-sorcerer',
    label: 'Archmage Sorcerer Lv50',
    character: createGodlyHero(HeroClass.SORCERER, 'Jazreth'),
    timestamp: 'Hellfire Preset',
    isPreset: true,
  },
  {
    id: 'preset-rogue',
    label: 'Shadow Rogue Lv50',
    character: createGodlyHero(HeroClass.ROGUE, 'Moreina'),
    timestamp: 'Classic Preset',
    isPreset: true,
  },
];

function loadCustomVault(): SavedVaultHero[] {
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedVaultHero[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistCustomVault(items: SavedVaultHero[]): void {
  try {
    const customOnly = items.filter((item) => !item.isPreset);
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(customOnly));
  } catch {
    // Ignore storage quota errors
  }
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function useCharacterEditor() {
  const [character, setCharacter] = useState<HeroCharacter>(() =>
    createGodlyHero(HeroClass.WARRIOR, 'Aidan')
  );
  const [activeTab, setActiveTab] = useState<EditorTab>(EditorTab.HERO);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    'Welcome to DevilutionX Hero Editor'
  );
  const [mpqInfo, setMpqInfo] = useState<MpqHeaderInfo | null>(null);
  const [hexDump, setHexDump] = useState<string | null>(null);
  const [vault, setVault] = useState<SavedVaultHero[]>(() => [
    ...loadCustomVault(),
    ...PRESET_VAULT_HEROES,
  ]);

  useEffect(() => {
    if (!statusMessage) return;
    const timer = window.setTimeout(() => {
      setStatusMessage(null);
    }, 3400);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const showMessage = useCallback((msg: string) => {
    setStatusMessage(msg);
  }, []);

  const clearStatusMessage = useCallback(() => {
    setStatusMessage(null);
  }, []);

  const selectTab = useCallback((tab: EditorTab) => {
    setActiveTab(tab);
  }, []);

  // Hero Identity
  const updateName = useCallback((name: string) => {
    setCharacter((prev) => ({ ...prev, name: name.slice(0, 15) }));
  }, []);

  const updateHeroClass = useCallback((newClass: HeroClass) => {
    const meta = HERO_CLASS_META[newClass];
    setCharacter((current) => ({
      ...current,
      heroClass: newClass,
      strength: Math.max(
        meta.baseStrength,
        Math.min(current.strength, meta.maxStrength)
      ),
      magic: Math.max(meta.baseMagic, Math.min(current.magic, meta.maxMagic)),
      dexterity: Math.max(
        meta.baseDexterity,
        Math.min(current.dexterity, meta.maxDexterity)
      ),
      vitality: Math.max(
        meta.baseVitality,
        Math.min(current.vitality, meta.maxVitality)
      ),
    }));
    setStatusMessage(`Class changed to ${meta.displayName}`);
  }, []);

  const setGameMod = useCallback((mod: GameMod) => {
    const modMeta = GAME_MOD_META[mod];
    setCharacter((current) => {
      const classMeta = HERO_CLASS_META[current.heroClass];
      const newClass =
        mod === GameMod.VANILLA_DIABLO && classMeta.isHellfire
          ? HeroClass.WARRIOR
          : current.heroClass;
      const newLevel = clamp(current.level, 1, modMeta.maxLevel);
      return {
        ...current,
        gameMod: mod,
        heroClass: newClass,
        level: newLevel,
      };
    });
    setStatusMessage(`Active Mode: ${modMeta.displayName}`);
  }, []);

  const setIsMultiplayer = useCallback((isMp: boolean) => {
    setCharacter((prev) => ({ ...prev, isMultiplayer: isMp }));
    setStatusMessage(
      isMp
        ? 'Switched to Multiplayer Character mode (multi_*.sv)'
        : 'Switched to Single Player Character mode (single_*.sv)'
    );
  }, []);

  const toggleMultiplayer = useCallback(() => {
    setCharacter((prev) => {
      const next = !prev.isMultiplayer;
      setStatusMessage(
        next
          ? 'Switched to Multiplayer Character mode (multi_*.sv)'
          : 'Switched to Single Player Character mode (single_*.sv)'
      );
      return { ...prev, isMultiplayer: next };
    });
  }, []);

  const setMultiplayerSlot = useCallback((slot: number) => {
    const clamped = clamp(slot, 0, 3);
    setCharacter((prev) => ({ ...prev, multiplayerSlot: clamped }));
    setStatusMessage(`Multiplayer Slot set to #${clamped} (multi_${clamped}.sv)`);
  }, []);

  const setUnlockedDifficulties = useCallback(
    (nightmare: boolean, hell: boolean) => {
      setCharacter((prev) => ({
        ...prev,
        unlockedNightmare: nightmare,
        unlockedHell: hell,
      }));
      setStatusMessage('Multiplayer difficulty unlocks updated');
    },
    []
  );

  const equipRecommendedLoadout = useCallback(() => {
    setCharacter((current) => {
      const loadout = getFullRecommendedLoadout(current.heroClass, current.gameMod);
      const count = Object.keys(loadout).length;
      setStatusMessage(
        `Equipped recommended loadout for ${HERO_CLASS_META[current.heroClass].displayName} (${count} items)`
      );
      return { ...current, equipment: loadout };
    });
  }, []);

  const updateLevel = useCallback((level: number) => {
    setCharacter((prev) => {
      const maxLvl = GAME_MOD_META[prev.gameMod].maxLevel;
      const clamped = clamp(level, 1, maxLvl);
      const calculatedXp = xpForLevel(Math.min(clamped, 50));
      return { ...prev, level: clamped, experience: calculatedXp };
    });
  }, []);

  const updateExperience = useCallback((xp: number) => {
    const clampedXp = clamp(xp, 0, 2_000_000_000);
    const derivedLvl = levelForXp(clampedXp);
    setCharacter((prev) => ({
      ...prev,
      experience: clampedXp,
      level: derivedLvl,
    }));
  }, []);

  const updateGold = useCallback((gold: number) => {
    const clamped = clamp(Math.floor(gold), 0, 999_999);
    setCharacter((prev) => ({ ...prev, gold: clamped }));
  }, []);

  const updateDifficulty = useCallback((difficulty: string) => {
    setCharacter((prev) => ({ ...prev, difficulty }));
  }, []);

  const updateDungeonLevel = useCallback((floor: number) => {
    setCharacter((prev) => ({ ...prev, dungeonLevel: clamp(floor, 0, 24) }));
  }, []);

  // Stats
  const modifyStat = useCallback((stat: string, delta: number) => {
    setCharacter((c) => {
      switch (stat.toLowerCase()) {
        case 'strength':
        case 'str': {
          const newVal = clamp(c.strength + delta, 0, 300);
          return { ...c, strength: newVal, baseStrength: newVal };
        }
        case 'magic':
        case 'mag': {
          const newVal = clamp(c.magic + delta, 0, 300);
          return { ...c, magic: newVal, baseMagic: newVal };
        }
        case 'dexterity':
        case 'dex': {
          const newVal = clamp(c.dexterity + delta, 0, 300);
          return { ...c, dexterity: newVal, baseDexterity: newVal };
        }
        case 'vitality':
        case 'vit': {
          const newVal = clamp(c.vitality + delta, 0, 300);
          return { ...c, vitality: newVal, baseVitality: newVal };
        }
        case 'points':
        case 'statpoints': {
          const newVal = clamp(c.statPoints + delta, 0, 999);
          return { ...c, statPoints: newVal };
        }
        default:
          return c;
      }
    });
  }, []);

  const updateLife = useCallback((current: number, max: number) => {
    const c = clamp(current, 1, 1500);
    const m = clamp(max, 1, 1500);
    setCharacter((prev) => ({ ...prev, life: c, maxLife: m, baseLife: m }));
  }, []);

  const updateMana = useCallback((current: number, max: number) => {
    const c = clamp(current, 0, 1500);
    const m = clamp(max, 0, 1500);
    setCharacter((prev) => ({ ...prev, mana: c, maxMana: m, baseMana: m }));
  }, []);

  const toggleManaShield = useCallback(() => {
    setCharacter((prev) => {
      const next = !prev.manaShieldActive;
      setStatusMessage(`Mana Shield ${next ? 'Activated' : 'Deactivated'}`);
      return { ...prev, manaShieldActive: next };
    });
  }, []);

  // Spells
  const setSpellLevel = useCallback((spellId: string, level: number) => {
    setCharacter((current) => {
      const updated = { ...current.spellLevels };
      if (level <= 0) {
        delete updated[spellId];
      } else {
        updated[spellId] = clamp(level, 1, 15);
      }
      return { ...current, spellLevels: updated };
    });
  }, []);

  // Quick Boosts
  const maxAllSpells = useCallback(() => {
    const allSpells: Record<string, number> = {};
    for (const spell of DIABLO_SPELLS_CATALOG) {
      allSpells[spell.id] = 15;
    }
    setCharacter((prev) => ({ ...prev, spellLevels: allSpells }));
    setStatusMessage('All 32 Diablo & Hellfire Spells set to Level 15!');
  }, []);

  const maxOutAllStats = useCallback(() => {
    setCharacter((c) => {
      const cls = HERO_CLASS_META[c.heroClass];
      setStatusMessage(`Stats maxed out to class limits (${cls.displayName})!`);
      return {
        ...c,
        strength: cls.maxStrength,
        baseStrength: cls.maxStrength,
        magic: cls.maxMagic,
        baseMagic: cls.maxMagic,
        dexterity: cls.maxDexterity,
        baseDexterity: cls.maxDexterity,
        vitality: cls.maxVitality,
        baseVitality: cls.maxVitality,
        statPoints: 25,
      };
    });
  }, []);

  const maxGold = useCallback(() => {
    setCharacter((prev) => ({ ...prev, gold: 999_999 }));
    setStatusMessage('Gold set to 999,999!');
  }, []);

  const fullHeal = useCallback(() => {
    setCharacter((prev) => ({ ...prev, life: prev.maxLife, mana: prev.maxMana }));
    setStatusMessage('Hit Points and Mana fully restored!');
  }, []);

  // Equipment & Inventory
  const equipItem = useCallback((slot: EquipSlot, item: DiabloItem) => {
    setCharacter((current) => ({
      ...current,
      equipment: {
        ...current.equipment,
        [slot]: { ...item, id: generateItemUuid() },
      },
    }));
    setStatusMessage(`Equipped ${item.name} in ${slot.replace('_', ' ')}`);
  }, []);

  const unequipItem = useCallback((slot: EquipSlot) => {
    setCharacter((current) => {
      const item = current.equipment[slot];
      if (!item) return current;
      const newEquipment = { ...current.equipment };
      delete newEquipment[slot];
      const newInventory =
        current.inventory.length < 40
          ? [...current.inventory, item]
          : current.inventory;
      setStatusMessage(`Unequipped ${slot.replace('_', ' ')} to backpack`);
      return { ...current, equipment: newEquipment, inventory: newInventory };
    });
  }, []);

  const addItemToInventory = useCallback((item: DiabloItem) => {
    setCharacter((current) => {
      if (current.inventory.length >= 40) {
        setStatusMessage('Backpack is full (40 / 40 items)');
        return current;
      }
      setStatusMessage(`Added ${item.name} to Backpack`);
      return {
        ...current,
        inventory: [...current.inventory, { ...item, id: generateItemUuid() }],
      };
    });
  }, []);

  const removeItemFromInventory = useCallback((itemId: string) => {
    setCharacter((current) => ({
      ...current,
      inventory: current.inventory.filter((it) => it.id !== itemId),
    }));
    setStatusMessage('Item removed from Backpack');
  }, []);

  const setBeltSlot = useCallback((index: number, item: DiabloItem | null) => {
    if (index < 0 || index > 7) return;
    setCharacter((current) => {
      const newBelt = [...current.belt];
      newBelt[index] = item ? { ...item, id: generateItemUuid() } : null;
      return { ...current, belt: newBelt };
    });
  }, []);

  const fillBeltWithPotions = useCallback(() => {
    const rejuv = FULL_ITEM_LIBRARY.find((it) =>
      it.name.includes('Full Rejuvenation')
    );
    if (!rejuv) return;
    setCharacter((current) => ({
      ...current,
      belt: Array.from({ length: 8 }, () => ({
        ...rejuv,
        id: generateItemUuid(),
      })),
    }));
    setStatusMessage('Belt filled with Full Rejuvenation Potions');
  }, []);

  // Save & Load (Noctonic JSON & DevilutionX MPQ)
  const importNoctonicJson = useCallback((jsonStr: string): boolean => {
    try {
      const loaded = heroFromNoctonicJson(jsonStr);
      setCharacter(loaded);
      setStatusMessage(
        `Successfully imported character: ${loaded.name} (Lv ${loaded.level} ${HERO_CLASS_META[loaded.heroClass].displayName})`
      );
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMessage(`JSON Parse error: ${msg}`);
      return false;
    }
  }, []);

  const getNoctonicJson = useCallback((): string => {
    return heroToNoctonicJson(character);
  }, [character]);

  const importSaveBytes = useCallback(
    (bytes: Uint8Array, filename: string): boolean => {
      try {
        const mpq = analyzeMpqHeader(bytes);
        setMpqInfo(mpq);
        setHexDump(formatHexDump(bytes, 24));

        const parsedHero = parseSaveBytes(bytes, filename);
        setCharacter(parsedHero);
        setStatusMessage(
          `Imported ${filename} (${parsedHero.name}, Lv ${parsedHero.level} ${HERO_CLASS_META[parsedHero.heroClass].displayName}${parsedHero.isMultiplayer ? ' [Multiplayer]' : ''})`
        );
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setStatusMessage(`Save parse error: ${msg}`);
        return false;
      }
    },
    []
  );

  const exportSaveMpqBytes = useCallback(
    (overrideHero?: Partial<HeroCharacter>): Uint8Array => {
      const target = overrideHero ? { ...character, ...overrideHero } : character;
      return createSaveFileMpq(target);
    },
    [character]
  );

  const inspectBytes = useCallback((bytes: Uint8Array) => {
    const mpq = analyzeMpqHeader(bytes);
    setMpqInfo(mpq);
    setHexDump(formatHexDump(bytes, 32));
  }, []);

  // Vault
  const saveToVault = useCallback(
    (label: string) => {
      const cleanLabel =
        label.trim() || `${character.name} (Lv ${character.level})`;
      const newVaultItem: SavedVaultHero = {
        id: generateItemUuid(),
        label: cleanLabel,
        character,
        timestamp: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isPreset: false,
      };
      setVault((prev) => {
        const next = [newVaultItem, ...prev];
        persistCustomVault(next);
        return next;
      });
      setStatusMessage(`Saved snapshot "${cleanLabel}" to Vault`);
    },
    [character]
  );

  const loadFromVault = useCallback((vaultItem: SavedVaultHero) => {
    setCharacter(vaultItem.character);
    setStatusMessage(`Loaded "${vaultItem.label}" from Vault`);
  }, []);

  const deleteFromVault = useCallback((id: string) => {
    setVault((prev) => {
      const next = prev.filter((v) => v.id !== id || v.isPreset);
      persistCustomVault(next);
      return next;
    });
    setStatusMessage('Removed snapshot from Vault');
  }, []);

  return {
    character,
    activeTab,
    statusMessage,
    mpqInfo,
    hexDump,
    vault,
    selectTab,
    showMessage,
    clearStatusMessage,
    updateName,
    updateHeroClass,
    setGameMod,
    setIsMultiplayer,
    toggleMultiplayer,
    setMultiplayerSlot,
    setUnlockedDifficulties,
    equipRecommendedLoadout,
    updateLevel,
    updateExperience,
    updateGold,
    updateDifficulty,
    updateDungeonLevel,
    modifyStat,
    updateLife,
    updateMana,
    toggleManaShield,
    setSpellLevel,
    maxAllSpells,
    maxOutAllStats,
    maxGold,
    fullHeal,
    equipItem,
    unequipItem,
    addItemToInventory,
    removeItemFromInventory,
    setBeltSlot,
    fillBeltWithPotions,
    importNoctonicJson,
    getNoctonicJson,
    importSaveBytes,
    exportSaveMpqBytes,
    inspectBytes,
    saveToVault,
    loadFromVault,
    deleteFromVault,
  };
}
