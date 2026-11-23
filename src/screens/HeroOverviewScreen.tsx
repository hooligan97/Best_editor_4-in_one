import React from 'react';
import {
  Crosshair,
  Diamond,
  Flame,
  Hammer,
  Music,
  Shield,
  Users,
  Wand2,
  Zap,
  Dumbbell,
} from 'lucide-react';
import {
  ALL_GAME_MODS,
  ALL_HERO_CLASSES,
  GAME_MOD_META,
  GameMod,
  getRoleTitle,
  HERO_CLASS_META,
  HeroCharacter,
  HeroClass,
  xpForLevel,
} from '../data/models';
import { GothicCard } from '../components/GothicCard';

interface HeroOverviewScreenProps {
  hero: HeroCharacter;
  onUpdateName: (name: string) => void;
  onUpdateHeroClass: (cls: HeroClass) => void;
  onSetGameMod: (mod: GameMod) => void;
  onSetIsMultiplayer: (isMp: boolean) => void;
  onSetMultiplayerSlot: (slot: number) => void;
  onSetUnlockedDifficulties: (nightmare: boolean, hell: boolean) => void;
  onMaxStats: () => void;
  onMaxSpells: () => void;
  onMaxGold: () => void;
  onUpdateLevel: (level: number) => void;
  onUpdateGold: (gold: number) => void;
  onUpdateDifficulty: (diff: string) => void;
  onUpdateDungeonLevel: (floor: number) => void;
}

function getHeroClassIcon(heroClass: HeroClass) {
  switch (heroClass) {
    case HeroClass.WARRIOR:
      return <Shield className="h-7 w-7 text-[#FFD464]" />;
    case HeroClass.ROGUE:
      return <Crosshair className="h-7 w-7 text-[#FFD464]" />;
    case HeroClass.SORCERER:
      return <Wand2 className="h-7 w-7 text-[#FFD464]" />;
    case HeroClass.MONK:
      return <Dumbbell className="h-7 w-7 text-[#FFD464]" />;
    case HeroClass.BARD:
      return <Music className="h-7 w-7 text-[#FFD464]" />;
    case HeroClass.BARBARIAN:
      return <Hammer className="h-7 w-7 text-[#FFD464]" />;
  }
}

function getDungeonFloorName(mod: GameMod, dungeonLevel: number): string {
  if (mod === GameMod.MIDDLE_EARTH) {
    if (dungeonLevel === 0) return 'Rivendell Sanctuary';
    if (dungeonLevel <= 4) return `Bree & Barrow-downs (Level ${dungeonLevel})`;
    if (dungeonLevel <= 8) return `Mines of Moria (Level ${dungeonLevel})`;
    if (dungeonLevel <= 12) return `Isengard Deep (Level ${dungeonLevel})`;
    if (dungeonLevel <= 16) return `Barad-dûr & Mount Doom (Level ${dungeonLevel})`;
    return `Cirith Ungol (Level ${dungeonLevel})`;
  }
  if (dungeonLevel === 0) return 'Town of Tristram';
  if (dungeonLevel <= 4) return `Cathedral (Level ${dungeonLevel})`;
  if (dungeonLevel <= 8) return `Catacombs (Level ${dungeonLevel})`;
  if (dungeonLevel <= 12) return `Caves (Level ${dungeonLevel})`;
  if (dungeonLevel <= 16) return `Hell (Level ${dungeonLevel})`;
  if (dungeonLevel <= 20) return `Crypt (Hellfire Level ${dungeonLevel - 16})`;
  return `Hive (Hellfire Level ${dungeonLevel - 20})`;
}

export const HeroOverviewScreen: React.FC<HeroOverviewScreenProps> = ({
  hero,
  onUpdateName,
  onUpdateHeroClass,
  onSetGameMod,
  onSetIsMultiplayer,
  onSetMultiplayerSlot,
  onSetUnlockedDifficulties,
  onMaxStats,
  onMaxSpells,
  onMaxGold,
  onUpdateLevel,
  onUpdateGold,
  onUpdateDifficulty,
  onUpdateDungeonLevel,
}) => {
  const modMeta = GAME_MOD_META[hero.gameMod];
  const classMeta = HERO_CLASS_META[hero.heroClass];
  const maxLvl = modMeta.maxLevel;

  const availableClasses =
    hero.gameMod === GameMod.VANILLA_DIABLO
      ? [HeroClass.WARRIOR, HeroClass.ROGUE, HeroClass.SORCERER]
      : ALL_HERO_CLASSES;

  const currentBaseXp = xpForLevel(Math.min(hero.level, 50));
  const nextXp =
    hero.level < maxLvl
      ? xpForLevel(Math.min(hero.level + 1, 50))
      : hero.experience;
  const xpDiff = nextXp - currentBaseXp;
  const xpProgress =
    hero.level < maxLvl && xpDiff > 0
      ? Math.max(0, Math.min(1, (hero.experience - currentBaseXp) / xpDiff))
      : 1;

  const floorName = getDungeonFloorName(hero.gameMod, hero.dungeonLevel);

  return (
    <div className="space-y-5">
      {/* Hero Banner Card */}
      <GothicCard
        variant="highlight"
        borderColor={modMeta.isMod ? '#EE3535' : '#E5B044'}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#3B2F2A] bg-[#2C221F]">
              {getHeroClassIcon(hero.heroClass)}
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2.5">
                <h1 className="font-display text-2xl font-bold text-[#FFD464]">
                  {hero.name || 'Hero'}
                </h1>
                <span
                  className={`text-xs font-semibold tracking-wide ${
                    hero.isMultiplayer ? 'text-[#EE3535]' : 'text-[#A59B93]'
                  }`}
                >
                  {hero.isMultiplayer ? 'Multiplayer' : 'Single Player'}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-[#A59B93]">
                <span className="tabular-nums font-medium text-[#E8E0D5]">
                  Level {hero.level} {classMeta.displayName}
                </span>
                <span aria-hidden="true">·</span>
                <span>{getRoleTitle(hero.heroClass, hero.gameMod)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5AA1FF]">{modMeta.displayName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#A59B93]">Difficulty:</span>
            <span
              className={`font-semibold ${
                hero.difficulty === 'Hell' ? 'text-[#EE3535]' : 'text-[#FFD464]'
              }`}
            >
              {hero.difficulty}
            </span>
          </div>
        </div>
      </GothicCard>

      {/* Two-Column Workspace Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Game Mod & Engine Mode */}
        <GothicCard borderColor={modMeta.isMod ? '#751212' : '#9E7422'}>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-bold text-[#FFD464]">
              Game Mod &amp; Engine Mode
            </h2>
            <span className="font-mono-tabular text-xs font-semibold text-[#E5B044]">
              {modMeta.shortName}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#A59B93]">
            {modMeta.description}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {ALL_GAME_MODS.map((mod) => {
              const m = GAME_MOD_META[mod];
              const active = hero.gameMod === mod;
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => onSetGameMod(mod)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'border-[#EE3535] bg-[#751212] text-white'
                      : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:border-[#9E7422] hover:text-[#E8E0D5]'
                  }`}
                >
                  {mod === GameMod.VANILLA_DIABLO && (
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {mod === GameMod.HELLFIRE && (
                    <Flame className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {mod === GameMod.VKD_MOD && (
                    <Wand2 className="h-3.5 w-3.5 shrink-0" />
                  )}
                  {mod === GameMod.MIDDLE_EARTH && (
                    <Diamond className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span>{m.shortName}</span>
                </button>
              );
            })}
          </div>
        </GothicCard>

        {/* Multiplayer Character Settings */}
        <GothicCard borderColor={hero.isMultiplayer ? '#EE3535' : '#3B2F2A'}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#EE3535]" />
              <h2 className="font-display text-base font-bold text-[#EE3535]">
                Multiplayer Character Settings
              </h2>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={hero.isMultiplayer}
              onClick={() => onSetIsMultiplayer(!hero.isMultiplayer)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
                hero.isMultiplayer
                  ? 'border-[#EE3535] bg-[#751212]'
                  : 'border-[#3B2F2A] bg-[#2C221F]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full transition-transform ${
                  hero.isMultiplayer
                    ? 'translate-x-6 bg-[#EE3535]'
                    : 'translate-x-1 bg-[#A59B93]'
                }`}
              />
            </button>
          </div>

          <p className="mt-2 text-xs leading-relaxed text-[#A59B93]">
            {hero.isMultiplayer
              ? `Character will be saved and formatted as a DevilutionX multiplayer hero (multi_${hero.multiplayerSlot}.sv / multi_${hero.multiplayerSlot}.hsv).`
              : `Character is currently in Single Player mode (single_${hero.multiplayerSlot}.sv). Toggle switch above to convert to Multiplayer.`}
          </p>

          {hero.isMultiplayer && (
            <div className="mt-4 space-y-3 border-t border-[#3B2F2A] pt-3">
              <div>
                <span className="text-xs font-semibold text-[#E5B044]">
                  Multiplayer Hero Slot (0 to 3)
                </span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((slot) => {
                    const selected = hero.multiplayerSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onSetMultiplayerSlot(slot)}
                        className={`rounded-lg border px-2 py-2 font-mono-tabular text-xs font-semibold whitespace-nowrap transition-colors ${
                          selected
                            ? 'border-[#EE3535] bg-[#751212] text-white'
                            : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
                        }`}
                      >
                        Slot #{slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-5">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#E8E0D5]">
                  <input
                    type="checkbox"
                    checked={hero.unlockedNightmare}
                    onChange={(e) =>
                      onSetUnlockedDifficulties(e.target.checked, hero.unlockedHell)
                    }
                    className="h-4 w-4 accent-[#C82323]"
                  />
                  <span>Unlock Nightmare (bypasses Lv 20)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-xs text-[#E8E0D5]">
                  <input
                    type="checkbox"
                    checked={hero.unlockedHell}
                    onChange={(e) =>
                      onSetUnlockedDifficulties(
                        hero.unlockedNightmare,
                        e.target.checked
                      )
                    }
                    className="h-4 w-4 accent-[#C82323]"
                  />
                  <span>Unlock Hell (bypasses Lv 30)</span>
                </label>
              </div>
            </div>
          )}
        </GothicCard>

        {/* Hero Identity */}
        <GothicCard>
          <h2 className="font-display text-base font-bold text-[#E5B044]">
            Hero Identity
          </h2>

          <div className="mt-3 space-y-4">
            <div>
              <label
                htmlFor="hero-name-input"
                className="block text-xs font-medium text-[#A59B93]"
              >
                Character Name (max 15 chars)
              </label>
              <input
                id="hero-name-input"
                type="text"
                maxLength={15}
                value={hero.name}
                onChange={(e) => onUpdateName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] px-3.5 py-2.5 text-sm text-[#E8E0D5] placeholder-[#A59B93]/50 focus:border-[#E5B044] focus:outline-none"
                placeholder="Enter hero name..."
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-[#A59B93]">
                Hero Class ({modMeta.shortName})
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableClasses.map((cls) => {
                  const selected = hero.heroClass === cls;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => onUpdateHeroClass(cls)}
                      className={`rounded-lg border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                        selected
                          ? 'border-[#EE3535] bg-[#751212] text-white'
                          : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:border-[#9E7422] hover:text-[#E8E0D5]'
                      }`}
                    >
                      {HERO_CLASS_META[cls].displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </GothicCard>

        {/* Quick Boosts & Gold */}
        <div className="space-y-5">
          <GothicCard borderColor="#751212">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#EE3535]" />
              <h2 className="font-display text-base font-bold text-[#EE3535]">
                DevilutionX Quick Boosts
              </h2>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={onMaxStats}
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2.5 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:border-[#E5B044]"
              >
                Max Stats
              </button>
              <button
                type="button"
                onClick={onMaxSpells}
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2.5 text-xs font-semibold text-[#5AA1FF] whitespace-nowrap transition-colors hover:border-[#2D7BDE]"
              >
                All Spells 15
              </button>
              <button
                type="button"
                onClick={onMaxGold}
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2.5 text-xs font-semibold text-[#E5B044] whitespace-nowrap transition-colors hover:border-[#E5B044]"
              >
                999k Gold
              </button>
            </div>
          </GothicCard>

          <GothicCard>
            <h2 className="font-display text-base font-bold text-[#E5B044]">
              Gold &amp; Treasure
            </h2>
            <div className="mt-3">
              <label
                htmlFor="hero-gold-input"
                className="block text-xs font-medium text-[#A59B93]"
              >
                Gold in Purse &amp; Bank (max 999,999)
              </label>
              <input
                id="hero-gold-input"
                type="number"
                min={0}
                max={999999}
                value={hero.gold}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  onUpdateGold(Number.isNaN(val) ? 0 : val);
                }}
                className="font-mono-tabular mt-1.5 w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] px-3.5 py-2.5 text-sm text-[#FFD464] focus:border-[#E5B044] focus:outline-none"
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateGold(Math.min(999_999, hero.gold + 10_000))
                }
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2 text-xs font-medium text-[#E8E0D5] whitespace-nowrap transition-colors hover:border-[#9E7422]"
              >
                +10k Gold
              </button>
              <button
                type="button"
                onClick={() =>
                  onUpdateGold(Math.min(999_999, hero.gold + 50_000))
                }
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2 text-xs font-medium text-[#E8E0D5] whitespace-nowrap transition-colors hover:border-[#9E7422]"
              >
                +50k Gold
              </button>
              <button
                type="button"
                onClick={() => onUpdateGold(999_999)}
                className="rounded-lg border border-[#9E7422] bg-[#2C221F] px-3 py-2 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#9E7422] hover:text-[#0C0908]"
              >
                Max (999k)
              </button>
            </div>
          </GothicCard>
        </div>

        {/* Level & Experience Progression */}
        <GothicCard>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#E5B044]">
              Level &amp; Experience
            </h2>
            <span className="font-mono-tabular text-sm font-bold text-[#FFD464]">
              Level {hero.level} / {maxLvl}
            </span>
          </div>

          <div className="mt-4">
            <input
              type="range"
              aria-label="Hero Level"
              min={1}
              max={maxLvl}
              value={hero.level}
              onChange={(e) => onUpdateLevel(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="font-mono-tabular text-[#A59B93]">
              Current XP: {hero.experience.toLocaleString()}
            </span>
            <span className="font-mono-tabular text-[#9E7422]">
              Next Lvl: {nextXp.toLocaleString()}
            </span>
          </div>

          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-[#3B2F2A]">
            <div
              className="h-full bg-[#E5B044] transition-all duration-150"
              style={{ width: `${Math.round(xpProgress * 100)}%` }}
            />
          </div>
        </GothicCard>

        {/* Dungeon Location & Difficulty */}
        <GothicCard>
          <h2 className="font-display text-base font-bold text-[#E5B044]">
            Dungeon Location &amp; Difficulty
          </h2>

          <div className="mt-3">
            <span className="block text-xs font-medium text-[#A59B93]">
              Difficulty
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {['Normal', 'Nightmare', 'Hell'].map((diff) => {
                const selected = hero.difficulty === diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => onUpdateDifficulty(diff)}
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                      selected
                        ? 'border-[#EE3535] bg-[#751212] text-white'
                        : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
                    }`}
                  >
                    {diff}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#A59B93]">Dungeon Floor</span>
              <span className="font-medium text-[#E8E0D5]">{floorName}</span>
            </div>
            <input
              type="range"
              aria-label="Dungeon Floor"
              min={0}
              max={24}
              value={hero.dungeonLevel}
              onChange={(e) => onUpdateDungeonLevel(Number(e.target.value))}
              className="mt-2 w-full cursor-pointer accent-[#C82323]"
            />
          </div>
        </GothicCard>
      </div>
    </div>
  );
};
