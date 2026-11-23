import React from 'react';
import { X } from 'lucide-react';
import {
  DiabloItem,
  EQUIP_SLOT_META,
  EquipSlot,
  getInferredSlot,
  getItemFullTitle,
  getItemQualityColor,
  ITEM_QUALITY_LABELS,
} from '../data/models';

interface ItemInspectorModalProps {
  item: DiabloItem;
  equippedSlot: EquipSlot | null;
  onClose: () => void;
  onEquip: (slot: EquipSlot, item: DiabloItem) => void;
  onUnequip: (slot: EquipSlot) => void;
  onRemoveFromInventory: (itemId: string) => void;
}

export const ItemInspectorModal: React.FC<ItemInspectorModalProps> = ({
  item,
  equippedSlot,
  onClose,
  onEquip,
  onUnequip,
  onRemoveFromInventory,
}) => {
  const qColor = getItemQualityColor(item.quality);
  const fullTitle = getItemFullTitle(item);
  const inferred = getInferredSlot(item);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-inspector-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-[#3B2F2A] bg-[#161210] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3
              id="item-inspector-title"
              className="font-display text-lg font-bold"
              style={{ color: qColor }}
            >
              {fullTitle}
            </h3>
            <p className="mt-0.5 text-sm text-[#A59B93]">
              {ITEM_QUALITY_LABELS[item.quality]} {item.baseType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close item inspector"
            className="rounded-lg p-1.5 text-[#A59B93] transition-colors hover:bg-[#2C221F] hover:text-[#E8E0D5]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <hr className="my-4 border-[#3B2F2A]" />

        <div className="space-y-2 text-sm">
          {item.armorClass > 0 && (
            <div className="flex justify-between">
              <span className="text-[#A59B93]">Armor Class</span>
              <span className="font-mono-tabular font-semibold text-[#E8E0D5]">
                {item.armorClass}
              </span>
            </div>
          )}
          {(item.minDamage > 0 || item.maxDamage > 0) && (
            <div className="flex justify-between">
              <span className="text-[#A59B93]">Damage</span>
              <span className="font-mono-tabular font-semibold text-[#E8E0D5]">
                {item.minDamage} - {item.maxDamage} (+{item.damageBonus}%)
              </span>
            </div>
          )}
          {item.toHitBonus > 0 && (
            <div className="flex justify-between">
              <span className="text-[#A59B93]">To Hit</span>
              <span className="font-mono-tabular font-semibold text-[#E8E0D5]">
                +{item.toHitBonus}%
              </span>
            </div>
          )}
          {item.isIndestructible ? (
            <p className="font-semibold text-[#FFD464]">Indestructible</p>
          ) : (
            item.maxDurability > 0 && (
              <div className="flex justify-between">
                <span className="text-[#A59B93]">Durability</span>
                <span className="font-mono-tabular text-[#E8E0D5]">
                  {item.durability} / {item.maxDurability}
                </span>
              </div>
            )
          )}
          {item.maxCharges > 0 && (
            <div className="flex justify-between">
              <span className="text-[#A59B93]">Charges</span>
              <span className="font-mono-tabular font-semibold text-[#5AA1FF]">
                {item.charges} / {item.maxCharges}
              </span>
            </div>
          )}
          {item.allAttributesBonus > 0 && (
            <p className="font-semibold text-[#FFD464]">
              +{item.allAttributesBonus} to All Attributes
            </p>
          )}
          {item.hitPointsBonus !== 0 && (
            <p className="font-semibold text-[#EE3535]">
              {item.hitPointsBonus > 0 ? '+' : ''}
              {item.hitPointsBonus} Hit Points
            </p>
          )}
          {item.manaBonus !== 0 && (
            <p className="font-semibold text-[#5AA1FF]">
              {item.manaBonus > 0 ? '+' : ''}
              {item.manaBonus} Mana
            </p>
          )}
          {(item.fireResist > 0 ||
            item.lightningResist > 0 ||
            item.magicResist > 0) && (
            <p className="text-[#E8E0D5]">
              Resistances: Fire +{item.fireResist}% · Lightning +
              {item.lightningResist}% · Magic +{item.magicResist}%
            </p>
          )}
          {(item.strengthReq > 0 ||
            item.magicReq > 0 ||
            item.dexterityReq > 0) && (
            <p className="text-xs text-[#A59B93]">
              Requirements:
              {item.strengthReq > 0 ? ` STR ${item.strengthReq}` : ''}
              {item.magicReq > 0 ? ` MAG ${item.magicReq}` : ''}
              {item.dexterityReq > 0 ? ` DEX ${item.dexterityReq}` : ''}
            </p>
          )}
          {item.extraDescription && (
            <p className="pt-2 text-xs italic leading-relaxed text-[#E5B044]">
              {item.extraDescription}
            </p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#3B2F2A] px-4 py-2 text-xs font-medium text-[#A59B93] transition-colors hover:bg-[#2C221F] hover:text-[#E8E0D5]"
          >
            Close
          </button>

          {equippedSlot ? (
            <button
              type="button"
              onClick={() => {
                onUnequip(equippedSlot);
                onClose();
              }}
              className="rounded-lg bg-[#751212] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#C82323]"
            >
              Unequip ({EQUIP_SLOT_META[equippedSlot].shortLabel})
            </button>
          ) : inferred ? (
            <button
              type="button"
              onClick={() => {
                onEquip(inferred, item);
                onClose();
              }}
              className="rounded-lg bg-[#9E7422] px-4 py-2 text-xs font-semibold text-[#FFD464] transition-colors hover:bg-[#E5B044] hover:text-[#0C0908]"
            >
              Equip ({EQUIP_SLOT_META[inferred].shortLabel})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onRemoveFromInventory(item.id);
                onClose();
              }}
              className="rounded-lg bg-[#751212] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#C82323]"
            >
              Drop Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
