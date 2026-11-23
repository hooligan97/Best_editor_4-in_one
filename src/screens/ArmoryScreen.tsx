import React, { useMemo, useState } from 'react';
import { CheckCircle2, Plus, Search, Shield, Star, X } from 'lucide-react';
import {
  FULL_ITEM_LIBRARY,
  getProposedItemsForClassBySlot,
} from '../data/itemArmory';
import {
  DiabloItem,
  EQUIP_SLOT_META,
  EquipSlot,
  GAME_MOD_META,
  GameMod,
  getInferredSlot,
  getItemFullTitle,
  getItemQualityColor,
  HERO_CLASS_META,
  HeroCharacter,
  ITEM_QUALITY_LABELS,
} from '../data/models';
import { GothicCard } from '../components/GothicCard';

interface ArmoryScreenProps {
  hero: HeroCharacter;
  onEquipItem: (slot: EquipSlot, item: DiabloItem) => void;
  onAddItemToInventory: (item: DiabloItem) => void;
  onEquipRecommendedLoadout: () => void;
}

const CATEGORIES = [
  'All',
  'Weapons',
  'Armor',
  'Helms',
  'Shields',
  'Jewelry',
  'Consumables',
  'Middle Earth',
  'VKDMod',
] as const;

const SLOT_PROPOSED_ROWS: Array<{ slot: EquipSlot; label: string }> = [
  { slot: EquipSlot.LEFT_HAND, label: 'Weapons' },
  { slot: EquipSlot.TORSO, label: 'Armor' },
  { slot: EquipSlot.HEAD, label: 'Helms' },
  { slot: EquipSlot.RIGHT_HAND, label: 'Shields' },
  { slot: EquipSlot.NECK, label: 'Amulets' },
  { slot: EquipSlot.LEFT_RING, label: 'Rings' },
];

export const ArmoryScreen: React.FC<ArmoryScreenProps> = ({
  hero,
  onEquipItem,
  onAddItemToInventory,
  onEquipRecommendedLoadout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const proposedBySlot = useMemo(
    () => getProposedItemsForClassBySlot(hero.heroClass, hero.gameMod),
    [hero.heroClass, hero.gameMod]
  );

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return FULL_ITEM_LIBRARY.filter((item) => {
      const bt = item.baseType.toLowerCase();
      let matchCat = true;
      switch (selectedCategory) {
        case 'Weapons':
          matchCat =
            bt.includes('sword') ||
            bt.includes('bow') ||
            bt.includes('staff') ||
            bt.includes('axe') ||
            bt.includes('mace') ||
            bt.includes('hammer') ||
            bt.includes('cleaver') ||
            bt.includes('blade') ||
            bt.includes('dagger') ||
            bt.includes('club') ||
            bt.includes('maul');
          break;
        case 'Armor':
          matchCat =
            bt.includes('mail') ||
            bt.includes('plate') ||
            bt.includes('leather') ||
            bt.includes('cloak') ||
            bt.includes('robe');
          break;
        case 'Helms':
          matchCat =
            bt.includes('helm') ||
            bt.includes('cap') ||
            bt.includes('crown') ||
            bt.includes('hood');
          break;
        case 'Shields':
          matchCat =
            bt.includes('shield') ||
            bt.includes('buckler') ||
            bt.includes('bulwark');
          break;
        case 'Jewelry':
          matchCat =
            bt.includes('ring') ||
            bt.includes('amulet') ||
            bt.includes('phial');
          break;
        case 'Consumables':
          matchCat =
            bt.includes('potion') ||
            bt.includes('scroll') ||
            bt.includes('oil') ||
            bt.includes('rune');
          break;
        case 'Middle Earth':
          matchCat = item.modOrigin === GameMod.MIDDLE_EARTH;
          break;
        case 'VKDMod':
          matchCat = item.modOrigin === GameMod.VKD_MOD;
          break;
        default:
          matchCat = true;
      }

      const fullTitle = getItemFullTitle(item).toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        fullTitle.includes(q) ||
        item.extraDescription.toLowerCase().includes(q) ||
        bt.includes(q);

      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const classDisplay = HERO_CLASS_META[hero.heroClass].displayName;
  const modShort = GAME_MOD_META[hero.gameMod].shortName;

  return (
    <div className="space-y-5">
      {/* Recommended Loadout Banner */}
      <GothicCard variant="highlight" borderColor="#FFD464">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FFD464]" />
              <h1 className="font-display text-base font-bold text-[#FFD464]">
                Recommended Items for {classDisplay}
              </h1>
            </div>
            <p className="mt-1 text-xs text-[#A59B93]">
              Curated top 2–3 items per slot for {classDisplay} in {modShort}{' '}
              mode.
            </p>
          </div>

          <button
            type="button"
            onClick={onEquipRecommendedLoadout}
            className="inline-flex items-center gap-2 rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-bold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#E5B044] hover:text-[#0C0908]"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Equip Full Set</span>
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {SLOT_PROPOSED_ROWS.map(({ slot, label }) => {
            const slotItems = proposedBySlot[slot] ?? [];
            if (slotItems.length === 0) return null;
            return (
              <div key={slot}>
                <h2 className="text-xs font-bold text-[#E5B044]">{label}</h2>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {slotItems.map((pItem) => {
                    const qColor = getItemQualityColor(pItem.quality);
                    return (
                      <div
                        key={pItem.name}
                        className="flex flex-col justify-between rounded-lg border bg-[#2C221F] p-3"
                        style={{ borderColor: `${qColor}80` }}
                      >
                        <div>
                          <div
                            className="truncate text-xs font-bold"
                            style={{ color: qColor }}
                          >
                            {pItem.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#A59B93]">
                            {pItem.baseType}
                          </div>
                          <div className="font-mono-tabular mt-1 text-[11px] text-[#E8E0D5]">
                            {pItem.minDamage > 0 || pItem.maxDamage > 0
                              ? `Dmg: ${pItem.minDamage}-${pItem.maxDamage} (+${pItem.damageBonus}%)`
                              : pItem.armorClass > 0
                                ? `AC: ${pItem.armorClass}`
                                : pItem.allAttributesBonus > 0
                                  ? `+${pItem.allAttributesBonus} All Attributes`
                                  : null}
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => onEquipItem(slot, pItem)}
                            className="flex-1 rounded-md bg-[#751212] px-2.5 py-1.5 text-xs font-semibold text-white whitespace-nowrap transition-colors hover:bg-[#C82323]"
                          >
                            Equip
                          </button>
                          <button
                            type="button"
                            onClick={() => onAddItemToInventory(pItem)}
                            className="flex-1 rounded-md border border-[#3B2F2A] bg-[#161210] px-2.5 py-1.5 text-xs font-medium text-[#E8E0D5] whitespace-nowrap transition-colors hover:border-[#9E7422]"
                          >
                            Backpack
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </GothicCard>

      {/* Full Item Library Search & Categories */}
      <GothicCard borderColor="#E5B044">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#FFD464]" />
            <h2 className="font-display text-lg font-bold text-[#FFD464]">
              Full Item Armory
            </h2>
          </div>
          <span className="font-mono-tabular text-xs font-semibold text-[#E5B044]">
            {filteredItems.length} items
          </span>
        </div>

        <p className="mt-1.5 text-xs text-[#A59B93]">
          Browse unique and magic items across Diablo 1, Hellfire, VKDMod, and
          Middle Earth Mod.
        </p>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A59B93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items (e.g. Grandfather, Whale, Narsil, One Ring)"
            className="w-full rounded-lg border border-[#3B2F2A] bg-[#0C0908] py-2.5 pl-10 pr-10 text-sm text-[#E8E0D5] placeholder-[#A59B93]/60 focus:border-[#E5B044] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear item search"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A59B93] hover:text-[#E8E0D5]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#FFD464] bg-[#9E7422] text-[#0C0908]'
                    : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </GothicCard>

      {/* Catalog Grid */}
      {filteredItems.length === 0 ? (
        <GothicCard className="py-10 text-center">
          <p className="text-sm text-[#A59B93]">
            No armory items match your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="mt-3 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-4 py-2 text-xs font-semibold text-[#FFD464] hover:border-[#9E7422]"
          >
            Show All Items
          </button>
        </GothicCard>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredItems.map((item) => {
            const qColor = getItemQualityColor(item.quality);
            const targetSlot = getInferredSlot(item);
            const modMeta = GAME_MOD_META[item.modOrigin];

            return (
              <GothicCard
                key={item.name}
                borderColor={`${qColor}66`}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3
                        className="font-display text-base font-bold"
                        style={{ color: qColor }}
                      >
                        {getItemFullTitle(item)}
                      </h3>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#A59B93]">
                        <span>{ITEM_QUALITY_LABELS[item.quality]}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.baseType}</span>
                        {item.modOrigin !== GameMod.VANILLA_DIABLO && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                modMeta.isMod
                                  ? 'font-semibold text-[#EE3535]'
                                  : 'text-[#FFD464]'
                              }
                            >
                              {modMeta.shortName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs">
                    {item.armorClass > 0 && (
                      <div className="font-mono-tabular text-[#E8E0D5]">
                        Armor Class: {item.armorClass}
                      </div>
                    )}
                    {(item.minDamage > 0 || item.maxDamage > 0) && (
                      <div className="font-mono-tabular text-[#E8E0D5]">
                        Damage: {item.minDamage} - {item.maxDamage} (+
                        {item.damageBonus}%)
                      </div>
                    )}
                    {item.toHitBonus > 0 && (
                      <div className="font-mono-tabular text-[#E8E0D5]">
                        To Hit: +{item.toHitBonus}%
                      </div>
                    )}
                    {item.allAttributesBonus > 0 && (
                      <div className="font-mono-tabular text-[#FFD464]">
                        +{item.allAttributesBonus} to All Attributes
                      </div>
                    )}
                    {item.hitPointsBonus !== 0 && (
                      <div className="font-mono-tabular text-[#EE3535]">
                        {item.hitPointsBonus > 0 ? '+' : ''}
                        {item.hitPointsBonus} Hit Points
                      </div>
                    )}
                    {item.manaBonus !== 0 && (
                      <div className="font-mono-tabular text-[#5AA1FF]">
                        {item.manaBonus > 0 ? '+' : ''}
                        {item.manaBonus} Mana
                      </div>
                    )}
                    {(item.fireResist > 0 ||
                      item.lightningResist > 0 ||
                      item.magicResist > 0) && (
                      <div className="font-mono-tabular text-[#5AA1FF]">
                        Resists: Fire +{item.fireResist}% / Light +
                        {item.lightningResist}% / Magic +{item.magicResist}%
                      </div>
                    )}
                    {item.extraDescription && (
                      <p className="pt-1 text-[11px] leading-relaxed text-[#E5B044]">
                        {item.extraDescription}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2.5">
                  {targetSlot && (
                    <button
                      type="button"
                      onClick={() => onEquipItem(targetSlot, item)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-2 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:border-[#E5B044]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Equip ({EQUIP_SLOT_META[targetSlot].shortLabel})
                      </span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onAddItemToInventory(item)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#3B2F2A] bg-[#161210] px-3 py-2 text-xs font-medium text-[#E8E0D5] whitespace-nowrap transition-colors hover:border-[#9E7422]"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0" />
                    <span>To Backpack</span>
                  </button>
                </div>
              </GothicCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
