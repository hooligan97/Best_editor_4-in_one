import React from 'react';
import {
  Crosshair,
  Dumbbell,
  Gauge,
  Heart,
  Shield,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { EquipSlot, HERO_CLASS_META, HeroCharacter } from '../data/models';
import { DiabloOrb } from '../components/DiabloOrb';
import { GothicCard } from '../components/GothicCard';

interface StatsScreenProps {
  hero: HeroCharacter;
  onFullHeal: () => void;
  onToggleManaShield: () => void;
  onUpdateLife: (current: number, max: number) => void;
  onUpdateMana: (current: number, max: number) => void;
  onModifyStat: (stat: string, delta: number) => void;
}

interface AttributeRowProps {
  name: string;
  statKey: string;
  value: number;
  maxCap: number;
  colorClass: string;
  icon: React.ReactNode;
  onAdjust: (stat: string, delta: number) => void;
}

const AttributeRow: React.FC<AttributeRowProps> = ({
  name,
  statKey,
  value,
  maxCap,
  colorClass,
  icon,
  onAdjust,
}) => {
  const isAtMax = value >= maxCap;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex items-center gap-3">
        <span className={colorClass}>{icon}</span>
        <div>
          <div className="text-sm font-semibold text-[#E8E0D5]">{name}</div>
          <div
            className={`font-mono-tabular text-xs ${
              isAtMax ? 'text-[#FFD464]' : 'text-[#A59B93]'
            }`}
          >
            Cap: {maxCap} (
            {isAtMax ? 'MAX' : `${Math.max(0, maxCap - value)} to max`})
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`font-mono-tabular min-w-[3rem] text-right text-lg font-bold ${
            isAtMax ? 'text-[#FFD464]' : 'text-[#E8E0D5]'
          }`}
        >
          {value}
        </span>

        <div className="flex items-center gap-1.5">
          {[-5, -1, 1, 5].map((delta) => (
            <button
              key={delta}
              type="button"
              onClick={() => onAdjust(statKey, delta)}
              className="font-mono-tabular min-w-[2.25rem] rounded-md border border-[#3B2F2A] bg-[#2C221F] px-2 py-1.5 text-xs font-medium text-[#E8E0D5] transition-colors hover:border-[#9E7422] hover:text-[#FFD464]"
            >
              {delta > 0 ? `+${delta}` : delta}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatsScreen: React.FC<StatsScreenProps> = ({
  hero,
  onFullHeal,
  onToggleManaShield,
  onUpdateLife,
  onUpdateMana,
  onModifyStat,
}) => {
  const classMeta = HERO_CLASS_META[hero.heroClass];
  const equipItems = Object.values(hero.equipment).filter(Boolean);

  const totalAc =
    equipItems.reduce((sum, it) => sum + (it?.armorClass ?? 0), 0) +
    Math.floor(hero.dexterity / 5);
  const totalFireRes = Math.min(
    75,
    equipItems.reduce((sum, it) => sum + (it?.fireResist ?? 0), 0)
  );
  const totalLightRes = Math.min(
    75,
    equipItems.reduce((sum, it) => sum + (it?.lightningResist ?? 0), 0)
  );
  const totalMagicRes = Math.min(
    75,
    equipItems.reduce((sum, it) => sum + (it?.magicResist ?? 0), 0)
  );
  const toHit =
    50 +
    Math.floor(hero.dexterity / 2) +
    equipItems.reduce((sum, it) => sum + (it?.toHitBonus ?? 0), 0);
  const blockChance = hero.equipment[EquipSlot.RIGHT_HAND]
    ? Math.min(75, 10 + Math.floor(hero.dexterity / 4))
    : 0;

  return (
    <div className="space-y-5">
      {/* Life & Mana Orbs */}
      <GothicCard>
        <div className="flex flex-col items-center justify-around gap-6 py-2 sm:flex-row">
          <DiabloOrb
            title="LIFE (HP)"
            currentValue={hero.life}
            maxValue={hero.maxLife}
            isLife
            onClick={onFullHeal}
          />

          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={onFullHeal}
              className="inline-flex items-center gap-2 rounded-lg border border-[#9E7422] bg-[#2C221F] px-4 py-2 text-xs font-semibold text-[#FFD464] whitespace-nowrap transition-colors hover:bg-[#9E7422] hover:text-[#0C0908]"
            >
              <Sparkles className="h-4 w-4 text-[#EE3535]" />
              <span>Full Heal</span>
            </button>

            <button
              type="button"
              onClick={onToggleManaShield}
              className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                hero.manaShieldActive
                  ? 'border-[#5AA1FF] bg-[#17427C] text-white'
                  : 'border-[#3B2F2A] bg-[#2C221F] text-[#A59B93] hover:text-[#E8E0D5]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>
                Mana Shield: {hero.manaShieldActive ? 'Active' : 'Off'}
              </span>
            </button>
          </div>

          <DiabloOrb
            title="MANA"
            currentValue={hero.mana}
            maxValue={hero.maxMana}
            isLife={false}
            onClick={onFullHeal}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#3B2F2A] pt-4 sm:grid-cols-2">
          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#EE3535]">Max Life</span>
              <span className="font-mono-tabular text-[#E8E0D5]">
                {hero.life} / {hero.maxLife}
              </span>
            </div>
            <input
              type="range"
              aria-label="Max Life"
              min={20}
              max={1200}
              value={hero.maxLife}
              onChange={(e) => {
                const m = Number(e.target.value);
                onUpdateLife(Math.min(hero.life, m), m);
              }}
              className="mt-2 w-full cursor-pointer accent-[#C82323]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs">
              <span className="font-semibold text-[#5AA1FF]">Max Mana</span>
              <span className="font-mono-tabular text-[#E8E0D5]">
                {hero.mana} / {hero.maxMana}
              </span>
            </div>
            <input
              type="range"
              aria-label="Max Mana"
              min={0}
              max={1200}
              value={hero.maxMana}
              onChange={(e) => {
                const m = Number(e.target.value);
                onUpdateMana(Math.min(hero.mana, m), m);
              }}
              className="mt-2 w-full cursor-pointer accent-[#2D7BDE]"
            />
          </div>
        </div>
      </GothicCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Core Attributes */}
        <GothicCard borderColor="#9E7422">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-base font-bold text-[#E5B044]">
              Core Attributes
            </h2>
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular text-xs font-bold text-[#FFD464]">
                Points: {hero.statPoints}
              </span>
              <button
                type="button"
                onClick={() => onModifyStat('points', -1)}
                className="font-mono-tabular rounded border border-[#3B2F2A] bg-[#2C221F] px-2 py-0.5 text-xs text-[#E8E0D5] hover:border-[#9E7422]"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => onModifyStat('points', 5)}
                className="font-mono-tabular rounded border border-[#3B2F2A] bg-[#2C221F] px-2 py-0.5 text-xs text-[#E8E0D5] hover:border-[#9E7422]"
              >
                +5
              </button>
            </div>
          </div>

          <div className="mt-2 divide-y divide-[#3B2F2A]">
            <AttributeRow
              name="Strength"
              statKey="strength"
              value={hero.strength}
              maxCap={classMeta.maxStrength}
              colorClass="text-[#E5B044]"
              icon={<Dumbbell className="h-5 w-5" />}
              onAdjust={onModifyStat}
            />
            <AttributeRow
              name="Magic"
              statKey="magic"
              value={hero.magic}
              maxCap={classMeta.maxMagic}
              colorClass="text-[#5AA1FF]"
              icon={<Wand2 className="h-5 w-5" />}
              onAdjust={onModifyStat}
            />
            <AttributeRow
              name="Dexterity"
              statKey="dexterity"
              value={hero.dexterity}
              maxCap={classMeta.maxDexterity}
              colorClass="text-[#67DE6E]"
              icon={<Gauge className="h-5 w-5" />}
              onAdjust={onModifyStat}
            />
            <AttributeRow
              name="Vitality"
              statKey="vitality"
              value={hero.vitality}
              maxCap={classMeta.maxVitality}
              colorClass="text-[#EE3535]"
              icon={<Heart className="h-5 w-5" />}
              onAdjust={onModifyStat}
            />
          </div>
        </GothicCard>

        {/* Combat Calculations & Resistances */}
        <GothicCard>
          <h2 className="font-display text-base font-bold text-[#E5B044]">
            Combat Ratings &amp; Resistances
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center rounded-lg border border-[#3B2F2A] bg-[#221B18] p-3.5">
              <Shield className="h-4 w-4 text-[#E5B044]" />
              <span className="font-mono-tabular mt-2 text-lg font-bold text-[#E8E0D5]">
                {totalAc} AC
              </span>
              <span className="mt-0.5 text-xs text-[#A59B93]">Armor Class</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-[#3B2F2A] bg-[#221B18] p-3.5">
              <Crosshair className="h-4 w-4 text-[#E5B044]" />
              <span className="font-mono-tabular mt-2 text-lg font-bold text-[#E8E0D5]">
                {toHit}%
              </span>
              <span className="mt-0.5 text-xs text-[#A59B93]">To-Hit Chance</span>
            </div>
            <div className="flex flex-col items-center rounded-lg border border-[#3B2F2A] bg-[#221B18] p-3.5">
              <ShieldCheck className="h-4 w-4 text-[#E5B044]" />
              <span className="font-mono-tabular mt-2 text-lg font-bold text-[#E8E0D5]">
                {blockChance}%
              </span>
              <span className="mt-0.5 text-xs text-[#A59B93]">Block Chance</span>
            </div>
          </div>

          <hr className="my-5 border-[#3B2F2A]" />

          <h3 className="text-xs font-medium text-[#A59B93]">
            Elemental Resistances (Max 75%)
          </h3>

          <div className="mt-3 grid grid-cols-3 gap-3">
            {[
              {
                label: 'Fire',
                val: totalFireRes,
                color: '#EE3535',
              },
              {
                label: 'Lightning',
                val: totalLightRes,
                color: '#FFD464',
              },
              {
                label: 'Magic',
                val: totalMagicRes,
                color: '#5AA1FF',
              },
            ].map((res) => (
              <div
                key={res.label}
                className="flex flex-col items-center rounded-lg border bg-[#2C221F] py-3 px-2"
                style={{
                  borderColor: res.val >= 75 ? res.color : '#3B2F2A',
                }}
              >
                <span
                  className="font-mono-tabular text-lg font-bold"
                  style={{ color: res.color }}
                >
                  {res.val}%
                </span>
                <span className="mt-0.5 text-xs text-[#A59B93]">
                  {res.label}
                </span>
              </div>
            ))}
          </div>
        </GothicCard>
      </div>
    </div>
  );
};
