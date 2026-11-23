import React, { useMemo, useState } from 'react';
import { Backpack, PackageOpen, Sparkles, Trash2 } from 'lucide-react';
import { getProposedItemsForClassBySlot } from '../data/itemArmory';
import {
  DiabloItem,
  EQUIP_SLOT_META,
  EquipSlot,
  getItemFullTitle,
  getItemQualityColor,
  HERO_CLASS_META,
  HeroCharacter,
  ITEM_QUALITY_LABELS,
} from '../data/models';
import { GothicCard } from '../components/GothicCard';
import { ItemInspectorModal } from '../components/ItemInspectorModal';

interface InventoryScreenProps {
  hero: HeroCharacter;
  onEquipItem: (slot: EquipSlot, item: DiabloItem) => void;
  onUnequipItem: (slot: EquipSlot) => void;
  onAddItemToInventory: (item: DiabloItem) => void;
  onRemoveItemFromInventory: (itemId: string) => void;
  onEquipRecommendedLoadout: () => void;
  onFillBeltWithPotions: () => void;
  onSetBeltSlot: (index: number, item: DiabloItem | null) => void;
  onGoToArmory: () => void;
}

interface EquipSlotCardProps {
  slot: EquipSlot;
  item?: DiabloItem;
  onInspect: (item: DiabloItem, slot: EquipSlot) => void;
}

const EquipSlotCard: React.FC<EquipSlotCardProps> = ({
  slot,
  item,
  onInspect,
}) => {
  const qColor = item ? getItemQualityColor(item.quality) : '#3B2F2A';
  const meta = EQUIP_SLOT_META[slot];

  return (
    <button
      type="button"
      disabled={!item}
      onClick={() => item && onInspect(item, slot)}
      className={`flex h-24 w-28 flex-col items-center justify-center rounded-lg border bg-[#2C221F] p-2 text-center transition-colors sm:w-32 ${
        item
          ? 'cursor-pointer hover:bg-[#352925]'
          : 'cursor-default opacity-75'
      }`}
      style={{ borderColor: qColor }}
    >
      <span className="text-[11px] font-medium text-[#A59B93]">
        {meta.shortLabel}
      </span>
      <span
        className="mt-1.5 line-clamp-2 text-xs font-bold leading-tight"
        style={{ color: item ? qColor : '#574942' }}
      >
        {item ? getItemFullTitle(item) : '<Empty>'}
      </span>
    </button>
  );
};

const SLOT_PROPOSED_SECTIONS: Array<{ slot: EquipSlot; label: string }> = [
  { slot: EquipSlot.LEFT_HAND, label: 'Weapons' },
  { slot: EquipSlot.TORSO, label: 'Body Armor' },
  { slot: EquipSlot.HEAD, label: 'Helms & Headgear' },
  { slot: EquipSlot.RIGHT_HAND, label: 'Shields' },
  { slot: EquipSlot.NECK, label: 'Amulets' },
  { slot: EquipSlot.LEFT_RING, label: 'Rings' },
];

export const InventoryScreen: React.FC<InventoryScreenProps> = ({
  hero,
  onEquipItem,
  onUnequipItem,
  onAddItemToInventory,
  onRemoveItemFromInventory,
  onEquipRecommendedLoadout,
  onFillBeltWithPotions,
  onSetBeltSlot,
  onGoToArmory,
}) => {
  const [inspected, setInspected] = useState<{
    item: DiabloItem;
    slot: EquipSlot | null;
  } | null>(null);

  const proposedBySlot = useMemo(
    () => getProposedItemsForClassBySlot(hero.heroClass, hero.gameMod),
    [hero.heroClass, hero.gameMod]
  );

  const equippedCount = Object.values(hero.equipment).filter(Boolean).length;
  const className = HERO_CLASS_META[hero.heroClass].displayName;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Equipment Paperdoll */}
        <GothicCard borderColor="#9E7422" className="lg:col-span-5">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-base font-bold text-[#E5B044]">
              Equipped Gear
            </h1>
            <span className="font-mono-tabular text-xs text-[#A59B93]">
              {equippedCount} / 7 Slots
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            {/* Top: Helm & Amulet */}
            <div className="flex justify-center gap-4">
              <EquipSlotCard
                slot={EquipSlot.HEAD}
                item={hero.equipment[EquipSlot.HEAD]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
              <EquipSlotCard
                slot={EquipSlot.NECK}
                item={hero.equipment[EquipSlot.NECK]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
            </div>

            {/* Middle: Main Hand, Armor, Off Hand */}
            <div className="flex flex-wrap justify-center gap-3">
              <EquipSlotCard
                slot={EquipSlot.LEFT_HAND}
                item={hero.equipment[EquipSlot.LEFT_HAND]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
              <EquipSlotCard
                slot={EquipSlot.TORSO}
                item={hero.equipment[EquipSlot.TORSO]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
              <EquipSlotCard
                slot={EquipSlot.RIGHT_HAND}
                item={hero.equipment[EquipSlot.RIGHT_HAND]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
            </div>

            {/* Bottom: Ring 1 & Ring 2 */}
            <div className="flex justify-center gap-4">
              <EquipSlotCard
                slot={EquipSlot.LEFT_RING}
                item={hero.equipment[EquipSlot.LEFT_RING]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
              <EquipSlotCard
                slot={EquipSlot.RIGHT_RING}
                item={hero.equipment[EquipSlot.RIGHT_RING]}
                onInspect={(item, slot) => setInspected({ item, slot })}
              />
            </div>
          </div>

          {/* Belt / Speed Bar */}
          <div className="mt-6 border-t border-[#3B2F2A] pt-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-sm font-bold text-[#E5B044]">
                  Belt / Speed Bar
                </h2>
                <p className="text-xs text-[#A59B93]">8 Slots (Keys 1–8)</p>
              </div>
              <button
                type="button"
                onClick={onFillBeltWithPotions}
                className="rounded-lg border border-[#3B2F2A] bg-[#2C221F] px-3 py-1.5 text-xs font-semibold text-[#FFD464] whitespace-nowrap hover:border-[#9E7422]"
              >
                Fill Potions
              </button>
            </div>

            <div className="mt-3 grid grid-cols-8 gap-1.5">
              {hero.belt.map((beltItem, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (beltItem) {
                      setInspected({ item: beltItem, slot: null });
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (beltItem) onSetBeltSlot(idx, null);
                  }}
                  title={
                    beltItem
                      ? `${beltItem.name} (Right-click to clear)`
                      : `Empty Belt Slot ${idx + 1}`
                  }
                  className="flex h-11 items-center justify-center rounded-md border border-[#3B2F2A] bg-[#2C221F] px-1 text-center transition-colors hover:border-[#9E7422]"
                >
                  {beltItem ? (
                    <span
                      className="truncate text-[11px] font-semibold"
                      style={{ color: getItemQualityColor(beltItem.quality) }}
                    >
                      {beltItem.name.slice(0, 4)}
                    </span>
                  ) : (
                    <span className="font-mono-tabular text-xs text-[#574942]">
                      {idx + 1}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </GothicCard>

        {/* Backpack Inventory */}
        <GothicCard className="lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Backpack className="h-4 w-4 text-[#E5B044]" />
              <h2 className="font-display text-base font-bold text-[#E5B044]">
                Backpack Inventory
              </h2>
            </div>
            <span className="font-mono-tabular text-xs text-[#A59B93]">
              {hero.inventory.length} / 40 Items
            </span>
          </div>

          {hero.inventory.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed border-[#3B2F2A] py-12 text-center">
              <PackageOpen className="h-9 w-9 text-[#574942]" />
              <p className="mt-2.5 text-sm font-medium text-[#A59B93]">
                Backpack is empty
              </p>
              <p className="mt-1 text-xs text-[#9E7422]">
                Add legendary items from the Armory or Recommended Gear below.
              </p>
              <button
                type="button"
                onClick={onGoToArmory}
                className="mt-4 rounded-lg border border-[#9E7422] bg-[#2C221F] px-4 py-2 text-xs font-semibold text-[#FFD464] hover:bg-[#9E7422] hover:text-[#0C0908]"
              >
                Browse Armory
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2.5">
              {hero.inventory.map((item) => {
                const qColor = getItemQualityColor(item.quality);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-[#2C221F] px-3.5 py-2.5 transition-colors hover:bg-[#352925]"
                    style={{ borderColor: `${qColor}66` }}
                  >
                    <button
                      type="button"
                      onClick={() => setInspected({ item, slot: null })}
                      className="flex-1 text-left"
                    >
                      <div
                        className="text-sm font-bold"
                        style={{ color: qColor }}
                      >
                        {getItemFullTitle(item)}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#A59B93]">
                        <span>{item.baseType}</span>
                        <span aria-hidden="true">·</span>
                        <span>{ITEM_QUALITY_LABELS[item.quality]}</span>
                        {item.armorClass > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              AC {item.armorClass}
                            </span>
                          </>
                        )}
                        {(item.minDamage > 0 || item.maxDamage > 0) && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular">
                              Dmg {item.minDamage}-{item.maxDamage}
                            </span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-label={`Remove ${item.name} from backpack`}
                      onClick={() => onRemoveItemFromInventory(item.id)}
                      className="rounded-lg p-2 text-[#EE3535] transition-colors hover:bg-[#751212]/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </GothicCard>
      </div>

      {/* Recommended Gear for Selected Class */}
      <GothicCard variant="highlight" borderColor="#FFD464">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#FFD464]" />
              <h2 className="font-display text-base font-bold text-[#FFD464]">
                Recommended Gear for {className}
              </h2>
            </div>
            <p className="mt-1 text-xs text-[#A59B93]">
              Inspect, equip directly to the matching slot, or place into your
              backpack.
            </p>
          </div>

          <button
            type="button"
            onClick={onEquipRecommendedLoadout}
            className="rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-bold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#E5B044] hover:text-[#0C0908]"
          >
            Equip Full Loadout
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {SLOT_PROPOSED_SECTIONS.map(({ slot, label }) => {
            const items = proposedBySlot[slot] ?? [];
            if (items.length === 0) return null;
            return (
              <div key={slot}>
                <h3 className="text-xs font-bold text-[#E5B044]">{label}</h3>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((pItem) => {
                    const qColor = getItemQualityColor(pItem.quality);
                    return (
                      <div
                        key={pItem.name}
                        className="flex flex-col justify-between rounded-lg border bg-[#2C221F] p-3"
                        style={{ borderColor: `${qColor}66` }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setInspected({ item: pItem, slot: null })
                          }
                          className="text-left"
                        >
                          <div
                            className="truncate text-xs font-bold"
                            style={{ color: qColor }}
                          >
                            {pItem.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-[#A59B93]">
                            {pItem.baseType}
                          </div>
                        </button>

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

      {inspected && (
        <ItemInspectorModal
          item={inspected.item}
          equippedSlot={inspected.slot}
          onClose={() => setInspected(null)}
          onEquip={onEquipItem}
          onUnequip={onUnequipItem}
          onRemoveFromInventory={onRemoveItemFromInventory}
        />
      )}
    </div>
  );
};
